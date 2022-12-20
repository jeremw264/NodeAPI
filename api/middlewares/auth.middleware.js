const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user.model").model;

dotenv.config();

const auth = (...roles) => {
	return asyncHandler(async function (req, res, next) {
		if (req.cookies.token) {
			try {
				const token = req.cookies.token;

				const payload = jwt.verify(token, process.env.JWT_KEY);

				const user = await User.findOne({ _id: payload.id });

				if (!user) {
					res.status(401);
					throw new Error("Authentication failed.");
				}

				if (!roles.includes(user.role)) {
					res.status(401);
					throw new Error("You do not have the necessary level of access.");
				}

				req.user = {
					id: user._id,
					username: user.username,
					email: user.email,
					role: user.role,
				};

				next();
			} catch (error) {
				if (error instanceof jwt.TokenExpiredError) {
					res.status(498);
					throw new Error("Token expired");
				}
				res.status(401);
				throw new Error(error.message);
			}
		} else {
			res.status(401);
			throw new Error("Not allowed, token not found");
		}
	});
};

module.exports = auth;