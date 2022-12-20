const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");
const Roles = require("../util/role.util");

// methods GET
router.get("/:id", auth(Roles.User, Roles.Moderator, Roles.Admin), userController.getUserWithId);
router.get("/", auth(Roles.User, Roles.Moderator, Roles.Admin), userController.getUsers);

// methods POST
router.post("/", userController.createUser);

// methods PUT
router.put("/:id", auth(Roles.User, Roles.Moderator, Roles.Admin), userController.updateUserWithId);

// methods DELETE
router.delete("/:id", auth(Roles.User, Roles.Moderator, Roles.Admin), userController.deleteUserWithId);

module.exports = router;
