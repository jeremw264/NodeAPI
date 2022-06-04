const mongoose = require("mongoose");

const dbURI = require("../config/db.config").DB_URI;

const dbConnection = mongoose.createConnection(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

module.exports = dbConnection;

// mise en place des abonnements aux événéments
dbConnection.on("connected", () => console.log(`db.controller.js : connected to ${dbURI}`));
dbConnection.on("disconnected", () => console.log("bd disconnected"));
dbConnection.on("error", () => console.log("bd error"));

const shutdown = (msg, callback) => {
    // fonction pour
    dbConnection.close(
        // fermer proprement la connexion
        () => {
            console.log(` Mongoose shutdown : ${msg}`);
            callback();
        }
    );
};

// code pour gérer proprement le Ctrl+C sous windows et la réception de 'SIGINT'
// nécessite d'installer le module readline : 'npm install readline --save'

process.on("SIGINT", () => shutdown("application ends", () => process.exit(0))); // application killed (Ctrl+c)
process.on("SIGTERM", () => shutdown("SIGTERM received", () => process.exit(0))); // process killed (POSIX)
