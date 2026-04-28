const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// HEALTH CHECK
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "healthy",
    versao: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// ROTAS
app.use("/api/v1", require("./routes/climaRoutes"));
app.use("/api/v1", require("./routes/cidadesRoutes"));

// Middleware
const errorMiddleware = require("./middlewares/errorMiddleware");

app.use(errorMiddleware);
module.exports = app;