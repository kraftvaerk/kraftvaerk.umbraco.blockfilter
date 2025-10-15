using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using kraftvaerk.umbraco.blockfilter.Backend.Models;
using kraftvaerk.umbraco.blockfilter.Backend.Notifications;
using kraftvaerk.umbraco.blockfilter.Backend.PackageConstants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
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
public class BlockFilterController : Controller
{
    private readonly ICoreScopeProvider _coreScopeProvider;
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;
    private readonly IContentTypeService _contentTypeService;
    private readonly ILogger<BlockFilterController> _logger;

    public BlockFilterController(
        ICoreScopeProvider scopeProvider,
        IBackOfficeSecurityAccessor backOfficeSecurityAccessor,
        IContentTypeService contentTypeService,
        ILogger<BlockFilterController> logger)
    {
        _coreScopeProvider = scopeProvider ?? throw new ArgumentNullException(nameof(scopeProvider));
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor ?? throw new ArgumentNullException(nameof(backOfficeSecurityAccessor));
        _contentTypeService = contentTypeService ?? throw new ArgumentNullException(nameof(contentTypeService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
}
