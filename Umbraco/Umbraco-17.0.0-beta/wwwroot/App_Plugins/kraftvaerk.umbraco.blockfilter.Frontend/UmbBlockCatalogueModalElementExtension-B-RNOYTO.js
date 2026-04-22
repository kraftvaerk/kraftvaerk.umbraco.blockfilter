import { UmbBlockCatalogueModalElement as x, UMB_BLOCK_WORKSPACE_CONTEXT as W } from "@umbraco-cms/backoffice/block";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as F } from "@umbraco-cms/backoffice/document";
import { UMB_VARIANT_WORKSPACE_CONTEXT as X } from "@umbraco-cms/backoffice/workspace";
import { UMB_MODAL_CONTEXT as V } from "@umbraco-cms/backoffice/modal";
import { B as H, O as k } from "./index-Bsfdud1v.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = (i) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(i, t);
  }) : customElements.define(i, t);
};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const P = globalThis, T = P.ShadowRoot && (P.ShadyCSS === void 0 || P.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, D = Symbol(), B = /* @__PURE__ */ new WeakMap();
let G = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== D) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (T && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = B.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && B.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Q = (i) => new G(typeof i == "string" ? i : i + "", void 0, D), Y = (i, t) => {
  if (T) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), r = P.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = e.cssText, i.appendChild(s);
  }
}, K = T ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return Q(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Z, defineProperty: tt, getOwnPropertyDescriptor: et, getOwnPropertyNames: st, getOwnPropertySymbols: it, getPrototypeOf: rt } = Object, u = globalThis, I = u.trustedTypes, ot = I ? I.emptyScript : "", U = u.reactiveElementPolyfillSupport, g = (i, t) => i, M = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? ot : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, L = (i, t) => !Z(i, t), N = { attribute: !0, type: String, converter: M, reflect: !1, useDefault: !1, hasChanged: L };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), u.litPropertyMetadata ?? (u.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
class v extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = N) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(t, s, e);
      r !== void 0 && tt(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: r, set: o } = et(this.prototype, t) ?? { get() {
      return this[e];
    }, set(a) {
      this[e] = a;
    } };
    return { get: r, set(a) {
      const l = r == null ? void 0 : r.call(this);
      o == null || o.call(this, a), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? N;
  }
  static _$Ei() {
    if (this.hasOwnProperty(g("elementProperties"))) return;
    const t = rt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(g("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(g("properties"))) {
      const e = this.properties, s = [...st(e), ...it(e)];
      for (const r of s) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, r] of e) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const r = this._$Eu(e, s);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const r of s) e.unshift(K(r));
    } else t !== void 0 && e.push(K(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((e) => e(this));
  }
  addController(t) {
    var e;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((e = t.hostConnected) == null || e.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Y(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostConnected) == null ? void 0 : s.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostDisconnected) == null ? void 0 : s.call(e);
    });
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    var o;
    const s = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, s);
    if (r !== void 0 && s.reflect === !0) {
      const a = (((o = s.converter) == null ? void 0 : o.toAttribute) !== void 0 ? s.converter : M).toAttribute(e, s.type);
      this._$Em = t, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var o, a;
    const s = this.constructor, r = s._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const l = s.getPropertyOptions(r), m = typeof l.converter == "function" ? { fromAttribute: l.converter } : ((o = l.converter) == null ? void 0 : o.fromAttribute) !== void 0 ? l.converter : M;
      this._$Em = r, this[r] = m.fromAttribute(e, l.type) ?? ((a = this._$Ej) == null ? void 0 : a.get(r)) ?? null, this._$Em = null;
    }
  }
  requestUpdate(t, e, s) {
    var r;
    if (t !== void 0) {
      const o = this.constructor, a = this[t];
      if (s ?? (s = o.getPropertyOptions(t)), !((s.hasChanged ?? L)(a, e) || s.useDefault && s.reflect && a === ((r = this._$Ej) == null ? void 0 : r.get(t)) && !this.hasAttribute(o._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: r, wrapped: o }, a) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, a ?? e ?? this[t]), o !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [o, a] of this._$Ep) this[o] = a;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [o, a] of r) {
        const { wrapped: l } = a, m = this[o];
        l !== !0 || this._$AL.has(o) || m === void 0 || this.C(o, void 0, a, m);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (s = this._$EO) == null || s.forEach((r) => {
        var o;
        return (o = r.hostUpdate) == null ? void 0 : o.call(r);
      }), this.update(e)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((s) => {
      var r;
      return (r = s.hostUpdated) == null ? void 0 : r.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
}
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[g("elementProperties")] = /* @__PURE__ */ new Map(), v[g("finalized")] = /* @__PURE__ */ new Map(), U == null || U({ ReactiveElement: v }), (u.reactiveElementVersions ?? (u.reactiveElementVersions = [])).push("2.1.0");
var at = Object.defineProperty, nt = Object.getOwnPropertyDescriptor, z = (i) => {
  throw TypeError(i);
}, ht = (i, t, e, s) => {
  for (var r = s > 1 ? void 0 : s ? nt(t, e) : t, o = i.length - 1, a; o >= 0; o--)
    (a = i[o]) && (r = (s ? a(t, e, r) : a(r)) || r);
  return s && r && at(t, e, r), r;
}, R = (i, t, e) => t.has(i) || z("Cannot " + e), n = (i, t, e) => (R(i, t, "read from private field"), t.get(i)), d = (i, t, e) => t.has(i) ? z("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(i) : t.set(i, e), _ = (i, t, e, s) => (R(i, t, "write to private field"), t.set(i, e), e), f = (i, t, e) => (R(i, t, "access private method"), e), S, b, A, w, y, O, C, c, q, j, E;
let h = class extends x {
  constructor() {
    super(), d(this, c), d(this, S, ""), d(this, b, null), d(this, A, !1), d(this, w, null), d(this, y), d(this, O), d(this, C), _(this, O, new Promise((i) => {
      _(this, C, i);
    })), this.consumeContext(W, () => {
      f(this, c, E).call(this);
    }), this.consumeContext(X, (i) => {
      h.pageId = (i == null ? void 0 : i.getUnique()) ?? "", f(this, c, E).call(this);
    }).passContextAliasMatches(), this.consumeContext(F, (i) => {
      this.observe(i == null ? void 0 : i.contentTypeUnique, (t) => {
        h.pageTypeId = t ?? "", f(this, c, E).call(this);
      });
    }).passContextAliasMatches(), this.consumeContext(V, (i) => {
      _(this, b, (i == null ? void 0 : i.data) ?? null), f(this, c, E).call(this);
    });
  }
  connectedCallback() {
    var i;
    super.connectedCallback(), f(this, c, q).call(this), (i = this._manager) != null && i.propertyAlias && this.observe(this._manager.propertyAlias, (t) => {
      _(this, S, t ?? ""), f(this, c, E).call(this);
    });
  }
  /**
   * Calls the BlockFilter API and rebuilds the block catalogue with filtered blocks.
   */
  async handleBlocks(i) {
    var o;
    const t = {
      ...i,
      pageId: h.pageId,
      editingAlias: n(this, S),
      pageTypeId: h.pageTypeId
    }, s = await new H({
      TOKEN: k.TOKEN,
      BASE: k.BASE
    }).v1.postApiV1BlockfilterRemodel({
      requestBody: t
    });
    this.data = { ...s }, _(this, w, ((o = this.data) == null ? void 0 : o.blocks.map((a) => a.contentElementTypeKey.toLowerCase())) ?? []), n(this, C).call(this);
    const r = n(this, y);
    this.data.clipboardFilter = async (a) => a.values.flatMap(($) => {
      var p;
      return ((p = $.value) == null ? void 0 : p.contentData) || [];
    }).map(($) => {
      var p;
      return (p = $.contentTypeKey) == null ? void 0 : p.toLowerCase();
    }).filter(Boolean).every(($) => {
      var p;
      return (p = n(this, w)) == null ? void 0 : p.includes($);
    }) ? typeof r == "function" ? await r(a) : !0 : !1, this.connectedCallback();
  }
};
S = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
A = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakMap();
y = /* @__PURE__ */ new WeakMap();
O = /* @__PURE__ */ new WeakMap();
C = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakSet();
q = function() {
  !this.data || n(this, y) !== void 0 || (_(this, y, this.data.clipboardFilter), this.data = { ...this.data }, this.data.clipboardFilter = async (i) => (await n(this, O), i.values.flatMap((s) => {
    var r;
    return ((r = s.value) == null ? void 0 : r.contentData) || [];
  }).map((s) => {
    var r;
    return (r = s.contentTypeKey) == null ? void 0 : r.toLowerCase();
  }).filter(Boolean).every((s) => {
    var r;
    return (r = n(this, w)) == null ? void 0 : r.includes(s);
  }) ? typeof n(this, y) == "function" ? await n(this, y).call(this, i) : !0 : !1));
};
j = function() {
  return !!(n(this, b) && n(this, S) && h.pageId && h.pageTypeId);
};
E = function() {
  n(this, A) || !f(this, c, j).call(this) || (_(this, A, !0), this.handleBlocks(n(this, b)));
};
h.pageId = "";
h.pageTypeId = "";
h = ht([
  J("umb-block-catalogue-modal-extend")
], h);
const _t = h;
export {
  h as UmbBlockCatalogueModalElementExtension,
  _t as default
};
//# sourceMappingURL=UmbBlockCatalogueModalElementExtension-B-RNOYTO.js.map
