using kraftvaerk.umbraco.blockfilter.Backend.Handlers;
using kraftvaerk.umbraco.blockfilter.Backend.Notifications;
using kraftvaerk.umbraco.blockfilter.Backend.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Notifications;

namespace kraftvaerk.umbraco.blockfilter.Backend.Composers;

public class ServiceComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<BlockFilterOptions>(
            builder.Config.GetSection(BlockFilterOptions.SectionName));

        var options = builder.Config.GetSection(BlockFilterOptions.SectionName).Get<BlockFilterOptions>();
        if (options?.EnableSettingsTab == true)
        {
            builder.AddNotificationAsyncHandler<RemodelBlockCatalogueNotification, BlockFilterNotificationHandler>();
        }
    }
}
