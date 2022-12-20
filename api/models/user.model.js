const mongoose = require("mongoose");
const Role = require("../util/role.util");

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, required: true, default: Role.User, enum: [Role.User, Role.Moderator, Role.Admin] },
		last_login: { type: Date },
	},
	{ timestamps: true },
);

module.exports = userSchema;

const dbConnection = require("../controllers/db.controller");

const User = dbConnection.model("User", userSchema, "user");

module.exports.model = User;
