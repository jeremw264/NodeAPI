const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const UsersRoute = require("./routes/users.route");
const ClientsController = require("./routes/clients.route");

const { errorHandler } = require("./middleware/error.middleware");

const app = express();

const corsOptions = {};
dotenv.config();
const apiPrefix = "/api/";
const PORT = Number(process.env.PORT || 8080);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

app.get("/", (req, res) => res.status(200).send("<h1>Hello i'am  API</h1>"));

app.use(`${apiPrefix}users`, UsersRoute);
app.use(`${apiPrefix}clients`, ClientsController);


app.all("*", (req, res,) => {
    return res.status(404).json({ error: "Endpoint Not Found" });
});

app.use(errorHandler);

app.listen(PORT, () => {

    const MODE = process.env.NODE_ENV;

    console.log(`Server running on port ${PORT} `);
    console.log(`mode: ${MODE}`); 
});

