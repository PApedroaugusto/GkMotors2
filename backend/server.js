const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "db.json");

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cors());

/* ===============================
   DB HELPERS
================================ */
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { vehicles: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }

  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (err) {
    console.error("❌ ERRO NO DB.JSON:", err);
    return { vehicles: [] };
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

/* ===============================
   ROTAS
================================ */

// LISTAR
app.get('/vehicles', (req, res) => {
  res.json([...]); // seus veículos
});

// CRIAR
app.post("/api/vehicles", (req, res) => {
  const db = readDB();

  if (!req.body || !req.body.brand) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const vehicle = {
    ...req.body,
    _id: Date.now().toString()
  };

  db.vehicles.push(vehicle);
  saveDB(db);

  res.status(201).json(vehicle);
});

// EDITAR
app.put("/api/vehicles/:id", (req, res) => {
  const db = readDB();
  const id = req.params.id;

  const index = db.vehicles.findIndex(v => v._id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Veículo não encontrado" });
  }

  // 🔥 MESCLA, NÃO SOBRESCREVE
  db.vehicles[index] = {
    ...db.vehicles[index],
    ...req.body,
    _id: id
  };

  saveDB(db);
  res.json(db.vehicles[index]);
});

// EXCLUIR
app.delete("/api/vehicles/:id", (req, res) => {
  const db = readDB();
  const id = req.params.id;

  const before = db.vehicles.length;
  db.vehicles = db.vehicles.filter(v => v._id !== id);

  if (db.vehicles.length === before) {
    return res.status(404).json({ error: "Veículo não encontrado" });
  }

  saveDB(db);
  res.json({ success: true });
});

// STATUS
app.get("/", (req, res) => {
  res.json({
    message: "Backend rodando 🚀",
    totalVehicles: readDB().vehicles.length
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
