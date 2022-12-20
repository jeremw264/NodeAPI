const asyncHandler = require("express-async-handler");
const User = require("../models/user.model").model;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

class AuthController {
	/**
	 * @desc Connecter un utilisateur
	 * @route POST /api/auth/login
	 */
	login = asyncHandler(async (req, res, next) => {
		const { email, password } = req.body;

		// * Searching for the user
		const userFound = await User.findOne({ email });

		if (!userFound) {
			res.status(404);
			throw new Error("User not found.");
		}

		// * Password check
		const passwordIsCorrect = await bcrypt.compare(password, userFound.password);

		if (!passwordIsCorrect) {
			res.status(400);
			throw new Error("Incorrect password.");
		}

		const JWTKEY = process.env.JWT_KEY;
		
		if (!JWTKEY) {
			res.status(500);
			throw new Error("JWT Key undefined!");
		}

		// * Generation of the token
		const token = jwt.sign({ id: userFound._id }, JWTKEY, {
			expiresIn: "3600000",
		});

		// * Passing the token in an HTTPONLY cookie
		res.cookie("token", token, {
			maxAge: 3600000,
			httpOnly: true,
			sameSite: "strict" /*, secure:true <- si https */,
		});

		await User.updateOne({ _id: userFound._id }, { last_login: new Date(Date.now()) });

		// * Sending the response
		return res.status(200).json({
			id: userFound._id,
			username: userFound.username,
			email: userFound.email,
			role: userFound.role,
		});
	});
}

module.exports = new AuthController();