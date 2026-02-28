"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AiController", {
    enumerable: true,
    get: function() {
        return AiController;
    }
});
const _common = require("@nestjs/common");
const _platformexpress = require("@nestjs/platform-express");
const _aiservice = require("./ai.service");
const _dto = require("./dto");
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
let AiController = class AiController {
    /**
     * POST /ai/chat
     * Main AI chat endpoint — supports CHAT, GENERATE, ENHANCE modes.
     * This is the primary endpoint used by the React app.
     */ async chat(dto) {
        return this.aiService.chat(dto.messages, dto.token, dto.mode);
    }
    /**
     * POST /ai/enhance
     * Dedicated content enhancement endpoint.
     */ async enhance(dto) {
        return this.aiService.enhance(dto.content, dto.token, dto.field);
    }
    /**
     * POST /ai/generate
     * Dedicated resume generation endpoint.
     */ async generate(dto) {
        return this.aiService.generate(dto.brief, dto.token, dto.context);
    }
    /**
     * POST /ai/extract-pdf
     * Extracts text from uploaded PDF file.
     */ async extractPdf(file) {
        return this.aiService.extractPdfText(file);
    }
    constructor(aiService){
        this.aiService = aiService;
    }
};
_ts_decorate([
    (0, _common.Post)('chat'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.ChatRequestDto === "undefined" ? Object : _dto.ChatRequestDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AiController.prototype, "chat", null);
_ts_decorate([
    (0, _common.Post)('enhance'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.EnhanceRequestDto === "undefined" ? Object : _dto.EnhanceRequestDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AiController.prototype, "enhance", null);
_ts_decorate([
    (0, _common.Post)('generate'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.GenerateRequestDto === "undefined" ? Object : _dto.GenerateRequestDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AiController.prototype, "generate", null);
_ts_decorate([
    (0, _common.Post)('extract-pdf'),
    (0, _common.UseInterceptors)((0, _platformexpress.FileInterceptor)('file')),
    _ts_param(0, (0, _common.UploadedFile)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Express === "undefined" || typeof Express.Multer === "undefined" || typeof Express.Multer.File === "undefined" ? Object : Express.Multer.File
    ]),
    _ts_metadata("design:returntype", Promise)
], AiController.prototype, "extractPdf", null);
AiController = _ts_decorate([
    (0, _common.Controller)('ai'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _aiservice.AiService === "undefined" ? Object : _aiservice.AiService
    ])
], AiController);

//# sourceMappingURL=ai.controller.js.map