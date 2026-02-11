const express = require("express");
const multer = require("multer");
const { supabase } = require("./supabase.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// =====================
// Upload de imagens
// =====================
router.post("/upload", upload.array("photos"), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0)
      return res.status(400).json({ error: "Nenhuma foto enviada." });

    const uploadedUrls = [];

    for (let file of files) {
      const fileName = `${Date.now()}_${file.originalname}`;

      const { error } = await supabase.storage
        .from("vehicle-images")
        .upload(fileName, file.buffer, { upsert: true });

      if (error) return res.status(500).json({ error: error.message });

      const url = supabase.storage
        .from("vehicle-images")
        .getPublicUrl(fileName).data.publicUrl;

      uploadedUrls.push(url);
    }

    res.json({ uploadedUrls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// CRUD veículos
// =====================
router.get("/vehicles", async (req, res) => {
  try {
    const { data, error } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/vehicles", async (req, res) => {
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
      image: photos[0],   // destaque
      photos
    }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
