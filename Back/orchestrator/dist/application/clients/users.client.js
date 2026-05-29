"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersClient = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const orchestrator_config_1 = require("../../config/orchestrator.config");
const RETRYABLE_ERROR_CODES = new Set([
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'EAI_AGAIN',
]);
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
let UsersClient = class UsersClient {
    http;
    constructor(http) {
        this.http = http;
    }
    async authenticateUser(email, password) {
        const response = await this.withRetry(() => this.http.axiosRef.post(`${orchestrator_config_1.SERVICES.USER}/users/authenticate`, { email, password }));
        return response.data;
    }
    async createUser(data) {
        const response = await this.withRetry(() => this.http.axiosRef.post(`${orchestrator_config_1.SERVICES.USER}/users`, data));
        return response.data;
    }
    async updateUser(id, data) {
        const response = await this.withRetry(() => this.http.axiosRef.put(`${orchestrator_config_1.SERVICES.USER}/users/${id}`, data));
        return response.data;
    }
    async getUserByEmail(email) {
        const response = await this.withRetry(() => this.http.axiosRef.get(`${orchestrator_config_1.SERVICES.USER}/users/email/${email}`));
        return response.data;
    }
    async withRetry(request, attempts = 6) {
        let lastError;
        for (let attempt = 1; attempt <= attempts; attempt++) {
            try {
                return await request();
            }
            catch (error) {
                lastError = error;
                if (attempt === attempts || !this.isRetryable(error)) {
                    throw error;
                }
                await this.wait(Math.min(500 * attempt, 2500));
            }
        }
        throw lastError;
    }
    isRetryable(error) {
        const axiosError = error;
        const status = axiosError?.response?.status;
        const code = axiosError?.code;
        return ((typeof status === 'number' && RETRYABLE_STATUS_CODES.has(status)) ||
            (typeof code === 'string' && RETRYABLE_ERROR_CODES.has(code)));
    }
    wait(milliseconds) {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }
};
exports.UsersClient = UsersClient;
exports.UsersClient = UsersClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], UsersClient);
//# sourceMappingURL=users.client.js.map