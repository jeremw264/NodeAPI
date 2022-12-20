const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
var cookieParser = require('cookie-parser');
const { errorHandler } = require("../../NodeAPIV1/app/middleware/error.middleware");
dotenv.config();
const app = express();

const corsOptions = {};
const PORT = Number(process.env.PORT || 8080);

// Routes
const userRoute = require("./routes/user.route");
const authRoute = require("./routes/auth.route");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());


const apiPrefix = "/api";

app.use(`${apiPrefix}/user`, userRoute);
app.use(`${apiPrefix}/auth`, authRoute);

app.all(`${apiPrefix}*`, (req, res) => {
	return res.status(404).json({ error: "Endpoint Not Found" });
});

app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT} `);
	console.log(`mode: ${process.env.NODE_ENV}`);
});
