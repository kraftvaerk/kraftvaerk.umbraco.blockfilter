using System.Collections.Generic;
using System.Text.Json.Serialization;
using Umbraco.Cms.Core.Models.Membership;

namespace kraftvaerk.umbraco.blockfilter.Backend.Models
{
    public class Area
    {
        [JsonPropertyName("key")]
        public string Key { get; set; } = default!;

        [JsonPropertyName("alias")]
        public string Alias { get; set; } = default!;

        [JsonPropertyName("columnSpan")]
        public int ColumnSpan { get; set; }

        [JsonPropertyName("rowSpan")]
        public int RowSpan { get; set; }

        [JsonPropertyName("minAllowed")]
        public int MinAllowed { get; set; }

        [JsonPropertyName("specifiedAllowance")]
        public List<object> SpecifiedAllowance { get; set; } = new();
    }

    public class Block
    {
        [JsonPropertyName("contentElementTypeKey")]
        public string ContentElementTypeKey { get; set; } = default!;

        [JsonPropertyName("allowAtRoot")]
        public bool AllowAtRoot { get; set; }

        [JsonPropertyName("allowInAreas")]
        public bool AllowInAreas { get; set; }

        [JsonPropertyName("groupKey")]
        public string? GroupKey { get; set; } = default!;

        [JsonPropertyName("areas")]
        public List<Area>? Areas { get; set; }

        [JsonPropertyName("areaGridColumns")]
        public int? AreaGridColumns { get; set; }

        [JsonIgnore]
        public string? Alias { get; set; }
    }

    public class BlockGroup
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = default!;

        [JsonPropertyName("key")]
        public string Key { get; set; } = default!;
    }

    public class OriginData
    {
        [JsonPropertyName("index")]
        public int Index { get; set; }

        [JsonPropertyName("areaKey")]
        public object? AreaKey { get; set; }

        [JsonPropertyName("parentUnique")]
        public object? ParentUnique { get; set; }
    }

    public class BlockCatalogueModel
    {
        [JsonPropertyName("blocks")]
        public List<Block> Blocks { get; set; } = new();

        [JsonPropertyName("blockGroups")]
        public List<BlockGroup> BlockGroups { get; set; } = new();

        [JsonPropertyName("openClipboard")]
        public bool OpenClipboard { get; set; }

        [JsonPropertyName("originData")]
        public OriginData OriginData { get; set; } = new();

        [JsonPropertyName("createBlockInWorkspace")]
        public bool CreateBlockInWorkspace { get; set; }

        [JsonPropertyName("pageId")]
        public string? ContentId { get; set; }

        [JsonPropertyName("pageTypeId")]
        public string? ContentTypeId { get; set; }

        [JsonPropertyName("editingAlias")]
        public string? EditorAlias { get; set; }

        [JsonIgnore]
        public string? ContentTypeAlias { get; set; }

        [JsonIgnore]
        public IUser? User { get; set; }
    }
}
