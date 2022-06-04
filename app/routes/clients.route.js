const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clients.controller");

const auth = require("../middleware/auth.middleware");

router.get("/test", clientController.test);
router.get("/", auth(), clientController.getClients);
router.post("/", auth(), clientController.createClient);
router.put("/:id", auth(), clientController.updateClient);
router.delete("/:id", auth(), clientController.deleteClient);

module.exports = router;
