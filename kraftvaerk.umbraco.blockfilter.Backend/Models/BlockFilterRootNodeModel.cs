namespace Kraftvaerk.Umbraco.Blockfilter.Backend.Models;
using System.Text.Json.Serialization;

public sealed class BlockFilterRootNodeModel
{
    [JsonPropertyName("key")]
    public string Key { get; set; } = default!;
    [JsonPropertyName("name")]
    public string Name { get; set; } = default!;
}