
import { ManifestBase, UmbConditionConfigBase, UmbEntryPointOnInit, UmbExtensionRegistry } from '@umbraco-cms/backoffice/extension-api';


import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { ManifestModal } from '@umbraco-cms/backoffice/modal';
import { OpenAPI } from './blockfilter-api/index.ts';

const manifests: ManifestModal[] = [
  {
    type: 'modal',
    // This alias is the key. We’re overriding the core catalogue by reusing its alias.
    // If the alias ever changes upstream, update this to match.
    alias: 'Umb.Modal.BlockCatalogue',
    
    name: 'Custom Block Catalogue Modal',
    // Your custom element tag name:
    elementName: 'custom-umb-block-catalogue',
    // Lazy-load the element class:
    js: () => import('./elements/UmbBlockCatalogueModalElement.ts'),
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
   //extensionRegistry.registerMany(manifests);
   
   removeAndRegister(extensionRegistry);
  });
};

  
function removeAndRegister(extensionRegistry : UmbExtensionRegistry<ManifestBase, UmbConditionConfigBase<string>, ManifestBase>) {
  setTimeout(() => {
    const all = extensionRegistry.getAllExtensions();
    const found = all.find(x => x.alias === 'Umb.Modal.BlockCatalogue');
    
    if(!found) {
      removeAndRegister(extensionRegistry);
    }
    else {
      extensionRegistry.unregister(found.alias);
      extensionRegistry.registerMany(manifests);
    }
  }, 200);
}