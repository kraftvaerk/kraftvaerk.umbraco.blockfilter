using System.Text.Json.Serialization;

namespace kraftvaerk.umbraco.blockfilter.Backend.Models;

/// <summary>
/// API model matching the frontend JSON shape. Uses keys/GUIDs.
/// Translated to/from <see cref="BlockFilterConfigModel"/> (aliases) on save/load.
/// </summary>
public class BlockFilterApiConfigModel
{
    [JsonPropertyName("propertyAlias")]
    public string PropertyAlias { get; set; } = default!;

    [JsonPropertyName("mode")]
    public string Mode { get; set; } = "none";

    [JsonPropertyName("simple")]
    public BlockFilterApiSimpleConfig? Simple { get; set; }

    [JsonPropertyName("complex")]
    public BlockFilterApiComplexConfig? Complex { get; set; }
}

public class BlockFilterApiSimpleConfig
{
    [JsonPropertyName("enabledBlockKeys")]
    public List<string> EnabledBlockKeys { get; set; } = new();
}

public class BlockFilterApiComplexConfig
{
    [JsonPropertyName("rules")]
    public List<BlockFilterApiRule> Rules { get; set; } = new();
}

public class BlockFilterApiRule
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "allow";

    [JsonPropertyName("blockKey")]
    public string BlockKey { get; set; } = default!;

    [JsonPropertyName("userGroup")]
    public string UserGroup { get; set; } = "everyone";

    [JsonPropertyName("weight")]
    public int Weight { get; set; }
}
