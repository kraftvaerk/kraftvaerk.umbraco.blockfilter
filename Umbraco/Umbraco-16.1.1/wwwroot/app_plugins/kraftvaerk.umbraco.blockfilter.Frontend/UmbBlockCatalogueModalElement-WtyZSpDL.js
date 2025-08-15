var x = (e) => {
  throw TypeError(e);
};
var V = (e, t, r) => t.has(e) || x("Cannot " + r);
var n = (e, t, r) => (V(e, t, "read from private field"), r ? r.call(e) : t.get(e)), C = (e, t, r) => t.has(e) ? x("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), p = (e, t, r, i) => (V(e, t, "write to private field"), i ? i.call(e, r) : t.set(e, r), r);
import { UMB_BLOCK_WORKSPACE_MODAL as ct, UMB_BLOCK_MANAGER_CONTEXT as ut } from "@umbraco-cms/backoffice/block";
import { html as b, css as ht, state as g, customElement as dt, nothing as pt, when as K, repeat as G, ifDefined as J } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement as mt, UMB_MODAL_CONTEXT as bt } from "@umbraco-cms/backoffice/modal";
import { O as X } from "./index-Bl4itN-X.js";
import { UmbRepositoryItemsManager as yt } from "@umbraco-cms/backoffice/repository";
import { UMB_DOCUMENT_TYPE_ITEM_REPOSITORY_ALIAS as ft } from "@umbraco-cms/backoffice/document-type";
import { UMB_SERVER_CONTEXT as _t } from "@umbraco-cms/backoffice/server";
import { UmbModalRouteRegistrationController as Et } from "@umbraco-cms/backoffice/router";
import { transformServerPathToClientPath as Ct } from "@umbraco-cms/backoffice/utils";
import { UMB_VARIANT_WORKSPACE_CONTEXT as Tt } from "@umbraco-cms/backoffice/workspace";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as St } from "@umbraco-cms/backoffice/document";
class $t {
  constructor(t) {
    this.config = t;
  }
}
class Y extends Error {
  constructor(t, r, i) {
    super(i), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = t;
  }
}
class vt extends Error {
  constructor(t) {
    super(t), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
var f, _, m, S, A, O, $;
class Rt {
  constructor(t) {
    C(this, f);
    C(this, _);
    C(this, m);
    C(this, S);
    C(this, A);
    C(this, O);
    C(this, $);
    p(this, f, !1), p(this, _, !1), p(this, m, !1), p(this, S, []), p(this, A, new Promise((r, i) => {
      p(this, O, r), p(this, $, i);
      const s = (l) => {
        n(this, f) || n(this, _) || n(this, m) || (p(this, f, !0), n(this, O) && n(this, O).call(this, l));
      }, o = (l) => {
        n(this, f) || n(this, _) || n(this, m) || (p(this, _, !0), n(this, $) && n(this, $).call(this, l));
      }, a = (l) => {
        n(this, f) || n(this, _) || n(this, m) || n(this, S).push(l);
      };
      return Object.defineProperty(a, "isResolved", {
        get: () => n(this, f)
      }), Object.defineProperty(a, "isRejected", {
        get: () => n(this, _)
      }), Object.defineProperty(a, "isCancelled", {
        get: () => n(this, m)
      }), t(s, o, a);
    }));
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(t, r) {
    return n(this, A).then(t, r);
  }
  catch(t) {
    return n(this, A).catch(t);
  }
  finally(t) {
    return n(this, A).finally(t);
  }
  cancel() {
    if (!(n(this, f) || n(this, _) || n(this, m))) {
      if (p(this, m, !0), n(this, S).length)
        try {
          for (const t of n(this, S))
            t();
        } catch (t) {
          console.warn("Cancellation threw an error", t);
          return;
        }
      n(this, S).length = 0, n(this, $) && n(this, $).call(this, new vt("Request aborted"));
    }
  }
  get isCancelled() {
    return n(this, m);
  }
}
f = new WeakMap(), _ = new WeakMap(), m = new WeakMap(), S = new WeakMap(), A = new WeakMap(), O = new WeakMap(), $ = new WeakMap();
const z = (e) => e != null, N = (e) => typeof e == "string", j = (e) => N(e) && e !== "", H = (e) => typeof e == "object" && typeof e.type == "string" && typeof e.stream == "function" && typeof e.arrayBuffer == "function" && typeof e.constructor == "function" && typeof e.constructor.name == "string" && /^(Blob|File)$/.test(e.constructor.name) && /^(Blob|File)$/.test(e[Symbol.toStringTag]), Q = (e) => e instanceof FormData, At = (e) => {
  try {
    return btoa(e);
  } catch {
    return Buffer.from(e).toString("base64");
  }
}, Ot = (e) => {
  const t = [], r = (s, o) => {
    t.push(`${encodeURIComponent(s)}=${encodeURIComponent(String(o))}`);
  }, i = (s, o) => {
    z(o) && (Array.isArray(o) ? o.forEach((a) => {
      i(s, a);
    }) : typeof o == "object" ? Object.entries(o).forEach(([a, l]) => {
      i(`${s}[${a}]`, l);
    }) : r(s, o));
  };
  return Object.entries(e).forEach(([s, o]) => {
    i(s, o);
  }), t.length > 0 ? `?${t.join("&")}` : "";
}, wt = (e, t) => {
  const r = e.ENCODE_PATH || encodeURI, i = t.url.replace("{api-version}", e.VERSION).replace(/{(.*?)}/g, (o, a) => {
    var l;
    return (l = t.path) != null && l.hasOwnProperty(a) ? r(String(t.path[a])) : o;
  }), s = `${e.BASE}${i}`;
  return t.query ? `${s}${Ot(t.query)}` : s;
}, kt = (e) => {
  if (e.formData) {
    const t = new FormData(), r = (i, s) => {
      N(s) || H(s) ? t.append(i, s) : t.append(i, JSON.stringify(s));
    };
    return Object.entries(e.formData).filter(([i, s]) => z(s)).forEach(([i, s]) => {
      Array.isArray(s) ? s.forEach((o) => r(i, o)) : r(i, s);
    }), t;
  }
}, M = async (e, t) => typeof t == "function" ? t(e) : t, Bt = async (e, t) => {
  const [r, i, s, o] = await Promise.all([
    M(t, e.TOKEN),
    M(t, e.USERNAME),
    M(t, e.PASSWORD),
    M(t, e.HEADERS)
  ]), a = Object.entries({
    Accept: "application/json",
    ...o,
    ...t.headers
  }).filter(([l, d]) => z(d)).reduce((l, [d, c]) => ({
    ...l,
    [d]: String(c)
  }), {});
  if (j(r) && (a.Authorization = `Bearer ${r}`), j(i) && j(s)) {
    const l = At(`${i}:${s}`);
    a.Authorization = `Basic ${l}`;
  }
  return t.body !== void 0 && (t.mediaType ? a["Content-Type"] = t.mediaType : H(t.body) ? a["Content-Type"] = t.body.type || "application/octet-stream" : N(t.body) ? a["Content-Type"] = "text/plain" : Q(t.body) || (a["Content-Type"] = "application/json")), new Headers(a);
}, gt = (e) => {
  var t;
  if (e.body !== void 0)
    return (t = e.mediaType) != null && t.includes("/json") ? JSON.stringify(e.body) : N(e.body) || H(e.body) || Q(e.body) ? e.body : JSON.stringify(e.body);
}, Nt = async (e, t, r, i, s, o, a) => {
  const l = new AbortController(), d = {
    headers: o,
    body: i ?? s,
    method: t.method,
    signal: l.signal
  };
  return e.WITH_CREDENTIALS && (d.credentials = e.CREDENTIALS), a(() => l.abort()), await fetch(r, d);
}, Mt = (e, t) => {
  if (t) {
    const r = e.headers.get(t);
    if (N(r))
      return r;
  }
}, Pt = async (e) => {
  if (e.status !== 204)
    try {
      const t = e.headers.get("Content-Type");
      if (t)
        return ["application/json", "application/problem+json"].some((s) => t.toLowerCase().startsWith(s)) ? await e.json() : await e.text();
    } catch (t) {
      console.error(t);
    }
}, Dt = (e, t) => {
  const i = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    ...e.errors
  }[t.status];
  if (i)
    throw new Y(e, t, i);
  if (!t.ok) {
    const s = t.status ?? "unknown", o = t.statusText ?? "unknown", a = (() => {
      try {
        return JSON.stringify(t.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new Y(
      e,
      t,
      `Generic Error: status: ${s}; status text: ${o}; body: ${a}`
    );
  }
}, Ut = (e, t) => new Rt(async (r, i, s) => {
  try {
    const o = wt(e, t), a = kt(t), l = gt(t), d = await Bt(e, t);
    if (!s.isCancelled) {
      const c = await Nt(e, t, o, l, a, d, s), u = await Pt(c), v = Mt(c, t.responseHeader), F = {
        url: o,
        ok: c.ok,
        status: c.status,
        statusText: c.statusText,
        body: v ?? u
      };
      Dt(t, F), r(F.body);
    }
  } catch (o) {
    i(o);
  }
});
class qt extends $t {
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
class It {
  constructor(t) {
    this.httpRequest = t;
  }
  /**
   * @returns string OK
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
      responseHeader: "Umb-Notifications",
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
}
class jt {
  constructor(t, r = qt) {
    this.request = new r({
      BASE: (t == null ? void 0 : t.BASE) ?? "",
      VERSION: (t == null ? void 0 : t.VERSION) ?? "1.0",
      WITH_CREDENTIALS: (t == null ? void 0 : t.WITH_CREDENTIALS) ?? !1,
      CREDENTIALS: (t == null ? void 0 : t.CREDENTIALS) ?? "include",
      TOKEN: t == null ? void 0 : t.TOKEN,
      USERNAME: t == null ? void 0 : t.USERNAME,
      PASSWORD: t == null ? void 0 : t.PASSWORD,
      HEADERS: t == null ? void 0 : t.HEADERS,
      ENCODE_PATH: t == null ? void 0 : t.ENCODE_PATH
    }), this.v1 = new It(this.request);
  }
}
var Kt = Object.defineProperty, zt = Object.getOwnPropertyDescriptor, Z = (e) => {
  throw TypeError(e);
}, w = (e, t, r, i) => {
  for (var s = i > 1 ? void 0 : i ? zt(t, r) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (s = (i ? a(t, r, s) : a(s)) || s);
  return i && s && Kt(t, r, s), s;
}, W = (e, t, r) => t.has(e) || Z("Cannot " + r), T = (e, t, r) => (W(e, t, "read from private field"), r ? r.call(e) : t.get(e)), R = (e, t, r) => t.has(e) ? Z("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), k = (e, t, r, i) => (W(e, t, "write to private field"), t.set(e, r), r), y = (e, t, r) => (W(e, t, "access private method"), r), P, B, I, D, U, q, h, tt, L, et, rt, st, it, ot, at, nt, lt;
let E = class extends mt {
  constructor() {
    super(), R(this, h), R(this, P, new yt(
      this,
      ft
    )), R(this, B, ""), R(this, I, ""), R(this, D, ""), R(this, U, ""), R(this, q, ""), this._groupedBlocks = [], this._filtered = [], this._loading = !0, this.consumeContext(_t, (e) => {
      k(this, I, (e == null ? void 0 : e.getServerUrl()) ?? "");
    }), this.consumeContext(bt, (e) => {
      e != null && e.data.createBlockInWorkspace && new Et(this, ct).onSetup(() => ({
        data: { preset: {}, originData: e.data.originData }
      })).onSubmit(() => {
        var t;
        (t = this.modalContext) == null || t.submit();
      }).observeRouteBuilder((t) => {
        this._workspacePath = t({});
      });
    }), this.consumeContext(ut, (e) => {
      var t;
      this._manager = e, this.observe((t = this._manager) == null ? void 0 : t.propertyAlias, (r) => {
        k(this, D, r ?? "");
      });
    }), this.consumeContext(Tt, (e) => {
      k(this, U, (e == null ? void 0 : e.getUnique()) ?? "");
    }), this.consumeContext(St, (e) => {
      this.observe(e == null ? void 0 : e.contentTypeUnique, (t) => {
        k(this, q, t ?? "");
      });
    }), this.observe(T(this, P).items, async (e) => {
      y(this, h, tt).call(this, e);
    });
  }
  connectedCallback() {
    if (super.connectedCallback(), !this.data) return;
    const e = new jt({
      TOKEN: X.TOKEN,
      BASE: X.BASE
    }), t = {
      ...this.data,
      pageId: T(this, U),
      editingAlias: T(this, D),
      pageTypeId: T(this, q)
    };
    e.v1.postApiV1BlockfilterRemodel({
      requestBody: t
    }).then((r) => {
      var s;
      const i = (s = this.data) == null ? void 0 : s.clipboardFilter;
      this.data = r, this._openClipboard = this.data.openClipboard ?? !1, T(this, P).setUniques(this.data.blocks.map((o) => o.contentElementTypeKey)), this.data.clipboardFilter = async (o) => {
        var c;
        console.log("I stole the clipboard", o), console.log("with data", this.data);
        const a = (c = this.data) == null ? void 0 : c.blocks.map((u) => u.contentElementTypeKey.toLowerCase());
        return o.values.flatMap((u) => {
          var v;
          return ((v = u.value) == null ? void 0 : v.contentData) || [];
        }).map((u) => {
          var v;
          return (v = u.contentTypeKey) == null ? void 0 : v.toLowerCase();
        }).filter(Boolean).every((u) => a == null ? void 0 : a.includes(u)) ? typeof i == "function" ? await i(o) : !0 : !1;
      };
    });
  }
  render() {
    return b`
			<umb-body-layout headline=${this.localize.term("blockEditor_addBlock")}>
				${y(this, h, lt).call(this)}${y(this, h, it).call(this)}
				<div slot="actions">
					<uui-button label=${this.localize.term("general_close")} @click=${this._rejectModal}></uui-button>
					<uui-button
						label=${this.localize.term("general_submit")}
						look="primary"
						color="positive"
						@click=${this._submitModal}></uui-button>
				</div>
			</umb-body-layout>
		`;
  }
};
P = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakMap();
I = /* @__PURE__ */ new WeakMap();
D = /* @__PURE__ */ new WeakMap();
U = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakMap();
h = /* @__PURE__ */ new WeakSet();
tt = function(e) {
  var a, l, d;
  if (!(e != null && e.length)) return;
  const t = e.reduce(
    (c, u) => (c[u.unique] = u, c),
    {}
  ), r = ((l = (a = this.data) == null ? void 0 : a.blocks) == null ? void 0 : l.map((c) => ({ ...t[c.contentElementTypeKey] ?? {}, ...c }))) ?? [], i = ((d = this.data) == null ? void 0 : d.blockGroups) ?? [], s = r.filter((c) => !i.find((u) => u.key === c.groupKey)), o = i.map((c) => ({
    name: c.name,
    blocks: r.filter((u) => u.groupKey === c.key)
  }));
  this._groupedBlocks = [{ blocks: s }, ...o], y(this, h, L).call(this), this._loading = !1;
};
L = function() {
  if (T(this, B).length === 0)
    this._filtered = this._groupedBlocks;
  else {
    const e = T(this, B).toLowerCase();
    this._filtered = this._groupedBlocks.map((t) => ({
      ...t,
      blocks: t.blocks.filter(
        (r) => {
          var i, s, o;
          return ((i = r.label) == null ? void 0 : i.toLowerCase().includes(e)) || ((s = r.name) == null ? void 0 : s.toLowerCase().includes(e)) || ((o = r.description) == null ? void 0 : o.toLowerCase().includes(e));
        }
      )
    }));
  }
};
et = function(e) {
  k(this, B, e.target.value), y(this, h, L).call(this);
};
rt = function(e) {
  var t;
  this.value = {
    create: {
      contentElementTypeKey: e
    }
  }, (t = this.modalContext) == null || t.submit();
};
st = async function(e) {
  const t = e.target, r = (t == null ? void 0 : t.selection) || [];
  this.value = {
    clipboard: {
      selection: r
    }
  };
};
it = function() {
  return this._manager ? this._openClipboard ? y(this, h, ot).call(this) : y(this, h, at).call(this) : pt;
};
ot = function() {
  var e;
  return b`
			<uui-box>
				<umb-clipboard-entry-picker
					.config=${{ multiple: !0, asyncFilter: (e = this.data) == null ? void 0 : e.clipboardFilter }}
					@selection-change=${y(this, h, st)}></umb-clipboard-entry-picker>
			</uui-box>
		`;
};
at = function() {
  var e, t;
  return this._loading ? b`<div id="loader"><uui-loader></uui-loader></div>` : b`
			${K(
    ((e = this.data) == null ? void 0 : e.blocks) && ((t = this.data) == null ? void 0 : t.blocks.length) > 8,
    () => b`
					<uui-input
						id="search"
						@input=${y(this, h, et)}
						label=${this.localize.term("general_search")}
						placeholder=${this.localize.term("placeholders_search")}>
						<uui-icon name="icon-search" slot="prepend"></uui-icon>
					</uui-input>
				`
  )}
			${G(
    this._filtered,
    (r) => r.name,
    (r) => b`
					${K(r.name && r.blocks.length !== 0 && r.name !== "", () => b`<h4>${r.name}</h4>`)}
					<div class="blockGroup">
						${G(
      r.blocks,
      (i) => i.contentElementTypeKey,
      (i) => y(this, h, nt).call(this, i)
    )}
					</div>
				`
  )}
		`;
};
nt = function(e) {
  var s;
  const t = this._workspacePath && this._manager.getContentTypeHasProperties(e.contentElementTypeKey) ? `${this._workspacePath}create/${e.contentElementTypeKey}` : void 0, r = e.thumbnail ? Ct(e.thumbnail) : void 0, i = r ? (s = new URL(r, T(this, I))) == null ? void 0 : s.href : void 0;
  return b`
			<uui-card-block-type
				href=${J(t)}
				name=${this.localize.string(e.name)}
				description=${this.localize.string(e.description)}
				.background=${e.backgroundColor}
				@open=${() => y(this, h, rt).call(this, e.contentElementTypeKey)}>
				${K(
    i,
    (o) => b`<img src=${o} alt="" />`,
    () => b`<umb-icon name=${e.icon ?? ""} color=${J(e.iconColor)}></umb-icon>`
  )}
				<slot name="actions" slot="actions"> </slot>
			</uui-card-block-type>
		`;
};
lt = function() {
  return b`
			<uui-tab-group slot="navigation">
				<uui-tab
					label=${this.localize.term("blockEditor_tabCreateEmpty")}
					?active=${!this._openClipboard}
					@click=${() => this._openClipboard = !1}>
					<umb-localize key=${this.localize.term("blockEditor_tabCreateEmpty")}>Create Empty</umb-localize>
					<uui-icon slot="icon" name="icon-add"></uui-icon>
				</uui-tab>
				<uui-tab
					label=${this.localize.term("blockEditor_tabClipboard")}
					?active=${this._openClipboard}
					@click=${() => this._openClipboard = !0}>
					<umb-localize key=${this.localize.term("blockEditor_tabClipboard")}>Clipboard</umb-localize>
					<uui-icon slot="icon" name="icon-clipboard"></uui-icon>
				</uui-tab>
			</uui-tab-group>
		`;
};
E.styles = [
  ht`
			#loader {
				display: flex;
				justify-content: center;
			}

			#search {
				width: 100%;
				align-items: center;
				margin-bottom: var(--uui-size-layout-1);

				> uui-icon {
					padding-left: var(--uui-size-space-3);
				}
			}

			.blockGroup {
				display: grid;
				gap: 1rem;
				grid-template-columns: repeat(auto-fill, minmax(min(var(--umb-card-medium-min-width), 100%), 1fr));
			}

			uui-tab-group {
				--uui-tab-divider: var(--uui-color-border);
				border-left: 1px solid var(--uui-color-border);
				border-right: 1px solid var(--uui-color-border);
			}
		`
];
w([
  g()
], E.prototype, "_openClipboard", 2);
w([
  g()
], E.prototype, "_workspacePath", 2);
w([
  g()
], E.prototype, "_filtered", 2);
w([
  g()
], E.prototype, "_manager", 2);
w([
  g()
], E.prototype, "_loading", 2);
E = w([
  dt("custom-umb-block-catalogue-modal")
], E);
const te = E;
export {
  E as CustomUmbBlockCatalogueModalElement,
  te as default
};
//# sourceMappingURL=UmbBlockCatalogueModalElement-WtyZSpDL.js.map
