using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Text.Json;
using Asp.Versioning;
using kraftvaerk.umbraco.blockfilter.Backend.Models;
using kraftvaerk.umbraco.blockfilter.Backend.Notifications;
using kraftvaerk.umbraco.blockfilter.Backend.Options;
using kraftvaerk.umbraco.blockfilter.Backend.PackageConstants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Cms.Web.Common.Authorization;

namespace kraftvaerk.umbraco.blockfilter.Backend.Controllers;

[ApiController]
[ApiVersion("1.0")]
[MapToApi($"{BlockFilterConstants.ApiName}-api-v1")]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[JsonOptionsName(Constants.JsonOptionsNames.BackOffice)]
[Route($"api/v1/{BlockFilterConstants.ApiName}")]
[Produces("application/json")]
public class BlockFilterController : ControllerBase
{
    private readonly ICoreScopeProvider _coreScopeProvider;
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;
    private readonly IContentTypeService _contentTypeService;
    private readonly IUserGroupService _userGroupService;
    private readonly ILogger<BlockFilterController> _logger;
    private readonly IOptions<BlockFilterOptions> _options;
    private readonly string _storageRoot;

    public BlockFilterController(
        ICoreScopeProvider scopeProvider,
        IBackOfficeSecurityAccessor backOfficeSecurityAccessor,
        IContentTypeService contentTypeService,
        IUserGroupService userGroupService,
        ILogger<BlockFilterController> logger,
        IOptions<BlockFilterOptions> options,
        IWebHostEnvironment webHostEnvironment)
    {
        _coreScopeProvider = scopeProvider ?? throw new ArgumentNullException(nameof(scopeProvider));
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor ?? throw new ArgumentNullException(nameof(backOfficeSecurityAccessor));
        _contentTypeService = contentTypeService ?? throw new ArgumentNullException(nameof(contentTypeService));
        _userGroupService = userGroupService ?? throw new ArgumentNullException(nameof(userGroupService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _options = options ?? throw new ArgumentNullException(nameof(options));
        _storageRoot = Path.Combine(webHostEnvironment.ContentRootPath, options.Value.StoragePath);
    }

    [HttpGet("settings")]
    [ProducesResponseType(typeof(BlockFilterSettingsModel), StatusCodes.Status200OK)]
    public IActionResult GetSettings()
    {
        return Ok(new BlockFilterSettingsModel
        {
            EnableSettingsTab = _options.Value.EnableSettingsTab
        });
    }

    [HttpPost("remodel")]
    [ProducesResponseType(typeof(BlockCatalogueModel), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Remodel([FromBody] BlockCatalogueModel model, CancellationToken cancellationToken)
    {
        if (model is null)
        {
            return BadRequest("Request body is required.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            using ICoreScope scope = _coreScopeProvider.CreateCoreScope();

            model.User = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser;

            if (model.Blocks is { Count: > 0 })
            {
                foreach (var block in model.Blocks)
                {
                    if (string.IsNullOrWhiteSpace(block.ContentElementTypeKey))
                    {
                        _logger.LogWarning("Block with missing contentElementTypeKey encountered and skipped.");
                        continue; // skip invalid entry
                    }

                    if (!Guid.TryParse(block.ContentElementTypeKey, out var blockTypeKey))
                    {
                        _logger.LogWarning("Invalid GUID for contentElementTypeKey: {Key}", block.ContentElementTypeKey);
                        continue; // skip invalid entry but allow request to proceed
                    }

                    try
                    {
                        var ct = _contentTypeService.Get(blockTypeKey);
                        if (ct is null)
                        {
                            _logger.LogInformation("Content type not found for key {Key}", blockTypeKey);
                        }
                        block.Alias = ct?.Alias; // alias stays null if not found
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error resolving content type for key {Key}", blockTypeKey);
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(model.ContentTypeId) && Guid.TryParse(model.ContentTypeId, out var contentTypeKey))
            {
                try
                {
                    model.ContentTypeAlias = _contentTypeService.Get(contentTypeKey)?.Alias;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error resolving content type alias for model.ContentTypeId {Id}", model.ContentTypeId);
                }
            }

            var notification = new RemodelBlockCatalogueNotification(model);

            if (cancellationToken.IsCancellationRequested || HttpContext.RequestAborted.IsCancellationRequested)
            {
                _logger.LogInformation("Cancellation requested before publishing notification.");
                return BadRequest("Request was cancelled.");
            }

            await scope.Notifications.PublishCancelableAsync(notification);

            if (notification.Cancel)
            {
                _logger.LogInformation("Remodel operation cancelled by a notification handler.");
                // Do not complete scope – rollback. Provide a conflict response.
                return Conflict(new { message = "Remodel operation was cancelled by server policy.", model });
            }

            scope.Complete();
            return Ok(model);
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Remodel request was cancelled by client.");
            return BadRequest("Request was cancelled.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception during remodel operation.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("configuration/{documentTypeKey}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetConfiguration(string documentTypeKey)
    {
        if (!IsValidKey(documentTypeKey))
        {
            return BadRequest("Invalid document type key.");
        }

        var docTypeAlias = ResolveContentTypeAlias(documentTypeKey);
        if (docTypeAlias is null)
        {
            return Content("[]", "application/json");
        }

        var filePath = Path.Combine(_storageRoot, $"{docTypeAlias}.json");
        if (!System.IO.File.Exists(filePath))
        {
            return Content("[]", "application/json");
        }

        var json = await System.IO.File.ReadAllTextAsync(filePath);
        var diskConfigs = JsonSerializer.Deserialize<List<BlockFilterConfigModel>>(json);
        if (diskConfigs is null)
        {
            return Content("[]", "application/json");
        }

        // Translate aliases → keys for the frontend
        var blockAliasToKey = BuildBlockAliasToKeyMap(diskConfigs);
        var groupAliasToKey = await BuildUserGroupAliasToKeyMapAsync(diskConfigs);

        var apiConfigs = diskConfigs.Select(dc => new BlockFilterApiConfigModel
        {
            PropertyAlias = dc.PropertyAlias,
            Mode = dc.Mode,
            Simple = dc.Simple is not null ? new BlockFilterApiSimpleConfig
            {
                EnabledBlockKeys = dc.Simple.EnabledBlocks
                    .Select(a => blockAliasToKey.GetValueOrDefault(a, a))
                    .ToList()
            } : null,
            Complex = dc.Complex is not null ? new BlockFilterApiComplexConfig
            {
                Rules = dc.Complex.Rules.Select(r => new BlockFilterApiRule
                {
                    Type = r.Type,
                    BlockKey = blockAliasToKey.GetValueOrDefault(r.Block, r.Block),
                    UserGroup = r.UserGroup == "everyone" ? "everyone" : groupAliasToKey.GetValueOrDefault(r.UserGroup, r.UserGroup),
                    Weight = r.Weight,
                }).ToList()
            } : null,
        }).ToList();

        return Ok(apiConfigs);
    }

    [HttpPost("configuration/{documentTypeKey}")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SaveConfiguration(string documentTypeKey, [FromBody] List<BlockFilterApiConfigModel>? requestBody)
    {
        if (!IsValidKey(documentTypeKey))
        {
            return BadRequest("Invalid document type key.");
        }

        if (requestBody is null)
        {
            return BadRequest("Request body is required.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var docTypeAlias = ResolveContentTypeAlias(documentTypeKey);
        if (docTypeAlias is null)
        {
            return BadRequest("Document type not found.");
        }

        // Translate keys → aliases for on-disk storage
        var blockKeyToAlias = BuildBlockKeyToAliasMap(requestBody);
        var groupKeyToAlias = await BuildUserGroupKeyToAliasMapAsync(requestBody);

        var diskConfigs = requestBody.Select(ac => new BlockFilterConfigModel
        {
            PropertyAlias = ac.PropertyAlias,
            Mode = ac.Mode,
            Simple = ac.Simple is not null ? new BlockFilterSimpleConfig
            {
                EnabledBlocks = ac.Simple.EnabledBlockKeys
                    .Select(k => blockKeyToAlias.GetValueOrDefault(k, k))
                    .ToList()
            } : null,
            Complex = ac.Complex is not null ? new BlockFilterComplexConfig
            {
                Rules = ac.Complex.Rules.Select(r => new BlockFilterRule
                {
                    Type = r.Type,
                    Block = blockKeyToAlias.GetValueOrDefault(r.BlockKey, r.BlockKey),
                    UserGroup = r.UserGroup == "everyone" ? "everyone" : groupKeyToAlias.GetValueOrDefault(r.UserGroup, r.UserGroup),
                    Weight = r.Weight,
                }).ToList()
            } : null,
        }).ToList();

        Directory.CreateDirectory(_storageRoot);

        var json = JsonSerializer.Serialize(diskConfigs, new JsonSerializerOptions { WriteIndented = true });
        var filePath = Path.Combine(_storageRoot, $"{docTypeAlias}.json");
        await System.IO.File.WriteAllTextAsync(filePath, json);

        _logger.LogInformation("Block filter configuration saved for document type {Alias}.", docTypeAlias);
        return Ok(new { saved = true });
    }

    // ── Translation helpers ──────────────────────────────────

    private string? ResolveContentTypeAlias(string key)
    {
        if (!Guid.TryParse(key, out var guid)) return null;
        return _contentTypeService.Get(guid)?.Alias;
    }

    private Dictionary<string, string> BuildBlockKeyToAliasMap(List<BlockFilterApiConfigModel> configs)
    {
        var keys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var c in configs)
        {
            if (c.Simple is not null)
                foreach (var k in c.Simple.EnabledBlockKeys) keys.Add(k);
            if (c.Complex is not null)
                foreach (var r in c.Complex.Rules) keys.Add(r.BlockKey);
        }

        var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var k in keys)
        {
            if (Guid.TryParse(k, out var guid))
            {
                var ct = _contentTypeService.Get(guid);
                if (ct is not null) map[k] = ct.Alias;
            }
        }
        return map;
    }

    private Dictionary<string, string> BuildBlockAliasToKeyMap(List<BlockFilterConfigModel> configs)
    {
        var aliases = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var c in configs)
        {
            if (c.Simple is not null)
                foreach (var a in c.Simple.EnabledBlocks) aliases.Add(a);
            if (c.Complex is not null)
                foreach (var r in c.Complex.Rules) aliases.Add(r.Block);
        }

        var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var a in aliases)
        {
            var ct = _contentTypeService.Get(a);
            if (ct is not null) map[a] = ct.Key.ToString();
        }
        return map;
    }

    private async Task<Dictionary<string, string>> BuildUserGroupKeyToAliasMapAsync(List<BlockFilterApiConfigModel> configs)
    {
        var keys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var c in configs)
        {
            if (c.Complex is not null)
                foreach (var r in c.Complex.Rules)
                    if (r.UserGroup != "everyone") keys.Add(r.UserGroup);
        }

        var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var k in keys)
        {
            if (Guid.TryParse(k, out var guid))
            {
                var group = await _userGroupService.GetAsync(guid);
                if (group is not null) map[k] = group.Alias;
            }
        }
        return map;
    }

    private async Task<Dictionary<string, string>> BuildUserGroupAliasToKeyMapAsync(List<BlockFilterConfigModel> configs)
    {
        var aliases = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var c in configs)
        {
            if (c.Complex is not null)
                foreach (var r in c.Complex.Rules)
                    if (r.UserGroup != "everyone") aliases.Add(r.UserGroup);
        }

        var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var alias in aliases)
        {
            var group = await _userGroupService.GetAsync(alias);
            if (group is not null) map[alias] = group.Key.ToString();
        }
        return map;
    }

    /// <summary>
    /// Validates that the key is a valid GUID to prevent path traversal.
    /// </summary>
    private static bool IsValidKey(string key)
    {
        return Guid.TryParse(key, out _);
    }
}
