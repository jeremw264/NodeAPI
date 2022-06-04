const mongoose = require("mongoose");
const dbConnection = require("../controllers/db.controller");



const clientSchema = new mongoose.Schema({
    userId: { type: mongoose.ObjectId, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: String,
    phone: Number,
});

module.exports = clientSchema;
const Client = dbConnection.model("Client", clientSchema, "client");
module.exports.model = Client;
