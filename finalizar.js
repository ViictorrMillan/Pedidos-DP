// Finalizar pedido via WhatsApp
document.getElementById("carrinho-final").addEventListener("click", () => {
  if (carrinho.length === 0) {
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

  // Função auxiliar para saber o preço
  function getPreco(item) {
    return typeof item.precoUnitario === "number" ? item.precoUnitario : null;
  }

  // Separar produtos
  const comPreco = carrinho.filter(item => getPreco(item));
  const semPreco = carrinho.filter(item => !getPreco(item));

  // Montar resumo dos que têm preço
  const resumoComPreco = comPreco.map(item => {
    const preco = getPreco(item) * item.qtd;
    return `• ${item.nome} - ${item.qtd} ${item.vendidoPor === "KG" ? "Kg" : "unidade"} - R$ ${preco.toFixed(2).replace('.', ',')}`;
  }).join("\n");

  // Montar resumo dos sem preço
  const resumoSemPreco = semPreco.map(item => {
    return `• ${item.nome} - ${item.qtd} ${item.vendidoPor === "KG" ? "Kg" : "unidade"} - *Valor após pesagem*`;
  }).join("\n");

  // Calcular total apenas dos com preço
  const total = comPreco.reduce((t, item) => t + getPreco(item) * item.qtd, 0);

  // Mensagem para WhatsApp
  const mensagem = `
Olá, quero fazer um pedido:

*Dados do cliente*
👤 Nome: ${nome}
🏪 Pizzaria: ${pizzaria}
📞 Telefone: ${telefone}
📍 Endereço: ${endereco} Nº ${numero}
📮 CEP: ${cep}
💳 Pagamento: ${pagamento}

${resumoComPreco ? `*Produtos com preço definido:*\n${resumoComPreco}` : ""}
${resumoSemPreco ? `\n*Produtos a pesar (valor após pesagem):*\n${resumoSemPreco}` : ""}

${resumoComPreco ? `\n*Total (produtos com preço):* R$ ${total.toFixed(2).replace('.', ',')}` : ""}
  `;

  const numeroWhats = "5511982688488"; // número do WhatsApp
  const url = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
});
