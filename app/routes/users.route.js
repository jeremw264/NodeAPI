const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");
const auth = require("../middleware/auth.middleware");
const Roles = require("../utils/roles.utils")

router.get("/", auth(Roles.Admin,Roles.User), userController.getAllUsers);
router.post("/", userController.createUser);
router.put("/", auth(Roles.User), userController.updateUser);
router.delete("/", userController.deleteUser);

router.post("/login", userController.userLogin);

module.exports = router;
