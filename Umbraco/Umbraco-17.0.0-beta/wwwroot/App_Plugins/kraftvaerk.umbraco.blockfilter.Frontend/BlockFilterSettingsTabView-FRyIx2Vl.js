import { UmbElementMixin as X } from "@umbraco-cms/backoffice/element-api";
import { LitElement as Y, html as d, css as H, state as w, customElement as Q } from "@umbraco-cms/backoffice/external/lit";
import { UmbDocumentTypeItemRepository as Z, UMB_DOCUMENT_TYPE_WORKSPACE_CONTEXT as j } from "@umbraco-cms/backoffice/document-type";
import { UmbDataTypeItemRepository as ee, UmbDataTypeDetailRepository as te } from "@umbraco-cms/backoffice/data-type";
import { UmbUserGroupCollectionRepository as ie } from "@umbraco-cms/backoffice/user-group";
import { B as A, O as $ } from "./index-Bsfdud1v.js";
var se = Object.defineProperty, oe = Object.getOwnPropertyDescriptor, G = (e) => {
  throw TypeError(e);
}, v = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? oe(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (s = (a ? l(t, i, s) : l(s)) || s);
  return a && s && se(t, i, s), s;
}, z = (e, t, i) => t.has(e) || G("Cannot " + i), x = (e, t, i) => (z(e, t, "read from private field"), i ? i.call(e) : t.get(e)), B = (e, t, i) => t.has(e) ? G("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), r = (e, t, i) => (z(e, t, "access private method"), i), U, P, q, C, c, O, I, R, f, E, N, D, L, T, W, F, J, V;
const ae = /* @__PURE__ */ new Set([
  "Umb.PropertyEditorUi.BlockList",
  "Umb.PropertyEditorUi.BlockGrid"
]);
let h = class extends X(Y) {
  constructor() {
    super(), B(this, c), B(this, U, new ee(this)), B(this, P, new te(this)), B(this, q, new Z(this)), B(this, C, new ie(this)), this._blockProperties = [], this._userGroups = [], this._loading = !0, this._saving = !1, this._configs = /* @__PURE__ */ new Map(), r(this, c, I).call(this), this.consumeContext(j, (e) => {
      this._documentTypeKey = e.getUnique() ?? void 0, this.observe(e.structure.contentTypeProperties, async (t) => {
        if (this._loading = !0, !(t != null && t.length)) {
          this._blockProperties = [], this._loading = !1;
          return;
        }
        const i = [...new Set(t.map((o) => o.dataType.unique))], { data: a } = await x(this, U).requestItems(i);
        if (!a) {
          this._blockProperties = [], this._loading = !1;
          return;
        }
        const s = new Map(
          a.filter((o) => ae.has(o.propertyEditorUiAlias)).map((o) => [o.unique, o])
        ), n = t.filter((o) => s.has(o.dataType.unique)), l = [...new Set(n.map((o) => o.dataType.unique))], y = await Promise.all(
          l.map(async (o) => {
            const u = await x(this, P).requestByUnique(o);
            return { id: o, detail: u.data };
          })
        ), b = new Map(
          y.map(({ id: o, detail: u }) => [o, u])
        ), p = /* @__PURE__ */ new Set();
        for (const o of b.values()) {
          if (!o) continue;
          const u = o.values.find((k) => k.alias === "blocks"), m = u == null ? void 0 : u.value;
          if (m)
            for (const k of m)
              k.contentElementTypeKey && p.add(k.contentElementTypeKey);
        }
        const M = /* @__PURE__ */ new Map();
        if (p.size > 0) {
          const { data: o } = await x(this, q).requestItems([...p]);
          if (o)
            for (const u of o) {
              const m = u.icon || "icon-document";
              M.set(u.unique, { name: u.name, icon: m.split(" ")[0] });
            }
        }
        const K = n.map((o) => {
          const u = b.get(o.dataType.unique), m = u == null ? void 0 : u.values.find((g) => g.alias === "blocks"), k = (m == null ? void 0 : m.value) ?? [];
          return {
            name: o.name,
            alias: o.alias,
            editorUiAlias: s.get(o.dataType.unique).propertyEditorUiAlias,
            dataType: s.get(o.dataType.unique),
            availableBlocks: k.filter((g) => g.contentElementTypeKey).map((g) => {
              const _ = M.get(g.contentElementTypeKey);
              return {
                key: g.contentElementTypeKey,
                name: (_ == null ? void 0 : _.name) ?? g.contentElementTypeKey,
                icon: (_ == null ? void 0 : _.icon) || "icon-document"
              };
            })
          };
        }), S = new Map(this._configs);
        for (const o of K)
          S.has(o.alias) || S.set(o.alias, {
            mode: "none",
            enabledBlocks: new Set(o.availableBlocks.map((u) => u.key)),
            rules: []
          });
        this._configs = S, this._blockProperties = K, this._documentTypeKey && await r(this, c, O).call(this, K), this._loading = !1;
      });
    });
  }
  /** Build the full JSON config for all properties */
  getConfigJson() {
    return this._blockProperties.map((e) => {
      const t = r(this, c, f).call(this, e.alias), i = {
        propertyAlias: e.alias,
        mode: t.mode
      };
      return t.mode === "simple" ? i.simple = { enabledBlockKeys: [...t.enabledBlocks] } : i.complex = {
        rules: t.rules.map((a) => ({
          type: a.type,
          blockKey: a.blockKey,
          userGroup: a.userGroupUnique,
          weight: a.weight
        }))
      }, i;
    });
  }
  render() {
    return this._loading ? d`<uui-loader></uui-loader>` : this._blockProperties.length === 0 ? d`
                <uui-box headline="Block Filter">
                    <p class="none">No Block List or Block Grid properties found on this document type.</p>
                </uui-box>
            ` : d`
            ${this._blockProperties.map((e) => r(this, c, F).call(this, e))}

            <div class="actions">
                <uui-button
                    look="primary"
                    color="positive"
                    ?disabled=${this._saving}
                    @click=${() => r(this, c, W).call(this)}
                >${this._saving ? "Saving..." : "Save configuration"}</uui-button>
            </div>

            <uui-box headline="Generated configuration">
                <pre>${JSON.stringify(this.getConfigJson(), null, 2)}</pre>
            </uui-box>
        `;
  }
};
U = /* @__PURE__ */ new WeakMap();
P = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakMap();
C = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakSet();
O = async function(e) {
  var t, i;
  try {
    const s = await new A({ TOKEN: $.TOKEN, BASE: $.BASE }).v1.getApiV1BlockfilterConfiguration({
      documentTypeKey: this._documentTypeKey
    }), n = new Map(this._configs);
    for (const l of s) {
      const y = e.find((p) => p.alias === l.propertyAlias);
      if (!y) continue;
      const b = {
        mode: l.mode,
        enabledBlocks: new Set(
          ((t = l.simple) == null ? void 0 : t.enabledBlockKeys) ?? y.availableBlocks.map((p) => p.key)
        ),
        rules: (((i = l.complex) == null ? void 0 : i.rules) ?? []).map((p) => ({
          type: p.type,
          blockKey: p.blockKey,
          userGroupUnique: p.userGroup,
          weight: p.weight
        }))
      };
      n.set(l.propertyAlias, b);
    }
    this._configs = n;
  } catch {
  }
};
I = async function() {
  const { data: e } = await x(this, C).requestCollection({ skip: 0, take: 1e3 });
  e != null && e.items && (this._userGroups = e.items.map((t) => ({ name: t.name, unique: t.unique })));
};
R = function(e) {
  return e === "Umb.PropertyEditorUi.BlockGrid" ? "Block Grid" : e === "Umb.PropertyEditorUi.BlockList" ? "Block List" : e;
};
f = function(e) {
  return this._configs.get(e);
};
E = function(e, t) {
  const i = r(this, c, f).call(this, e), a = this._blockProperties.find((n) => n.alias === e), s = new Map(this._configs);
  s.set(e, {
    ...i,
    mode: t,
    // Reset to defaults when switching
    enabledBlocks: new Set(a.availableBlocks.map((n) => n.key)),
    rules: []
  }), this._configs = s;
};
N = function(e, t, i) {
  const a = r(this, c, f).call(this, e), s = new Set(a.enabledBlocks);
  i ? s.add(t) : s.delete(t);
  const n = new Map(this._configs);
  n.set(e, { ...a, enabledBlocks: s }), this._configs = n;
};
D = function(e) {
  var s;
  const t = r(this, c, f).call(this, e), i = this._blockProperties.find((n) => n.alias === e), a = new Map(this._configs);
  a.set(e, {
    ...t,
    rules: [
      ...t.rules,
      {
        type: "allow",
        blockKey: ((s = i.availableBlocks[0]) == null ? void 0 : s.key) ?? "",
        userGroupUnique: "everyone",
        weight: 0
      }
    ]
  }), this._configs = a;
};
L = function(e, t) {
  const i = r(this, c, f).call(this, e), a = new Map(this._configs);
  a.set(e, {
    ...i,
    rules: i.rules.filter((s, n) => n !== t)
  }), this._configs = a;
};
T = function(e, t, i, a) {
  const s = r(this, c, f).call(this, e), n = s.rules.map((y, b) => b === t ? { ...y, [i]: a } : y), l = new Map(this._configs);
  l.set(e, { ...s, rules: n }), this._configs = l;
};
W = async function() {
  if (this._documentTypeKey) {
    this._saving = !0;
    try {
      await new A({ TOKEN: $.TOKEN, BASE: $.BASE }).v1.postApiV1BlockfilterConfiguration({
        documentTypeKey: this._documentTypeKey,
        requestBody: this.getConfigJson()
      });
    } catch (e) {
      console.error("Failed to save block filter configuration", e);
    } finally {
      this._saving = !1;
    }
  }
};
F = function(e) {
  const t = r(this, c, f).call(this, e.alias);
  return d`
            <uui-box headline="${e.name}">
                <div class="meta">
                    <span class="label">Alias</span>
                    <span><code>${e.alias}</code></span>
                    <span class="label">Editor</span>
                    <span>${r(this, c, R).call(this, e.editorUiAlias)} · ${e.dataType.name}</span>
                </div>

                <div class="mode-selector">
                    <uui-button-group>
                        <uui-button
                            look=${t.mode === "none" ? "primary" : "secondary"}
                            @click=${() => r(this, c, E).call(this, e.alias, "none")}
                        >None</uui-button>
                        <uui-button
                            look=${t.mode === "simple" ? "primary" : "secondary"}
                            @click=${() => r(this, c, E).call(this, e.alias, "simple")}
                        >Simple</uui-button>
                        <uui-button
                            look=${t.mode === "complex" ? "primary" : "secondary"}
                            @click=${() => r(this, c, E).call(this, e.alias, "complex")}
                        >Complex</uui-button>
                    </uui-button-group>
                </div>

                ${t.mode === "none" ? d`<p class="none">No block filtering configured for this property.</p>` : t.mode === "simple" ? r(this, c, J).call(this, e, t) : r(this, c, V).call(this, e, t)}
            </uui-box>
        `;
};
J = function(e, t) {
  return e.availableBlocks.length === 0 ? d`<p class="none">No blocks configured on this editor.</p>` : d`
            <div class="block-grid">
                ${e.availableBlocks.map(
    (i) => d`
                        <label class="block-check">
                            <uui-checkbox
                                ?checked=${t.enabledBlocks.has(i.key)}
                                @change=${(a) => r(this, c, N).call(this, e.alias, i.key, a.target.checked)}
                            ></uui-checkbox>
                            <uui-icon name=${i.icon} aria-hidden="true"></uui-icon>
                            <span>${i.name}</span>
                        </label>
                    `
  )}
            </div>
        `;
};
V = function(e, t) {
  const i = [
    { name: "Everyone", value: "everyone" },
    ...this._userGroups.map((s) => ({ name: s.name, value: s.unique }))
  ], a = e.availableBlocks.map((s) => ({
    name: s.name,
    value: s.key
  }));
  return d`
            <p class="precedence-note">Rules are evaluated by weight — higher weight takes precedence.</p>
            <div class="rules">
                ${t.rules.map((s, n) => d`
                    <div class="rule-row">
                        <uui-select
                            .options=${[
    { name: "Allow", value: "allow", selected: s.type === "allow" },
    { name: "Deny", value: "deny", selected: s.type === "deny" }
  ]}
                            @change=${(l) => r(this, c, T).call(this, e.alias, n, "type", l.target.value)}
                        ></uui-select>

                        <uui-select
                            .options=${a.map((l) => ({
    ...l,
    selected: l.value === s.blockKey
  }))}
                            @change=${(l) => r(this, c, T).call(this, e.alias, n, "blockKey", l.target.value)}
                        ></uui-select>

                        <span class="rule-for">for</span>

                        <uui-select
                            .options=${i.map((l) => ({
    ...l,
    selected: l.value === s.userGroupUnique
  }))}
                            @change=${(l) => r(this, c, T).call(this, e.alias, n, "userGroupUnique", l.target.value)}
                        ></uui-select>

                        <uui-input
                            type="number"
                            class="weight-input"
                            label="Weight"
                            placeholder="0"
                            .value=${String(s.weight)}
                            @change=${(l) => r(this, c, T).call(this, e.alias, n, "weight", parseInt(l.target.value, 10) || 0)}
                        ></uui-input>

                        <uui-button
                            look="secondary"
                            color="danger"
                            compact
                            @click=${() => r(this, c, L).call(this, e.alias, n)}
                        >
                            <uui-icon name="icon-trash"></uui-icon>
                        </uui-button>
                    </div>
                `)}

                <uui-button
                    look="placeholder"
                    @click=${() => r(this, c, D).call(this, e.alias)}
                >Add rule</uui-button>
            </div>
        `;
};
h.styles = [
  H`
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
        `
];
v([
  w()
], h.prototype, "_blockProperties", 2);
v([
  w()
], h.prototype, "_userGroups", 2);
v([
  w()
], h.prototype, "_loading", 2);
v([
  w()
], h.prototype, "_saving", 2);
v([
  w()
], h.prototype, "_documentTypeKey", 2);
v([
  w()
], h.prototype, "_configs", 2);
h = v([
  Q("blockfilter-settings-tab-view")
], h);
const de = h;
export {
  h as BlockFilterSettingsTabViewElement,
  de as default
};
//# sourceMappingURL=BlockFilterSettingsTabView-FRyIx2Vl.js.map
