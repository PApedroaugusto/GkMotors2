const express = require("express");
const cors = require("cors");
const router = require("./routes"); // sem .js já funciona

const app = express();

/**
 * ===============================
 * CORS (ESSENCIAL NO RENDER)
 * ===============================
 */
app.use(
  cors({
    origin: [
      "https://gkmotors-2.onrender.com",
      "https://gkmotors.onrender.com",
      "http://localhost:3000",
      "http://127.0.0.1:5500"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/**
 * ===============================
 * MIDDLEWARES
 * ===============================
 */
app.use(express.json());

/**
 * ===============================
 * ROTAS
 * ===============================
 */
app.use("/api", router);

/**
 * ===============================
 * ROTA DE TESTE (DEBUG)
 * ===============================
 */
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API GkMotors rodando 🚗🔥" });
});

/**
 * ===============================
 * SERVER
 * ===============================
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
