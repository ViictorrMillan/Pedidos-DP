let produtos = [];
let carrinho = [];
let categoriaAtiva = null;

const categoriasContainer = document.getElementById("categorias-container");
const container = document.getElementById("produtos-container");
const pesquisaInput = document.getElementById("pesquisa");

const modal = document.getElementById("modal");
const modalNome = document.getElementById("modal-nome");
const modalImg = document.getElementById("modal-img");
const modalPreco = document.getElementById("modal-preco");
const modalDescricao = document.getElementById("modal-descricao");
const qtdInput = document.getElementById("modal-quantidade");
let modalIndex = null;

const painelCarrinho = document.getElementById("painel-carrinho");
const botaoCarrinho = document.getElementById("carrinho");
const botaoFecharCarrinho = document.getElementById("carrinho-fechar");



// Carregar produtos
async function carregarProdutos() {
  try {
    const resposta = await fetch("produtos.json");
    produtos = await resposta.json();
    renderizarCategorias();
    renderizarProdutos();
    atualizarCarrinho();
  } catch (erro) { console.error("Erro ao carregar produtos:", erro); }
}


// Categorias
function renderizarCategorias() {
  const categorias = [...new Set(produtos.map(p => p.categoria))];
  categoriasContainer.innerHTML = "";
  categorias.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "categoria-btn" + (cat === categoriaAtiva ? " ativo" : "");
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    btn.onclick = () => {
      categoriaAtiva = (categoriaAtiva === cat ? null : cat);
      renderizarCategorias();
      renderizarProdutos();
    };
    categoriasContainer.appendChild(btn);
  });
}

// Produtos
function renderizarProdutos() {
  const termo = pesquisaInput.value.toLowerCase();
  container.innerHTML = "";
  produtos
    .filter(p => (!categoriaAtiva || (categoriaAtiva === "promoção" ? p.promocao : p.categoria === categoriaAtiva)) && p.nome.toLowerCase().includes(termo))
    .forEach((p, index) => {
      const card = document.createElement("div");
      card.className = "produto-card";
      card.innerHTML = `
        ${p.promocao ? '<div class="promocao-badge">Promoção!</div>' : ''}
        <img src="${p.imagem}" alt="${p.nome}" data-index="${index}">
        <div class="produto-nome" data-index="${index}">${p.nome}</div>
        <div class="produto-subt"> R$ ${p.preco.toFixed(2).replace('.', ',')} ${p.vendidoPor === "KG" ? "por Kg" : "por Unidade"} </div>
        <button class="produto-card-btn " data-index="${index}"> Colocar no carrinho</button>
      `;
      container.appendChild(card);
    });
}

// Toast
function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerHTML = `<i class="fas fa-shopping-cart"></i> ${msg}`;
  toast.className = "show";
  setTimeout(() => {
    toast.className = toast.className.replace("show","");
  }, 3000);
}

// Adicionar ao carrinho
function adicionarCarrinho(index, qtd = 1) {
  const produto = produtos[index];
  const existente = carrinho.find(item => item.codigo === produto.codigo);
  if (existente) existente.qtd += qtd;
  else carrinho.push({ ...produto, qtd });
  atualizarCarrinho();
  mostrarToast(`${produto.nome} adicionado!`);
}

// Atualizar carrinho
function atualizarCarrinho() {
  const lista = document.getElementById("carrinho-itens");
  const totalEl = document.getElementById("carrinho-total");
  const botaoFinal = document.getElementById("carrinho-final");
  lista.innerHTML = "";
  let total = 0;

  if (carrinho.length > 0) {
    botaoCarrinho.style.display = painelCarrinho.classList.contains("aberto") ? "none" : "flex";
    botaoFinal.style.display = "flex";
  } else {
    botaoCarrinho.style.display = "none";
    botaoFinal.style.display = "none";
  }

  carrinho.forEach((item, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}">
      <div class="item-info">
        <span>${item.nome}</span>
        <span>Qtd: ${item.qtd} ${item.vendidoPor === "KG" ? "Kg" : "Unidade"}</span>
        <span>R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>
      </div>
      <div class="item-controles">
        <button id="menos" onclick="alterarQtd(${i}, -1)"><i class="fa fa-minus"></i></button>
        <button id="mais" onclick="alterarQtd(${i}, 1)"><i class="fa fa-plus"></i></button>
        <button class="remover" onclick="removerItem(${i})"><i class="fa fa-times"></i></button>
      </div>
    `;
    lista.appendChild(li);
    total += item.preco * item.qtd;
  });

  totalEl.textContent = total.toFixed(2);
  document.getElementById("carrinho-contador").textContent = carrinho.reduce((s,it)=>s+it.qtd,0);
}

// Alterar quantidade
function alterarQtd(index, delta) {
  carrinho[index].qtd += delta;
  if (carrinho[index].qtd <= 0) carrinho.splice(index,1);
  atualizarCarrinho();
}

// Remover item
function removerItem(index) {
  carrinho.splice(index,1);
  atualizarCarrinho();
}

// Pesquisa
pesquisaInput.addEventListener("input", renderizarProdutos);

// Eventos do card
container.addEventListener("click", (e) => {
  const index = e.target.dataset.index;
  if (!index) return;
  if (e.target.classList.contains("produto-card-btn")) adicionarCarrinho(index);
  else if (e.target.classList.contains("produto-nome") || e.target.tagName === "IMG") abrirModal(index);
});

// Modal
function abrirModal(index) {
  modalIndex = index;
  const produto = produtos[index];
  modalNome.textContent = produto.nome;
  modalImg.src = produto.imagem;
  modalDescricao.textContent = produto.descricao || "Sem descrição disponível";
  qtdInput.value = 1;
  atualizarPrecoModal(produto,1);
  modal.classList.add("show");
}
function atualizarPrecoModal(produto,qtd){
  modalPreco.textContent = `R$ ${(produto.preco*qtd).toFixed(2).replace('.', ',')} (${qtd} ${produto.vendidoPor==="KG"?"Kg":"Unidade"})`;
}

// Modal botões
document.getElementById("modal-fechar").onclick = () => modal.classList.remove("show");
document.getElementById("menos").onclick = () => {
  let qtd = parseInt(qtdInput.value);
  if(qtd>1){qtd--;qtdInput.value=qtd;atualizarPrecoModal(produtos[modalIndex],qtd);}
};
document.getElementById("mais").onclick = () => {
  let qtd = parseInt(qtdInput.value); qtd++; qtdInput.value = qtd;
  atualizarPrecoModal(produtos[modalIndex],qtd);
};
document.getElementById("modal-adicionar").onclick = () => {
  const qtd = parseInt(qtdInput.value)||1;
  adicionarCarrinho(modalIndex,qtd);
  modal.classList.remove("show");
};

// Abrir/Fechar carrinho
botaoCarrinho.addEventListener("click", ()=>{painelCarrinho.classList.add("aberto"); botaoCarrinho.style.display="none";});
botaoFecharCarrinho.addEventListener("click", ()=>{
  painelCarrinho.classList.remove("aberto");
  if(carrinho.length>0) botaoCarrinho.style.display="flex";
});


// Selecionar as setas
const setaEsquerda = document.querySelector("#categorias-wrapper .left");
const setaDireita = document.querySelector("#categorias-wrapper .right");

// Rolagem ao clicar
setaEsquerda.addEventListener("click", () => {
  categoriasContainer.scrollBy({ left: -150, behavior: "smooth" });
});
setaDireita.addEventListener("click", () => {
  categoriasContainer.scrollBy({ left: 150, behavior: "smooth" });
});

// Ocultar setas se necessário
function atualizarSetas() {
  const maxScroll = categoriasContainer.scrollWidth - categoriasContainer.clientWidth;
  setaEsquerda.style.display = categoriasContainer.scrollLeft > 0 ? "block" : "none";
  setaDireita.style.display = categoriasContainer.scrollLeft < maxScroll ? "block" : "none";
}
categoriasContainer.addEventListener("scroll", atualizarSetas);
window.addEventListener("resize", atualizarSetas);
atualizarSetas();



// Inicializa
carregarProdutos();



