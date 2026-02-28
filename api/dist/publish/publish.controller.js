"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PublishController", {
    enumerable: true,
    get: function() {
        return PublishController;
    }
});
const _common = require("@nestjs/common");
const _publishservice = require("./publish.service");
const _publishdto = require("./dto/publish.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let PublishController = class PublishController {
    async publishResume(publishDto, clientIp, request) {
        const ip = request.headers['x-forwarded-for']?.split(',')[0].trim() || clientIp;
        const userAgent = request.headers['user-agent'] || 'unknown';
        return this.publishService.publishResume(publishDto, ip, userAgent);
    }
    async cleanupOldResumes() {
        return this.publishService.cleanupOldResumes();
    }
    async getStats() {
        return this.publishService.getPublishingStats();
    }
    async getResume(id) {
        return this.publishService.getPublishedResume(id);
    }
    async deleteResume(id) {
        return this.publishService.deletePublishedResume(id);
    }
    constructor(publishService){
        this.publishService = publishService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Ip)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _publishdto.PublishDto === "undefined" ? Object : _publishdto.PublishDto,
        String,
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", Promise)
], PublishController.prototype, "publishResume", null);
_ts_decorate([
    (0, _common.Post)('cleanup'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], PublishController.prototype, "cleanupOldResumes", null);
_ts_decorate([
    (0, _common.Get)('stats'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], PublishController.prototype, "getStats", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PublishController.prototype, "getResume", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PublishController.prototype, "deleteResume", null);
PublishController = _ts_decorate([
    (0, _common.Controller)('publish'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _publishservice.PublishService === "undefined" ? Object : _publishservice.PublishService
    ])
], PublishController);

//# sourceMappingURL=publish.controller.js.map