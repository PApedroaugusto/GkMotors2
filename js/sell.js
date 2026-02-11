// ===============================
// FUNÇÃO PARA AVANÇAR OS PASSOS DO FORMULÁRIO
// ===============================
function nextStep(step) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  const current = document.getElementById("step" + step);
  if (current) current.classList.add("active");
}

// ===============================
// FUNÇÃO PARA ENVIAR PARA WHATSAPP
// ===============================
function sendToWhatsApp() {
  const name = document.getElementById("name")?.value || "";
  const phoneUser = document.getElementById("phone")?.value || "";
  const email = document.getElementById("email")?.value || "";
  const description = document.getElementById("description")?.value || "";
  const price = document.getElementById("price")?.value || "";

  const message = `
🚗 *VENDA SEU CARRO – GK MOTORS*

👤 Nome: ${name}
📞 Telefone: ${phoneUser}
📧 E-mail: ${email}

📝 Descrição:
${description}

💰 Valor desejado:
${price}
`;

  const phone = "5562992847266"; 
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  // Abrir WhatsApp
  window.open(url, "_blank");
}
