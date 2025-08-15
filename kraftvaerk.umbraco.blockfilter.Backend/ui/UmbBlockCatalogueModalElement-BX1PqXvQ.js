import { UmbBlockCatalogueModalElement as m } from "@umbraco-cms/backoffice/block";
import { customElement as u } from "@umbraco-cms/backoffice/external/lit";
import { UMB_MODAL_CONTEXT as n } from "@umbraco-cms/backoffice/modal";
var p = Object.defineProperty, f = Object.getOwnPropertyDescriptor, i = (t, o, s, r) => {
  for (var e = r > 1 ? void 0 : r ? f(o, s) : o, a = t.length - 1, l; a >= 0; a--)
    (l = t[a]) && (e = (r ? l(o, s, e) : l(e)) || e);
  return r && e && p(o, s, e), e;
};
let c = class extends m {
  constructor() {
    super(), this.consumeContext(n, (t) => {
      const o = JSON.stringify(t == null ? void 0 : t.data);
      if (o) {
        const s = JSON.parse(o);
        console.log(s), this.data = s ?? {};
      }
    });
  }
};
c = i([
  u("custom-umb-block-catalogue-modal")
], c);
const g = c;
export {
  c as CustomUmbBlockCatalogueModalElement,
  g as default
};
//# sourceMappingURL=UmbBlockCatalogueModalElement-BX1PqXvQ.js.map
