const User = require("../models/user.model").model;
const bcrypt = require("bcrypt");
const jwt = require("../utils/jwt.utils");
const ObjectId = require("mongoose").Types.ObjectId;

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
		return res.status(200).json({
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
		// * Vérifie que l'utilisateur a le droit de récup tout les users
		if (req.user.role != Roles.Admin) {
			res.status(401);
			throw new Error("Vous n'avez pas le niveau d'acces nécessaire !");
		}

		// * Récupere tous les utilisateurs.
		const userFound = await User.find();

		// * Filtre les données à conservé.
		const allUsers = userFound.map(user => ({
			id: user._id,
			username: user.username,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt,
		}));

		return res.status(200).json(allUsers);
	};

	/**
	 * @desc Renvoie l'utilisateur qui corresponds à l'id
	 * @route POST /api/users/:id
	 * @access private
	 */
	getUserById = async (req, res, next) => {
		let id = undefined;

		// * Vérifie si l'id est valide
		if (ObjectId.isValid(req.params.id)) {
			id = new ObjectId(req.params.id);
		} else {
			res.status(400);
			throw new Error("L'identifiant saisie est incorrect !");
		}

		// * Si l'id n'est pas celui du propriétaire, on vérifié que l'utilisateur est un admin
		if (req.user.id != id) {
			if (req.user.role != Roles.Admin) {
				res.status(401);
				throw new Error("Vous n'avez pas le niveau d'acces nécessaire !");
			}
		}

		// * Récupération de l'utilisateur choisie
		const user = await User.findOne({ _id: id });

		if (!user) {
			res.status(404);
			throw new Error("Utilisateur non trouvé !");
		}

		return res.status(200).json({
			id: user._id,
			username: user.username,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt,
		});
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

		// * Vérifie si il y a déja un utilisateur avec les même données
		const userExist = await User.findOne({ email });

		if (userExist) {
			res.status(400);
			throw new Error("L'utilisateur existe déja.");
		}

		// * Ajout en BDD
		let createdUser = await User.create({
			username: username,
			email: email,
			password: await this.#hashPassword(password),
		});

		// * Génération du token
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

		if (userData.email != email && userData.role == "user") {
            res.status(403);
            throw new Error("Vous n'avez pas l'autorisation pour modifié un autre utilisateur");
        }

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

		return res.status(501).json(updatedUser);
	});

	deleteUserById = asyncHandler(async (req, res, next) => {
		let id = undefined;

		// * Vérifie si l'id est valide
		if (ObjectId.isValid(req.params.id)) {
			id = new ObjectId(req.params.id);
		} else {
			res.status(400);
			throw new Error("L'identifiant saisie est incorrect !");
		}

		// * On vérifié que l'utilisateur est un admin
		if (req.user.role != Roles.Admin) {
			res.status(401);
			throw new Error("Vous n'avez pas le niveau d'acces nécessaire !");
		}

		// * Suppresion de l'utilisateur choisi
		const deletedUser = await User.findByIdAndDelete(id);

		// * Si l'id qui corresponds à l'utilisateur n'est pas trouvé, on lance une erreur.
		if (!deletedUser) {
			res.status(404);
			throw new Error("Utilisateur non trouvé avec cette identifiant !");
		}

		// * Si il est supprimer on renvoie les infos
		return res.status(200).json({
			id: deletedUser._id,
			username: deletedUser.username,
			email: deletedUser.email,
			role: deletedUser.role,
		});
	});

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
