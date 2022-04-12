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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var axios_1 = __importDefault(require("axios"));
var express_1 = require("express");
var json_bigint_1 = __importDefault(require("json-bigint"));
var array_1 = require("../util/array");
var topia_1 = require("../util/topia");
var router = (0, express_1.Router)();
router.get("/search", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result_1, e_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, topia_1.tryOrRegenerateToken)(function (_a) {
                        var accessToken = _a.accessToken;
                        return __awaiter(void 0, void 0, void 0, function () {
                            var _b;
                            return __generator(this, function (_c) {
                                return [2 /*return*/, (0, topia_1.api)("GET /users/search", (0, topia_1.getHeaders)(accessToken), {
                                        nickname: (_b = req.query.nickname) !== null && _b !== void 0 ? _b : ""
                                    })];
                            });
                        });
                    })];
            case 1:
                result_1 = _b.sent();
                return [2 /*return*/, res.status(200).json(result_1.users.map(function (user) {
                        var _a, _b;
                        return ({
                            id: user.id,
                            profileImage: user.icon_url,
                            name: user.nickname,
                            room: (_b = (_a = result_1.opening_rooms.find(function (room) { return room.user_id === user.id; })) === null || _a === void 0 ? void 0 : _a.firebase_dynamic_link) !== null && _b !== void 0 ? _b : null
                        });
                    }))];
            case 2:
                e_1 = _b.sent();
                return [2 /*return*/, res.status((_a = e_1.status) !== null && _a !== void 0 ? _a : 502).json({ error: e_1.toString() })];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/:userId", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userIdString, userId, twitterAccessToken, response, twitterProfile, _a, reservedRoom, e_2;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                userIdString = req.params.userId;
                if (!userIdString || !/^\d+$/.test(userIdString)) {
                    return [2 /*return*/, res.status(404).json({})];
                }
                userId = parseInt(userIdString);
                _e.label = 1;
            case 1:
                _e.trys.push([1, 6, , 7]);
                twitterAccessToken = process.env.TWITTER_TOKEN;
                return [4 /*yield*/, (0, topia_1.tryOrRegenerateToken)(function (_a) {
                        var accessToken = _a.accessToken;
                        return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_b) {
                                return [2 /*return*/, (0, topia_1.api)("GET /users/:userId", (0, topia_1.getHeaders)(accessToken), undefined, {
                                        userId: userId
                                    })];
                            });
                        });
                    })];
            case 2:
                response = _e.sent();
                if (!!response.user_profile.twitter_id) return [3 /*break*/, 3];
                _a = null;
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, axios_1["default"]
                    .request({
                    method: "GET",
                    url: "https://api.twitter.com/2/users/".concat(response.user_profile.twitter_id),
                    headers: {
                        Authorization: "Bearer ".concat(twitterAccessToken)
                    },
                    transformResponse: function (response) {
                        return (0, json_bigint_1["default"])().parse(response);
                    }
                })
                    .then(function (response) {
                    var _a;
                    return (_a = response.data.data) !== null && _a !== void 0 ? _a : null;
                })["catch"](function (e) {
                    var _a, _b;
                    // eslint-disable-next-line no-throw-literal
                    throw { status: (_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : 502 };
                })];
            case 4:
                _a = _e.sent();
                _e.label = 5;
            case 5:
                twitterProfile = _a;
                reservedRoom = (_c = (_b = response.reserved_room) !== null && _b !== void 0 ? _b : response.user_room_reservation) !== null && _c !== void 0 ? _c : null;
                return [2 /*return*/, res.status(200).json({
                        id: response.user.id,
                        name: response.user.nickname,
                        profileImage: response.user.icon_url,
                        profile: {
                            message: response.user_profile.message,
                            tags: response.user_profile.interest_tags,
                            twitterProfile: twitterProfile
                        },
                        room: response.user_room
                            ? {
                                id: response.user_room.id,
                                name: response.user_room.name,
                                link: response.user_room.firebase_dynamic_link,
                                thumbnail: response.user_room.thumbnail_url
                            }
                            : null,
                        reservedRoom: reservedRoom
                            ? {
                                id: reservedRoom.id,
                                name: reservedRoom.name,
                                date: reservedRoom.reserved_date,
                                thumbnail: reservedRoom.thumbnail_url
                            }
                            : null
                    })];
            case 6:
                e_2 = _e.sent();
                return [2 /*return*/, res.status((_d = e_2.status) !== null && _d !== void 0 ? _d : 502).json({ error: e_2.toString() })];
            case 7: return [2 /*return*/];
        }
    });
}); });
router.get("/:userId/ff", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userIdString, userId, page, _a, following, follower, ffIds, included_1, e_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                userIdString = req.params.userId;
                if (!userIdString || !/^\d+$/.test(userIdString)) {
                    return [2 /*return*/, res.status(404).json({})];
                }
                userId = parseInt(userIdString);
                page = req.query.page ? parseInt(req.query.page) : 1;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, topia_1.tryOrRegenerateToken)(function (_a) {
                        var accessToken = _a.accessToken;
                        return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, Promise.all([
                                            (0, topia_1.api)("GET /v2/users/:userId/following_users", (0, topia_1.getHeaders)(accessToken), { page: page }, { userId: userId }),
                                            (0, topia_1.api)("GET /v2/users/:userId/follower_users", (0, topia_1.getHeaders)(accessToken), { page: page }, { userId: userId }),
                                        ])];
                                    case 1: return [2 /*return*/, _b.sent()];
                                }
                            });
                        });
                    })];
            case 2:
                _a = _c.sent(), following = _a[0], follower = _a[1];
                ffIds = (0, array_1.removeDuplicatesBy)(__spreadArray(__spreadArray([], following.follows.map(function (_a) {
                    var followable_id = _a.followable_id;
                    return followable_id;
                }), true), follower.follows.map(function (_a) {
                    var follower_id = _a.follower_id;
                    return follower_id;
                }), true), function (a) { return a; });
                included_1 = {
                    users: __spreadArray(__spreadArray([], following.included.users, true), follower.included.users, true),
                    opening_rooms: __spreadArray(__spreadArray([], following.included.opening_rooms, true), follower.included.opening_rooms, true)
                };
                return [2 /*return*/, res.status(200).json({
                        follows: ffIds.map(function (ffId) {
                            var _a, _b;
                            var user = included_1.users.find(function (_a) {
                                var id = _a.id;
                                return id === ffId;
                            });
                            return {
                                id: ffId,
                                profileImage: user.icon_url,
                                name: user.nickname,
                                room: (_b = (_a = included_1.opening_rooms.find(function (room) { return room.user_id === user.id; })) === null || _a === void 0 ? void 0 : _a.firebase_dynamic_link) !== null && _b !== void 0 ? _b : null
                            };
                        }),
                        hasNextPage: following.list_result_meta.next_page_available ||
                            follower.list_result_meta.next_page_available
                    })];
            case 3:
                e_3 = _c.sent();
                return [2 /*return*/, res.status((_b = e_3.status) !== null && _b !== void 0 ? _b : 502).json({ error: e_3.toString() })];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.get("/:userId/repertory", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userIdString, userId, _a, songsResponse_1, postsResponse_1, songsRepertory, postsRepertory, e_4;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                userIdString = req.params.userId;
                if (!userIdString || !/^\d+$/.test(userIdString)) {
                    return [2 /*return*/, res.status(404).json({})];
                }
                userId = parseInt(userIdString);
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, topia_1.tryOrRegenerateToken)(function (_a) {
                        var accessToken = _a.accessToken;
                        return __awaiter(void 0, void 0, void 0, function () {
                            var _b, _c, _d, _e, _f, _g, _h;
                            return __generator(this, function (_j) {
                                return [2 /*return*/, Promise.all([
                                        (0, topia_1.api)("GET /karaoke_songs", (0, topia_1.getHeaders)(accessToken), {
                                            favorite_by_user: userId,
                                            artist_id: (_b = req.query.artist_id) !== null && _b !== void 0 ? _b : 0,
                                            genre_id: (_c = req.query.genre_id) !== null && _c !== void 0 ? _c : 0,
                                            match_name_also_to_artist: (_d = req.query.match_name_also_to_artist) !== null && _d !== void 0 ? _d : true,
                                            original_key: (_e = req.query.original_key) !== null && _e !== void 0 ? _e : 0,
                                            has_original_key: (_f = req.query.has_original_key) !== null && _f !== void 0 ? _f : false,
                                            sort_by: (_g = req.query.sort_by) !== null && _g !== void 0 ? _g : "popularity_desc",
                                            page: (_h = req.query.page) !== null && _h !== void 0 ? _h : 1
                                        }),
                                        (0, topia_1.api)("GET /karaoke_posts", (0, topia_1.getHeaders)(accessToken), {
                                            user_id: userId
                                        }),
                                    ])];
                            });
                        });
                    })];
            case 2:
                _a = _c.sent(), songsResponse_1 = _a[0], postsResponse_1 = _a[1];
                songsRepertory = songsResponse_1.karaoke_songs.map(function (song) {
                    var _a, _b;
                    return ({
                        id: song.id,
                        title: song.name,
                        artist: (_b = (_a = songsResponse_1.included.karaoke_song_artists.find(function (artist) { return artist.id === song.artist_id; })) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : ""
                    });
                });
                postsRepertory = postsResponse_1.karaoke_posts.map(function (post) {
                    var _a, _b, _c;
                    var song = postsResponse_1.included.karaoke_songs.find(function (_a) {
                        var id = _a.id;
                        return id === post.karaoke_song_id;
                    });
                    return {
                        id: post.karaoke_song_id,
                        title: (_a = song.name) !== null && _a !== void 0 ? _a : "",
                        artist: (_c = (_b = postsResponse_1.included.karaoke_song_artists.find(function (artist) { return artist.id === song.artist_id; })) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : "",
                        url: post.web_url
                    };
                });
                return [2 /*return*/, res.status(200).json({
                        repertory: (0, array_1.removeDuplicatesOrderBy)(__spreadArray(__spreadArray([], postsRepertory, true), songsRepertory, true), function (song) { return song.id; }),
                        hasNextPage: songsResponse_1.result_list_meta.next_page_available
                    })];
            case 3:
                e_4 = _c.sent();
                return [2 /*return*/, res.status((_b = e_4.status) !== null && _b !== void 0 ? _b : 502).json({ error: e_4.toString() })];
            case 4: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
