using System.Text.Json;
using kraftvaerk.umbraco.blockfilter.Backend.Models;
using kraftvaerk.umbraco.blockfilter.Backend.Notifications;
using kraftvaerk.umbraco.blockfilter.Backend.Options;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Services.Navigation;

namespace kraftvaerk.umbraco.blockfilter.Backend.Handlers;

public class BlockFilterNotificationHandler : INotificationAsyncHandler<RemodelBlockCatalogueNotification>
{
    private readonly string _storageRoot;
    private readonly ILogger<BlockFilterNotificationHandler> _logger;
    private readonly IDocumentNavigationQueryService _documentNavigationQueryService;

    public BlockFilterNotificationHandler(
        IWebHostEnvironment webHostEnvironment,
        ILogger<BlockFilterNotificationHandler> logger,
        IOptions<BlockFilterOptions> options,
        IDocumentNavigationQueryService documentNavigationQueryService)
    {
        _storageRoot = Path.Combine(webHostEnvironment.ContentRootPath, options.Value.StoragePath);
        _logger = logger;
        _documentNavigationQueryService = documentNavigationQueryService;
    }

    public async Task HandleAsync(RemodelBlockCatalogueNotification notification, CancellationToken cancellationToken)
    {
        var model = notification.Model;

        if (string.IsNullOrWhiteSpace(model.ContentTypeAlias) || string.IsNullOrWhiteSpace(model.EditorAlias))
            return;

        var configPath = Path.Combine(_storageRoot, $"{model.ContentTypeAlias}.json");
        if (!File.Exists(configPath))
            return;

        List<BlockFilterConfigModel>? configs;
        try
        {
            var json = await File.ReadAllTextAsync(configPath, cancellationToken);
            configs = JsonSerializer.Deserialize<List<BlockFilterConfigModel>>(json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read block filter config for {Alias}.", model.ContentTypeAlias);
            return;
        }

        if (configs is null)
            return;

        var propertyConfig = configs.FirstOrDefault(c =>
            string.Equals(c.PropertyAlias, model.EditorAlias, StringComparison.OrdinalIgnoreCase));

        if (propertyConfig is null || string.Equals(propertyConfig.Mode, "none", StringComparison.OrdinalIgnoreCase))
            return;

        if (string.Equals(propertyConfig.Mode, "simple", StringComparison.OrdinalIgnoreCase) && propertyConfig.Simple is not null)
        {
            var enabled = new HashSet<string>(propertyConfig.Simple.EnabledBlocks, StringComparer.OrdinalIgnoreCase);
            model.Blocks = model.Blocks
                .Where(b => b.Alias is not null && enabled.Contains(b.Alias))
                .ToList();
        }
        else if (string.Equals(propertyConfig.Mode, "complex", StringComparison.OrdinalIgnoreCase) && propertyConfig.Complex is not null)
        {
            var userGroupAliases = model.User?.Groups
                .Select(g => g.Alias)
                .ToHashSet(StringComparer.OrdinalIgnoreCase)
                ?? new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            model.Blocks = model.Blocks.Where(block =>
            {
                if (block.Alias is null) return true;

                // Find rootNode
                var currentRootKey = ResolveRootNodeKey(model.ContentId);

                // Find matching rules: block alias matches AND user is in the rule's group (or rule targets everyone)
                var matchingRules = propertyConfig.Complex.Rules
                    .Where(r => string.Equals(r.Block, block.Alias, StringComparison.OrdinalIgnoreCase))
                    .Where(r => string.Equals(r.UserGroup, "everyone", StringComparison.OrdinalIgnoreCase)
                                || userGroupAliases.Contains(r.UserGroup))
                    .Where(r => string.Equals(r.RootNode, "any", StringComparison.OrdinalIgnoreCase)
                        || (currentRootKey.HasValue
                            && Guid.TryParse(r.RootNode, out var ruleRootKey)
                            && ruleRootKey == currentRootKey.Value))
                    .OrderByDescending(r => r.Weight)
                    .ToList();

                if (matchingRules.Count == 0) return true; // no rules = allowed

                // Highest weight rule wins
                return string.Equals(matchingRules[0].Type, "allow", StringComparison.OrdinalIgnoreCase);
            }).ToList();
        }
    }

    private Guid? ResolveRootNodeKey(string? contentId)
    {
        if(!Guid.TryParse(contentId, out var contentKey))
            return null;
        
        if(!_documentNavigationQueryService.TryGetAncestorsOrSelfKeys(contentKey, out var keys))
        return null;

        foreach(var key in keys)
        {
            if(_documentNavigationQueryService.TryGetLevel(key, out var level) && level == 1)
                return key;
        }

        return null;

    }
}
