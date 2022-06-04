const User = require("../models/user.model").model;
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const jwtUtils = require("../utils/jwt.utils");

const Roles = require("../utils/roles.utils");

const auth = (...roles) => {
	return asyncHandler(async function (req, res, next) {
		let token;

		if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
			try {
				token = req.headers.authorization.split(" ")[1];

				const payload = jwtUtils.verifyToken(token);

				const user = await User.findOne({ _id: payload.userData._id });

				if (!user) {
					res.status(401);
					throw new Error("Echec de l'authentification");
				}

				console.log(roles.includes(user.role));
				console.log(roles);
				console.log(user.role);

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
					throw new Error().json({ error: "Token expiré" });
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
