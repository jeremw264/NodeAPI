const User = require("../models/user.model").model;
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const jwtUtils = require("../utils/jwt.utils");

const Roles = require("../utils/roles.utils");

const auth = (...roles) => {
	return asyncHandler(async function (req, res, next) {
		if (req.cookies.token) {
			try {
				const token = req.cookies.token;

				const payload = jwtUtils.verifyToken(token);

				const user = await User.findOne({ _id: payload.id });

				if (!user) {
					res.status(401);
					throw new Error("Echec de l'authentification");
				}

				if (!roles.includes(user.role)) {
					res.status(401);
					throw new Error("Vous n'avez pas le niveau d'acces nécessaire !");
				}

				req.user = {
					id: user._id,
					username: user.username,
					email: user.email,
					role: user.role,
					token: token,
				};

				next();
			} catch (error) {
				res.status(401);
				if (error instanceof jwt.TokenExpiredError) {
					throw new Error("Token expiré");
				}
				throw new Error(error.message);
			}
		} else {
			res.status(401);
			throw new Error("Non autorisé, token non trouvé");
		}
	});
};

module.exports = auth;
