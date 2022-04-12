"use strict";
var express_1 = require("express");
var users = require("./users");
var raw = require("./raw");
var router = (0, express_1.Router)();
router.use("/users", users);
router.use("/raw", raw);
module.exports = router;
