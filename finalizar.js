// Finalizar pedido via WhatsApp
document.getElementById("carrinho-final").addEventListener("click", () => {
  if(carrinho.length === 0) {
    alert("O carrinho está vazio!");
    return;
  }

  // Pegar dados do formulário
  const nome = document.getElementById("nome").value.trim();
  const pizzaria = document.getElementById("pizzaria").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const numero = document.getElementById("numero").value.trim();
  const cep = document.getElementById("cep").value.trim();
  const pagamento = document.getElementById("pagamento").value;

  // Montar resumo do carrinho
  let resumo = carrinho.map(item => {
    return `${item.nome} - ${item.qtd} ${item.vendidoPor === "KG" ? "Kg" : "unidade"} - R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}`;
  }).join("\n");

  // Montar mensagem completa
  const mensagem = `
Olá, quero fazer um pedido:

*Dados do cliente*
Nome: ${nome}
Pizzaria: ${pizzaria}
Telefone: ${telefone}
Endereço: ${endereco} Nº ${numero}
CEP: ${cep}
Pagamento: ${pagamento}

*Pedido*
${resumo}

*Total:* R$ ${carrinho.reduce((t, item) => t + item.preco*item.qtd, 0).toFixed(2).replace('.', ',')}
  `;

  // URL encode para WhatsApp
  const numeroWhats = "5511982688488"; // coloque o número do WhatsApp da pizzaria
  const url = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(mensagem)}`;

  // Abrir WhatsApp
  window.open(url, "_blank");
});