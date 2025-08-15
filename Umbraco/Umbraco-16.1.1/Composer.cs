using kraftvaerk.umbraco.blockfilter.Backend.Notifications;
using Umbraco.Cms.Core.Composing;

namespace Umbraco_16._1._1;

public class Composer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.AddNotificationAsyncHandler<RemodelBlockCatalogueNotification, NotificationHandler>();
    }
}
