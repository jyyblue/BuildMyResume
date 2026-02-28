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
        return _chatdto.ChatMode;
    },
    get ChatRequestDto () {
        return _chatdto.ChatRequestDto;
    },
    get EnhanceRequestDto () {
        return _enhancedto.EnhanceRequestDto;
    },
    get GenerateRequestDto () {
        return _generatedto.GenerateRequestDto;
    }
});
const _chatdto = require("./chat.dto");
const _enhancedto = require("./enhance.dto");
const _generatedto = require("./generate.dto");

//# sourceMappingURL=index.js.map