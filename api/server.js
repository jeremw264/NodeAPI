const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();

const corsOptions = {};
const apiPrefix = "/api";
const PORT = Number(process.env.PORT || 8080);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

app.get(`${apiPrefix}/`, (req, res) => res.status(200).send("<h1>Hello i'am  API</h1>"));

app.all(`${apiPrefix}*`, (req, res) => {
	return res.status(404).json({ error: "Endpoint Not Found" });
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT} `);
	console.log(`mode: ${process.env.NODE_ENV}`);
});
