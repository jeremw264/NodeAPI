const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

class Jwt {
    generateToken = userData => {
        return jwt.sign({ userData: userData }, process.env.SECRET_KEY, {
            expiresIn: process.env.TTL_TOKEN || "1h",
        });
    };

    verifyToken = token => {
        return jwt.verify(token, process.env.SECRET_KEY);
    };
}

module.exports = new Jwt();
