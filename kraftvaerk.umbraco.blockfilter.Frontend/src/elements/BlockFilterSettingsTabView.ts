import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { LitElement, html, css, customElement, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UMB_DOCUMENT_TYPE_WORKSPACE_CONTEXT, UmbDocumentTypeItemRepository } from '@umbraco-cms/backoffice/document-type';
import { UmbDataTypeItemRepository, UmbDataTypeDetailRepository } from '@umbraco-cms/backoffice/data-type';
import type { UmbDataTypeItemModel, UmbDataTypeDetailModel } from '@umbraco-cms/backoffice/data-type';
import { UmbUserGroupCollectionRepository } from '@umbraco-cms/backoffice/user-group';
import { BlockfilterClient, OpenAPI } from '../blockfilter-api';

const BLOCK_EDITOR_UI_ALIASES: ReadonlySet<string> = new Set([
    'Umb.PropertyEditorUi.BlockList',
    'Umb.PropertyEditorUi.BlockGrid',
]);

interface BlockConfig {
    contentElementTypeKey: string;
    [key: string]: unknown;
}

interface AvailableBlock {
    key: string;
    name: string;
    icon: string;
}

type RuleType = 'allow' | 'deny';

interface Rule {
    type: RuleType;
    blockKey: string;
    userGroupUnique: string; // 'everyone' or a real unique
    weight: number;
}

type ConfigMode = 'none' | 'simple' | 'complex';

interface PropertyConfig {
    mode: ConfigMode;
    /** Simple mode: set of enabled block keys (all enabled by default) */
    enabledBlocks: Set<string>;
    /** Complex mode: ordered list of rules */
    rules: Rule[];
}

interface BlockPropertyEntry {
    name: string;
    alias: string;
    editorUiAlias: string;
    dataType: UmbDataTypeItemModel;
    availableBlocks: AvailableBlock[];
}

/** The JSON shape we build for each property */
interface PropertyConfigJson {
    propertyAlias: string;
    mode: ConfigMode;
    simple?: { enabledBlockKeys: string[] };
    complex?: { rules: Array<{ type: RuleType; blockKey: string; userGroup: string; weight: number }> };
}

@customElement('blockfilter-settings-tab-view')
export class BlockFilterSettingsTabViewElement extends UmbElementMixin(LitElement) {
    readonly #itemRepository = new UmbDataTypeItemRepository(this);
    readonly #detailRepository = new UmbDataTypeDetailRepository(this);
    readonly #docTypeItemRepository = new UmbDocumentTypeItemRepository(this);
    readonly #userGroupRepository = new UmbUserGroupCollectionRepository(this);

    @state()
    private _blockProperties: BlockPropertyEntry[] = [];

    @state()
    private _userGroups: Array<{ name: string; unique: string }> = [];

    @state()
    private _loading = true;

    @state()
    private _saving = false;

    @state()
    private _documentTypeKey: string | undefined;

    /** Per-property configuration state, keyed by property alias */
    @state()
    private _configs: Map<string, PropertyConfig> = new Map();

    constructor() {
        super();
        this.#loadUserGroups();

        this.consumeContext(UMB_DOCUMENT_TYPE_WORKSPACE_CONTEXT, (context) => {
            this._documentTypeKey = context.getUnique() ?? undefined;

            this.observe(context.structure.contentTypeProperties, async (properties) => {
                this._loading = true;

                if (!properties?.length) {
                    this._blockProperties = [];
                    this._loading = false;
                    return;
                }

                const uniqueDataTypeIds = [...new Set(properties.map((p) => p.dataType.unique))];
                const { data: itemModels } = await this.#itemRepository.requestItems(uniqueDataTypeIds);

                if (!itemModels) {
                    this._blockProperties = [];
                    this._loading = false;
                    return;
                }

                const blockItemMap = new Map<string, UmbDataTypeItemModel>(
                    itemModels
                        .filter((dt) => BLOCK_EDITOR_UI_ALIASES.has(dt.propertyEditorUiAlias))
                        .map((dt) => [dt.unique, dt]),
                );

                const blockProperties = properties.filter((p) => blockItemMap.has(p.dataType.unique));

                const uniqueBlockDataTypeIds = [...new Set(blockProperties.map((p) => p.dataType.unique))];
                const detailResults = await Promise.all(
                    uniqueBlockDataTypeIds.map(async (id) => {
                        const result = await this.#detailRepository.requestByUnique(id);
                        return { id, detail: result.data as UmbDataTypeDetailModel | undefined };
                    }),
                );
                const detailMap = new Map<string, UmbDataTypeDetailModel | undefined>(
                    detailResults.map(({ id, detail }) => [id, detail]),
                );

                const allBlockKeys = new Set<string>();
                for (const detail of detailMap.values()) {
                    if (!detail) continue;
                    const blocksValue = detail.values.find((v) => v.alias === 'blocks');
                    const blocks = blocksValue?.value as BlockConfig[] | undefined;
                    if (blocks) {
                        for (const b of blocks) {
                            if (b.contentElementTypeKey) allBlockKeys.add(b.contentElementTypeKey);
                        }
                    }
                }

                const blockInfoMap = new Map<string, { name: string; icon: string }>();
                if (allBlockKeys.size > 0) {
                    const { data: docTypeItems } = await this.#docTypeItemRepository.requestItems([...allBlockKeys]);
                    if (docTypeItems) {
                        for (const item of docTypeItems) {
                            const rawIcon = item.icon || 'icon-document';
                            blockInfoMap.set(item.unique, { name: item.name, icon: rawIcon.split(' ')[0] });
                        }
                    }
                }

                const newProps: BlockPropertyEntry[] = blockProperties.map((p) => {
                    const detail = detailMap.get(p.dataType.unique);
                    const blocksValue = detail?.values.find((v) => v.alias === 'blocks');
                    const blocks = (blocksValue?.value as BlockConfig[] | undefined) ?? [];

                    return {
                        name: p.name,
                        alias: p.alias,
                        editorUiAlias: blockItemMap.get(p.dataType.unique)!.propertyEditorUiAlias,
                        dataType: blockItemMap.get(p.dataType.unique)!,
                        availableBlocks: blocks
                            .filter((b) => b.contentElementTypeKey)
                            .map((b) => {
                                const info = blockInfoMap.get(b.contentElementTypeKey);
                                return {
                                    key: b.contentElementTypeKey,
                                    name: info?.name ?? b.contentElementTypeKey,
                                    icon: info?.icon || 'icon-document',
                                };
                            }),
                    };
                });

                // Initialise config state for new properties (preserve existing)
                const updatedConfigs = new Map(this._configs);
                for (const prop of newProps) {
                    if (!updatedConfigs.has(prop.alias)) {
                        updatedConfigs.set(prop.alias, {
                            mode: 'none',
                            enabledBlocks: new Set(prop.availableBlocks.map((b) => b.key)),
                            rules: [],
                        });
                    }
                }
                this._configs = updatedConfigs;
                this._blockProperties = newProps;

                // Load saved configuration from server
                if (this._documentTypeKey) {
                    await this.#loadSavedConfig(newProps);
                }

                this._loading = false;
            });
        });
    }

    async #loadSavedConfig(props: BlockPropertyEntry[]) {
        try {
            const client = new BlockfilterClient({ TOKEN: OpenAPI.TOKEN, BASE: OpenAPI.BASE });
            const saved: PropertyConfigJson[] = await client.v1.getApiV1BlockfilterConfiguration({
                documentTypeKey: this._documentTypeKey!,
            });
            const updatedConfigs = new Map(this._configs);

            for (const entry of saved) {
                const prop = props.find((p) => p.alias === entry.propertyAlias);
                if (!prop) continue;

                const cfg: PropertyConfig = {
                    mode: entry.mode,
                    enabledBlocks: new Set(
                        entry.simple?.enabledBlockKeys ?? prop.availableBlocks.map((b) => b.key),
                    ),
                    rules: (entry.complex?.rules ?? []).map((r) => ({
                        type: r.type,
                        blockKey: r.blockKey,
                        userGroupUnique: r.userGroup,
                        weight: r.weight,
                    })),
                };
                updatedConfigs.set(entry.propertyAlias, cfg);
            }

            this._configs = updatedConfigs;
        } catch {
            // empty array returned when no config exists
        }
    }

    async #loadUserGroups() {
        const { data } = await this.#userGroupRepository.requestCollection({ skip: 0, take: 1000 });
        if (data?.items) {
            this._userGroups = data.items.map((g) => ({ name: g.name, unique: g.unique }));
        }
    }

    #editorLabel(alias: string): string {
        if (alias === 'Umb.PropertyEditorUi.BlockGrid') return 'Block Grid';
        if (alias === 'Umb.PropertyEditorUi.BlockList') return 'Block List';
        return alias;
    }

    #getConfig(alias: string): PropertyConfig {
        return this._configs.get(alias)!;
    }

    #setMode(alias: string, mode: ConfigMode) {
        const cfg = this.#getConfig(alias);
        const prop = this._blockProperties.find((p) => p.alias === alias)!;
        const updated = new Map(this._configs);
        updated.set(alias, {
            ...cfg,
            mode,
            // Reset to defaults when switching
            enabledBlocks: new Set(prop.availableBlocks.map((b) => b.key)),
            rules: [],
        });
        this._configs = updated;
    }

    #toggleBlock(alias: string, blockKey: string, checked: boolean) {
        const cfg = this.#getConfig(alias);
        const enabledBlocks = new Set(cfg.enabledBlocks);
        if (checked) {
            enabledBlocks.add(blockKey);
        } else {
            enabledBlocks.delete(blockKey);
        }
        const updated = new Map(this._configs);
        updated.set(alias, { ...cfg, enabledBlocks });
        this._configs = updated;
    }

    #addRule(alias: string) {
        const cfg = this.#getConfig(alias);
        const prop = this._blockProperties.find((p) => p.alias === alias)!;
        const updated = new Map(this._configs);
        updated.set(alias, {
            ...cfg,
            rules: [
                ...cfg.rules,
                {
                    type: 'allow',
                    blockKey: prop.availableBlocks[0]?.key ?? '',
                    userGroupUnique: 'everyone',
                    weight: 0,
                },
            ],
        });
        this._configs = updated;
    }

    #removeRule(alias: string, index: number) {
        const cfg = this.#getConfig(alias);
        const updated = new Map(this._configs);
        updated.set(alias, {
            ...cfg,
            rules: cfg.rules.filter((_, i) => i !== index),
        });
        this._configs = updated;
    }

    #updateRule(alias: string, index: number, field: keyof Rule, value: string | number) {
        const cfg = this.#getConfig(alias);
        const rules = cfg.rules.map((r, i) => (i === index ? { ...r, [field]: value } : r));
        const updated = new Map(this._configs);
        updated.set(alias, { ...cfg, rules });
        this._configs = updated;
    }

    /** Build the full JSON config for all properties */
    getConfigJson(): PropertyConfigJson[] {
        return this._blockProperties.map((prop) => {
            const cfg = this.#getConfig(prop.alias);
            const base: PropertyConfigJson = {
                propertyAlias: prop.alias,
                mode: cfg.mode,
            };
            if (cfg.mode === 'simple') {
                base.simple = { enabledBlockKeys: [...cfg.enabledBlocks] };
            } else {
                base.complex = {
                    rules: cfg.rules.map((r) => ({
                        type: r.type,
                        blockKey: r.blockKey,
                        userGroup: r.userGroupUnique,
                        weight: r.weight,
                    })),
                };
            }
            return base;
        });
    }

    // ── Render ──────────────────────────────────────────────

    async #saveConfig() {
        if (!this._documentTypeKey) return;
        this._saving = true;
        try {
            const client = new BlockfilterClient({ TOKEN: OpenAPI.TOKEN, BASE: OpenAPI.BASE });
            await client.v1.postApiV1BlockfilterConfiguration({
                documentTypeKey: this._documentTypeKey,
                requestBody: this.getConfigJson(),
            });
        } catch (err) {
            console.error('Failed to save block filter configuration', err);
        } finally {
            this._saving = false;
        }
    }

    override render() {
        if (this._loading) {
            return html`<uui-loader></uui-loader>`;
        }

        if (this._blockProperties.length === 0) {
            return html`
                <uui-box headline="Block Filter">
                    <p class="none">No Block List or Block Grid properties found on this document type.</p>
                </uui-box>
            `;
        }

        return html`
            ${this._blockProperties.map((prop) => this.#renderProperty(prop))}

            <div class="actions">
                <uui-button
                    look="primary"
                    color="positive"
                    ?disabled=${this._saving}
                    @click=${() => this.#saveConfig()}
                >${this._saving ? 'Saving...' : 'Save configuration'}</uui-button>
            </div>

            <uui-box headline="Generated configuration">
                <pre>${JSON.stringify(this.getConfigJson(), null, 2)}</pre>
            </uui-box>
        `;
    }

    #renderProperty(prop: BlockPropertyEntry) {
        const cfg = this.#getConfig(prop.alias);

        return html`
            <uui-box headline="${prop.name}">
                <div class="meta">
                    <span class="label">Alias</span>
                    <span><code>${prop.alias}</code></span>
                    <span class="label">Editor</span>
                    <span>${this.#editorLabel(prop.editorUiAlias)} · ${prop.dataType.name}</span>
                </div>

                <div class="mode-selector">
                    <uui-button-group>
                        <uui-button
                            look=${cfg.mode === 'none' ? 'primary' : 'secondary'}
                            @click=${() => this.#setMode(prop.alias, 'none')}
                        >None</uui-button>
                        <uui-button
                            look=${cfg.mode === 'simple' ? 'primary' : 'secondary'}
                            @click=${() => this.#setMode(prop.alias, 'simple')}
                        >Simple</uui-button>
                        <uui-button
                            look=${cfg.mode === 'complex' ? 'primary' : 'secondary'}
                            @click=${() => this.#setMode(prop.alias, 'complex')}
                        >Complex</uui-button>
                    </uui-button-group>
                </div>

                ${cfg.mode === 'none'
                    ? html`<p class="none">No block filtering configured for this property.</p>`
                    : cfg.mode === 'simple'
                        ? this.#renderSimple(prop, cfg)
                        : this.#renderComplex(prop, cfg)}
            </uui-box>
        `;
    }

    #renderSimple(prop: BlockPropertyEntry, cfg: PropertyConfig) {
        if (prop.availableBlocks.length === 0) {
            return html`<p class="none">No blocks configured on this editor.</p>`;
        }

        return html`
            <div class="block-grid">
                ${prop.availableBlocks.map(
                    (block) => html`
                        <label class="block-check">
                            <uui-checkbox
                                ?checked=${cfg.enabledBlocks.has(block.key)}
                                @change=${(e: Event) =>
                                    this.#toggleBlock(
                                        prop.alias,
                                        block.key,
                                        (e.target as HTMLInputElement).checked,
                                    )}
                            ></uui-checkbox>
                            <uui-icon name=${block.icon} aria-hidden="true"></uui-icon>
                            <span>${block.name}</span>
                        </label>
                    `,
                )}
            </div>
        `;
    }

    #renderComplex(prop: BlockPropertyEntry, cfg: PropertyConfig) {
        const userGroupOptions = [
            { name: 'Everyone', value: 'everyone' },
            ...this._userGroups.map((g) => ({ name: g.name, value: g.unique })),
        ];

        const blockOptions = prop.availableBlocks.map((b) => ({
            name: b.name,
            value: b.key,
        }));

        return html`
            <p class="precedence-note">Rules are evaluated by weight — higher weight takes precedence.</p>
            <div class="rules">
                ${cfg.rules.map((rule, idx) => html`
                    <div class="rule-row">
                        <uui-select
                            .options=${[
                                { name: 'Allow', value: 'allow', selected: rule.type === 'allow' },
                                { name: 'Deny', value: 'deny', selected: rule.type === 'deny' },
                            ]}
                            @change=${(e: Event) =>
                                this.#updateRule(prop.alias, idx, 'type', (e.target as HTMLSelectElement).value)}
                        ></uui-select>

                        <uui-select
                            .options=${blockOptions.map((o) => ({
                                ...o,
                                selected: o.value === rule.blockKey,
                            }))}
                            @change=${(e: Event) =>
                                this.#updateRule(prop.alias, idx, 'blockKey', (e.target as HTMLSelectElement).value)}
                        ></uui-select>

                        <span class="rule-for">for</span>

                        <uui-select
                            .options=${userGroupOptions.map((o) => ({
                                ...o,
                                selected: o.value === rule.userGroupUnique,
                            }))}
                            @change=${(e: Event) =>
                                this.#updateRule(prop.alias, idx, 'userGroupUnique', (e.target as HTMLSelectElement).value)}
                        ></uui-select>

                        <uui-input
                            type="number"
                            class="weight-input"
                            label="Weight"
                            placeholder="0"
                            .value=${String(rule.weight)}
                            @change=${(e: Event) =>
                                this.#updateRule(prop.alias, idx, 'weight', parseInt((e.target as HTMLInputElement).value, 10) || 0)}
                        ></uui-input>

                        <uui-button
                            look="secondary"
                            color="danger"
                            compact
                            @click=${() => this.#removeRule(prop.alias, idx)}
                        >
                            <uui-icon name="icon-trash"></uui-icon>
                        </uui-button>
                    </div>
                `)}

                <uui-button
                    look="placeholder"
                    @click=${() => this.#addRule(prop.alias)}
                >Add rule</uui-button>
            </div>
        `;
    }

    static override styles = [
        css`
            :host {
                display: block;
                padding: var(--uui-size-layout-1);
            }
            uui-box {
                margin-bottom: var(--uui-size-space-4);
            }
            p.none {
                color: var(--uui-color-text-alt);
            }
            code {
                font-family: monospace;
                background: var(--uui-color-surface-alt);
                padding: 1px 4px;
                border-radius: 3px;
            }
            .meta {
                display: grid;
                grid-template-columns: max-content 1fr;
                gap: var(--uui-size-space-2) var(--uui-size-space-5);
                margin-bottom: var(--uui-size-space-4);
            }
            .label {
                font-weight: bold;
                color: var(--uui-color-text-alt);
            }
            .mode-selector {
                margin-bottom: var(--uui-size-space-4);
            }

            /* ── Simple mode ── */
            .block-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: var(--uui-size-space-3);
            }
            .block-check {
                display: flex;
                align-items: center;
                gap: var(--uui-size-space-2);
                padding: var(--uui-size-space-2) var(--uui-size-space-3);
                border: 1px solid var(--uui-color-border);
                border-radius: var(--uui-border-radius);
                cursor: pointer;
            }
            .block-check:hover {
                background: var(--uui-color-surface-alt);
            }
            .block-check uui-icon {
                font-size: 18px;
                color: var(--uui-color-text-alt);
                flex-shrink: 0;
            }

            /* ── Complex mode ── */
            .rules {
                display: flex;
                flex-direction: column;
                gap: var(--uui-size-space-3);
            }
            .rule-row {
                display: flex;
                align-items: center;
                gap: var(--uui-size-space-3);
            }
            .rule-row uui-select {
                flex: 1;
                min-width: 0;
            }
            .rule-row uui-select:first-child {
                flex: 0 0 100px;
            }
            .rule-for {
                font-weight: bold;
                color: var(--uui-color-text-alt);
                flex-shrink: 0;
            }
            .weight-input {
                flex: 0 0 70px;
            }
            .precedence-note {
                font-size: var(--uui-type-small-size);
                color: var(--uui-color-text-alt);
                margin: 0 0 var(--uui-size-space-3) 0;
            }

            /* ── JSON preview ── */
            .actions {
                margin-bottom: var(--uui-size-space-4);
                display: flex;
                justify-content: flex-end;
            }
            pre {
                background: var(--uui-color-surface-alt);
                padding: var(--uui-size-space-4);
                border-radius: var(--uui-border-radius);
                overflow: auto;
                font-size: 12px;
                line-height: 1.5;
                margin: 0;
            }
        `,
    ];
}

export default BlockFilterSettingsTabViewElement;

declare global {
    interface HTMLElementTagNameMap {
        'blockfilter-settings-tab-view': BlockFilterSettingsTabViewElement;
    }
}
