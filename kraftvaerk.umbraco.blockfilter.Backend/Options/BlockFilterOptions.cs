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
}
