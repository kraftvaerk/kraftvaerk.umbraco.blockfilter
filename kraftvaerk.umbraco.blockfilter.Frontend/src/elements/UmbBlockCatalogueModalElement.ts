import { UMB_BLOCK_MANAGER_CONTEXT, UMB_BLOCK_WORKSPACE_MODAL, UmbBlockCatalogueModalData, UmbBlockCatalogueModalElement, UmbBlockCatalogueModalValue } from "@umbraco-cms/backoffice/block";
import { css, customElement, html, ifDefined, nothing, repeat, state, when } from "@umbraco-cms/backoffice/external/lit";
import { UMB_MODAL_CONTEXT, UmbModalBaseElement } from "@umbraco-cms/backoffice/modal";
import { BlockCatalogueModel, BlockfilterClient, OpenAPI } from "../blockfilter-api";
import { UmbRepositoryItemsManager } from "@umbraco-cms/backoffice/repository";
import { UMB_DOCUMENT_TYPE_ENTITY_TYPE, UMB_DOCUMENT_TYPE_ITEM_REPOSITORY_ALIAS, UmbDocumentTypeItemModel } from "@umbraco-cms/backoffice/document-type";
import { UMB_SERVER_CONTEXT } from "@umbraco-cms/backoffice/server";
import { UmbBlockTypeGroup, UmbBlockTypeWithGroupKey } from "@umbraco-cms/backoffice/block-type";
import { UmbModalRouteRegistrationController } from "@umbraco-cms/backoffice/router";
import { UUIInputEvent } from "@umbraco-cms/backoffice/external/uui";
import { UmbSelectionChangeEvent } from "@umbraco-cms/backoffice/event";
import { transformServerPathToClientPath } from "@umbraco-cms/backoffice/utils";
import { UMB_VARIANT_WORKSPACE_CONTEXT, UMB_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/workspace";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";

type UmbBlockTypeItemWithGroupKey = UmbBlockTypeWithGroupKey & UmbDocumentTypeItemModel;

@customElement('custom-umb-block-catalogue-modal')
export class CustomUmbBlockCatalogueModalElement extends UmbModalBaseElement<
	UmbBlockCatalogueModalData,
	UmbBlockCatalogueModalValue
> {
	readonly #itemManager = new UmbRepositoryItemsManager<UmbDocumentTypeItemModel>(
		this,
		UMB_DOCUMENT_TYPE_ITEM_REPOSITORY_ALIAS,
	);

	#search = '';

	#serverUrl = '';
  #alias = '';
  #unique = '';
  #pageType = '';
	private _groupedBlocks: Array<{ name?: string; blocks: Array<UmbBlockTypeItemWithGroupKey> }> = [];

	@state()
	private _openClipboard?: boolean;

	@state()
	private _workspacePath?: string;

	@state()
	private _filtered: Array<{ name?: string; blocks: Array<UmbBlockTypeItemWithGroupKey> }> = [];

	@state()
	private _manager?: typeof UMB_BLOCK_MANAGER_CONTEXT.TYPE;

	@state()
	private _loading = true;

	constructor() {
		super();

		this.consumeContext(UMB_SERVER_CONTEXT, (instance) => {
			this.#serverUrl = instance?.getServerUrl() ?? '';
		});

		this.consumeContext(UMB_MODAL_CONTEXT, (modalContext) => {
			if (modalContext?.data.createBlockInWorkspace) {
				new UmbModalRouteRegistrationController(this, UMB_BLOCK_WORKSPACE_MODAL)
					//.addAdditionalPath('block') // No need for additional path specification in this context as this is for sure the only workspace we want to open here.
					.onSetup(() => {
						return {
							data: { preset: {}, originData: (modalContext.data as UmbBlockCatalogueModalData).originData },
						};
					})
					.onSubmit(() => {
						// When workspace is submitted, we want to close this modal.
						this.modalContext?.submit();
					})
					.observeRouteBuilder((routeBuilder) => {
						this._workspacePath = routeBuilder({});
					});
			}
		});

		this.consumeContext(UMB_BLOCK_MANAGER_CONTEXT, (manager) => {
			this._manager = manager;
      this.observe(this._manager?.propertyAlias, (value) => {
        this.#alias = value ?? '';
      });
		});

    this.consumeContext(UMB_VARIANT_WORKSPACE_CONTEXT, (workspaceContext) => {
      this.#unique = workspaceContext?.getUnique() ?? '';      
    });

    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (workspaceContext) => {
       this.observe(workspaceContext?.contentTypeUnique, (value) => {
         this.#pageType = value ?? '';
       });
    });

		this.observe(this.#itemManager.items, async (items) => {
			this.#observeBlockTypes(items);
		});
	}

	override connectedCallback() {
		super.connectedCallback();
		if (!this.data) return;

    const bfc = new BlockfilterClient({
      TOKEN: OpenAPI.TOKEN,
      BASE: OpenAPI.BASE
    });

    const requestObject = {
      ...this.data as any, pageId: this.#unique, editingAlias: this.#alias, pageTypeId: this.#pageType
    }

    bfc.v1.postApiV1BlockfilterRemodel({
      requestBody: requestObject
    }).then((response : any) => {

      const oldFilter = this.data?.clipboardFilter;
      this.data = response as UmbBlockCatalogueModalData;
      this._openClipboard = this.data.openClipboard ?? false;
      this.#itemManager.setUniques(this.data.blocks.map((block) => block.contentElementTypeKey));

      
      this.data.clipboardFilter = async (clipboardEntryDetail) => {
        console.log('I stole the clipboard', clipboardEntryDetail);
        console.log('with data', this.data);

        // ✅ Allowed keys from this.data.blocks
        const allowedKeys = this.data?.blocks.map(b => b.contentElementTypeKey.toLowerCase());

        // ✅ Gather all contentTypeKeys from clipboard entry
        const clipboardKeys = clipboardEntryDetail.values
            .flatMap(v => v.value?.contentData || [])
            .map(cd => cd.contentTypeKey?.toLowerCase())
            .filter(Boolean);

        // ✅ Check: all clipboard contentTypeKeys must be in allowedKeys
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
    });
	}

	#observeBlockTypes(items: Array<UmbDocumentTypeItemModel> | undefined) {
		if (!items?.length) return;

		const lookup = items.reduce(
			(acc, item) => {
				acc[item.unique] = item;
				return acc;
			},
			{} as { [key: string]: UmbDocumentTypeItemModel },
		);

		const blocks: Array<UmbBlockTypeItemWithGroupKey> =
			this.data?.blocks?.map((block) => ({ ...(lookup[block.contentElementTypeKey] ?? {}), ...block })) ?? [];

		const blockGroups: Array<UmbBlockTypeGroup> = this.data?.blockGroups ?? [];

		const noGroupBlocks = blocks.filter((block) => !blockGroups.find((group) => group.key === block.groupKey));

		const grouped = blockGroups.map((group) => ({
			name: group.name,
			blocks: blocks.filter((block) => block.groupKey === group.key),
		}));

		this._groupedBlocks = [{ blocks: noGroupBlocks }, ...grouped];

		this.#updateFiltered();

		this._loading = false;
	}

	#updateFiltered() {
		if (this.#search.length === 0) {
			this._filtered = this._groupedBlocks;
		} else {
			const search = this.#search.toLowerCase();
			this._filtered = this._groupedBlocks.map((group) => {
				return {
					...group,
					blocks: group.blocks.filter(
						(block) =>
							block.label?.toLowerCase().includes(search) ||
							block.name?.toLowerCase().includes(search) ||
							block.description?.toLowerCase().includes(search),
					),
				};
			});
		}
	}

	#onSearch(e: UUIInputEvent) {
		this.#search = e.target.value as string;
		this.#updateFiltered();
	}

	#chooseBlock(contentElementTypeKey: string) {
		this.value = {
			create: {
				contentElementTypeKey,
			},
		};
		this.modalContext?.submit();
	}

	async #onClipboardPickerSelectionChange(event: UmbSelectionChangeEvent) {
		const target = event.target as any;
		const selection = target?.selection || [];
		this.value = {
			clipboard: {
				selection,
			},
		};
	}

	override render() {
		return html`
			<umb-body-layout headline=${this.localize.term('blockEditor_addBlock')}>
				${this.#renderViews()}${this.#renderMain()}
				<div slot="actions">
					<uui-button label=${this.localize.term('general_close')} @click=${this._rejectModal}></uui-button>
					<uui-button
						label=${this.localize.term('general_submit')}
						look="primary"
						color="positive"
						@click=${this._submitModal}></uui-button>
				</div>
			</umb-body-layout>
		`;
	}

	#renderMain() {
		return this._manager ? (this._openClipboard ? this.#renderClipboard() : this.#renderCreateEmpty()) : nothing;
	}

	#renderClipboard() {
		return html`
			<uui-box>
				<umb-clipboard-entry-picker
					.config=${{ multiple: true, asyncFilter: this.data?.clipboardFilter }}
					@selection-change=${this.#onClipboardPickerSelectionChange}></umb-clipboard-entry-picker>
			</uui-box>
		`;
	}

	#renderCreateEmpty() {
		if (this._loading) return html`<div id="loader"><uui-loader></uui-loader></div>`;
		return html`
			${when(
				this.data?.blocks && this.data?.blocks.length > 8,
				() => html`
					<uui-input
						id="search"
						@input=${this.#onSearch}
						label=${this.localize.term('general_search')}
						placeholder=${this.localize.term('placeholders_search')}>
						<uui-icon name="icon-search" slot="prepend"></uui-icon>
					</uui-input>
				`,
			)}
			${repeat(
				this._filtered,
				(group) => group.name,
				(group) => html`
					${when(group.name && group.blocks.length !== 0 && group.name !== '', () => html`<h4>${group.name}</h4>`)}
					<div class="blockGroup">
						${repeat(
							group.blocks,
							(block) => block.contentElementTypeKey,
							(block) => this.#renderBlockTypeCard(block),
						)}
					</div>
				`,
			)}
		`;
	}

	#renderBlockTypeCard(block: UmbBlockTypeItemWithGroupKey) {
		const href =
			this._workspacePath && this._manager!.getContentTypeHasProperties(block.contentElementTypeKey)
				? `${this._workspacePath}create/${block.contentElementTypeKey}`
				: undefined;

		const path = block.thumbnail ? transformServerPathToClientPath(block.thumbnail) : undefined;
		const imgSrc = path ? new URL(path, this.#serverUrl)?.href : undefined;

		return html`
			<uui-card-block-type
				href=${ifDefined(href)}
				name=${this.localize.string(block.name)}
				description=${this.localize.string(block.description)}
				.background=${block.backgroundColor}
				@open=${() => this.#chooseBlock(block.contentElementTypeKey)}>
				${when(
					imgSrc,
					(src) => html`<img src=${src} alt="" />`,
					() => html`<umb-icon name=${block.icon ?? ''} color=${ifDefined(block.iconColor)}></umb-icon>`,
				)}
				<slot name="actions" slot="actions"> </slot>
			</uui-card-block-type>
		`;
	}

	#renderViews() {
		return html`
			<uui-tab-group slot="navigation">
				<uui-tab
					label=${this.localize.term('blockEditor_tabCreateEmpty')}
					?active=${!this._openClipboard}
					@click=${() => (this._openClipboard = false)}>
					<umb-localize key=${this.localize.term('blockEditor_tabCreateEmpty')}>Create Empty</umb-localize>
					<uui-icon slot="icon" name="icon-add"></uui-icon>
				</uui-tab>
				<uui-tab
					label=${this.localize.term('blockEditor_tabClipboard')}
					?active=${this._openClipboard}
					@click=${() => (this._openClipboard = true)}>
					<umb-localize key=${this.localize.term('blockEditor_tabClipboard')}>Clipboard</umb-localize>
					<uui-icon slot="icon" name="icon-clipboard"></uui-icon>
				</uui-tab>
			</uui-tab-group>
		`;
	}

	static override styles = [
		css`
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
		`,
	];
}
export default CustomUmbBlockCatalogueModalElement;

declare global {
	interface HTMLElementTagNameMap {
		'custom-umb-block-catalogue-modal': CustomUmbBlockCatalogueModalElement;
	}
}
