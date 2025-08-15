# Block Filter (by Kraftvaerk)

Block Filter is a simple package that replaces the *Block Catalogue Modal* in Umbraco with one under **our** control.

Whenever the modal is opened, a `RemodelBlockCatalogueNotification` is sent, allowing you to modify the block catalogue before it is displayed.

Ever wished a block could only be available to certain users or user groups? Only on certain pages? Only if the editor alias is `gridContent`? Or maybe only if the logged-in user’s first name is *Unicorn*?  

With Block Filter – and its `RemodelBlockCatalogueNotification` handler – the sky’s the limit for deciding who gets to see what… and when.

---

## 🚀 Installation (TODO)
You can install Block Filter via NuGet:

```bash
dotnet add package Kraftvaerk.Umbraco.BlockFilter
```

---

## 🛠️ Usage
To use Block Filter, create a handler for the `RemodelBlockCatalogueNotification`.  
This handler lets you modify the block catalogue based on your custom logic.

```csharp
public class YourNotificationHandler : INotificationAsyncHandler<RemodelBlockCatalogueNotification>
{
    public YourNotificationHandler()
    {
    }

    public async Task HandleAsync(RemodelBlockCatalogueNotification notification, CancellationToken cancellationToken)
    {
        // These are only allowed if the user is an admin
        var adminAliases = new List<string> { "mySecretBlock" };

        if (!notification.Model.User.Groups.Any(g => g.Name == "Administrators"))
        {
            notification.Model.Blocks = notification.Model.Blocks
                .Where(b => !adminAliases.Contains(b.Alias))
                .ToList();
        }

        // "codeBlock" not allowed on the homepage
        if (notification.Model.ContentTypeAlias == "home")
        {
            notification.Model.Blocks = notification.Model.Blocks
                .Where(b => b.Alias != "codeBlock")
                .ToList();
        }
    }
}

public class YourComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.AddNotificationAsyncHandler<RemodelBlockCatalogueNotification, YourNotificationHandler>();
    }
}
```

---

## 📦 License & Contributing

This package is open source and licensed under the [MIT License](https://opensource.org/licenses/MIT).

Contributions are welcome!  
If you find a bug, want to improve something, or have an idea for a feature, feel free to open an issue or submit a pull request.

— Kaspar
