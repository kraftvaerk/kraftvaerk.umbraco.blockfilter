using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;

#if !NET10_0_OR_GREATER
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Api.Management.OpenApi;
#endif

namespace kraftvaerk.umbraco.blockfilter.Backend.OpenApi;

/// <summary>
/// Registers a back-office OpenAPI document across Umbraco 16 (net9, Swashbuckle),
/// Umbraco 17 (net10, Swashbuckle), and Umbraco 18+ (net10, Microsoft.AspNetCore.OpenApi).
///
/// On net9 the Swashbuckle types are compile-time dependencies and are referenced
/// directly. On net10 every code path uses pure System.Linq.Expressions reflection so
/// no Swashbuckle or v18-specific type tokens appear in any IL class declaration —
/// preventing TypeLoadException during Umbraco's assembly type-scan on whichever
/// version is running.
/// </summary>
public static partial class UmbracoBackOfficeOpenApi
{
#if !NET10_0_OR_GREATER
    // net9 / Umbraco 16: Swashbuckle is a guaranteed compile-time dependency.
    // Primary-constructor takes the document name so one class serves all callers.
    private sealed class BackOfficeSecurityFilter(string apiName)
        : BackOfficeSecurityRequirementsOperationFilterBase
    {
        protected override string ApiName => apiName;
    }
#endif

    /// <summary>
    /// Registers a back-office OpenAPI document described by <paramref name="document"/>.
    /// Safe to call from any <see cref="IComposer"/>.
    /// </summary>
    public static void Register(IUmbracoBuilder builder, BackOfficeApiDocumentOptions document)
    {
#if NET10_0_OR_GREATER
        if (IsSwashbucklePresent())
            RegisterSwashbuckle(builder, document);
        else
            RegisterNewOpenApi(builder, document);
#else
        builder.Services.Configure<SwaggerGenOptions>(opts =>
        {
            opts.SwaggerDoc(document.DocumentName, BuildOpenApiInfo(document));
            opts.OperationFilter<BackOfficeSecurityFilter>(document.DocumentName);
        });
#endif
    }

    /// <summary>Convenience overload for simple title-only registrations.</summary>
    public static void Register(IUmbracoBuilder builder, string documentName, string title) =>
        Register(builder, new BackOfficeApiDocumentOptions(documentName, title));

#if !NET10_0_OR_GREATER

    private static OpenApiInfo BuildOpenApiInfo(BackOfficeApiDocumentOptions doc)
    {
        var info = new OpenApiInfo { Title = doc.Title, Version = doc.Version };

        if (doc.Description is not null)
            info.Description = doc.Description;

        if (doc.ContactName is not null || doc.ContactEmail is not null || doc.ContactUrl is not null)
            info.Contact = new OpenApiContact
            {
                Name = doc.ContactName,
                Email = doc.ContactEmail,
                Url = doc.ContactUrl,
            };

        if (doc.LicenseName is not null)
            info.License = new OpenApiLicense
            {
                Name = doc.LicenseName,
                Url = doc.LicenseUrl,
            };

        return info;
    }

#endif
}
