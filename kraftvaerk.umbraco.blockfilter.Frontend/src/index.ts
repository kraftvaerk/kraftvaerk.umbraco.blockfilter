
import { ManifestBase, UmbConditionConfigBase, UmbEntryPointOnInit, UmbExtensionRegistry } from '@umbraco-cms/backoffice/extension-api';


import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { ManifestModal } from '@umbraco-cms/backoffice/modal';
import { OpenAPI } from './blockfilter-api/index.ts';

const modalAlias = 'Umb.Modal.BlockCatalogue';
const manifests: ManifestModal[] = [
  {
    type: 'modal',
    // This alias is the key. We're overriding the core catalogue by reusing its alias.
    // If the alias ever changes upstream, update this to match.
    alias: modalAlias,

    name: 'Block Catalogue Modal Extension',
    elementName: 'umb-block-catalogue-modal-extend',
    js: () => import('./elements/UmbBlockCatalogueModalElementExtension.ts'),
    // Make sure we win registration ordering if both exist:
    weight: -10000,
    
  },
];

export const onInit: UmbEntryPointOnInit = async (_host, extensionRegistry) => {
  _host.consumeContext(UMB_AUTH_CONTEXT, async (authContext) => {
    const token = await authContext?.getLatestToken() ?? '';
    const base = authContext?.getServerUrl() ?? '';

    OpenAPI.BASE = base;
    OpenAPI.TOKEN = token;
    
    // Umbraco doesn't provide a "overwrites" for modals
    // lets overwrite it anyway
    removeAndRegister(extensionRegistry);
  });
};

  
function removeAndRegister(extensionRegistry : UmbExtensionRegistry<ManifestBase, UmbConditionConfigBase<string>, ManifestBase>) {
  setTimeout(() => {
    const blockCatalogueExtension = extensionRegistry.getByAlias(modalAlias);

    if(!blockCatalogueExtension) {
      removeAndRegister(extensionRegistry);
    }
    else {
      extensionRegistry.unregister(blockCatalogueExtension.alias);
      extensionRegistry.registerMany(manifests);
    }
  }, 200);
}