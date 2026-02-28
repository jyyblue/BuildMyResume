"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AiModule", {
    enumerable: true,
    get: function() {
        return AiModule;
    }
});
const _common = require("@nestjs/common");
const _aicontroller = require("./ai.controller");
const _aiservice = require("./ai.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AiModule = class AiModule {
};
AiModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _aicontroller.AiController
        ],
        providers: [
            _aiservice.AiService
        ],
        exports: [
            _aiservice.AiService
        ]
    })
], AiModule);

//# sourceMappingURL=ai.module.js.map