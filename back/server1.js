const express = require("express");
const fs = require("fs");
const cors = require("cors");

const PORT = process.env.PORT || 3000;

const app = express();

// Permitir requisições de qualquer origem (Netlify, localhost, etc)
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // caso tenha frontend estático

const COMMENTS_FILE = "./comments.json";

// ===============================
// Funções de DB
// ===============================
function readComments() {
  if (!fs.existsSync(COMMENTS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(COMMENTS_FILE));
  } catch (err) {
    console.error("Erro ao ler comments.json:", err);
    return [];
  }
}

function saveComments(data) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(data, null, 2));
}

// ===============================
// Rotas
// ===============================
app.get("/api/comments", (req, res) => {
  res.json(readComments());
});

app.post("/api/comments", (req, res) => {
  const { nome, comentario } = req.body;

  if (!nome || !comentario) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const comments = readComments();

  comments.push({
    id: Date.now(),
    nome,
    comentario,
    data: new Date().toLocaleString("pt-BR"),
  });

  saveComments(comments);
  res.json({ success: true });
});

app.delete("/api/comments/:id", (req, res) => {
  const id = Number(req.params.id);
  const comments = readComments().filter((c) => c.id !== id);
  saveComments(comments);
  res.json({ success: true });
});

// ===============================
// Start server
// ===============================
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
