
import { ManifestBase, UmbConditionConfigBase, UmbEntryPointOnInit, UmbExtensionRegistry } from '@umbraco-cms/backoffice/extension-api';


import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { ManifestModal } from '@umbraco-cms/backoffice/modal';
import { ManifestWorkspaceView } from '@umbraco-cms/backoffice/workspace';
import { OpenAPI, BlockfilterClient } from './blockfilter-api/index.ts';

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

const settingsTabManifest: ManifestWorkspaceView = {
  type: 'workspaceView',
  alias: 'Kraftvaerk.Blockfilter.WorkspaceView.SettingsTab',
  name: 'BlockFilter Settings Tab',
  element: () => import('./elements/BlockFilterSettingsTabView.ts'),
  weight: 100,
  meta: {
    label: 'BlockFilter',
    pathname: 'blockfilter',
    icon: 'icon-filter',
  },
  conditions: [
    {
      alias: 'Umb.Condition.WorkspaceAlias',
      match: 'Umb.Workspace.DocumentType',
    },
  ],
};

export const onInit: UmbEntryPointOnInit = async (_host, extensionRegistry) => {
  _host.consumeContext(UMB_AUTH_CONTEXT, async (authContext) => {
    const token = await authContext?.getLatestToken() ?? '';
    const base = authContext?.getServerUrl() ?? '';

    OpenAPI.BASE = base;
    OpenAPI.TOKEN = token;

    try {
      const client = new BlockfilterClient({ TOKEN: token, BASE: base });
      const settings = await client.v1.getApiV1BlockfilterSettings();
      if (settings.enableSettingsTab === true) {
        extensionRegistry.register(settingsTabManifest);
      }
    } catch {
      // Settings fetch failed – proceed without the settings tab
    }
    
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