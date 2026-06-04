/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Block } from './Block';
import type { BlockGroup } from './BlockGroup';
import type { OriginData } from './OriginData';
export type BlockCatalogueModel = {
    blocks: Array<Block>;
    blockGroups: Array<BlockGroup>;
    openClipboard: boolean;
    originData: OriginData;
    createBlockInWorkspace: boolean;
    pageId?: string | null;
    pageTypeId?: string | null;
    editingAlias?: string | null;
};

