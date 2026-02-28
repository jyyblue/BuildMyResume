"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _throttler = require("@nestjs/throttler");
const _core = require("@nestjs/core");
const _aimodule = require("./ai/ai.module");
const _healthmodule = require("./health/health.module");
const _publishmodule = require("./publish/publish.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            // Global rate limiting: 30 requests per 60 seconds per IP
            _throttler.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 30
                }
            ]),
            _aimodule.AiModule,
            _healthmodule.HealthModule,
            _publishmodule.PublishModule
        ],
        providers: [
            {
                provide: _core.APP_GUARD,
                useClass: _throttler.ThrottlerGuard
            }
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map