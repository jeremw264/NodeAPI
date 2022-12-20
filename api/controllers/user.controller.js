const asyncHandler = require("express-async-handler");
const User = require("../models/user.model").model;
const bcrypt = require("bcrypt");
const ObjectId = require("mongoose").Types.ObjectId;

const Role = require("../util/role.util");

class UserController {
	/**
	 * @desc Returns the list of users
	 * @route GET /api/v1/user/
	 */
	getUsers = asyncHandler(async (req, res, next) => {
		let users = await User.find();

		// * User data filtering
		users = users.map(user => ({
			id: user._id,
			username: user.username,
			email: user.email,
			role: user.role,
			last_login: user.last_login,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		}));

		return res.status(200).json(users);
	});

	/**
	 * @desc Returns the user found with id into params
	 * @route GET /api/v1/user/:id
	 */
	getUserWithId = asyncHandler(async (req, res, next) => {
		if (!req.params.id) {
			res.status(400);
			throw new Error("User id not found in the params.");
		}

		if (!ObjectId.isValid(req.params.id)) {
			throw new Error("The ID entered is incorrect.");
		}

		const userId = req.params.id;

		let user = await User.findOne({ _id: userId });

		if (!user) {
			res.status(404);
			throw new Error("User not found.");
		}

		return res.status(200).json({
			id: user._id,
			username: user.username,
			email: user.email,
			role: user.role,
			last_login: user.last_login,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		});
	});

	/**
	 * @desc Create new user
	 * @route POST /api/v1/user/
	 */
	createUser = asyncHandler(async (req, res, next) => {
		const { username, email, password } = req.body;

		// * Check if there is already a user with the same email
		const userExist = await User.findOne({ email });

		if (userExist) {
			res.status(400);
			throw new Error("The user already exists.");
		}

		// * Add to database
		const createdUser = await User.create({
			username: username,
			email: email,
			password: bcrypt.hashSync(password, 5),
		});

		// * Returns the response
		return res.status(201).json({
			id: createdUser._id,
			username: createdUser.lastname,
			email: createdUser.email,
			role: createdUser.role,
		});
	});

	/**
	 * @desc Update a user
	 * @route PUT /api/v1/user/:id
	 */
	updateUserWithId = asyncHandler(async (req, res, next) => {
		if (!req.params.id) {
			res.status(400);
			throw new Error("User id not found in the params.");
		}

		if (!ObjectId.isValid(req.params.id)) {
			throw new Error("The ID entered is incorrect.");
		}

		const id = new ObjectId(req.params.id);
		let selectedUser = await User.findOne({ _id: id });

		if (!req.user.id.equals(id) && req.user.role != Role.Admin) {
			res.status(401);
			throw new Error("You do not have the permissions to update this user.");
		}

		const { password, password2, role } = req.body;

		if (password || password2) {
			if (password === password2) {
				selectedUser.password = bcrypt.hashSync(password, 5);
			} else {
				res.status(400);
				throw new Error("The passwords are not the same.");
			}
		}

		if (role) {
			if (req.user.role == Role.Admin && selectedUser.role != Role.Admin) {
				if ([Role.User, Role.Moderator, Role.Admin].includes(req.body.role)) {
					selectedUser.role = role;
				} else {
					res.status(400);
					throw new Error(`The role must be ${Role.User}, ${Role.Moderator} or ${Role.Admin}.`);
				}
			} else {
				res.status(400);
				throw new Error("You do not have the necessary permissions to update the role for this user.");
			}
		}

		const updatedState = await User.updateOne({ _id: id }, selectedUser);

		if (updatedState.modifiedCount > 0) {
			const updatedUser = await User.findOne({ _id: id });
			return res.status(200).json({
				id: updatedUser._id,
				username: updatedUser.username,
				email: updatedUser.email,
				role: updatedUser.role,
			});
		} else {
			res.status(500);
			throw new Error("Problem during the update");
		}
	});

	/**
	 * @desc Deletes a user using her ID.
	 * @route DELETE /api/v1/user/:id
	 */
	deleteUserWithId = asyncHandler(async (req, res, next) => {
		if (!req.params.id) {
			res.status(400);
			throw new Error("User id not found in the params.");
		}

		if (!ObjectId.isValid(req.params.id)) {
			throw new Error("The ID entered is incorrect.");
		}

		const id = new ObjectId(req.params.id);
		const selectedUser = await User.findOne({ _id: id });

		if (!req.user.id.equals(id) && req.user.role != Role.Admin) {
			res.status(401);
			throw new Error("You do not have the permissions to delete this user.");
		}

		const deletedUser = await User.deleteOne({ _id: id });

		if (deletedUser.deletedCount < 1) {
			res.status(500);
			throw new Error("Problem when deleting the user.");
		}
		return res.status(200).json({
			id: selectedUser._id,
			username: selectedUser.username,
			email: selectedUser.email,
			role: selectedUser.role,
		});
	});
}

module.exports = new UserController();