const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// MIDDLEWARES
// ===============================
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// ===============================
// CONEXÃO SUPABASE (POSTGRES)
// ===============================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ===============================
// ROTAS
// ===============================

// 🔹 HEALTH CHECK
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend rodando 🚀" });
});

// 🔹 LISTAR VEÍCULOS
app.get("/api/vehicles", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM vehicles ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar veículos" });
  }
});

// 🔹 CRIAR VEÍCULO
app.post("/api/vehicles", async (req, res) => {
  const v = req.body;

  if (!v.brand || !v.model || !v.year || !v.price) {
    return res.status(400).json({ error: "Dados obrigatórios faltando" });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO vehicles
      (brand, model, year, price, power, category, fuel, transmission, color, description, photos, image, status, featured)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *
      `,
      [
        v.brand,
        v.model,
        v.year,
        v.price,
        v.power,
        v.category,
        v.fuel,
        v.transmission,
        v.color,
        v.description,
        v.photos || [],
        v.image || null,
        v.status || "disponivel",
        v.featured || false
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar veículo" });
  }
});

// 🔹 ATUALIZAR VEÍCULO
app.put("/api/vehicles/:id", async (req, res) => {
  const id = Number(req.params.id);
  const v = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const { rows } = await pool.query(
      `
      UPDATE vehicles SET
        brand=$1,
        model=$2,
        year=$3,
        price=$4,
        power=$5,
        category=$6,
        fuel=$7,
        transmission=$8,
        color=$9,
        description=$10,
        photos=$11,
        image=$12,
        status=$13,
        featured=$14
      WHERE id=$15
      RETURNING *
      `,
      [
        v.brand,
        v.model,
        v.year,
        v.price,
        v.power,
        v.category,
        v.fuel,
        v.transmission,
        v.color,
        v.description,
        v.photos || [],
        v.image || null,
        v.status,
        v.featured,
        id
      ]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Veículo não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar veículo" });
  }
});

// 🔹 DELETAR VEÍCULO
app.delete("/api/vehicles/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    await pool.query("DELETE FROM vehicles WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir veículo" });
  }
});

// ===============================
app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
