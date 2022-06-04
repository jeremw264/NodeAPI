const Client = require("../models/client.model").model;
const asyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");

class ClientsController {
	test = async (req, res) => {
		return res.status(200).json({
			content: "Je suis la route clients",
		});
	};

	/**
	 * @desc Récupère la liste des clients
	 * @route GET /api/clients/
	 */
	getClients = asyncHandler(async (req, res) => {
		const userData = req.user;

		if (!userData) {
			res.status(500);
			throw new Error("Données utilisateur non trouvé.");
		}

		const clients = await Client.find({ userId: userData.id });

		res.status(200).json({ clients });
	});

	/**
	 * @desc Créé un client
	 * @route POST /api/clients/
	 */
	createClient = asyncHandler(async (req, res) => {
		const userId = req.user.id;
		const { firstname, lastname, email, phone } = req.body;

		if (!userId) {
			res.status(500);
			throw new Error("Id utilisateur non trouvé.");
		}

		if (!(firstname && lastname && email && phone)) {
			res.status(401);
			throw new Error("Les champs firstname, lastname, email et phone sont obligatoire. ");
		}

		let createClient = await Client.create({
			userId: userId,
			firstname: firstname,
			lastname: lastname,
			email: email,
			phone: phone,
		});

		return res.status(200).json({
			id: createClient._id,
			firstname: createClient.firstname,
			lastname: createClient.lastname,
			email: createClient.email,
			phone: createClient.phone,
		});
	});

	/**
	 * @desc Supprime un client avec son id
	 * @route PUT /api/clients/:id
	 */
	updateClient = asyncHandler(async (req, res) => {
		const userData = req.user;
		const clientId = req.params.id;

		if (!userData) {
			res.status(500);
			throw new Error("Donnée utilisateur non trouvée dans la requette.");
		}

		if (!clientId) {
			res.status(401);
			throw new Error("Id client non fournie impossible de le supprimer");
		}

		if (!mongoose.isValidObjectId(clientId)) {
			res.status(401);
			throw new Error("Le format de l'identifiant est invalide.");
		}

		const client = await Client.findOne({ userId: userData.id, _id: clientId });

		if (!client) {
			res.status(404);
			throw new Error("Client non trouvé");
		}

		const updatedClient = await Client.findByIdAndUpdate(clientId, req.body, {
			new: true,
		});

		res.status(200).json({
			id: updatedClient._id,
			userId: updatedClient.userId,
			firstname: updatedClient.firstname,
			lastname: updatedClient.lastname,
			email: updatedClient.email,
			phone: updatedClient.phone,
		});
	});

	/**
	 * @desc Supprime un client avec sont id
	 * @route DELETE /api/clients/:id
	 */
	deleteClient = asyncHandler(async (req, res) => {
		const userData = req.user;
		const clientId = req.params.id;

		if (!userData) {
			res.status(500);
			throw new Error("Donnée utilisateur non trouvée dans la requette.");
		}

		if (!clientId) {
			res.status(401);
			throw new Error("Id client non fournie impossible de le supprimer");
		}

		if (!mongoose.isValidObjectId(clientId)) {
			res.status(401);
			throw new Error("Le format de l'identifiant est invalide.");
		}

		const client = await Client.findOne({ userId: userData.id, _id: clientId });

		if (!client) {
			res.status(404);
			throw new Error("Client non trouvé");
		}

		let deleteResult = await Client.deleteOne(client);

		if (!deleteResult) {
			res.status(500);
			throw new Error(`Problème lors de la suppression du client avec id : ${clientId}`);
		}

		res.status(200).json({
			id: client._id,
			firstname: client.firstname,
			lastname: client.lastname,
			email: client.email,
			phone: client.phone,
			...deleteResult,
		});
	});
}

module.exports = new ClientsController();
