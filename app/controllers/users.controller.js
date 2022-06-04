const User = require("../models/user.model").model;
const bcrypt = require("bcrypt");
const jwt = require("../utils/jwt.utils");

const Roles = require("../utils/roles.utils");

const asyncHandler = require("express-async-handler");

class UsersController {
	/**
	 * @desc Connecter un utilisateur
	 * @route POST /api/users/login
	 * @access private
	 */
	userLogin = asyncHandler(async (req, res, next) => {
		const { email, password } = req.body;

		// * Vérification des données
		if (!(password && email)) {
			res.status(400);
			throw new Error("Les champs email et password sont obligatoire.");
		}

		// * Recherche de l'utilisateur
		const userFound = await User.findOne({ email });

		if (!userFound) {
			res.status(404);
			throw new Error("Utilisateur non trouvé.");
		}

		// * Vérification password
		const userPass = userFound.password;

		const checkPassword = await bcrypt.compare(password, userPass);

		if (!checkPassword) {
			res.status(401);
			throw new Error("Mot de passe incorrect.");
		}

		// * Génération du token
		const token = jwt.generateToken(userFound);

		// * Envoie de la réponse
		return res.status(201).json({
			id: userFound._id,
			username: userFound.username,
			email: userFound.email,
			role: userFound.role,
			token,
		});
	});

	/**
	 * @desc Renvoie la liste de tous les utilisateurs
	 * @route GET /api/users/
	 * @access private
	 */
	getAllUsers = async (req, res, next) => {
		if (req.user.role != Roles.Admin) {
			res.status(401);
			throw new Error("Vous n'avez pas le niveau d'acces nécessaire !");
		}

        let users = await User.find();

		return res.status(200).json(users);
	};

	getUsersById = async (req, res, next) => {
		return res.status(501).json({ message: "In developpement" });
	};

	/**
	 * @desc Créé un utilisateur
	 * @route POST /api/users/
	 * @access private
	 */
	createUser = asyncHandler(async (req, res) => {
		const { username, email, password } = req.body;

		if (!(password && username && email)) {
			res.status(400);
			throw new Error("Les champs username, email et password sont obligatoire");
		}

		// Vérifie si il y a déja un utilisateur avec les même données
		const userExist = await User.findOne({ email });

		if (userExist) {
			res.status(400);
			throw new Error("L'utilisateur existe déja.");
		}

		// Ajout en BDD
		let createdUser = await User.create({
			username: username,
			email: email,
			password: await this.#hashPassword(password),
		});

		// Génération du token
		const token = jwt.generateToken(createdUser);

		return res.status(201).json({
			id: createdUser._id,
			username: createdUser.username,
			email: createdUser.email,
			role: createdUser.role,
			token,
		});
	});

	/**
	 * @desc Modifie une utilisateur
	 * @route PUT /api/users/
	 * @access private
	 */
	updateUser = asyncHandler(async (req, res, next) => {
		const { username, email, password, role, token } = req.body;

		if (!token) {
			res.status(400);
			throw new Error("Token nécessaire pour effectuer une modification.");
		}

		if (!email) {
			res.status(400);
			throw new Error("Email nécessaire pour savoir quelle utilisateur modifié.");
		}

		const userData = jwt.verifyToken(token).userData;

		/*if (userData.email != email && userData.role == "user") {
            res.status(403);
            throw new Error("Vous n'avez pas l'autorisation pour modifié un autre utilisateur");
        }*/

		const userFound = await User.findOne({ email });

		if (!userFound) {
			res.status(404);
			throw new Error("Utilisateur non trouvé.");
		}

		if (username) {
			userFound.username = username;
		}
		if (password) {
			userFound.password = this.#hashPassword(password);
		}

		if (role) {
			userFound.role = role;
		}

		const updatedUser = await User.findByIdAndUpdate(userFound, req.body, {
			new: true,
		});

		console.log(this.updatedUser);

		return res.status(501).json({ message: "In developpement" });
	});

	deleteUser = async (req, res, next) => {
		return res.status(501).json({ message: "In developpement" });
	};

	/**
	 *
	 * @param {String} password Le password à hasher.
	 * @returns le hash, null si il y a un problème.
	 */
	#hashPassword = async password => {
		if (password) {
			return await bcrypt.hash(password, 5);
		}
		return null;
	};
}

module.exports = new UsersController();
