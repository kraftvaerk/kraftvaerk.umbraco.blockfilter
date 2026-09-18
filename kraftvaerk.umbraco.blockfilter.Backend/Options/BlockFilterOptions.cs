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
    /// Optional list of parent content IDs (GUIDs) whose children are offered in the block placement
    /// "at" dropdown in the rules builder, in addition to the real root nodes.
    /// </summary>
    public Guid[]? AllowedBlockPlacementParentContentIds { get; set; }

    /// <summary>
    /// Optional list of document type aliases used to filter the items in the "at" dropdown
    /// in the rules builder. If specified, only nodes with these document types are listed.
    /// </summary>
    public string[]? AllowedDocumentTypeAliases { get; set; }
}
