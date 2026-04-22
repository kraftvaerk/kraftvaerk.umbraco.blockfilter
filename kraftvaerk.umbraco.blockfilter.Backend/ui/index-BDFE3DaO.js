var k = (t) => {
  throw TypeError(t);
};
var q = (t, e, r) => e.has(t) || k("Cannot " + r);
var a = (t, e, r) => (q(t, e, "read from private field"), r ? r.call(t) : e.get(t)), p = (t, e, r) => e.has(t) ? k("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), l = (t, e, r, n) => (q(t, e, "write to private field"), n ? n.call(t, r) : e.set(t, r), r);
import { UMB_AUTH_CONTEXT as U } from "@umbraco-cms/backoffice/auth";
class g {
  constructor(e) {
    this.config = e;
  }
}
class D extends Error {
  constructor(e, r, n) {
    super(n), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class _ extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
var d, h, u, E, b, S, T;
class v {
  constructor(e) {
    p(this, d);
    p(this, h);
    p(this, u);
    p(this, E);
    p(this, b);
    p(this, S);
    p(this, T);
    l(this, d, !1), l(this, h, !1), l(this, u, !1), l(this, E, []), l(this, b, new Promise((r, n) => {
      l(this, S, r), l(this, T, n);
      const s = (c) => {
        a(this, d) || a(this, h) || a(this, u) || (l(this, d, !0), a(this, S) && a(this, S).call(this, c));
      }, o = (c) => {
        a(this, d) || a(this, h) || a(this, u) || (l(this, h, !0), a(this, T) && a(this, T).call(this, c));
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
    return a(this, b).then(e, r);
  }
  catch(e) {
    return a(this, b).catch(e);
  }
  finally(e) {
    return a(this, b).finally(e);
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
      a(this, E).length = 0, a(this, T) && a(this, T).call(this, new _("Request aborted"));
    }
  }
  get isCancelled() {
    return a(this, u);
  }
}
d = new WeakMap(), h = new WeakMap(), u = new WeakMap(), E = new WeakMap(), b = new WeakMap(), S = new WeakMap(), T = new WeakMap();
const B = (t) => t != null, f = (t) => typeof t == "string", R = (t) => f(t) && t !== "", w = (t) => typeof t == "object" && typeof t.type == "string" && typeof t.stream == "function" && typeof t.arrayBuffer == "function" && typeof t.constructor == "function" && typeof t.constructor.name == "string" && /^(Blob|File)$/.test(t.constructor.name) && /^(Blob|File)$/.test(t[Symbol.toStringTag]), I = (t) => t instanceof FormData, V = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, W = (t) => {
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
}, x = (t, e) => {
  const r = t.ENCODE_PATH || encodeURI, n = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (o, i) => {
    var c;
    return (c = e.path) != null && c.hasOwnProperty(i) ? r(String(e.path[i])) : o;
  }), s = `${t.BASE}${n}`;
  return e.query ? `${s}${W(e.query)}` : s;
}, F = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (n, s) => {
      f(s) || w(s) ? e.append(n, s) : e.append(n, JSON.stringify(s));
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
  }).filter(([c, y]) => B(y)).reduce((c, [y, m]) => ({
    ...c,
    [y]: String(m)
  }), {});
  if (R(r) && (i.Authorization = `Bearer ${r}`), R(n) && R(s)) {
    const c = V(`${n}:${s}`);
    i.Authorization = `Basic ${c}`;
  }
  return e.body !== void 0 && (e.mediaType ? i["Content-Type"] = e.mediaType : w(e.body) ? i["Content-Type"] = e.body.type || "application/octet-stream" : f(e.body) ? i["Content-Type"] = "text/plain" : I(e.body) || (i["Content-Type"] = "application/json")), new Headers(i);
}, L = (t) => {
  var e;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("/json") ? JSON.stringify(t.body) : f(t.body) || w(t.body) || I(t.body) ? t.body : JSON.stringify(t.body);
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
}, G = async (t) => {
  if (t.status !== 204)
    try {
      const e = t.headers.get("Content-Type");
      if (e)
        return ["application/json", "application/problem+json"].some((s) => e.toLowerCase().startsWith(s)) ? await t.json() : await t.text();
    } catch (e) {
      console.error(e);
    }
}, z = (t, e) => {
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
    throw new D(t, e, n);
  if (!e.ok) {
    const s = e.status ?? "unknown", o = e.statusText ?? "unknown", i = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new D(
      t,
      e,
      `Generic Error: status: ${s}; status text: ${o}; body: ${i}`
    );
  }
}, X = (t, e) => new v(async (r, n, s) => {
  try {
    const o = x(t, e), i = F(e), c = L(e), y = await K(t, e);
    if (!s.isCancelled) {
      const m = await M(t, e, o, c, i, y, s), P = await G(m), $ = J(m, e.responseHeader), N = {
        url: o,
        ok: m.ok,
        status: m.status,
        statusText: m.statusText,
        body: $ ?? P
      };
      z(e, N), r(N.body);
    }
  } catch (o) {
    n(o);
  }
});
class Q extends g {
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
    return X(this.config, e);
  }
}
class Y {
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
class Z {
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
    }), this.v1 = new Y(this.request);
  }
}
const C = {
  BASE: "",
  VERSION: "1.0",
  WITH_CREDENTIALS: !1,
  CREDENTIALS: "include",
  TOKEN: void 0,
  USERNAME: void 0,
  PASSWORD: void 0,
  HEADERS: void 0,
  ENCODE_PATH: void 0
}, O = "Umb.Modal.BlockCatalogue", ee = [
  {
    type: "modal",
    // This alias is the key. We're overriding the core catalogue by reusing its alias.
    // If the alias ever changes upstream, update this to match.
    alias: O,
    name: "Block Catalogue Modal Extension",
    elementName: "umb-block-catalogue-modal-extend",
    js: () => import("./UmbBlockCatalogueModalElementExtension-CKNnT2eq.js"),
    // Make sure we win registration ordering if both exist:
    weight: -1e4
  }
], te = {
  type: "workspaceView",
  alias: "Kraftvaerk.Blockfilter.WorkspaceView.SettingsTab",
  name: "BlockFilter Settings Tab",
  element: () => import("./BlockFilterSettingsTabView-ngwO0s8p.js"),
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
}, ne = async (t, e) => {
  t.consumeContext(U, (r) => {
    if (!r) return;
    const n = r.getServerUrl() ?? "";
    C.BASE = n, C.TOKEN = async () => await r.getLatestToken() ?? "", (async () => {
      try {
        (await new Z({ TOKEN: C.TOKEN, BASE: n }).v1.getApiV1BlockfilterSettings()).enableSettingsTab === !0 && e.register(te);
      } catch {
      }
      H(e, 0);
    })();
  });
}, j = 30;
function H(t, e) {
  if (e >= j) {
    console.error(
      `BlockFilter: '${O}' was not found in the extension registry after ${j} attempts. The block catalogue override will not be applied.`
    );
    return;
  }
  setTimeout(() => {
    const r = t.getByAlias(O);
    r ? (t.unregister(r.alias), t.registerMany(ee)) : H(t, e + 1);
  }, 200);
}
export {
  Z as B,
  C as O,
  ne as o
};
//# sourceMappingURL=index-BDFE3DaO.js.map
