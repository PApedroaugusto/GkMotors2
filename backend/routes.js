const express = require("express");
const multer = require("multer");
const { supabase } = require("./supabase.js");

const router = express.Router();

// Multer para receber imagens do front-end (em memória)
const upload = multer({ storage: multer.memoryStorage() });

// =====================
// Rota: Upload de fotos
// =====================
router.post("/upload", upload.array("photos"), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0)
      return res.status(400).json({ error: "Nenhuma foto enviada." });

    const uploadedUrls = [];

    for (let file of files) {
      const fileName = `${Date.now()}_${file.originalname}`;

      // Envia a imagem para o Supabase Storage
      const { error } = await supabase.storage
        .from("vehicle-images") // nome do bucket
        .upload(fileName, file.buffer, { upsert: false });

      if (error) return res.status(500).json({ error: error.message });

      // Pega a URL pública da imagem
      const url = supabase.storage
        .from("vehicle-images")
        .getPublicUrl(fileName).data.publicUrl;

      uploadedUrls.push(url);
    }

    res.json({ uploadedUrls }); // Retorna as URLs das fotos
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// Rota: Adicionar carro
// =====================
router.post("/vehicles", async (req, res) => {
  try {
    const {
      brand, model, year, price, power, category, fuel, transmission,
      color, description, status, featured, photos
    } = req.body;

    if (!photos || photos.length === 0)
      return res.status(400).json({ error: "É necessário enviar pelo menos uma foto." });

    const { data, error } = await supabase.from("vehicles").insert([{
      brand,
      model,
      year,
      price,
      power: power || null,
      category: category || null,
      fuel: fuel || null,
      transmission: transmission || null,
      color: color || null,
      description: description || null,
      status: status || "Disponível",
      featured: featured || false,
      image: photos[0],  // primeira foto como destaque
      photos             // array completo de fotos
    }]);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// Rota: Listar carros
// =====================
router.get("/vehicles", async (req, res) => {
  try {
    const { data, error } = await supabase.from("vehicles").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Exporta o router no padrão CommonJS
module.exports = router;
