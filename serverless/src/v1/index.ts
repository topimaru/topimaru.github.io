import { Router } from "express";
import users = require("./users");

const router = Router();
router.use("/users", users);

export = router;
