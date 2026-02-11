// server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 10000;

// ===============================
// SUPABASE CONFIG
// ===============================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors()); // permite acesso de qualquer origem
app.use(express.json()); // lê JSON do body

const upload = multer({ storage: multer.memoryStorage() });

// ===============================
// ROTAS DE UPLOAD
// ===============================
app.post("/api/vehicles/upload", upload.array("photos"), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0)
      return res.status(400).json({ error: "Nenhuma foto enviada." });

    const uploadedUrls = [];

    for (let file of files) {
      if (!file.mimetype.startsWith("image/"))
        return res.status(400).json({ error: "Apenas imagens são permitidas." });

      const fileName = `${Date.now()}_${file.originalname}`;

      const { error } = await supabase.storage
        .from("vehicle-images")
        .upload(fileName, file.buffer, { upsert: true });

      if (error) return res.status(500).json({ error: error.message });

      const { data } = supabase.storage
        .from("vehicle-images")
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
    }

    res.json({ uploadedUrls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// CRUD VEÍCULOS
// ===============================
app.get("/api/vehicles", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/vehicles", async (req, res) => {
  try {
    const {
      brand, model, year, price, power, category, fuel, transmission,
      color, description, status, featured, photos
    } = req.body;

    if (!brand || !model || !year || !price || !photos || photos.length === 0)
      return res.status(400).json({ error: "Campos obrigatórios faltando ou nenhuma foto enviada" });

    const { data, error } = await supabase.from("vehicles").insert([{
      brand, model, year, price,
      power: power || null,
      category: category || null,
      fuel: fuel || null,
      transmission: transmission || null,
      color: color || null,
      description: description || null,
      status: status || "Disponível",
      featured: featured || false,
      image: photos[0],
      photos
    }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/vehicles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      brand, model, year, price, power, category, fuel, transmission,
      color, description, status, featured, photos
    } = req.body;

    const { data, error } = await supabase
      .from("vehicles")
      .update({
        brand, model, year, price,
        power: power || null,
        category: category || null,
        fuel: fuel || null,
        transmission: transmission || null,
        color: color || null,
        description: description || null,
        status: status || "Disponível",
        featured: featured || false,
        image: photos?.[0] || null,
        photos: photos || null
      })
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/vehicles/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Veículo excluído com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});
