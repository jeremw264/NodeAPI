const mongoose = require("mongoose");
const Roles = require('../utils/roles.utils')

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: Roles.User },
    createdAt: { type: Date, default: new Date(Date.now()) },
});

module.exports = userSchema;

const dbConnection = require("../controllers/db.controller");

const User = dbConnection.model("User", userSchema, "user");

module.exports.model = User;
