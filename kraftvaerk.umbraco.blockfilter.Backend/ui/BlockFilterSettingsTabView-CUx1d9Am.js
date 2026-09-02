import { UmbElementMixin as Z } from "@umbraco-cms/backoffice/element-api";
import { LitElement as j, html as m, css as ee, state as v, customElement as te } from "@umbraco-cms/backoffice/external/lit";
import { UmbDocumentTypeItemRepository as ie, UMB_DOCUMENT_TYPE_WORKSPACE_CONTEXT as oe } from "@umbraco-cms/backoffice/document-type";
import { UmbDataTypeItemRepository as se, UmbDataTypeDetailRepository as ae } from "@umbraco-cms/backoffice/data-type";
import { UmbUserGroupCollectionRepository as ne } from "@umbraco-cms/backoffice/user-group";
import { UMB_NOTIFICATION_CONTEXT as le } from "@umbraco-cms/backoffice/notification";
import { B as S, O as x } from "./index-CvfmLJdg.js";
var ce = Object.defineProperty, re = Object.getOwnPropertyDescriptor, R = (e) => {
  throw TypeError(e);
}, y = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? re(t, i) : t, s = e.length - 1, u; s >= 0; s--)
    (u = e[s]) && (r = (o ? u(t, i, r) : u(r)) || r);
  return o && r && ce(t, i, r), r;
}, P = (e, t, i) => t.has(e) || R("Cannot " + i), E = (e, t, i) => (P(e, t, "read from private field"), i ? i.call(e) : t.get(e)), B = (e, t, i) => t.has(e) ? R("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), ue = (e, t, i, o) => (P(e, t, "write to private field"), t.set(e, i), i), l = (e, t, i) => (P(e, t, "access private method"), i), M, q, A, O, K, n, z, D, F, L, W, g, $, N, J, X, T, H, V, Y, Q;
const pe = /* @__PURE__ */ new Set([
  "Umb.PropertyEditorUi.BlockList",
  "Umb.PropertyEditorUi.BlockGrid"
]), de = 1e3;
let h = class extends Z(j) {
  constructor() {
    super(...arguments), B(this, n), B(this, M, new se(this)), B(this, q, new ae(this)), B(this, A, new ie(this)), B(this, O, new ne(this)), B(this, K), this._blockProperties = [], this._userGroups = [], this._rootNodes = [], this._loading = !0, this._saving = !1, this._configs = /* @__PURE__ */ new Map();
  }
  connectedCallback() {
    super.connectedCallback(), l(this, n, L).call(this).catch(
      (e) => console.error("BlockFilter: failed to load user groups", e)
    ), l(this, n, F).call(this).catch(
      (e) => console.error("BlockFilter: failed to load root nodes", e)
    ), this.consumeContext(le, (e) => {
      e && ue(this, K, e);
    }), this.consumeContext(oe, (e) => {
      e && (this._documentTypeKey = e.getUnique() ?? void 0, this.observe(e.structure.contentTypeProperties, (t) => {
        this._loading = !0, l(this, n, z).call(this, t).catch((i) => {
          console.error("BlockFilter: failed to load block properties", i), this._loading = !1;
        });
      }));
    });
  }
  /** Build the full JSON config for all properties */
  getConfigJson() {
    return this._blockProperties.map((e) => {
      const t = l(this, n, g).call(this, e.alias), i = {
        propertyAlias: e.alias,
        mode: t.mode
      };
      return t.mode === "simple" ? i.simple = { enabledBlockKeys: [...t.enabledBlocks] } : t.mode === "complex" && (i.complex = {
        rules: t.rules.map((o) => ({
          type: o.type,
          blockKey: o.blockKey,
          userGroup: o.userGroupUnique,
          rootNode: o.rootNodeKey ?? "any",
          weight: o.weight
        }))
      }), i;
    });
  }
  render() {
    return this._loading ? m`<uui-loader></uui-loader>` : this._blockProperties.length === 0 ? m`
                <uui-box headline="Block Filter">
                    <p class="none">No Block List or Block Grid properties found on this document type.</p>
                </uui-box>
            ` : m`
            ${this._blockProperties.map((e) => l(this, n, V).call(this, e))}

            <div class="actions">
                <uui-button
                    look="primary"
                    color="positive"
                    ?disabled=${this._saving}
                    @click=${() => l(this, n, H).call(this)}
                >${this._saving ? "Saving..." : "Save configuration"}</uui-button>
            </div>
        `;
  }
};
M = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakMap();
A = /* @__PURE__ */ new WeakMap();
O = /* @__PURE__ */ new WeakMap();
K = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakSet();
z = async function(e) {
  if (!(e != null && e.length)) {
    this._blockProperties = [], this._loading = !1;
    return;
  }
  const t = e, i = [...new Set(t.map((a) => a.dataType.unique))], { data: o } = await E(this, M).requestItems(i);
  if (!o) {
    this._blockProperties = [], this._loading = !1;
    return;
  }
  const r = new Map(
    o.filter((a) => pe.has(a.propertyEditorUiAlias)).map((a) => [a.unique, a])
  ), s = t.filter((a) => r.has(a.dataType.unique)), u = [...new Set(s.map((a) => a.dataType.unique))], c = await Promise.all(
    u.map(async (a) => {
      const p = await E(this, q).requestByUnique(a);
      return { id: a, detail: p.data };
    })
  ), _ = new Map(
    c.map(({ id: a, detail: p }) => [a, p])
  ), d = /* @__PURE__ */ new Set();
  for (const a of _.values()) {
    if (!a) continue;
    const p = a.values.find((b) => b.alias === "blocks"), f = p == null ? void 0 : p.value;
    if (f)
      for (const b of f)
        b.contentElementTypeKey && d.add(b.contentElementTypeKey);
  }
  const I = /* @__PURE__ */ new Map();
  if (d.size > 0) {
    const { data: a } = await E(this, A).requestItems([...d]);
    if (a)
      for (const p of a) {
        const f = p.icon || "icon-document";
        I.set(p.unique, { name: p.name ?? p.unique, icon: f.split(" ")[0] });
      }
  }
  const C = s.map((a) => {
    const p = _.get(a.dataType.unique), f = p == null ? void 0 : p.values.find((k) => k.alias === "blocks"), b = (f == null ? void 0 : f.value) ?? [], G = r.get(a.dataType.unique);
    return {
      name: a.name,
      alias: a.alias,
      editorUiAlias: G.propertyEditorUiAlias,
      dataType: G,
      availableBlocks: b.filter((k) => k.contentElementTypeKey).map((k) => {
        const w = I.get(k.contentElementTypeKey);
        return {
          key: k.contentElementTypeKey,
          name: (w == null ? void 0 : w.name) ?? k.contentElementTypeKey,
          icon: (w == null ? void 0 : w.icon) || "icon-document"
        };
      })
    };
  }), U = new Map(this._configs);
  for (const a of C)
    U.has(a.alias) || U.set(a.alias, {
      mode: "none",
      enabledBlocks: new Set(a.availableBlocks.map((p) => p.key)),
      rules: []
    });
  this._configs = U, this._blockProperties = C, this._documentTypeKey && await l(this, n, D).call(this, C), this._loading = !1;
};
D = async function(e) {
  var t, i;
  try {
    const r = await new S({ TOKEN: x.TOKEN, BASE: x.BASE }).v1.getBlockfilterConfigurationByDocumentTypeKey({
      documentTypeKey: this._documentTypeKey
    }), s = new Map(this._configs);
    for (const u of r) {
      const c = e.find((d) => d.alias === u.propertyAlias);
      if (!c) continue;
      const _ = {
        mode: u.mode,
        enabledBlocks: new Set(
          ((t = u.simple) == null ? void 0 : t.enabledBlockKeys) ?? c.availableBlocks.map((d) => d.key)
        ),
        rules: (((i = u.complex) == null ? void 0 : i.rules) ?? []).map((d) => ({
          type: d.type,
          blockKey: d.blockKey,
          userGroupUnique: d.userGroup,
          weight: d.weight,
          rootNodeKey: d.rootNode ?? "any"
        }))
      };
      s.set(u.propertyAlias, _);
    }
    this._configs = s;
  } catch {
  }
};
F = async function() {
  const t = await new S({ TOKEN: x.TOKEN, BASE: x.BASE }).v1.getBlockfilterRootNodes();
  this._rootNodes = t.map((i) => ({ name: i.name, key: i.key }));
};
L = async function() {
  const { data: e } = await E(this, O).requestCollection({
    skip: 0,
    take: de
  });
  e != null && e.items && (this._userGroups = e.items.map((t) => ({ name: t.name ?? t.unique, unique: t.unique })));
};
W = function(e) {
  return e === "Umb.PropertyEditorUi.BlockGrid" ? "Block Grid" : e === "Umb.PropertyEditorUi.BlockList" ? "Block List" : e;
};
g = function(e) {
  return this._configs.get(e);
};
$ = function(e, t) {
  const i = l(this, n, g).call(this, e), o = new Map(this._configs);
  o.set(e, { ...i, mode: t }), this._configs = o;
};
N = function(e, t, i) {
  const o = l(this, n, g).call(this, e), r = new Set(o.enabledBlocks);
  i ? r.add(t) : r.delete(t);
  const s = new Map(this._configs);
  s.set(e, { ...o, enabledBlocks: r }), this._configs = s;
};
J = function(e) {
  var r;
  const t = l(this, n, g).call(this, e), i = this._blockProperties.find((s) => s.alias === e), o = new Map(this._configs);
  o.set(e, {
    ...t,
    rules: [
      ...t.rules,
      {
        type: "allow",
        blockKey: ((r = i.availableBlocks[0]) == null ? void 0 : r.key) ?? "",
        userGroupUnique: "everyone",
        weight: 0,
        rootNodeKey: "any"
      }
    ]
  }), this._configs = o;
};
X = function(e, t) {
  const i = l(this, n, g).call(this, e), o = new Map(this._configs);
  o.set(e, {
    ...i,
    rules: i.rules.filter((r, s) => s !== t)
  }), this._configs = o;
};
T = function(e, t, i, o) {
  const r = l(this, n, g).call(this, e), s = r.rules.map((c, _) => _ === t ? { ...c, [i]: o } : c), u = new Map(this._configs);
  u.set(e, { ...r, rules: s }), this._configs = u;
};
H = async function() {
  var e, t;
  if (this._documentTypeKey) {
    this._saving = !0;
    try {
      await new S({ TOKEN: x.TOKEN, BASE: x.BASE }).v1.postBlockfilterConfigurationByDocumentTypeKey({
        documentTypeKey: this._documentTypeKey,
        requestBody: this.getConfigJson()
      }), (e = E(this, K)) == null || e.peek("positive", {
        data: { message: "Block filter configuration saved." }
      });
    } catch (i) {
      console.error("Failed to save block filter configuration", i), (t = E(this, K)) == null || t.peek("danger", {
        data: {
          headline: "Block Filter",
          message: "Failed to save configuration. Please try again."
        }
      });
    } finally {
      this._saving = !1;
    }
  }
};
V = function(e) {
  const t = l(this, n, g).call(this, e.alias);
  return m`
            <uui-box headline="${e.name}">
                <div class="meta">
                    <span class="label">Alias</span>
                    <span><code>${e.alias}</code></span>
                    <span class="label">Editor</span>
                    <span>${l(this, n, W).call(this, e.editorUiAlias)} · ${e.dataType.name}</span>
                </div>

                <div class="mode-selector">
                    <uui-button-group>
                        <uui-button
                            look=${t.mode === "none" ? "primary" : "secondary"}
                            @click=${() => l(this, n, $).call(this, e.alias, "none")}
                        >None</uui-button>
                        <uui-button
                            look=${t.mode === "simple" ? "primary" : "secondary"}
                            @click=${() => l(this, n, $).call(this, e.alias, "simple")}
                        >Simple</uui-button>
                        <uui-button
                            look=${t.mode === "complex" ? "primary" : "secondary"}
                            @click=${() => l(this, n, $).call(this, e.alias, "complex")}
                        >Complex</uui-button>
                    </uui-button-group>
                </div>

                ${t.mode === "none" ? m`<p class="none">No block filtering configured for this property.</p>` : t.mode === "simple" ? l(this, n, Y).call(this, e, t) : l(this, n, Q).call(this, e, t)}
            </uui-box>
        `;
};
Y = function(e, t) {
  return e.availableBlocks.length === 0 ? m`<p class="none">No blocks configured on this editor.</p>` : m`
            <div class="block-grid">
                ${e.availableBlocks.map(
    (i) => m`
                        <label
                            class="block-check"
                            @click=${() => l(this, n, N).call(this, e.alias, i.key, !t.enabledBlocks.has(i.key))}
                        >
                            <uui-checkbox
                                ?checked=${t.enabledBlocks.has(i.key)}
                                @click=${(o) => o.stopPropagation()}
                                @change=${(o) => l(this, n, N).call(this, e.alias, i.key, o.target.checked)}
                            ></uui-checkbox>
                            <uui-icon name=${i.icon} aria-hidden="true"></uui-icon>
                            <span>${i.name}</span>
                        </label>
                    `
  )}
            </div>
        `;
};
Q = function(e, t) {
  const i = [
    { name: "Everyone", value: "everyone" },
    ...this._userGroups.map((s) => ({ name: s.name, value: s.unique }))
  ], o = [
    { name: "Any root node", value: "any" },
    ...this._rootNodes.map((s) => ({ name: s.name, value: s.key }))
  ], r = e.availableBlocks.map((s) => ({
    name: s.name,
    value: s.key
  }));
  return m`
            <p class="precedence-note">Rules are evaluated by weight — higher weight takes precedence.</p>
            <div class="rules">
                ${t.rules.map((s, u) => m`
                    <div class="rule-row">
                        <uui-select
                            .options=${[
    { name: "Allow", value: "allow", selected: s.type === "allow" },
    { name: "Deny", value: "deny", selected: s.type === "deny" }
  ]}
                            @change=${(c) => l(this, n, T).call(this, e.alias, u, "type", c.target.value)}
                        ></uui-select>

                        <uui-select
                            .options=${r.map((c) => ({
    ...c,
    selected: c.value === s.blockKey
  }))}
                            @change=${(c) => l(this, n, T).call(this, e.alias, u, "blockKey", c.target.value)}
                        ></uui-select>

                        <span class="rule-for">for</span>

                        <uui-select
                            .options=${i.map((c) => ({
    ...c,
    selected: c.value === s.userGroupUnique
  }))}
                            @change=${(c) => l(this, n, T).call(this, e.alias, u, "userGroupUnique", c.target.value)}
                        ></uui-select>
                        <span class="rule-for">at</span>

                        <uui-select
                            .options=${o.map((c) => ({
    ...c,
    selected: c.value == s.rootNodeKey
  }))}
                            @change=${(c) => l(this, n, T).call(this, e.alias, u, "rootNodeKey", c.target.value)}
                        ></uui-select>
                        <uui-input
                            type="number"
                            class="weight-input"
                            label="Weight"
                            placeholder="0"
                            .value=${String(s.weight)}
                            @change=${(c) => l(this, n, T).call(this, e.alias, u, "weight", parseInt(c.target.value, 10) || 0)}
                        ></uui-input>

                        <uui-button
                            look="secondary"
                            color="danger"
                            compact
                            @click=${() => l(this, n, X).call(this, e.alias, u)}
                        >
                            <uui-icon name="icon-trash"></uui-icon>
                        </uui-button>
                    </div>
                `)}

                <uui-button
                    look="placeholder"
                    @click=${() => l(this, n, J).call(this, e.alias)}
                >Add rule</uui-button>
            </div>
        `;
};
h.styles = [
  ee`
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
                user-select: none;
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
                flex-wrap: wrap;
                gap: var(--uui-size-space-3);
            }
            .rule-row uui-select {
                flex: 1 1 140px;
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

            /* ── Actions ── */
            .actions {
                margin-bottom: var(--uui-size-space-4);
                display: flex;
                justify-content: flex-end;
            }
        `
];
y([
  v()
], h.prototype, "_blockProperties", 2);
y([
  v()
], h.prototype, "_userGroups", 2);
y([
  v()
], h.prototype, "_rootNodes", 2);
y([
  v()
], h.prototype, "_loading", 2);
y([
  v()
], h.prototype, "_saving", 2);
y([
  v()
], h.prototype, "_documentTypeKey", 2);
y([
  v()
], h.prototype, "_configs", 2);
h = y([
  te("blockfilter-settings-tab-view")
], h);
const _e = h;
export {
  h as BlockFilterSettingsTabViewElement,
  _e as default
};
//# sourceMappingURL=BlockFilterSettingsTabView-CUx1d9Am.js.map
