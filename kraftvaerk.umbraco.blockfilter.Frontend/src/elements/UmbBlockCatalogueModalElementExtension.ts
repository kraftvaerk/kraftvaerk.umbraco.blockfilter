import { UmbBlockCatalogueModalData, UmbBlockCatalogueModalElement } from "@umbraco-cms/backoffice/block";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { UMB_VARIANT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/workspace";
import { customElement } from "lit/decorators.js";
import { UMB_MODAL_CONTEXT } from "@umbraco-cms/backoffice/modal";
import { BlockfilterClient, OpenAPI } from "../blockfilter-api";


@customElement('umb-block-catalogue-modal-extend')
export class UmbBlockCatalogueModalElementExtension extends UmbBlockCatalogueModalElement {

  #alias = '';
  #unique = '';
  #pageType = '';
  #modalData: unknown | null = null;
  #handled = false;
  
  // Allowed block keys from API - null means not yet loaded
  #allowedKeys: string[] | null = null;
  #originalClipboardFilter: ((clipboardEntryDetail: any) => Promise<boolean>) | undefined;
  
  // Promise that resolves when allowed keys are ready
  #keysReadyPromise: Promise<void>;
  #keysReadyResolve!: () => void;

  constructor() {
    super();
    
    // Create promise that will resolve when handleBlocks() sets allowed keys
    this.#keysReadyPromise = new Promise((resolve) => {
      this.#keysReadyResolve = resolve;
    });

    this.consumeContext(UMB_VARIANT_WORKSPACE_CONTEXT, (workspaceContext) => {
      this.#unique = workspaceContext?.getUnique() ?? '';
      this.#tryHandle();
    });

    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (workspaceContext) => {
      this.observe(workspaceContext?.contentTypeUnique, (value) => {
        this.#pageType = value ?? '';
        this.#tryHandle();
      });
    });

    this.consumeContext(UMB_MODAL_CONTEXT, (modalContext) => {
      this.#modalData = modalContext?.data ?? null;
      this.#tryHandle();
    });
  }

  connectedCallback(): void {
    super.connectedCallback();

    // Install wrapper filter EARLY before rendering, so it's in place even if clipboard opens immediately
    this.#installClipboardFilterWrapper();

    // Access _manager via bracket notation - not exposed publicly but needed for propertyAlias
    if (this['_manager']?.propertyAlias) {
      this.observe(this['_manager'].propertyAlias, (value) => {
        this.#alias = (value as string) ?? '';
        this.#tryHandle();
      });
    }
  }

  /**
   * Installs a wrapper clipboard filter early (before render) that checks #allowedKeys.
   * If keys aren't loaded yet, blocks all clipboard entries until handleBlocks() completes.
   */
  #installClipboardFilterWrapper() {
    
    if (!this.data || this.#originalClipboardFilter !== undefined) return;
    this.#originalClipboardFilter = this.data.clipboardFilter;
    
    // Clone data to make it writable (Umbraco freezes the original)
    this.data = { ...this.data };

    this.data.clipboardFilter = async (clipboardEntryDetail: any) => {
      // Wait for allowed keys to be loaded before filtering
      await this.#keysReadyPromise;

      const clipboardKeys = clipboardEntryDetail.values
        .flatMap((v: any) => v.value?.contentData || [])
        .map((cd: any) => cd.contentTypeKey?.toLowerCase())
        .filter(Boolean);

      const allAllowed = clipboardKeys.every((key: string) => this.#allowedKeys?.includes(key));
      if (!allAllowed) return false;

      if (typeof this.#originalClipboardFilter === 'function') {
        return await this.#originalClipboardFilter(clipboardEntryDetail);
      }

      return true;
    };
  }

  #ready(): boolean {
    return !!(this.#modalData && this.#alias && this.#unique && this.#pageType);
  }

  #tryHandle() {
    if (this.#handled || !this.#ready()) return;
    this.#handled = true;
    this.handleBlocks(this.#modalData);
  }

  /**
   * Calls the BlockFilter API and rebuilds the block catalogue with filtered blocks.
   */
  async handleBlocks(data: any) {
    const requestObject = {
      ...(data as any),
      pageId: this.#unique,
      editingAlias: this.#alias,
      pageTypeId: this.#pageType
    };

    const bfc = new BlockfilterClient({
      TOKEN: OpenAPI.TOKEN,
      BASE: OpenAPI.BASE
    });

    const response = await bfc.v1.postApiV1BlockfilterRemodel({
      requestBody: requestObject
    });

    // Spread to ensure it's a mutable object
    this.data = { ...response } as unknown as UmbBlockCatalogueModalData;

    // Set allowed keys and signal that filtering can proceed
    this.#allowedKeys = this.data?.blocks.map(b => b.contentElementTypeKey.toLowerCase()) ?? [];
    this.#keysReadyResolve();

    // Re-install filter on new data object
    const originalFilter = this.#originalClipboardFilter;
    this.data.clipboardFilter = async (clipboardEntryDetail: any) => {
      const clipboardKeys = clipboardEntryDetail.values
        .flatMap((v: any) => v.value?.contentData || [])
        .map((cd: any) => cd.contentTypeKey?.toLowerCase())
        .filter(Boolean);

      const allAllowed = clipboardKeys.every((key: string) => this.#allowedKeys?.includes(key));
      if (!allAllowed) return false;

      if (typeof originalFilter === 'function') {
        return await originalFilter(clipboardEntryDetail);
      }

      return true;
    };

    // Trigger base class refresh (private API workaround)
    this.connectedCallback();
  }
}

export default UmbBlockCatalogueModalElementExtension;

declare global {
  interface HTMLElementTagNameMap {
    'umb-block-catalogue-modal-extend': UmbBlockCatalogueModalElementExtension;
  }
}