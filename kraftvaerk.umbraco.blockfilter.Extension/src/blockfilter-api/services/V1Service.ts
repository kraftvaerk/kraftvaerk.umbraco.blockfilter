/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlockCatalogueModel } from '../models/BlockCatalogueModel';
import type { BlockFilterApiConfigModel } from '../models/BlockFilterApiConfigModel';
import type { BlockFilterRootNodeModel } from '../models/BlockFilterRootNodeModel';
import type { BlockFilterSettingsModel } from '../models/BlockFilterSettingsModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class V1Service {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns any OK
     * @throws ApiError
     */
    public getBlockfilterConfigurationByDocumentTypeKey({
        documentTypeKey,
    }: {
        documentTypeKey: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/blockfilter/configuration/{documentTypeKey}',
            path: {
                'documentTypeKey': documentTypeKey,
            },
            errors: {
                400: `Bad Request`,
                401: `The resource is protected and requires an authentication token`,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public postBlockfilterConfigurationByDocumentTypeKey({
        documentTypeKey,
        requestBody,
    }: {
        documentTypeKey: string,
        requestBody?: (null | Array<BlockFilterApiConfigModel>),
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/v1/blockfilter/configuration/{documentTypeKey}',
            path: {
                'documentTypeKey': documentTypeKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `The resource is protected and requires an authentication token`,
            },
        });
    }
    /**
     * @returns BlockCatalogueModel OK
     * @throws ApiError
     */
    public postBlockfilterRemodel({
        requestBody,
    }: {
        requestBody: BlockCatalogueModel,
    }): CancelablePromise<BlockCatalogueModel> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/v1/blockfilter/remodel',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `The resource is protected and requires an authentication token`,
                409: `Conflict`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @returns BlockFilterRootNodeModel OK
     * @throws ApiError
     */
    public getBlockfilterRootNodes(): CancelablePromise<Array<BlockFilterRootNodeModel>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/blockfilter/root-nodes',
            errors: {
                401: `The resource is protected and requires an authentication token`,
            },
        });
    }
    /**
     * @returns BlockFilterSettingsModel OK
     * @throws ApiError
     */
    public getBlockfilterSettings(): CancelablePromise<BlockFilterSettingsModel> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/blockfilter/settings',
            errors: {
                401: `The resource is protected and requires an authentication token`,
            },
        });
    }
}
