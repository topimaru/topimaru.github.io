"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var axios_1 = __importDefault(require("axios"));
var express_1 = require("express");
var json_bigint_1 = __importDefault(require("json-bigint"));
var topia_1 = require("../util/topia");
var router = (0, express_1.Router)();
router.use("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, e_1;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _b = (_a = res).json;
                return [4 /*yield*/, (0, topia_1.tryOrRegenerateToken)(function (_a) {
                        var accessToken = _a.accessToken;
                        return __awaiter(void 0, void 0, void 0, function () {
                            var response;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, (0, axios_1["default"])({
                                            url: "https://api.topia.tv".concat(req.query.url),
                                            method: req.method,
                                            headers: (0, topia_1.getHeaders)(accessToken),
                                            data: req.body,
                                            transformResponse: function (data) {
                                                try {
                                                    return (0, json_bigint_1["default"])().parse(data);
                                                }
                                                catch (e) {
                                                    return data;
                                                }
                                            }
                                        })];
                                    case 1:
                                        response = _b.sent();
                                        return [2 /*return*/, response.data];
                                }
                            });
                        });
                    })];
            case 1: return [2 /*return*/, _b.apply(_a, [_d.sent()])];
            case 2:
                e_1 = _d.sent();
                return [2 /*return*/, res.status((_c = e_1.status) !== null && _c !== void 0 ? _c : 502).json({ error: e_1.toString() })];
            case 3: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
