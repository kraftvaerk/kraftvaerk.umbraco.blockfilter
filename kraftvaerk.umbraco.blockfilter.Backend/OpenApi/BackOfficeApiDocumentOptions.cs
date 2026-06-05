namespace kraftvaerk.umbraco.blockfilter.Backend.OpenApi;

/// <summary>
/// Describes a back-office OpenAPI document to register via
/// <see cref="UmbracoBackOfficeOpenApi.Register"/>.
/// All string/Uri fields map to standard OpenAPI Info object fields and are
/// applied on every supported Umbraco version (16 → 18+).
/// </summary>
public sealed record BackOfficeApiDocumentOptions(string DocumentName, string Title)
{
    /// <summary>API version string shown in the document. Defaults to "1.0".</summary>
    public string Version { get; init; } = "1.0";

    /// <summary>Short description of what this API does.</summary>
    public string? Description { get; init; }

    /// <summary>Display name of the contact / maintainer.</summary>
    public string? ContactName { get; init; }

    /// <summary>Contact e-mail address.</summary>
    public string? ContactEmail { get; init; }

    /// <summary>Contact URL (e.g. a GitHub repo or issues page).</summary>
    public Uri? ContactUrl { get; init; }

    /// <summary>SPDX license identifier or display name, e.g. "MIT".</summary>
    public string? LicenseName { get; init; }

    /// <summary>URL pointing to the full license text.</summary>
    public Uri? LicenseUrl { get; init; }
}
