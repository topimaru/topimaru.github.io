"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.__esModule = true;
exports.tryOrRegenerateToken = exports.api = exports.getHeaders = void 0;
/* eslint-disable no-throw-literal */
var axios_1 = __importDefault(require("axios"));
var url_1 = require("url");
var firebase_1 = require("./firebase");
var clientVersion = "9999.9999.9999";
var getHeaders = function (token) { return (__assign({ Host: "api.topia.tv", "x-clientversion": clientVersion, accept: "application/json", "content-type": "application/json; charset=UTF-8", "accept-encoding": "gzip, identity", "user-agent": "BestHTTP/2 v2.5.3" }, (token
    ? {
        authorization: "Bearer ".concat(token)
    }
    : {}))); };
exports.getHeaders = getHeaders;
function api(endpoint, headers, data, query) {
    if (data === void 0) { data = undefined; }
    if (query === void 0) { query = undefined; }
    return __awaiter(this, void 0, void 0, function () {
        var _a, method, url, replacedUrl, response, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = endpoint.split(" "), method = _a[0], url = _a[1];
                    replacedUrl = Object.entries(query !== null && query !== void 0 ? query : {}).reduce(function (u, _a) {
                        var k = _a[0], r = _a[1];
                        return u.replace(new RegExp(":".concat(k), "g"), r);
                    }, url);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, axios_1["default"])({
                            url: "https://api.topia.tv".concat(replacedUrl).concat(method === "GET"
                                ? "?".concat(new url_1.URLSearchParams(data).toString())
                                : ""),
                            method: method,
                            headers: headers,
                            data: method === "GET" ? undefined : data
                        })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    e_1 = _b.sent();
                    throw { status: e_1.response.status };
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.api = api;
function tryOrRegenerateToken(callback) {
    return __awaiter(this, void 0, void 0, function () {
        var testClient, response, e_2, options, response, newTestClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, firebase_1.getTestClient)()];
                case 1:
                    testClient = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 6]);
                    return [4 /*yield*/, callback(testClient)];
                case 3:
                    response = _a.sent();
                    return [2 /*return*/, response];
                case 4:
                    e_2 = _a.sent();
                    if (e_2.status !== 401)
                        throw e_2;
                    options = {
                        headers: (0, exports.getHeaders)(),
                        data: { refresh_token: testClient.refreshToken }
                    };
                    return [4 /*yield*/, api("POST /refresh", options.headers, options.data)];
                case 5:
                    response = _a.sent();
                    newTestClient = __assign(__assign({}, testClient), { accessToken: response.access_token });
                    return [2 /*return*/, Promise.all([
                            callback(newTestClient),
                            (0, firebase_1.setAccessToken)(response.access_token),
                        ]).then(function (_a) {
                            var data = _a[0];
                            return data;
                        })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.tryOrRegenerateToken = tryOrRegenerateToken;
