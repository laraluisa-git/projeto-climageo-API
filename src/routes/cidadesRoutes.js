const express = require("express");
const router = express.Router();
const controller = require("../controllers/cidadesController");

router.get("/cidades/:uf", controller.listarCidades);

module.exports = router;