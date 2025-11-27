using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using kraftvaerk.umbraco.blockfilter.Backend.PackageConstants;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
#if NET10_0_OR_GREATER
using Microsoft.OpenApi;
#else
using Microsoft.OpenApi.Models;
#endif
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Core.Composing;

namespace kraftvaerk.umbraco.blockfilter.Backend.Composers;
public class SwaggerComposer : IComposer
{

    public class MyBackOfficeSecurityRequirementsOperationFilter : BackOfficeSecurityRequirementsOperationFilterBase
    {
        protected override string ApiName => $"{BlockFilterConstants.ApiName}-api-v1";
    }

    public class MyConfigureSwaggerGenOptions : IConfigureOptions<SwaggerGenOptions>
    {
        public void Configure(SwaggerGenOptions options)
        {
            options.SwaggerDoc($"{BlockFilterConstants.ApiName}-api-v1", new OpenApiInfo { Title = "Kraftvaerk Blockfilter v1", Version = "1.0" });
            options.OperationFilter<MyBackOfficeSecurityRequirementsOperationFilter>();
        }
    }
    public void Compose(IUmbracoBuilder builder)
    {
         builder.Services.ConfigureOptions<MyConfigureSwaggerGenOptions>();
    }
}
