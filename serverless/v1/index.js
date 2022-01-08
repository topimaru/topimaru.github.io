"use strict";
var express_1 = require("express");
var users = require("./users");
var router = (0, express_1.Router)();
router.use("/users", users);
module.exports = router;
