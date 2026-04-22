# Block Filter (by Kraftvaerk)

Block Filter is a simple package that replaces the *Block Catalogue Modal* in Umbraco with one under **our** control.

Whenever the modal is opened, a `RemodelBlockCatalogueNotification` is sent, allowing you to modify the block catalogue before it is displayed.

Ever wished a block could only be available to certain users or user groups? Only on certain pages? Only if the editor alias is `gridContent`? Or maybe only if the logged-in user’s first name is *Unicorn*?  

With Block Filter – and its `RemodelBlockCatalogueNotification` handler – the sky’s the limit for deciding who gets to see what… and when.

---

## 🏷️ Version support

Block filter is compatible with Umbraco 16.0 and later versions.

---

## 🚀 Installation
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

## ⚙️ Built-in Block Filter Configurator

For teams that don't want to write code, Block Filter ships with an optional **configurator UI** that adds a "BlockFilter" tab to document type workspaces in the backoffice.

The configurator lets you define filtering rules per Block List / Block Grid property with three modes:

- **None** – No filtering. All blocks are available (default).
- **Simple** – Pick which blocks are enabled via checkboxes.
- **Complex** – Define weighted allow/deny rules per block and user group. Higher weight takes precedence.

Configuration is persisted to disk as JSON using **aliases** (not GUIDs), so rules carry across dev/test/prod environments.

### Enabling the configurator

Add this to your `appsettings.json`:

```json
{
  "BlockFilter": {
    "EnableSettingsTab": true
  }
}
```

When enabled, this registers:
1. The **BlockFilter tab** on document type workspaces in the backoffice.
2. A built-in **notification handler** that reads saved rules and filters blocks automatically.

> **Note:** The built-in handler and the custom handler approach are **not mutually exclusive**. You can enable the configurator *and* register your own `RemodelBlockCatalogueNotification` handlers for additional logic. All handlers run in sequence.

### How it works

The configurator saves rules per document type to `/blockfilter/{documentTypeAlias}.json` in your site root. When a Block Catalogue modal opens, the built-in handler reads the relevant config file and filters blocks based on the saved rules.

For **complex** rules, the handler:
1. Finds all rules matching the block alias and the current user's group memberships (or "Everyone").
2. Picks the rule with the highest weight.
3. Allows or denies the block based on that rule's type.
4. If no rules match a block, it is allowed by default.

---

## 📦 License & Contributing

This package is open source and licensed under the [MIT License](https://opensource.org/licenses/MIT).

Contributions are welcome!  
If you find a bug, want to improve something, or have an idea for a feature, feel free to open an issue or submit a pull request.

— Kaspar
