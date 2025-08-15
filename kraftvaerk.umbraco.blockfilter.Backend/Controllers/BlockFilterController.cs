using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Asp.Versioning;
using kraftvaerk.umbraco.blockfilter.Backend.Models;
using kraftvaerk.umbraco.blockfilter.Backend.Notifications;
using kraftvaerk.umbraco.blockfilter.Backend.PackageConstants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
public class BlockFilterController : Controller
{
    private readonly ICoreScopeProvider _coreScopeProvider;
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;
    private readonly IContentTypeService _contentTypeService;

    public BlockFilterController(ICoreScopeProvider scopeProvider, IBackOfficeSecurityAccessor backOfficeSecurityAccessor, IContentTypeService contentTypeService)
    {
        _coreScopeProvider = scopeProvider;
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
        _contentTypeService = contentTypeService;
    }

    [HttpPost("remodel")]
    public async Task<IActionResult> Remodel([FromBody] BlockCatalogueModel model)
    {
        using ICoreScope scope = _coreScopeProvider.CreateCoreScope();
        
        model.User = _backOfficeSecurityAccessor?.BackOfficeSecurity?.CurrentUser;

        foreach(var block in model.Blocks)
        {
            var ct = _contentTypeService.Get(Guid.Parse(block.ContentElementTypeKey));
            block.Alias = ct.Alias;
        }

        model.ContentTypeAlias = _contentTypeService.Get(Guid.Parse(model.ContentTypeId)).Alias;

        var notification = new RemodelBlockCatalogueNotification(model);
        await scope.Notifications.PublishCancelableAsync(notification);
        
        scope.Complete();

        return Ok(model);
    }
}
