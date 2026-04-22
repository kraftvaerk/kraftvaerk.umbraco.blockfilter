var N = (t) => {
  throw TypeError(t);
};
var C = (t, e, r) => e.has(t) || N("Cannot " + r);
var a = (t, e, r) => (C(t, e, "read from private field"), r ? r.call(t) : e.get(t)), p = (t, e, r) => e.has(t) ? N("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), l = (t, e, r, n) => (C(t, e, "write to private field"), n ? n.call(t, r) : e.set(t, r), r);
import { UMB_AUTH_CONTEXT as $ } from "@umbraco-cms/backoffice/auth";
class U {
  constructor(e) {
    this.config = e;
  }
}
class k extends Error {
  constructor(e, r, n) {
    super(n), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class g extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
var d, h, u, E, S, T, m;
class V {
  constructor(e) {
    p(this, d);
    p(this, h);
    p(this, u);
    p(this, E);
    p(this, S);
    p(this, T);
    p(this, m);
    l(this, d, !1), l(this, h, !1), l(this, u, !1), l(this, E, []), l(this, S, new Promise((r, n) => {
      l(this, T, r), l(this, m, n);
      const s = (c) => {
        a(this, d) || a(this, h) || a(this, u) || (l(this, d, !0), a(this, T) && a(this, T).call(this, c));
      }, o = (c) => {
        a(this, d) || a(this, h) || a(this, u) || (l(this, h, !0), a(this, m) && a(this, m).call(this, c));
      }, i = (c) => {
        a(this, d) || a(this, h) || a(this, u) || a(this, E).push(c);
      };
      return Object.defineProperty(i, "isResolved", {
        get: () => a(this, d)
      }), Object.defineProperty(i, "isRejected", {
        get: () => a(this, h)
      }), Object.defineProperty(i, "isCancelled", {
        get: () => a(this, u)
      }), e(s, o, i);
    }));
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(e, r) {
    return a(this, S).then(e, r);
  }
  catch(e) {
    return a(this, S).catch(e);
  }
  finally(e) {
    return a(this, S).finally(e);
  }
  cancel() {
    if (!(a(this, d) || a(this, h) || a(this, u))) {
      if (l(this, u, !0), a(this, E).length)
        try {
          for (const e of a(this, E))
            e();
        } catch (e) {
          console.warn("Cancellation threw an error", e);
          return;
        }
      a(this, E).length = 0, a(this, m) && a(this, m).call(this, new g("Request aborted"));
    }
  }
  get isCancelled() {
    return a(this, u);
  }
}
d = new WeakMap(), h = new WeakMap(), u = new WeakMap(), E = new WeakMap(), S = new WeakMap(), T = new WeakMap(), m = new WeakMap();
const B = (t) => t != null, f = (t) => typeof t == "string", R = (t) => f(t) && t !== "", O = (t) => typeof t == "object" && typeof t.type == "string" && typeof t.stream == "function" && typeof t.arrayBuffer == "function" && typeof t.constructor == "function" && typeof t.constructor.name == "string" && /^(Blob|File)$/.test(t.constructor.name) && /^(Blob|File)$/.test(t[Symbol.toStringTag]), D = (t) => t instanceof FormData, W = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, v = (t) => {
  const e = [], r = (s, o) => {
    e.push(`${encodeURIComponent(s)}=${encodeURIComponent(String(o))}`);
  }, n = (s, o) => {
    B(o) && (Array.isArray(o) ? o.forEach((i) => {
      n(s, i);
    }) : typeof o == "object" ? Object.entries(o).forEach(([i, c]) => {
      n(`${s}[${i}]`, c);
    }) : r(s, o));
  };
  return Object.entries(t).forEach(([s, o]) => {
    n(s, o);
  }), e.length > 0 ? `?${e.join("&")}` : "";
}, _ = (t, e) => {
  const r = t.ENCODE_PATH || encodeURI, n = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (o, i) => {
    var c;
    return (c = e.path) != null && c.hasOwnProperty(i) ? r(String(e.path[i])) : o;
  }), s = `${t.BASE}${n}`;
  return e.query ? `${s}${v(e.query)}` : s;
}, F = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (n, s) => {
      f(s) || O(s) ? e.append(n, s) : e.append(n, JSON.stringify(s));
    };
    return Object.entries(t.formData).filter(([n, s]) => B(s)).forEach(([n, s]) => {
      Array.isArray(s) ? s.forEach((o) => r(n, o)) : r(n, s);
    }), e;
  }
}, A = async (t, e) => typeof e == "function" ? e(t) : e, K = async (t, e) => {
  const [r, n, s, o] = await Promise.all([
    A(e, t.TOKEN),
    A(e, t.USERNAME),
    A(e, t.PASSWORD),
    A(e, t.HEADERS)
  ]), i = Object.entries({
    Accept: "application/json",
    ...o,
    ...e.headers
  }).filter(([c, y]) => B(y)).reduce((c, [y, b]) => ({
    ...c,
    [y]: String(b)
  }), {});
  if (R(r) && (i.Authorization = `Bearer ${r}`), R(n) && R(s)) {
    const c = W(`${n}:${s}`);
    i.Authorization = `Basic ${c}`;
  }
  return e.body !== void 0 && (e.mediaType ? i["Content-Type"] = e.mediaType : O(e.body) ? i["Content-Type"] = e.body.type || "application/octet-stream" : f(e.body) ? i["Content-Type"] = "text/plain" : D(e.body) || (i["Content-Type"] = "application/json")), new Headers(i);
}, L = (t) => {
  var e;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("/json") ? JSON.stringify(t.body) : f(t.body) || O(t.body) || D(t.body) ? t.body : JSON.stringify(t.body);
}, M = async (t, e, r, n, s, o, i) => {
  const c = new AbortController(), y = {
    headers: o,
    body: n ?? s,
    method: e.method,
    signal: c.signal
  };
  return t.WITH_CREDENTIALS && (y.credentials = t.CREDENTIALS), i(() => c.abort()), await fetch(r, y);
}, J = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (f(r))
      return r;
  }
}, x = async (t) => {
  if (t.status !== 204)
    try {
      const e = t.headers.get("Content-Type");
      if (e)
        return ["application/json", "application/problem+json"].some((s) => e.toLowerCase().startsWith(s)) ? await t.json() : await t.text();
    } catch (e) {
      console.error(e);
    }
}, G = (t, e) => {
  const n = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    ...t.errors
  }[e.status];
  if (n)
    throw new k(t, e, n);
  if (!e.ok) {
    const s = e.status ?? "unknown", o = e.statusText ?? "unknown", i = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new k(
      t,
      e,
      `Generic Error: status: ${s}; status text: ${o}; body: ${i}`
    );
  }
}, z = (t, e) => new V(async (r, n, s) => {
  try {
    const o = _(t, e), i = F(e), c = L(e), y = await K(t, e);
    if (!s.isCancelled) {
      const b = await M(t, e, o, c, i, y, s), H = await x(b), P = J(b, e.responseHeader), w = {
        url: o,
        ok: b.ok,
        status: b.status,
        statusText: b.statusText,
        body: P ?? H
      };
      G(e, w), r(w.body);
    }
  } catch (o) {
    n(o);
  }
});
class Q extends U {
  constructor(e) {
    super(e);
  }
  /**
   * Request method
   * @param options The request options from the service
   * @returns CancelablePromise<T>
   * @throws ApiError
   */
  request(e) {
    return z(this.config, e);
  }
}
class X {
  constructor(e) {
    this.httpRequest = e;
  }
  /**
   * @returns any OK
   * @throws ApiError
   */
  getApiV1BlockfilterConfiguration({
    documentTypeKey: e
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/api/v1/blockfilter/configuration/{documentTypeKey}",
      path: {
        documentTypeKey: e
      },
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @returns any OK
   * @throws ApiError
   */
  postApiV1BlockfilterConfiguration({
    documentTypeKey: e,
    requestBody: r
  }) {
    return this.httpRequest.request({
      method: "POST",
      url: "/api/v1/blockfilter/configuration/{documentTypeKey}",
      path: {
        documentTypeKey: e
      },
      body: r,
      mediaType: "application/json",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @returns any OK
   * @throws ApiError
   */
  postApiV1BlockfilterRemodel({
    requestBody: e
  }) {
    return this.httpRequest.request({
      method: "POST",
      url: "/api/v1/blockfilter/remodel",
      body: e,
      mediaType: "application/json",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        409: "Conflict",
        500: "Internal Server Error"
      }
    });
  }
  /**
   * @returns any OK
   * @throws ApiError
   */
  getApiV1BlockfilterSettings() {
    return this.httpRequest.request({
      method: "GET",
      url: "/api/v1/blockfilter/settings",
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
}
class Y {
  constructor(e, r = Q) {
    this.request = new r({
      BASE: (e == null ? void 0 : e.BASE) ?? "",
      VERSION: (e == null ? void 0 : e.VERSION) ?? "1.0",
      WITH_CREDENTIALS: (e == null ? void 0 : e.WITH_CREDENTIALS) ?? !1,
      CREDENTIALS: (e == null ? void 0 : e.CREDENTIALS) ?? "include",
      TOKEN: e == null ? void 0 : e.TOKEN,
      USERNAME: e == null ? void 0 : e.USERNAME,
      PASSWORD: e == null ? void 0 : e.PASSWORD,
      HEADERS: e == null ? void 0 : e.HEADERS,
      ENCODE_PATH: e == null ? void 0 : e.ENCODE_PATH
    }), this.v1 = new X(this.request);
  }
}
const q = {
  BASE: "",
  VERSION: "1.0",
  WITH_CREDENTIALS: !1,
  CREDENTIALS: "include",
  TOKEN: void 0,
  USERNAME: void 0,
  PASSWORD: void 0,
  HEADERS: void 0,
  ENCODE_PATH: void 0
}, j = "Umb.Modal.BlockCatalogue", Z = [
  {
    type: "modal",
    // This alias is the key. We're overriding the core catalogue by reusing its alias.
    // If the alias ever changes upstream, update this to match.
    alias: j,
    name: "Block Catalogue Modal Extension",
    elementName: "umb-block-catalogue-modal-extend",
    js: () => import("./UmbBlockCatalogueModalElementExtension-B-RNOYTO.js"),
    // Make sure we win registration ordering if both exist:
    weight: -1e4
  }
], ee = {
  type: "workspaceView",
  alias: "Kraftvaerk.Blockfilter.WorkspaceView.SettingsTab",
  name: "BlockFilter Settings Tab",
  element: () => import("./BlockFilterSettingsTabView-FRyIx2Vl.js"),
  weight: 100,
  meta: {
    label: "BlockFilter",
    pathname: "blockfilter",
    icon: "icon-filter"
  },
  conditions: [
    {
      alias: "Umb.Condition.WorkspaceAlias",
      match: "Umb.Workspace.DocumentType"
    }
  ]
}, se = async (t, e) => {
  t.consumeContext($, async (r) => {
    const n = await (r == null ? void 0 : r.getLatestToken()) ?? "", s = (r == null ? void 0 : r.getServerUrl()) ?? "";
    q.BASE = s, q.TOKEN = n;
    try {
      (await new Y({ TOKEN: n, BASE: s }).v1.getApiV1BlockfilterSettings()).enableSettingsTab === !0 && e.register(ee);
    } catch {
    }
    I(e);
  });
};
function I(t) {
  setTimeout(() => {
    const e = t.getByAlias(j);
    e ? (t.unregister(e.alias), t.registerMany(Z)) : I(t);
  }, 200);
}
export {
  Y as B,
  q as O,
  se as o
};
//# sourceMappingURL=index-Bsfdud1v.js.map
