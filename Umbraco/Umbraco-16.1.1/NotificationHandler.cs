using kraftvaerk.umbraco.blockfilter.Backend.Notifications;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Umbraco_16._1._1;

public class NotificationHandler : INotificationAsyncHandler<RemodelBlockCatalogueNotification>
{
    public NotificationHandler()
    {

    }

    /// <summary>
    /// Example rule - remove 
    /// </summary>
    /// <param name="notification"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    public async Task HandleAsync(RemodelBlockCatalogueNotification notification, CancellationToken cancellationToken)
    {
        // these are only allowed if the user is an admin
        var adminAliases = new List<string>() { "secretBlock", "secretThreeColumns" };

        if(!notification.Model.User.Groups.Any(g => g.Name == "Administrators"))
        {
            notification.Model.Blocks = notification.Model.Blocks
                .Where(b => !adminAliases.Contains(b.Alias))
                .ToList();
        }

        // code block not allowed on homepage

        if (notification.Model.ContentTypeAlias == "home")
        {
            notification.Model.Blocks = notification.Model.Blocks
                .Where(b => b.Alias != "codeBlock")
                .ToList();
        }
    }
}
