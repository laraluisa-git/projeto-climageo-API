const express = require("express");
const router = express.Router();
const controller = require("../controllers/climaController");

router.get("/clima/:cidade", controller.buscarClima);

module.exports = router;