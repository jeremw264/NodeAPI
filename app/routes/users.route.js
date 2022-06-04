const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");
const auth = require("../middleware/auth.middleware");
const Roles = require("../utils/roles.utils");

// methods GET
router.get("/", auth(Roles.Admin, Roles.User), userController.getAllUsers);
router.get("/:id", auth(Roles.Admin, Roles.User), userController.getUserById);

// methods POST
router.post("/", userController.createUser);
router.post("/login", userController.userLogin);

// methods PUT
router.put("/", auth(Roles.User), userController.updateUser);

// methods DELETE
router.delete("/:id", auth(Roles.Admin), userController.deleteUserById);

module.exports = router;
