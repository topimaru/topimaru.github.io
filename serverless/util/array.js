"use strict";
exports.__esModule = true;
exports.removeDuplicatesOrderBy = exports.removeDuplicatesBy = void 0;
var removeDuplicatesBy = function (array, by) {
    return Array.from(new Map(array.map(function (v) { return [by(v), v]; })).values());
};
exports.removeDuplicatesBy = removeDuplicatesBy;
var removeDuplicatesOrderBy = function (array, by) {
    return array.filter(function (v, i, a) { return a.findIndex(function (t) { return by(t) === by(v); }) === i; });
};
exports.removeDuplicatesOrderBy = removeDuplicatesOrderBy;
