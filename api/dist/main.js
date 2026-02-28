"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, // Vercel serverless handler
"default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
require("dotenv/config");
const _core = require("@nestjs/core");
const _common = require("@nestjs/common");
const _appmodule = require("./app.module");
const _helmet = /*#__PURE__*/ _interop_require_default(require("helmet"));
const _compression = /*#__PURE__*/ _interop_require_default(require("compression"));
const _express = /*#__PURE__*/ _interop_require_wildcard(require("express"));
const _platformexpress = require("@nestjs/platform-express");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const server = _express();
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule, new _platformexpress.ExpressAdapter(server));
    const logger = new _common.Logger('Bootstrap');
    app.use((0, _helmet.default)());
    app.use((0, _compression.default)());
    app.use((0, _express.json)({
        limit: '10mb'
    }));
    app.use((0, _express.urlencoded)({
        extended: true,
        limit: '10mb'
    }));
    app.enableCors({
        origin: [
            'http://localhost:8080',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:3001',
            'https://buildmyresume.live',
            'https://www.buildmyresume.live',
            process.env.FRONTEND_URL
        ].filter(Boolean),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Authorization,Accept',
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204
    });
    app.useGlobalPipes(new _common.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true
    }));
    await app.init();
    return server;
}
// For local development
if (process.env.NODE_ENV !== 'production') {
    bootstrap().then((srv)=>{
        srv.listen(process.env.PORT || 4000, ()=>{
            console.log(`🚀 Running on port ${process.env.PORT || 4000}`);
        });
    });
}
const _default = async (req, res)=>{
    const app = await bootstrap();
    app(req, res);
};

//# sourceMappingURL=main.js.map