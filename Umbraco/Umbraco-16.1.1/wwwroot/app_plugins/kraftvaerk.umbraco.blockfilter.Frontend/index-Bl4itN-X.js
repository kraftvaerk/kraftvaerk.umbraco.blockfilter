import { UMB_AUTH_CONTEXT as E } from "@umbraco-cms/backoffice/auth";
const e = {
  BASE: "",
  VERSION: "1.0",
  WITH_CREDENTIALS: !1,
  CREDENTIALS: "include",
  TOKEN: void 0,
  USERNAME: void 0,
  PASSWORD: void 0,
  HEADERS: void 0,
  ENCODE_PATH: void 0
}, m = [
  {
    type: "modal",
    // This alias is the key. We’re overriding the core catalogue by reusing its alias.
    // If the alias ever changes upstream, update this to match.
    alias: "Umb.Modal.BlockCatalogue",
    name: "Custom Block Catalogue Modal",
    // Your custom element tag name:
    elementName: "custom-umb-block-catalogue",
    // Lazy-load the element class:
    js: () => import("./UmbBlockCatalogueModalElement-WtyZSpDL.js"),
    // Make sure we win registration ordering if both exist:
    weight: -1e4
  }
], d = async (l, s) => {
  l.consumeContext(E, async (o) => {
    const a = await (o == null ? void 0 : o.getLatestToken()) ?? "", i = (o == null ? void 0 : o.getServerUrl()) ?? "";
    e.BASE = i, e.TOKEN = a, c(s);
  });
};
function c(l) {
  setTimeout(() => {
    const o = l.getAllExtensions().find((a) => a.alias === "Umb.Modal.BlockCatalogue");
    o ? (l.unregister(o.alias), l.registerMany(m)) : c(l);
  }, 200);
}
export {
  e as O,
  d as o
};
//# sourceMappingURL=index-Bl4itN-X.js.map
