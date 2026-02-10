function nextStep(step) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById("step" + step).classList.add("active");
}

document.getElementById("sellForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const phoneUser = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;
  const photos = document.getElementById("photos").files.length;

  const message = `
🚗 *VENDA SEU CARRO – GK MOTORS*

👤 Nome: ${name}
📞 Telefone: ${phoneUser}
📧 E-mail: ${email}

📝 Descrição:
${description}

💰 Valor desejado:
${price}

📸 Fotos selecionadas:
${photos} imagem(ns)
`;

  const phone = "5562992847266";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
});
