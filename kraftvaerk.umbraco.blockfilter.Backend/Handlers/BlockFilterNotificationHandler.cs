using System.Text.Json;
using kraftvaerk.umbraco.blockfilter.Backend.Models;
using kraftvaerk.umbraco.blockfilter.Backend.Notifications;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Events;

namespace kraftvaerk.umbraco.blockfilter.Backend.Handlers;

public class BlockFilterNotificationHandler : INotificationAsyncHandler<RemodelBlockCatalogueNotification>
{
    private readonly string _storageRoot;
    private readonly ILogger<BlockFilterNotificationHandler> _logger;

    public BlockFilterNotificationHandler(
        IWebHostEnvironment webHostEnvironment,
        ILogger<BlockFilterNotificationHandler> logger)
    {
        _storageRoot = Path.Combine(webHostEnvironment.ContentRootPath, "blockfilter");
        _logger = logger;
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

        if (propertyConfig is null || propertyConfig.Mode == "none")
            return;

        if (propertyConfig.Mode == "simple" && propertyConfig.Simple is not null)
        {
            var enabled = new HashSet<string>(propertyConfig.Simple.EnabledBlocks, StringComparer.OrdinalIgnoreCase);
            model.Blocks = model.Blocks
                .Where(b => b.Alias is null || enabled.Contains(b.Alias))
                .ToList();
        }
        else if (propertyConfig.Mode == "complex" && propertyConfig.Complex is not null)
        {
            var userGroupAliases = model.User?.Groups
                .Select(g => g.Alias)
                .ToHashSet(StringComparer.OrdinalIgnoreCase)
                ?? new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            model.Blocks = model.Blocks.Where(block =>
            {
                if (block.Alias is null) return true;

                // Find matching rules: block alias matches AND user is in the rule's group (or rule targets everyone)
                var matchingRules = propertyConfig.Complex.Rules
                    .Where(r => string.Equals(r.Block, block.Alias, StringComparison.OrdinalIgnoreCase))
                    .Where(r => string.Equals(r.UserGroup, "everyone", StringComparison.OrdinalIgnoreCase)
                                || userGroupAliases.Contains(r.UserGroup))
                    .OrderByDescending(r => r.Weight)
                    .ToList();

                if (matchingRules.Count == 0) return true; // no rules = allowed

                // Highest weight rule wins
                return string.Equals(matchingRules[0].Type, "allow", StringComparison.OrdinalIgnoreCase);
            }).ToList();
        }
    }
}
