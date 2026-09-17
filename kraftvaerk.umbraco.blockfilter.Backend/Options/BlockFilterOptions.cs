namespace kraftvaerk.umbraco.blockfilter.Backend.Options;

public class BlockFilterOptions
{
    public const string SectionName = "BlockFilter";

    public bool EnableSettingsTab { get; set; } = false;

    /// <summary>
    /// Path relative to ContentRootPath where block filter config files are stored.
    /// Defaults to "blockfilter". Override this when running on a read-only filesystem
    /// or when you want to store config files in a non-default location.
    /// </summary>
    public string StoragePath { get; set; } = "blockfilter";

    /// <summary>
    /// Optional list of parent content IDs (GUIDs) whose children should be shown in the block placement
    /// "at" dropdown in the rules builder.
    /// </summary>
    public Guid[]? AllowedBlockPlacementParentContentIds { get; set; }

    /// <summary>
    /// Optional list of document type aliases used to filter the existing items in the "at" dropdown
    /// in the rules builder. If specified, only items with these document types will remain visible.
    /// </summary>
    public string[]? AllowedDocumentTypeAliases { get; set; }
}
