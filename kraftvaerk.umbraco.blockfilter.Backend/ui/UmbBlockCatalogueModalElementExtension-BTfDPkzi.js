var Q = (e) => {
  throw TypeError(e);
};
var Y = (e, t, s) => t.has(e) || Q("Cannot " + s);
var h = (e, t, s) => (Y(e, t, "read from private field"), s ? s.call(e) : t.get(e)), b = (e, t, s) => t.has(e) ? Q("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), u = (e, t, s, r) => (Y(e, t, "write to private field"), r ? r.call(e, s) : t.set(e, s), s);
import { UmbBlockCatalogueModalElement as ut, UMB_BLOCK_WORKSPACE_CONTEXT as pt } from "@umbraco-cms/backoffice/block";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as yt } from "@umbraco-cms/backoffice/document";
import { UMB_VARIANT_WORKSPACE_CONTEXT as ft } from "@umbraco-cms/backoffice/workspace";
import { UMB_MODAL_CONTEXT as Et } from "@umbraco-cms/backoffice/modal";
import { O as Z } from "./index-BUjUVvjl.js";
class mt {
  constructor(t) {
    this.config = t;
  }
}
class tt extends Error {
  constructor(t, s, r) {
    super(r), this.name = "ApiError", this.url = s.url, this.status = s.status, this.statusText = s.statusText, this.body = s.body, this.request = t;
  }
}
class _t extends Error {
  constructor(t) {
    super(t), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
var m, _, y, $, T, U, w;
class St {
  constructor(t) {
    b(this, m);
    b(this, _);
    b(this, y);
    b(this, $);
    b(this, T);
    b(this, U);
    b(this, w);
    u(this, m, !1), u(this, _, !1), u(this, y, !1), u(this, $, []), u(this, T, new Promise((s, r) => {
      u(this, U, s), u(this, w, r);
      const i = (o) => {
        h(this, m) || h(this, _) || h(this, y) || (u(this, m, !0), h(this, U) && h(this, U).call(this, o));
      }, n = (o) => {
        h(this, m) || h(this, _) || h(this, y) || (u(this, _, !0), h(this, w) && h(this, w).call(this, o));
      }, a = (o) => {
        h(this, m) || h(this, _) || h(this, y) || h(this, $).push(o);
      };
      return Object.defineProperty(a, "isResolved", {
        get: () => h(this, m)
      }), Object.defineProperty(a, "isRejected", {
        get: () => h(this, _)
      }), Object.defineProperty(a, "isCancelled", {
        get: () => h(this, y)
      }), t(i, n, a);
    }));
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(t, s) {
    return h(this, T).then(t, s);
  }
  catch(t) {
    return h(this, T).catch(t);
  }
  finally(t) {
    return h(this, T).finally(t);
  }
  cancel() {
    if (!(h(this, m) || h(this, _) || h(this, y))) {
      if (u(this, y, !0), h(this, $).length)
        try {
          for (const t of h(this, $))
            t();
        } catch (t) {
          console.warn("Cancellation threw an error", t);
          return;
        }
      h(this, $).length = 0, h(this, w) && h(this, w).call(this, new _t("Request aborted"));
    }
  }
  get isCancelled() {
    return h(this, y);
  }
}
m = new WeakMap(), _ = new WeakMap(), y = new WeakMap(), $ = new WeakMap(), T = new WeakMap(), U = new WeakMap(), w = new WeakMap();
const V = (e) => e != null, j = (e) => typeof e == "string", K = (e) => j(e) && e !== "", x = (e) => typeof e == "object" && typeof e.type == "string" && typeof e.stream == "function" && typeof e.arrayBuffer == "function" && typeof e.constructor == "function" && typeof e.constructor.name == "string" && /^(Blob|File)$/.test(e.constructor.name) && /^(Blob|File)$/.test(e[Symbol.toStringTag]), nt = (e) => e instanceof FormData, bt = (e) => {
  try {
    return btoa(e);
  } catch {
    return Buffer.from(e).toString("base64");
  }
}, $t = (e) => {
  const t = [], s = (i, n) => {
    t.push(`${encodeURIComponent(i)}=${encodeURIComponent(String(n))}`);
  }, r = (i, n) => {
    V(n) && (Array.isArray(n) ? n.forEach((a) => {
      r(i, a);
    }) : typeof n == "object" ? Object.entries(n).forEach(([a, o]) => {
      r(`${i}[${a}]`, o);
    }) : s(i, n));
  };
  return Object.entries(e).forEach(([i, n]) => {
    r(i, n);
  }), t.length > 0 ? `?${t.join("&")}` : "";
}, wt = (e, t) => {
  const s = e.ENCODE_PATH || encodeURI, r = t.url.replace("{api-version}", e.VERSION).replace(/{(.*?)}/g, (n, a) => {
    var o;
    return (o = t.path) != null && o.hasOwnProperty(a) ? s(String(t.path[a])) : n;
  }), i = `${e.BASE}${r}`;
  return t.query ? `${i}${$t(t.query)}` : i;
}, At = (e) => {
  if (e.formData) {
    const t = new FormData(), s = (r, i) => {
      j(i) || x(i) ? t.append(r, i) : t.append(r, JSON.stringify(i));
    };
    return Object.entries(e.formData).filter(([r, i]) => V(i)).forEach(([r, i]) => {
      Array.isArray(i) ? i.forEach((n) => s(r, n)) : s(r, i);
    }), t;
  }
}, q = async (e, t) => typeof t == "function" ? t(e) : t, vt = async (e, t) => {
  const [s, r, i, n] = await Promise.all([
    q(t, e.TOKEN),
    q(t, e.USERNAME),
    q(t, e.PASSWORD),
    q(t, e.HEADERS)
  ]), a = Object.entries({
    Accept: "application/json",
    ...n,
    ...t.headers
  }).filter(([o, c]) => V(c)).reduce((o, [c, d]) => ({
    ...o,
    [c]: String(d)
  }), {});
  if (K(s) && (a.Authorization = `Bearer ${s}`), K(r) && K(i)) {
    const o = bt(`${r}:${i}`);
    a.Authorization = `Basic ${o}`;
  }
  return t.body !== void 0 && (t.mediaType ? a["Content-Type"] = t.mediaType : x(t.body) ? a["Content-Type"] = t.body.type || "application/octet-stream" : j(t.body) ? a["Content-Type"] = "text/plain" : nt(t.body) || (a["Content-Type"] = "application/json")), new Headers(a);
}, Ot = (e) => {
  var t;
  if (e.body !== void 0)
    return (t = e.mediaType) != null && t.includes("/json") ? JSON.stringify(e.body) : j(e.body) || x(e.body) || nt(e.body) ? e.body : JSON.stringify(e.body);
}, Tt = async (e, t, s, r, i, n, a) => {
  const o = new AbortController(), c = {
    headers: n,
    body: r ?? i,
    method: t.method,
    signal: o.signal
  };
  return e.WITH_CREDENTIALS && (c.credentials = e.CREDENTIALS), a(() => o.abort()), await fetch(s, c);
}, Ct = (e, t) => {
  if (t) {
    const s = e.headers.get(t);
    if (j(s))
      return s;
  }
}, Pt = async (e) => {
  if (e.status !== 204)
    try {
      const t = e.headers.get("Content-Type");
      if (t)
        return ["application/json", "application/problem+json"].some((i) => t.toLowerCase().startsWith(i)) ? await e.json() : await e.text();
    } catch (t) {
      console.error(t);
    }
}, Rt = (e, t) => {
  const r = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    ...e.errors
  }[t.status];
  if (r)
    throw new tt(e, t, r);
  if (!t.ok) {
    const i = t.status ?? "unknown", n = t.statusText ?? "unknown", a = (() => {
      try {
        return JSON.stringify(t.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new tt(
      e,
      t,
      `Generic Error: status: ${i}; status text: ${n}; body: ${a}`
    );
  }
}, Ut = (e, t) => new St(async (s, r, i) => {
  try {
    const n = wt(e, t), a = At(t), o = Ot(t), c = await vt(e, t);
    if (!i.isCancelled) {
      const d = await Tt(e, t, n, o, a, c, i), f = await Pt(d), dt = Ct(d, t.responseHeader), G = {
        url: n,
        ok: d.ok,
        status: d.status,
        statusText: d.statusText,
        body: dt ?? f
      };
      Rt(t, G), s(G.body);
    }
  } catch (n) {
    r(n);
  }
});
class gt extends mt {
  constructor(t) {
    super(t);
  }
  /**
   * Request method
   * @param options The request options from the service
   * @returns CancelablePromise<T>
   * @throws ApiError
   */
  request(t) {
    return Ut(this.config, t);
  }
}
class Mt {
  constructor(t) {
    this.httpRequest = t;
  }
  /**
   * @returns any OK
   * @throws ApiError
   */
  postApiV1BlockfilterRemodel({
    requestBody: t
  }) {
    return this.httpRequest.request({
      method: "POST",
      url: "/api/v1/blockfilter/remodel",
      body: t,
      mediaType: "application/json",
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
}
class Nt {
  constructor(t, s = gt) {
    this.request = new s({
      BASE: (t == null ? void 0 : t.BASE) ?? "",
      VERSION: (t == null ? void 0 : t.VERSION) ?? "1.0",
      WITH_CREDENTIALS: (t == null ? void 0 : t.WITH_CREDENTIALS) ?? !1,
      CREDENTIALS: (t == null ? void 0 : t.CREDENTIALS) ?? "include",
      TOKEN: t == null ? void 0 : t.TOKEN,
      USERNAME: t == null ? void 0 : t.USERNAME,
      PASSWORD: t == null ? void 0 : t.PASSWORD,
      HEADERS: t == null ? void 0 : t.HEADERS,
      ENCODE_PATH: t == null ? void 0 : t.ENCODE_PATH
    }), this.v1 = new Mt(this.request);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bt = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const W = globalThis, J = W.ShadowRoot && (W.ShadyCSS === void 0 || W.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, at = Symbol(), et = /* @__PURE__ */ new WeakMap();
let Dt = class {
  constructor(t, s, r) {
    if (this._$cssResult$ = !0, r !== at) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (J && t === void 0) {
      const r = s !== void 0 && s.length === 1;
      r && (t = et.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && et.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const jt = (e) => new Dt(typeof e == "string" ? e : e + "", void 0, at), qt = (e, t) => {
  if (J) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const r = document.createElement("style"), i = W.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = s.cssText, e.appendChild(r);
  }
}, st = J ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const r of t.cssRules) s += r.cssText;
  return jt(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Wt, defineProperty: It, getOwnPropertyDescriptor: kt, getOwnPropertyNames: Ht, getOwnPropertySymbols: Kt, getPrototypeOf: Lt } = Object, A = globalThis, rt = A.trustedTypes, zt = rt ? rt.emptyScript : "", L = A.reactiveElementPolyfillSupport, M = (e, t) => e, z = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? zt : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let s = e;
  switch (t) {
    case Boolean:
      s = e !== null;
      break;
    case Number:
      s = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(e);
      } catch {
        s = null;
      }
  }
  return s;
} }, ot = (e, t) => !Wt(e, t), it = { attribute: !0, type: String, converter: z, reflect: !1, useDefault: !1, hasChanged: ot };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), A.litPropertyMetadata ?? (A.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
class g extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = it) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(t, r, s);
      i !== void 0 && It(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, s, r) {
    const { get: i, set: n } = kt(this.prototype, t) ?? { get() {
      return this[s];
    }, set(a) {
      this[s] = a;
    } };
    return { get: i, set(a) {
      const o = i == null ? void 0 : i.call(this);
      n == null || n.call(this, a), this.requestUpdate(t, o, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? it;
  }
  static _$Ei() {
    if (this.hasOwnProperty(M("elementProperties"))) return;
    const t = Lt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(M("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(M("properties"))) {
      const s = this.properties, r = [...Ht(s), ...Kt(s)];
      for (const i of r) this.createProperty(i, s[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [r, i] of s) this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, r] of this.elementProperties) {
      const i = this._$Eu(s, r);
      i !== void 0 && this._$Eh.set(i, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const i of r) s.unshift(st(i));
    } else t !== void 0 && s.push(st(t));
    return s;
  }
  static _$Eu(t, s) {
    const r = s.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((s) => this.enableUpdating = s), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((s) => s(this));
  }
  addController(t) {
    var s;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((s = t.hostConnected) == null || s.call(t));
  }
  removeController(t) {
    var s;
    (s = this._$EO) == null || s.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const r of s.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return qt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((s) => {
      var r;
      return (r = s.hostConnected) == null ? void 0 : r.call(s);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((s) => {
      var r;
      return (r = s.hostDisconnected) == null ? void 0 : r.call(s);
    });
  }
  attributeChangedCallback(t, s, r) {
    this._$AK(t, r);
  }
  _$ET(t, s) {
    var n;
    const r = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, r);
    if (i !== void 0 && r.reflect === !0) {
      const a = (((n = r.converter) == null ? void 0 : n.toAttribute) !== void 0 ? r.converter : z).toAttribute(s, r.type);
      this._$Em = t, a == null ? this.removeAttribute(i) : this.setAttribute(i, a), this._$Em = null;
    }
  }
  _$AK(t, s) {
    var n, a;
    const r = this.constructor, i = r._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const o = r.getPropertyOptions(i), c = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((n = o.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? o.converter : z;
      this._$Em = i, this[i] = c.fromAttribute(s, o.type) ?? ((a = this._$Ej) == null ? void 0 : a.get(i)) ?? null, this._$Em = null;
    }
  }
  requestUpdate(t, s, r) {
    var i;
    if (t !== void 0) {
      const n = this.constructor, a = this[t];
      if (r ?? (r = n.getPropertyOptions(t)), !((r.hasChanged ?? ot)(a, s) || r.useDefault && r.reflect && a === ((i = this._$Ej) == null ? void 0 : i.get(t)) && !this.hasAttribute(n._$Eu(t, r)))) return;
      this.C(t, s, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: r, reflect: i, wrapped: n }, a) {
    r && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, a ?? s ?? this[t]), n !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (s = void 0), this._$AL.set(t, s)), i === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var r;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, a] of this._$Ep) this[n] = a;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [n, a] of i) {
        const { wrapped: o } = a, c = this[n];
        o !== !0 || this._$AL.has(n) || c === void 0 || this.C(n, void 0, a, c);
      }
    }
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), (r = this._$EO) == null || r.forEach((i) => {
        var n;
        return (n = i.hostUpdate) == null ? void 0 : n.call(i);
      }), this.update(s)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(s);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var s;
    (s = this._$EO) == null || s.forEach((r) => {
      var i;
      return (i = r.hostUpdated) == null ? void 0 : i.call(r);
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
    this._$Eq && (this._$Eq = this._$Eq.forEach((s) => this._$ET(s, this[s]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
}
g.elementStyles = [], g.shadowRootOptions = { mode: "open" }, g[M("elementProperties")] = /* @__PURE__ */ new Map(), g[M("finalized")] = /* @__PURE__ */ new Map(), L == null || L({ ReactiveElement: g }), (A.reactiveElementVersions ?? (A.reactiveElementVersions = [])).push("2.1.0");
var Ft = Object.defineProperty, Vt = Object.getOwnPropertyDescriptor, ht = (e) => {
  throw TypeError(e);
}, xt = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Vt(t, s) : t, n = e.length - 1, a; n >= 0; n--)
    (a = e[n]) && (i = (r ? a(t, s, i) : a(i)) || i);
  return r && i && Ft(t, s, i), i;
}, X = (e, t, s) => t.has(e) || ht("Cannot " + s), l = (e, t, s) => (X(e, t, "read from private field"), t.get(e)), E = (e, t, s) => t.has(e) ? ht("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), p = (e, t, s, r) => (X(e, t, "write to private field"), t.set(e, s), s), v = (e, t, s) => (X(e, t, "access private method"), s), N, P, R, D, k, B, O, H, I, S, lt, ct, C;
let F = class extends ut {
  constructor() {
    super(), E(this, S), E(this, N, ""), E(this, P, ""), E(this, R, ""), E(this, D, null), E(this, k, !1), E(this, B, null), E(this, O), E(this, H), E(this, I), p(this, H, new Promise((e) => {
      p(this, I, e);
    })), this.consumeContext(pt, (e) => {
      p(this, P, (e == null ? void 0 : e.getUnique()) ?? ""), this.observe(e == null ? void 0 : e.contentKey, (t) => {
        p(this, R, t ?? ""), v(this, S, C).call(this);
      });
    }), this.consumeContext(ft, (e) => {
      p(this, P, (e == null ? void 0 : e.getUnique()) ?? ""), v(this, S, C).call(this);
    }), this.consumeContext(yt, (e) => {
      this.observe(e == null ? void 0 : e.contentTypeUnique, (t) => {
        p(this, R, t ?? ""), v(this, S, C).call(this);
      });
    }), this.consumeContext(Et, (e) => {
      p(this, D, (e == null ? void 0 : e.data) ?? null), v(this, S, C).call(this);
    });
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), v(this, S, lt).call(this), (e = this._manager) != null && e.propertyAlias && this.observe(this._manager.propertyAlias, (t) => {
      p(this, N, t ?? ""), v(this, S, C).call(this);
    });
  }
  /**
   * Calls the BlockFilter API and rebuilds the block catalogue with filtered blocks.
   */
  async handleBlocks(e) {
    var n;
    const t = {
      ...e,
      pageId: l(this, P),
      editingAlias: l(this, N),
      pageTypeId: l(this, R)
    }, r = await new Nt({
      TOKEN: Z.TOKEN,
      BASE: Z.BASE
    }).v1.postApiV1BlockfilterRemodel({
      requestBody: t
    });
    this.data = { ...r }, p(this, B, ((n = this.data) == null ? void 0 : n.blocks.map((a) => a.contentElementTypeKey.toLowerCase())) ?? []), l(this, I).call(this);
    const i = l(this, O);
    this.data.clipboardFilter = async (a) => a.values.flatMap((d) => {
      var f;
      return ((f = d.value) == null ? void 0 : f.contentData) || [];
    }).map((d) => {
      var f;
      return (f = d.contentTypeKey) == null ? void 0 : f.toLowerCase();
    }).filter(Boolean).every((d) => {
      var f;
      return (f = l(this, B)) == null ? void 0 : f.includes(d);
    }) ? typeof i == "function" ? await i(a) : !0 : !1, this.connectedCallback();
  }
};
N = /* @__PURE__ */ new WeakMap();
P = /* @__PURE__ */ new WeakMap();
R = /* @__PURE__ */ new WeakMap();
D = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakMap();
O = /* @__PURE__ */ new WeakMap();
H = /* @__PURE__ */ new WeakMap();
I = /* @__PURE__ */ new WeakMap();
S = /* @__PURE__ */ new WeakSet();
lt = function() {
  !this.data || l(this, O) !== void 0 || (p(this, O, this.data.clipboardFilter), this.data = { ...this.data }, this.data.clipboardFilter = async (e) => (await l(this, H), e.values.flatMap((r) => {
    var i;
    return ((i = r.value) == null ? void 0 : i.contentData) || [];
  }).map((r) => {
    var i;
    return (i = r.contentTypeKey) == null ? void 0 : i.toLowerCase();
  }).filter(Boolean).every((r) => {
    var i;
    return (i = l(this, B)) == null ? void 0 : i.includes(r);
  }) ? typeof l(this, O) == "function" ? await l(this, O).call(this, e) : !0 : !1));
};
ct = function() {
  return !!(l(this, D) && l(this, N) && l(this, P) && l(this, R));
};
C = function() {
  l(this, k) || !v(this, S, ct).call(this) || (p(this, k, !0), this.handleBlocks(l(this, D)));
};
F = xt([
  Bt("umb-block-catalogue-modal-extend")
], F);
const ee = F;
export {
  F as UmbBlockCatalogueModalElementExtension,
  ee as default
};
//# sourceMappingURL=UmbBlockCatalogueModalElementExtension-BTfDPkzi.js.map
