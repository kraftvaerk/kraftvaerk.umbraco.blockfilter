import { UmbElementMixin as Z } from "@umbraco-cms/backoffice/element-api";
import { LitElement as j, html as f, css as ee, state as _, customElement as te } from "@umbraco-cms/backoffice/external/lit";
import { UmbDocumentTypeItemRepository as oe, UMB_DOCUMENT_TYPE_WORKSPACE_CONTEXT as ie } from "@umbraco-cms/backoffice/document-type";
import { UmbDataTypeItemRepository as se, UmbDataTypeDetailRepository as ae } from "@umbraco-cms/backoffice/data-type";
import { UmbUserGroupCollectionRepository as ne } from "@umbraco-cms/backoffice/user-group";
import { UMB_NOTIFICATION_CONTEXT as le } from "@umbraco-cms/backoffice/notification";
import { B as S, O as K } from "./index-CTXYPfj9.js";
var ce = Object.defineProperty, re = Object.getOwnPropertyDescriptor, R = (e) => {
  throw TypeError(e);
}, g = (e, t, o, i) => {
  for (var c = i > 1 ? void 0 : i ? re(t, o) : t, u = e.length - 1, s; u >= 0; u--)
    (s = e[u]) && (c = (i ? s(t, o, c) : s(c)) || c);
  return i && c && ce(t, o, c), c;
}, P = (e, t, o) => t.has(e) || R("Cannot " + o), E = (e, t, o) => (P(e, t, "read from private field"), o ? o.call(e) : t.get(e)), B = (e, t, o) => t.has(e) ? R("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, o), ue = (e, t, o, i) => (P(e, t, "write to private field"), t.set(e, o), o), l = (e, t, o) => (P(e, t, "access private method"), o), M, q, O, A, x, n, z, D, F, L, W, k, $, C, J, X, T, H, V, Y, Q;
const pe = /* @__PURE__ */ new Set([
  "Umb.PropertyEditorUi.BlockList",
  "Umb.PropertyEditorUi.BlockGrid"
]), de = 1e3;
let m = class extends Z(j) {
  constructor() {
    super(...arguments), B(this, n), B(this, M, new se(this)), B(this, q, new ae(this)), B(this, O, new oe(this)), B(this, A, new ne(this)), B(this, x), this._blockProperties = [], this._userGroups = [], this._rootNodes = [], this._loading = !0, this._saving = !1, this._configs = /* @__PURE__ */ new Map();
  }
  connectedCallback() {
    super.connectedCallback(), l(this, n, L).call(this).catch(
      (e) => console.error("BlockFilter: failed to load user groups", e)
    ), l(this, n, F).call(this).catch(
      (e) => console.error("BlockFilter: failed to load root nodes", e)
    ), this.consumeContext(le, (e) => {
      e && ue(this, x, e);
    }), this.consumeContext(ie, (e) => {
      e && (this._documentTypeKey = e.getUnique() ?? void 0, this.observe(e.structure.contentTypeProperties, (t) => {
        this._loading = !0, l(this, n, z).call(this, t).catch((o) => {
          console.error("BlockFilter: failed to load block properties", o), this._loading = !1;
        });
      }));
    });
  }
  /** Build the full JSON config for all properties */
  getConfigJson() {
    return this._blockProperties.map((e) => {
      const t = l(this, n, k).call(this, e.alias), o = {
        propertyAlias: e.alias,
        mode: t.mode
      };
      return t.mode === "simple" ? o.simple = { enabledBlockKeys: [...t.enabledBlocks] } : t.mode === "complex" && (o.complex = {
        rules: t.rules.map((i) => ({
          type: i.type,
          blockKey: i.blockKey,
          userGroup: i.userGroupUnique,
          rootNode: i.rootNodeKey ?? "any",
          weight: i.weight
        }))
      }), o;
    });
  }
  render() {
    return this._loading ? f`<uui-loader></uui-loader>` : this._blockProperties.length === 0 ? f`
                <uui-box headline="Block Filter">
                    <p class="none">No Block List or Block Grid properties found on this document type.</p>
                </uui-box>
            ` : f`
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
O = /* @__PURE__ */ new WeakMap();
A = /* @__PURE__ */ new WeakMap();
x = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakSet();
z = async function(e) {
  if (!(e != null && e.length)) {
    this._blockProperties = [], this._loading = !1;
    return;
  }
  const t = e, o = [...new Set(t.map((a) => a.dataType.unique))], { data: i } = await E(this, M).requestItems(o);
  if (!i) {
    this._blockProperties = [], this._loading = !1;
    return;
  }
  const c = new Map(
    i.filter((a) => pe.has(a.propertyEditorUiAlias)).map((a) => [a.unique, a])
  ), u = t.filter((a) => c.has(a.dataType.unique)), s = [...new Set(u.map((a) => a.dataType.unique))], d = await Promise.all(
    s.map(async (a) => {
      const p = await E(this, q).requestByUnique(a);
      return { id: a, detail: p.data };
    })
  ), r = new Map(
    d.map(({ id: a, detail: p }) => [a, p])
  ), h = /* @__PURE__ */ new Set();
  for (const a of r.values()) {
    if (!a) continue;
    const p = a.values.find((b) => b.alias === "blocks"), y = p == null ? void 0 : p.value;
    if (y)
      for (const b of y)
        b.contentElementTypeKey && h.add(b.contentElementTypeKey);
  }
  const I = /* @__PURE__ */ new Map();
  if (h.size > 0) {
    const { data: a } = await E(this, O).requestItems([...h]);
    if (a)
      for (const p of a) {
        const y = p.icon || "icon-document";
        I.set(p.unique, { name: p.name ?? p.unique, icon: y.split(" ")[0] });
      }
  }
  const N = u.map((a) => {
    const p = r.get(a.dataType.unique), y = p == null ? void 0 : p.values.find((v) => v.alias === "blocks"), b = (y == null ? void 0 : y.value) ?? [], G = c.get(a.dataType.unique);
    return {
      name: a.name,
      alias: a.alias,
      editorUiAlias: G.propertyEditorUiAlias,
      dataType: G,
      availableBlocks: b.filter((v) => v.contentElementTypeKey).map((v) => {
        const w = I.get(v.contentElementTypeKey);
        return {
          key: v.contentElementTypeKey,
          name: (w == null ? void 0 : w.name) ?? v.contentElementTypeKey,
          icon: (w == null ? void 0 : w.icon) || "icon-document"
        };
      })
    };
  }), U = new Map(this._configs);
  for (const a of N)
    U.has(a.alias) || U.set(a.alias, {
      mode: "none",
      enabledBlocks: new Set(a.availableBlocks.map((p) => p.key)),
      rules: []
    });
  this._configs = U, this._blockProperties = N, this._documentTypeKey && await l(this, n, D).call(this, N), this._loading = !1;
};
D = async function(e) {
  var t, o;
  try {
    const c = await new S({ TOKEN: K.TOKEN, BASE: K.BASE }).v1.getBlockfilterConfigurationByDocumentTypeKey({
      documentTypeKey: this._documentTypeKey
    }), u = new Map(this._configs);
    for (const s of c) {
      const d = e.find((h) => h.alias === s.propertyAlias);
      if (!d) continue;
      const r = {
        mode: s.mode,
        enabledBlocks: new Set(
          ((t = s.simple) == null ? void 0 : t.enabledBlockKeys) ?? d.availableBlocks.map((h) => h.key)
        ),
        rules: (((o = s.complex) == null ? void 0 : o.rules) ?? []).map((h) => ({
          type: h.type,
          blockKey: h.blockKey,
          userGroupUnique: h.userGroup,
          weight: h.weight,
          rootNodeKey: h.rootNode ?? "any"
        }))
      };
      u.set(s.propertyAlias, r);
    }
    this._configs = u;
  } catch {
  }
};
F = async function() {
  const t = await new S({ TOKEN: K.TOKEN, BASE: K.BASE }).v1.getBlockfilterRootNodes();
  this._rootNodes = t.map((o) => ({ name: o.name, key: o.key }));
};
L = async function() {
  const { data: e } = await E(this, A).requestCollection({
    skip: 0,
    take: de
  });
  e != null && e.items && (this._userGroups = e.items.map((t) => ({ name: t.name ?? t.unique, unique: t.unique })));
};
W = function(e) {
  return e === "Umb.PropertyEditorUi.BlockGrid" ? "Block Grid" : e === "Umb.PropertyEditorUi.BlockList" ? "Block List" : e;
};
k = function(e) {
  return this._configs.get(e);
};
$ = function(e, t) {
  const o = l(this, n, k).call(this, e), i = new Map(this._configs);
  i.set(e, { ...o, mode: t }), this._configs = i;
};
C = function(e, t, o) {
  const i = l(this, n, k).call(this, e), c = new Set(i.enabledBlocks);
  o ? c.add(t) : c.delete(t);
  const u = new Map(this._configs);
  u.set(e, { ...i, enabledBlocks: c }), this._configs = u;
};
J = function(e) {
  var c;
  const t = l(this, n, k).call(this, e), o = this._blockProperties.find((u) => u.alias === e), i = new Map(this._configs);
  i.set(e, {
    ...t,
    rules: [
      ...t.rules,
      {
        type: "allow",
        blockKey: ((c = o.availableBlocks[0]) == null ? void 0 : c.key) ?? "",
        userGroupUnique: "everyone",
        weight: 0,
        rootNodeKey: "any"
      }
    ]
  }), this._configs = i;
};
X = function(e, t) {
  const o = l(this, n, k).call(this, e), i = new Map(this._configs);
  i.set(e, {
    ...o,
    rules: o.rules.filter((c, u) => u !== t)
  }), this._configs = i;
};
T = function(e, t, o, i) {
  const c = l(this, n, k).call(this, e), u = c.rules.map((d, r) => r === t ? { ...d, [o]: i } : d), s = new Map(this._configs);
  s.set(e, { ...c, rules: u }), this._configs = s;
};
H = async function() {
  var e, t;
  if (this._documentTypeKey) {
    this._saving = !0;
    try {
      await new S({ TOKEN: K.TOKEN, BASE: K.BASE }).v1.postBlockfilterConfigurationByDocumentTypeKey({
        documentTypeKey: this._documentTypeKey,
        requestBody: this.getConfigJson()
      }), (e = E(this, x)) == null || e.peek("positive", {
        data: { message: "Block filter configuration saved." }
      });
    } catch (o) {
      console.error("Failed to save block filter configuration", o), (t = E(this, x)) == null || t.peek("danger", {
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
  const t = l(this, n, k).call(this, e.alias);
  return f`
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

                ${t.mode === "none" ? f`<p class="none">No block filtering configured for this property.</p>` : t.mode === "simple" ? l(this, n, Y).call(this, e, t) : l(this, n, Q).call(this, e, t)}
            </uui-box>
        `;
};
Y = function(e, t) {
  return e.availableBlocks.length === 0 ? f`<p class="none">No blocks configured on this editor.</p>` : f`
            <div class="block-grid">
                ${e.availableBlocks.map(
    (o) => f`
                        <label
                            class="block-check"
                            @click=${() => l(this, n, C).call(this, e.alias, o.key, !t.enabledBlocks.has(o.key))}
                        >
                            <uui-checkbox
                                ?checked=${t.enabledBlocks.has(o.key)}
                                @click=${(i) => i.stopPropagation()}
                                @change=${(i) => l(this, n, C).call(this, e.alias, o.key, i.target.checked)}
                            ></uui-checkbox>
                            <uui-icon name=${o.icon} aria-hidden="true"></uui-icon>
                            <span>${o.name}</span>
                        </label>
                    `
  )}
            </div>
        `;
};
Q = function(e, t) {
  const o = [
    { name: "Everyone", value: "everyone" },
    ...this._userGroups.map((s) => ({ name: s.name, value: s.unique }))
  ], i = [
    { name: "Anywhere", value: "any" },
    ...this._rootNodes.map((s) => ({ name: s.name, value: s.key }))
  ], c = (s) => s.rootNodeKey && !i.some((d) => d.value === s.rootNodeKey) ? [...i, { name: `Unlisted node (${s.rootNodeKey})`, value: s.rootNodeKey }] : i, u = e.availableBlocks.map((s) => ({
    name: s.name,
    value: s.key
  }));
  return f`
            <p class="precedence-note">Rules are evaluated by weight — higher weight takes precedence.</p>
            <div class="rules">
                ${t.rules.map((s, d) => f`
                    <div class="rule-row">
                        <uui-select
                            .options=${[
    { name: "Allow", value: "allow", selected: s.type === "allow" },
    { name: "Deny", value: "deny", selected: s.type === "deny" }
  ]}
                            @change=${(r) => l(this, n, T).call(this, e.alias, d, "type", r.target.value)}
                        ></uui-select>

                        <uui-select
                            .options=${u.map((r) => ({
    ...r,
    selected: r.value === s.blockKey
  }))}
                            @change=${(r) => l(this, n, T).call(this, e.alias, d, "blockKey", r.target.value)}
                        ></uui-select>

                        <span class="rule-for">for</span>

                        <uui-select
                            .options=${o.map((r) => ({
    ...r,
    selected: r.value === s.userGroupUnique
  }))}
                            @change=${(r) => l(this, n, T).call(this, e.alias, d, "userGroupUnique", r.target.value)}
                        ></uui-select>
                        <span class="rule-for">at</span>

                        <uui-select
                            .options=${c(s).map((r) => ({
    ...r,
    selected: r.value === s.rootNodeKey
  }))}
                            @change=${(r) => l(this, n, T).call(this, e.alias, d, "rootNodeKey", r.target.value)}
                        ></uui-select>
                        <uui-input
                            type="number"
                            class="weight-input"
                            label="Weight"
                            placeholder="0"
                            .value=${String(s.weight)}
                            @change=${(r) => l(this, n, T).call(this, e.alias, d, "weight", parseInt(r.target.value, 10) || 0)}
                        ></uui-input>

                        <uui-button
                            look="secondary"
                            color="danger"
                            compact
                            @click=${() => l(this, n, X).call(this, e.alias, d)}
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
m.styles = [
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
g([
  _()
], m.prototype, "_blockProperties", 2);
g([
  _()
], m.prototype, "_userGroups", 2);
g([
  _()
], m.prototype, "_rootNodes", 2);
g([
  _()
], m.prototype, "_loading", 2);
g([
  _()
], m.prototype, "_saving", 2);
g([
  _()
], m.prototype, "_documentTypeKey", 2);
g([
  _()
], m.prototype, "_configs", 2);
m = g([
  te("blockfilter-settings-tab-view")
], m);
const _e = m;
export {
  m as BlockFilterSettingsTabViewElement,
  _e as default
};
//# sourceMappingURL=BlockFilterSettingsTabView-MzoA5PxQ.js.map
