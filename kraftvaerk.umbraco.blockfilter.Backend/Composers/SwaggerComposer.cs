using kraftvaerk.umbraco.blockfilter.Backend.OpenApi;
using kraftvaerk.umbraco.blockfilter.Backend.PackageConstants;
using Umbraco.Cms.Core.Composing;

namespace kraftvaerk.umbraco.blockfilter.Backend.Composers;

public class SwaggerComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder) =>
        UmbracoBackOfficeOpenApi.Register(builder, new BackOfficeApiDocumentOptions(
            $"{BlockFilterConstants.ApiName}-api-v1",
            "Kraftvaerk Blockfilter")
        {
            Description = "Dynamically filter available blocks based on user, page, or any custom logic.",
            ContactName = "Kraftvaerk",
            ContactUrl = new Uri("https://github.com/kraftvaerk/kraftvaerk.umbraco.blockfilter"),
            LicenseName = "MIT",
        });
}
