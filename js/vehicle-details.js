const API = window.API_VEHICLES;


let vehicle = null;
let currentImage = 0;

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

document.addEventListener("DOMContentLoaded", loadVehicle);

// ===============================
// LOAD
// ===============================
async function loadVehicle() {
  const res = await fetch(API);
  const vehicles = await res.json();

  vehicle = vehicles.find(v => String(v.id) === id);

  if (!vehicle) {
    document.body.innerHTML = "<h2>Veículo não encontrado</h2>";
    return;
  }

  renderVehicle();
}

// ===============================
// RENDER PRINCIPAL
// ===============================
function renderVehicle() {
  document.getElementById("title").innerText =
    `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;

  document.getElementById("price").innerText =
    `R$ ${Number(vehicle.price).toLocaleString("pt-BR")}`;

  document.getElementById("category").innerText = vehicle.category || "";
  document.getElementById("description").innerText =
    vehicle.description || "Sem descrição";

  renderSpecs();
  renderImages();
}

// ===============================
// ESPECIFICAÇÕES (COM ÍCONES)
// ===============================
function renderSpecs() {
  const specs = [
    { icon: "📅", label: "Ano", value: vehicle.year },
    
    { icon: "⛽", label: "Combustível", value: vehicle.fuel ?? "-" },
    { icon: "⚙️", label: "Câmbio", value: vehicle.transmission ?? "-" },
    { icon: "🎨", label: "Cor", value: vehicle.color ?? "-" },
    { icon: "⚡", label: "Potência", value: vehicle.power ?? "-" },
    { icon: "⭐", label: "Avaliação", value: vehicle.rating ? `${vehicle.rating}/5` : "Não avaliado" }
  ];

  const container = document.getElementById("specs");
  container.innerHTML = "";

  specs.forEach(spec => {
    container.innerHTML += `
      <div class="spec">
        <small>${spec.icon} ${spec.label}</small>
        <strong>${spec.value}</strong>
      </div>
    `;
  });
}

// ===============================
// IMAGENS
// ===============================
function getImages() {
  if (Array.isArray(vehicle.photos) && vehicle.photos.length > 0) {
    return vehicle.photos;
  }
  return ["img/no-image.png"];
}

// ===============================
// GALERIA
// ===============================
function renderImages() {
  const images = getImages();

  //const mainImage = document.getElementById("mainImage");
  const mainImage = document.getElementById("mainImage");
mainImage.src = images[currentImage];
mainImage.onclick = openFullscreen;

  const dots = document.getElementById("dots");
  const thumbs = document.getElementById("thumbnails");

  mainImage.src = images[currentImage];

  dots.innerHTML = "";
  thumbs.innerHTML = "";

  images.forEach((img, index) => {
    // DOTS
    const dot = document.createElement("span");
    if (index === currentImage) dot.classList.add("active");
    dot.onclick = () => {
      currentImage = index;
      renderImages();
    };
    dots.appendChild(dot);

    // THUMBNAILS (TODAS AS FOTOS)
    const thumb = document.createElement("img");
    thumb.src = img;
    thumb.className = index === currentImage ? "active" : "";
    thumb.onclick = () => {
      currentImage = index;
      renderImages();
    };
    thumbs.appendChild(thumb);
  });
}

// ===============================
// CONTROLES
// ===============================
function nextImage() {
  const images = getImages();
  currentImage = (currentImage + 1) % images.length;
  renderImages();
  updateFullscreenImage();

}

function prevImage() {
  const images = getImages();
  currentImage = (currentImage - 1 + images.length) % images.length;
  renderImages();
  updateFullscreenImage();

}


// ===============================
// FULLSCREEN
// ===============================
function openFullscreen() {
  const fs = document.getElementById("fullscreen");
  const fsImage = document.getElementById("fsImage");

  fsImage.src = getImages()[currentImage];
  fs.classList.remove("hidden");
}

function closeFullscreen() {
  document.getElementById("fullscreen").classList.add("hidden");
}

// ESC para fechar
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeFullscreen();
});

// Atualiza imagem no fullscreen
function updateFullscreenImage() {
  const fsImage = document.getElementById("fsImage");
  if (fsImage) {
    fsImage.src = getImages()[currentImage];
  }
}
