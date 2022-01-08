"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.__esModule = true;
exports.setAccessToken = exports.getTestClient = exports.firestore = exports.firebaseApp = void 0;
var firebaseAdmin = __importStar(require("firebase-admin"));
var firestoreAdmin = __importStar(require("firebase-admin/firestore"));
var serviceAccount = {
    type: process.env.FIREBASE_type,
    project_id: process.env.FIREBASE_project_id,
    private_key_id: process.env.FIREBASE_private_key_id,
    private_key: process.env.FIREBASE_private_key.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_client_email,
    client_id: process.env.FIREBASE_client_id,
    auth_uri: process.env.FIREBASE_auth_uri,
    token_uri: process.env.FIREBASE_token_uri,
    auth_provider_x509_cert_url: process.env.FIREBASE_auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.FIREBASE_client_x509_cert_url
};
exports.firebaseApp = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount)
});
exports.firestore = firestoreAdmin.getFirestore(exports.firebaseApp);
function getTestClient() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var querySnapshot, testClient;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, exports.firestore
                        .collection("/test_client")
                        .orderBy("createdAt", "desc")
                        .limit(1)
                        .get()];
                case 1:
                    querySnapshot = _c.sent();
                    testClient = (_b = (_a = querySnapshot.docs) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.data();
                    if (!testClient)
                        throw Error("Test client does not exist.");
                    return [2 /*return*/, testClient];
            }
        });
    });
}
exports.getTestClient = getTestClient;
function setAccessToken(accessToken) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var querySnapshot, documentSnapshot;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, exports.firestore
                        .collection("/test_client")
                        .orderBy("createdAt", "desc")
                        .limit(1)
                        .get()];
                case 1:
                    querySnapshot = _b.sent();
                    documentSnapshot = (_a = querySnapshot.docs) === null || _a === void 0 ? void 0 : _a[0];
                    if (!documentSnapshot)
                        throw Error("Test client does not exist.");
                    return [4 /*yield*/, documentSnapshot.ref.update({
                            accessToken: accessToken
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.setAccessToken = setAccessToken;