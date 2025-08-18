import { UmbBlockCatalogueModalData, UmbBlockCatalogueModalElement } from "@umbraco-cms/backoffice/block";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { UMB_VARIANT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/workspace";
import { customElement } from "lit/decorators.js";
import { BlockfilterClient, OpenAPI } from "../blockfilter-api";
import { UMB_MODAL_CONTEXT } from "@umbraco-cms/backoffice/modal";

@customElement('umb-block-catalogue-modal-extend')
export class UmbBlockCatalogueModalElementExtension extends UmbBlockCatalogueModalElement
{
  #alias = '';
  #unique = '';
  #pageType = '';

  constructor() {
    super();

    // grab a few vals we need for the model
    this.observe(this._manager?.propertyAlias, (value) => {
      this.#alias = value ?? '';
    });
    this.consumeContext(UMB_VARIANT_WORKSPACE_CONTEXT, (workspaceContext) => {
          this.#unique = workspaceContext?.getUnique() ?? '';      
        });

    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (workspaceContext) => {
        this.observe(workspaceContext?.contentTypeUnique, (value) => {
          this.#pageType = value ?? '';
        });
    });

    // modal provides us with data we forward to api
    this.consumeContext(UMB_MODAL_CONTEXT, (modalContext) => {
      if(modalContext?.data) {
        this.handleBlocks(modalContext.data);
      }
    });
  }

  async handleBlocks(data: any) {
    const bfc = new BlockfilterClient({
      TOKEN: OpenAPI.TOKEN,
      BASE: OpenAPI.BASE
    });

    const requestObject = {
          ...data as any, pageId: this.#unique, editingAlias: this.#alias, pageTypeId: this.#pageType
    } 

    const response = await bfc.v1.postApiV1BlockfilterRemodel({
      requestBody: requestObject
    });

    const oldFilter = this.data?.clipboardFilter;

    this.data = response as unknown as UmbBlockCatalogueModalData;

    this.data.clipboardFilter = async (clipboardEntryDetail) => {
        // Allowed keys from this.data.blocks
        const allowedKeys = this.data?.blocks.map(b => b.contentElementTypeKey.toLowerCase());

        // Gather all contentTypeKeys from clipboard entry
        const clipboardKeys = clipboardEntryDetail.values
            .flatMap(v => v.value?.contentData || [])
            .map(cd => cd.contentTypeKey?.toLowerCase())
            .filter(Boolean);

        // Check: all clipboard contentTypeKeys must be in allowedKeys
        const allAllowed = clipboardKeys.every(key => allowedKeys?.includes(key));

        if (!allAllowed) {
            return false;
        }

        // Keep old filter behavior if present
        if (typeof oldFilter === 'function') {
            return await oldFilter(clipboardEntryDetail);
        }
        return true;
    };

    // hacky as heck but this will trigger the line
    // this.#itemManager.setUniques(this.data.blocks.map((block) => block.contentElementTypeKey));
    // which we need to set the available blocks in the modal since everything else we could manipulate is private.
    this.connectedCallback();
  }
}

export default UmbBlockCatalogueModalElementExtension;

declare global {
  interface HTMLElementTagNameMap {
    'umb-block-catalogue-modal-extend': UmbBlockCatalogueModalElementExtension;
  }
}
