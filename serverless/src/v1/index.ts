import { Router } from "express";
import users = require("./users");
import raw = require("./raw");

const router = Router();
router.use("/users", users);
router.use("/raw", raw);

export = router;
