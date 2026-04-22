using System.Text.Json.Serialization;

namespace kraftvaerk.umbraco.blockfilter.Backend.Models;

public class BlockFilterSettingsModel
{
    [JsonPropertyName("enableSettingsTab")]
    public bool EnableSettingsTab { get; set; }
}
