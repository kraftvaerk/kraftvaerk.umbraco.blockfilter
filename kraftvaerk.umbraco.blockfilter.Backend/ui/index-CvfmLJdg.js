var k = (t) => {
  throw TypeError(t);
};
var q = (t, e, r) => e.has(t) || k("Cannot " + r);
var o = (t, e, r) => (q(t, e, "read from private field"), r ? r.call(t) : e.get(t)), p = (t, e, r) => e.has(t) ? k("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), l = (t, e, r, n) => (q(t, e, "write to private field"), n ? n.call(t, r) : e.set(t, r), r);
import { UMB_AUTH_CONTEXT as g } from "@umbraco-cms/backoffice/auth";
class U {
  constructor(e) {
    this.config = e;
  }
}
class D extends Error {
  constructor(e, r, n) {
    super(n), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class v extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
var d, h, u, E, b, f, T;
class K {
  constructor(e) {
    p(this, d);
    p(this, h);
    p(this, u);
    p(this, E);
    p(this, b);
    p(this, f);
    p(this, T);
    l(this, d, !1), l(this, h, !1), l(this, u, !1), l(this, E, []), l(this, b, new Promise((r, n) => {
      l(this, f, r), l(this, T, n);
      const s = (c) => {
        o(this, d) || o(this, h) || o(this, u) || (l(this, d, !0), o(this, f) && o(this, f).call(this, c));
      }, a = (c) => {
        o(this, d) || o(this, h) || o(this, u) || (l(this, h, !0), o(this, T) && o(this, T).call(this, c));
      }, i = (c) => {
        o(this, d) || o(this, h) || o(this, u) || o(this, E).push(c);
      };
      return Object.defineProperty(i, "isResolved", {
        get: () => o(this, d)
      }), Object.defineProperty(i, "isRejected", {
        get: () => o(this, h)
      }), Object.defineProperty(i, "isCancelled", {
        get: () => o(this, u)
      }), e(s, a, i);
    }));
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(e, r) {
    return o(this, b).then(e, r);
  }
  catch(e) {
    return o(this, b).catch(e);
  }
  finally(e) {
    return o(this, b).finally(e);
  }
  cancel() {
    if (!(o(this, d) || o(this, h) || o(this, u))) {
      if (l(this, u, !0), o(this, E).length)
        try {
          for (const e of o(this, E))
            e();
        } catch (e) {
          console.warn("Cancellation threw an error", e);
          return;
        }
      o(this, E).length = 0, o(this, T) && o(this, T).call(this, new v("Request aborted"));
    }
  }
  get isCancelled() {
    return o(this, u);
  }
}
d = new WeakMap(), h = new WeakMap(), u = new WeakMap(), E = new WeakMap(), b = new WeakMap(), f = new WeakMap(), T = new WeakMap();
const O = (t) => t != null, S = (t) => typeof t == "string", A = (t) => S(t) && t !== "", w = (t) => typeof t == "object" && typeof t.type == "string" && typeof t.stream == "function" && typeof t.arrayBuffer == "function" && typeof t.constructor == "function" && typeof t.constructor.name == "string" && /^(Blob|File)$/.test(t.constructor.name) && /^(Blob|File)$/.test(t[Symbol.toStringTag]), I = (t) => t instanceof FormData, _ = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, W = (t) => {
  const e = [], r = (s, a) => {
    e.push(`${encodeURIComponent(s)}=${encodeURIComponent(String(a))}`);
  }, n = (s, a) => {
    O(a) && (Array.isArray(a) ? a.forEach((i) => {
      n(s, i);
    }) : typeof a == "object" ? Object.entries(a).forEach(([i, c]) => {
      n(`${s}[${i}]`, c);
    }) : r(s, a));
  };
  return Object.entries(t).forEach(([s, a]) => {
    n(s, a);
  }), e.length > 0 ? `?${e.join("&")}` : "";
}, x = (t, e) => {
  const r = t.ENCODE_PATH || encodeURI, n = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (a, i) => {
    var c;
    return (c = e.path) != null && c.hasOwnProperty(i) ? r(String(e.path[i])) : a;
  }), s = `${t.BASE}${n}`;
  return e.query ? `${s}${W(e.query)}` : s;
}, F = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (n, s) => {
      S(s) || w(s) ? e.append(n, s) : e.append(n, JSON.stringify(s));
    };
    return Object.entries(t.formData).filter(([n, s]) => O(s)).forEach(([n, s]) => {
      Array.isArray(s) ? s.forEach((a) => r(n, a)) : r(n, s);
    }), e;
  }
}, R = async (t, e) => typeof e == "function" ? e(t) : e, L = async (t, e) => {
  const [r, n, s, a] = await Promise.all([
    R(e, t.TOKEN),
    R(e, t.USERNAME),
    R(e, t.PASSWORD),
    R(e, t.HEADERS)
  ]), i = Object.entries({
    Accept: "application/json",
    ...a,
    ...e.headers
  }).filter(([c, y]) => O(y)).reduce((c, [y, m]) => ({
    ...c,
    [y]: String(m)
  }), {});
  if (A(r) && (i.Authorization = `Bearer ${r}`), A(n) && A(s)) {
    const c = _(`${n}:${s}`);
    i.Authorization = `Basic ${c}`;
  }
  return e.body !== void 0 && (e.mediaType ? i["Content-Type"] = e.mediaType : w(e.body) ? i["Content-Type"] = e.body.type || "application/octet-stream" : S(e.body) ? i["Content-Type"] = "text/plain" : I(e.body) || (i["Content-Type"] = "application/json")), new Headers(i);
}, M = (t) => {
  var e;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("/json") ? JSON.stringify(t.body) : S(t.body) || w(t.body) || I(t.body) ? t.body : JSON.stringify(t.body);
}, V = async (t, e, r, n, s, a, i) => {
  const c = new AbortController(), y = {
    headers: a,
    body: n ?? s,
    method: e.method,
    signal: c.signal
  };
  return t.WITH_CREDENTIALS && (y.credentials = t.CREDENTIALS), i(() => c.abort()), await fetch(r, y);
}, J = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (S(r))
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
    const s = e.status ?? "unknown", a = e.statusText ?? "unknown", i = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new D(
      t,
      e,
      `Generic Error: status: ${s}; status text: ${a}; body: ${i}`
    );
  }
}, X = (t, e) => new K(async (r, n, s) => {
  try {
    const a = x(t, e), i = F(e), c = M(e), y = await L(t, e);
    if (!s.isCancelled) {
      const m = await V(t, e, a, c, i, y, s), P = await G(m), $ = J(m, e.responseHeader), N = {
        url: a,
        ok: m.ok,
        status: m.status,
        statusText: m.statusText,
        body: $ ?? P
      };
      z(e, N), r(N.body);
    }
  } catch (a) {
    n(a);
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
  getBlockfilterConfigurationByDocumentTypeKey({
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
  postBlockfilterConfigurationByDocumentTypeKey({
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
   * @returns BlockCatalogueModel OK
   * @throws ApiError
   */
  postBlockfilterRemodel({
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
   * @returns BlockFilterRootNodeModel OK
   * @throws ApiError
   */
  getBlockfilterRootNodes() {
    return this.httpRequest.request({
      method: "GET",
      url: "/api/v1/blockfilter/root-nodes",
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @returns BlockFilterSettingsModel OK
   * @throws ApiError
   */
  getBlockfilterSettings() {
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
      BASE: (e == null ? void 0 : e.BASE) ?? "https://localhost:44338",
      VERSION: (e == null ? void 0 : e.VERSION) ?? "1.0.0",
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
const B = {
  BASE: "https://localhost:44338",
  VERSION: "1.0.0",
  WITH_CREDENTIALS: !1,
  CREDENTIALS: "include",
  TOKEN: void 0,
  USERNAME: void 0,
  PASSWORD: void 0,
  HEADERS: void 0,
  ENCODE_PATH: void 0
}, C = "Umb.Modal.BlockCatalogue", ee = [
  {
    type: "modal",
    // This alias is the key. We're overriding the core catalogue by reusing its alias.
    // If the alias ever changes upstream, update this to match.
    alias: C,
    name: "Block Catalogue Modal Extension",
    elementName: "umb-block-catalogue-modal-extend",
    js: () => import("./UmbBlockCatalogueModalElementExtension-CRxPMQ3I.js"),
    // Make sure we win registration ordering if both exist:
    weight: -1e4
  }
], te = {
  type: "workspaceView",
  alias: "Kraftvaerk.Blockfilter.WorkspaceView.SettingsTab",
  name: "BlockFilter Settings Tab",
  element: () => import("./BlockFilterSettingsTabView-CUx1d9Am.js"),
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
  t.consumeContext(g, (r) => {
    if (!r) return;
    const n = r.getServerUrl() ?? "";
    B.BASE = n, B.TOKEN = async () => await r.getLatestToken() ?? "", (async () => {
      try {
        (await new Z({ TOKEN: B.TOKEN, BASE: n }).v1.getBlockfilterSettings()).enableSettingsTab === !0 && e.register(te);
      } catch {
      }
      H(e, 0);
    })();
  });
}, j = 30;
function H(t, e) {
  if (e >= j) {
    console.error(
      `BlockFilter: '${C}' was not found in the extension registry after ${j} attempts. The block catalogue override will not be applied.`
    );
    return;
  }
  setTimeout(() => {
    const r = t.getByAlias(C);
    r ? (t.unregister(r.alias), t.registerMany(ee)) : H(t, e + 1);
  }, 200);
}
export {
  Z as B,
  B as O,
  ne as o
};
//# sourceMappingURL=index-CvfmLJdg.js.map
