/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlockCatalogueModel } from '../models/BlockCatalogueModel';
import type { BlockFilterSettingsModel } from '../models/BlockFilterSettingsModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class V1Service {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns any OK
     * @throws ApiError
     */
    public getApiV1BlockfilterConfiguration({
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
    public postApiV1BlockfilterConfiguration({
        documentTypeKey,
        requestBody,
    }: {
        documentTypeKey: string,
        requestBody?: any,
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
     * @returns any OK
     * @throws ApiError
     */
    public postApiV1BlockfilterRemodel({
        requestBody,
    }: {
        requestBody?: BlockCatalogueModel,
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
     * @returns any OK
     * @throws ApiError
     */
    public getApiV1BlockfilterSettings(): CancelablePromise<BlockFilterSettingsModel> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/blockfilter/settings',
            errors: {
                401: `The resource is protected and requires an authentication token`,
            },
        });
    }
}
