using System.Text.Json.Serialization;

namespace kraftvaerk.umbraco.blockfilter.Backend.Models;

/// <summary>
/// On-disk persistence model for block filter configuration.
/// Uses aliases (not keys/GUIDs) for cross-environment portability.
/// </summary>
public class BlockFilterConfigModel
{
    [JsonPropertyName("propertyAlias")]
    public string PropertyAlias { get; set; } = default!;

    [JsonPropertyName("mode")]
    public string Mode { get; set; } = "none";

    [JsonPropertyName("simple")]
    public BlockFilterSimpleConfig? Simple { get; set; }

    [JsonPropertyName("complex")]
    public BlockFilterComplexConfig? Complex { get; set; }
}

public class BlockFilterSimpleConfig
{
    [JsonPropertyName("enabledBlocks")]
    public List<string> EnabledBlocks { get; set; } = new();
}

public class BlockFilterComplexConfig
{
    [JsonPropertyName("rules")]
    public List<BlockFilterRule> Rules { get; set; } = new();
}

public class BlockFilterRule
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "allow";

    [JsonPropertyName("block")]
    public string Block { get; set; } = default!;

    [JsonPropertyName("userGroup")]
    public string UserGroup { get; set; } = "everyone";

    [JsonPropertyName("weight")]
    public int Weight { get; set; }
}
