"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get ChatMode () {
        return ChatMode;
    },
    get ChatRequestDto () {
        return ChatRequestDto;
    }
});
const _classvalidator = require("class-validator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
var ChatMode = /*#__PURE__*/ function(ChatMode) {
    ChatMode["CHAT"] = "CHAT";
    ChatMode["GENERATE"] = "GENERATE";
    ChatMode["ENHANCE"] = "ENHANCE";
    return ChatMode;
}({});
let ChatRequestDto = class ChatRequestDto {
};
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Messages are required'
    }),
    _ts_metadata("design:type", Object)
], ChatRequestDto.prototype, "messages", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)({
        message: 'Puter auth token is required'
    }),
    _ts_metadata("design:type", String)
], ChatRequestDto.prototype, "token", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(ChatMode, {
        message: 'Mode must be CHAT, GENERATE, or ENHANCE'
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], ChatRequestDto.prototype, "mode", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Boolean)
], ChatRequestDto.prototype, "stream", void 0);

//# sourceMappingURL=chat.dto.js.map