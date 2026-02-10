document.addEventListener("DOMContentLoaded", () => {
  const BRAND_LOGOS = [
    { name: "Chevrolet", logo: "assets/brands/chevrolet.png" },
    { name: "Fiat", logo: "assets/brands/fiat.png" },
    { name: "Ford", logo: "assets/brands/ford.png" },
    { name: "Honda", logo: "assets/brands/honda.png" },
    { name: "Hyundai", logo: "assets/brands/hyundai.png" },
    { name: "Jeep", logo: "assets/brands/jeep.png" },
    { name: "Toyota", logo: "assets/brands/toyota.png" },
    { name: "Volkswagen", logo: "assets/brands/volkswagen.png" },
    { name: "BMW", logo: "assets/brands/bmw.png" },
    { name: "Mercedes-Benz", logo: "assets/brands/mercedes.png" },
    { name: "Audi", logo: "assets/brands/audi.png" },
    { name: "Nissan", logo: "assets/brands/nissan.png" },
    { name: "Peugeot", logo: "assets/brands/peugeot.png" },
    { name: "Renault", logo: "assets/brands/renault.png" },
    { name: "Citroën", logo: "assets/brands/citroen.png" },
    { name: "Mitsubishi", logo: "assets/brands/mitsubishi.png" },
    { name: "Kia", logo: "assets/brands/kia.png" },
    { name: "Volvo", logo: "assets/brands/volvo.png" },
    { name: "Land Rover", logo: "assets/brands/land-rover.png" },
    { name: "Porsche", logo: "assets/brands/porsche.png" }
  ];

  const brandsGrid = document.getElementById("brandsGrid");

  if (!brandsGrid) {
    console.error("Elemento #brandsGrid não encontrado");
    return;
  }

  BRAND_LOGOS.forEach(brand => {
    const card = document.createElement("a");
    card.href = `vehicles.html?brand=${encodeURIComponent(brand.name)}`;
    card.className = "brand-card";

    card.innerHTML = `
      <div class="brand-logo">
        <img src="${brand.logo}" alt="${brand.name}">
        <div class="brand-fallback">${brand.name.charAt(0)}</div>
      </div>
      <span>${brand.name}</span>
    `;

    const img = card.querySelector("img");
    const fallback = card.querySelector(".brand-fallback");

    img.addEventListener("error", () => {
      img.style.display = "none";
      fallback.style.display = "flex";
    });

    brandsGrid.appendChild(card);
  });
});

