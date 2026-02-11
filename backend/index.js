const express = require("express");
const cors = require("cors");
const router = require("./routes.js"); // suas rotas

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router); // todas as rotas começam com /api

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
