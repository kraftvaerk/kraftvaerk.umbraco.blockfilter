import { UMB_AUTH_CONTEXT as n } from "@umbraco-cms/backoffice/auth";
const m = [
  {
    type: "modal",
    // This alias is the key. We’re overriding the core catalogue by reusing its alias.
    // If the alias ever changes upstream, update this to match.
    alias: "Umb.Modal.BlockCatalogue",
    name: "Custom Block Catalogue Modal",
    // Your custom element tag name:
    elementName: "custom-umb-block-catalogue",
    // Lazy-load the element class:
    js: () => import("./UmbBlockCatalogueModalElement-BX1PqXvQ.js"),
    // Make sure we win registration ordering if both exist:
    weight: -1e4
  }
], i = async (l, a) => {
  l.consumeContext(n, async (o) => {
    const s = await (o == null ? void 0 : o.getLatestToken()) ?? "", c = (o == null ? void 0 : o.getServerUrl()) ?? "";
    console.log(s, c), e(a);
  });
};
function e(l) {
  setTimeout(() => {
    const o = l.getAllExtensions().find((s) => s.alias === "Umb.Modal.BlockCatalogue");
    o ? (console.log("found", o), l.unregister(o.alias), l.registerMany(m)) : (console.log("not found"), e(l));
  }, 200);
}
export {
  i as onInit
};
//# sourceMappingURL=dist.js.map
