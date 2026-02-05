import { UmbBlockCatalogueModalData, UmbBlockCatalogueModalElement } from "@umbraco-cms/backoffice/block";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { UMB_VARIANT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/workspace";
import { customElement } from "lit/decorators.js";
import { UMB_MODAL_CONTEXT } from "@umbraco-cms/backoffice/modal";
import { BlockfilterClient, OpenAPI } from "../blockfilter-api";


@customElement('umb-block-catalogue-modal-extend')
export class UmbBlockCatalogueModalElementExtension extends UmbBlockCatalogueModalElement {

  // Current property alias being edited
  #alias = '';         
  
  // Unique ID for the current page (document)  
  #unique = '';        
  
  // Unique content type key for the current page
  #pageType = '';      

  // Holds modal data from context
  #modalData: unknown | null = null;  

  // Ensures handleBlocks() is only executed once
  #handled = false;                   

  /**
   * Constructor
   * Sets up context consumers and observers needed for collecting
   * page, alias, and modal data before making API requests.
   */
  constructor() {
    super();

    // Observe Variant Workspace Context.
    // Used to retrieve the current page's unique ID.
    this.consumeContext(UMB_VARIANT_WORKSPACE_CONTEXT, (workspaceContext) => {

      // Assign unique ID if available
      this.#unique = workspaceContext?.getUnique() ?? '';  

      // Try handling blocks if all data is ready
      this.#tryHandle();                                   
    });

    // Observe Document Workspace Context.
    // Used to retrieve the content type unique key for the current document.
    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (workspaceContext) => {
      this.observe(workspaceContext?.contentTypeUnique, (value) => {

        // Store page type unique key        
        this.#pageType = value ?? ''; 

        // Try handling blocks if all data is ready
        this.#tryHandle();             
      });
    });

    // Observe Modal Context.
    // Modal context provides the raw block data used by handleBlocks().
    // We only cache it here and delay processing until other info is ready.
    this.consumeContext(UMB_MODAL_CONTEXT, (modalContext) => {
      
      // Store modal data if present
      this.#modalData = modalContext?.data ?? null;  

      // Try handling blocks if all data is ready
      this.#tryHandle();                             
    });
  }

  /**
   * connectedCallback
   * Lifecycle method called when the element is attached to the DOM.
   * Here we can safely observe _manager, which isn't available in the constructor.
   */
  connectedCallback(): void {
    super.connectedCallback();

    // Normally, bypassing a private field is discouraged.
    // But in this case:
    // Umbraco’s backoffice APIs don’t expose _manager publicly.
    // You need to access its observable propertyAlias to extend the modal correctly.
    // There’s no public API for this yet.
    // So, using this['_manager'] is a safe and pragmatic escape hatch.

    // Observe property alias
    // The _manager instance is initialized by the base class around connectedCallback().
    if (this['_manager']?.propertyAlias) {
      this.observe(this['_manager'].propertyAlias, (value) => {

        // Store current alias value
        this.#alias = (value as string) ?? '';  

        // Try handling blocks if all data is ready
        this.#tryHandle();                      
      });
    }
  }

  /**
   * #ready
   * Checks whether all required values (alias, unique, pageType, modalData)
   * are available before making the API request.
   */
  #ready(): boolean {
    return !!(this.#modalData && this.#alias && this.#unique && this.#pageType);
  }

  /**
   * #tryHandle
   * Simple gatekeeper that ensures handleBlocks() is only called once,
   * and only when all required data has been collected.
   */
  #tryHandle() {

    // Already executed once then skip
    if (this.#handled) return;        

    // Required data not ready then skip
    if (!this.#ready()) return;       

    // Mark as handled
    this.#handled = true;

    // Execute block handling
    this.handleBlocks(this.#modalData); 
  }

  /**
   * handleBlocks
   * Calls the BlockFilter API with gathered data to rebuild the block catalogue.
   * Also redefines the clipboard filter to enforce which blocks are allowed.
   */
  async handleBlocks(data: any) {

    // Combines modal data with alias, page ID, and page type.
    const requestObject = {
      ...(data as any),
      pageId: this.#unique,
      editingAlias: this.#alias,
      pageTypeId: this.#pageType
    };

    // Create client instance.
    const bfc = new BlockfilterClient({
      TOKEN: OpenAPI.TOKEN,
      BASE: OpenAPI.BASE
    });

    // This returns the allowed block configuration for the current editor context.
    const response = await bfc.v1.postApiV1BlockfilterRemodel({
      requestBody: requestObject
    });    

    // Keep any existing clipboard filter before overwriting
    const oldFilter = this.data?.clipboardFilter;

    // Replace this.data with the newly returned block catalogue
    this.data = response as unknown as UmbBlockCatalogueModalData;

    // Extend clipboard filter logic.
    // Ensures that pasted blocks are allowed based on API-provided allowed keys.
    this.data.clipboardFilter = async (clipboardEntryDetail) => {

      // Extract allowed block content type keys
      const allowedKeys = this.data?.blocks.map(b => b.contentElementTypeKey.toLowerCase());

      // Gather all contentTypeKeys from clipboard entry
      const clipboardKeys = clipboardEntryDetail.values
        .flatMap(v => v.value?.contentData || [])
        .map(cd => cd.contentTypeKey?.toLowerCase())
        .filter(Boolean);

      // Check that all clipboard entries are allowed
      const allAllowed = clipboardKeys.every(key => allowedKeys?.includes(key));      
      if (!allAllowed) return false;

      // Keep old filter behavior if defined
      if (typeof oldFilter === 'function') return await oldFilter(clipboardEntryDetail);
      
      return true;
    };

    // Trigger base class refresh hack.
    // This forces the base class to reapply available blocks.
    // (Private API workaround.)
    this.connectedCallback();
  }
}

export default UmbBlockCatalogueModalElementExtension;

declare global {
  interface HTMLElementTagNameMap {
    'umb-block-catalogue-modal-extend': UmbBlockCatalogueModalElementExtension;
  }
}