const mongoose = require("mongoose");

const dbURI = require("../config/db.config").DB_URI;

const dbConnection = mongoose.createConnection(dbURI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

module.exports = dbConnection;

dbConnection.on("connected", () => console.log(`db.controller.js : connected to ${dbURI}`));
dbConnection.on("disconnected", () => console.log("bd disconnected"));
dbConnection.on("error", () => console.log("bd error"));

const shutdown = (msg, callback) => {
	dbConnection.close(() => {
		console.log(` Mongoose shutdown : ${msg}`);
		callback();
	});
};

process.on("SIGINT", () => shutdown("application ends", () => process.exit(0))); // application killed (Ctrl+c)
process.on("SIGTERM", () => shutdown("SIGTERM received", () => process.exit(0))); // process killed (POSIX)