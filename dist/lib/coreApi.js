"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreApi = void 0;
const apiConfig_1 = require("./apiConfig");
const httpClient_1 = require("./httpClient");
const transaction_1 = require("./transaction");
const matchCharge_1 = require("../utils/matchCharge");
/**
 * CoreApi Midtrans is a RESTful Web Service served as a communication bridge between merchants and our payment channels.
 */
class CoreApi {
    /**
     * Initiate with options
     * @param  {Object} options - should have these props:
     * isProduction, serverKey, clientKey
     */
    apiConfig;
    httpClient;
    transaction;
    apiUrl;
    requestPayload;
    constructor(options) {
        this.apiConfig = new apiConfig_1.ApiConfig(options);
        this.httpClient = new httpClient_1.HttpClient(this);
        this.transaction = new transaction_1.Transaction(this);
    }
    /**
     * Perform a transaction with various available payment methods and features. Example given: Credit Card Charge.
     * @param  parameter - object of Core API JSON body as parameter, will be converted to JSON (more params detail refer to: https://api-docs.midtrans.com)
     * @return {Promise} - Promise contains Object from JSON decoded response
     */
    charge(parameter) {
        this.apiUrl = this.apiConfig.getCoreApiBaseUrl() + '/charge';
        const res = parameter;
        console.log(res);
        return this.httpClient.request({
            requestUrl: this.apiUrl,
            httpMethod: 'post',
            serverKey: this.apiConfig.get().serverKey,
            requestPayload: res === null || res === undefined ? res : !(0, matchCharge_1.matchCharge)(Object.keys(res)[0]) ? res : Object.values(res)[0]
        });
    }
    /**
     *  Capture an authorized transaction for card payment
     * @param parameter - object of Core API JSON body as parameter, will be converted to JSON (more params detail refer to: https://api-docs.midtrans.com)
     * @return {Promise} - Promise contains Object from JSON decoded response
     */
    capture(parameter) {
        this.apiUrl = this.apiConfig.getCoreApiBaseUrl() + '/capture';
        return this.httpClient.request({
            requestUrl: this.apiUrl,
            httpMethod: 'post',
            serverKey: this.apiConfig.get().serverKey,
            requestPayload: parameter
        });
    }
    /**
     * Register card information (card number and expiry) to be used for two clicks and one click
     * @param parameter - object of Core API JSON body as parameter, will be converted to JSON (more params detail refer to: https://api-docs.midtrans.com)
     * @return {Promise} - Promise contains Object from JSON decoded response
     */
    cardRegister(parameter) {
        this.apiUrl = this.apiConfig.getCoreApiBaseUrl() + '/card/register';
        return this.httpClient.request({
            requestUrl: this.apiUrl,
            httpMethod: 'get',
            serverKey: this.apiConfig.get().serverKey,
            requestPayload: parameter
        });
    }
    /**
     * Tokenize Credit Card information before being charged
     * @param  {Object} parameter - object of Core API JSON body as parameter, will be converted to JSON (more params detail refer to: https://api-docs.midtrans.com)
     * @return {Promise} - Promise contains Object from JSON decoded response
     */
    cardToken(parameter) {
        this.apiUrl = this.apiConfig.getCoreApiBaseUrl() + '/token';
        return this.httpClient.request({
            requestUrl: this.apiUrl,
            httpMethod: 'get',
            serverKey: this.apiConfig.get().serverKey,
            requestPayload: parameter
        });
    }
    /**
     * Get the point balance of the card in denomination amount
     * @param  {String} tokenId - tokenId of credit card (more params detail refer to: https://api-docs.midtrans.com)
     * @return {Promise} - Promise contains Object from JSON decoded response
     */
    cardPointInquiry(tokenId) {
        this.apiUrl = this.apiConfig.getCoreApiBaseUrl() + '/point_inquiry/' + tokenId;
        return this.httpClient.request({
            requestUrl: this.apiUrl,
            httpMethod: 'get',
            serverKey: this.apiConfig.get().serverKey
        });
    }
}
exports.CoreApi = CoreApi;
//# sourceMappingURL=coreApi.js.map