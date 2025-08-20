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
const modalSub = document.getElementById("modal-descricao"); // subtítulo com marca/peso
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
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }
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

// Renderizar produtos no card
function renderizarProdutos() {
  const termo = pesquisaInput.value.toLowerCase();
  container.innerHTML = "";
  produtos
    .filter(p =>
      (!categoriaAtiva || (categoriaAtiva === "promoção" ? p.promocao : p.categoria === categoriaAtiva))
      && p.nome.toLowerCase().includes(termo)
    )
    .forEach((p) => {
      const card = document.createElement("div");
      card.className = "produto-card";

      // Container para subtítulos
      const subtitulo = document.createElement("div");
      subtitulo.className = "produto-subt";

      if (p.marca) {
        const marcaEl = document.createElement("div");
        marcaEl.textContent = `Marca: ${p.marca}`;
        subtitulo.appendChild(marcaEl);
      }

      if (p.peso) {
        const pesoEl = document.createElement("div");
        pesoEl.textContent = `Peso: ${p.peso}`;
        subtitulo.appendChild(pesoEl);
      }

      const precoEl = document.createElement("div");
      precoEl.textContent = `R$ ${p.preco.toFixed(2).replace('.', ',')} ${p.vendidoPor === "KG" ? "por Kg" : "por Unidade"}`;
      subtitulo.appendChild(precoEl);

      card.innerHTML = `
        ${p.promocao ? '<div class="promocao-badge">Promoção!</div>' : ''}
        <img src="${p.imagem}" alt="${p.nome}" data-codigo="${p.codigo}">
        <div class="produto-nome" data-codigo="${p.codigo}">${p.nome}</div>
      `;

      card.appendChild(subtitulo);
      card.innerHTML += `<button class="produto-card-btn" data-codigo="${p.codigo}">Colocar no carrinho</button>`;

      container.appendChild(card);
    });
}

// Toast
function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerHTML = `<i class="fas fa-shopping-cart"></i> ${msg}`;
  toast.className = "show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 2000);
}

// Adicionar ao carrinho
function adicionarCarrinho(produto, qtd = 1) {
  const existente = carrinho.find(item => item.codigo === produto.codigo);
  if (existente) existente.qtd += qtd;
  else carrinho.push({ ...produto, qtd });
  atualizarCarrinho();
  mostrarToast(`${produto.nome} adicionado!`);
}

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
    li.className = "carrinho-item"; // mantém classe geral

    // HTML do item
    li.innerHTML = `
      <img class="carrinho-img" src="${item.imagem}" alt="${item.nome}">

      <div class="item-info">
        <span class="nome-produto">${item.nome}</span>
        <div class="descricao-produto-carrinho">
        ${item.marca ? `<span class="marca">Marca: ${item.marca}</span>` : ''}
        ${item.vendidoPor !== "KG" && item.peso ? `<span class="peso">Peso: ${item.peso}</span>` : ''}
        </div>
        <div class="qtd-preco-carrinho">
        <span class="item-qtd">Qtd: ${item.qtd} ${item.vendidoPor === "KG" ? "Kg" : "Un"}</span>
        <span class="item-preco">R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>
      </div>
         <div class="item-controles">
        <button id="mais" class="mais" onclick="alterarQtd(${i}, 1)"><i class="fa fa-plus"></i></button>
        <button id="menos" id= class="menos" onclick="alterarQtd(${i}, -1)"><i class="fa fa-minus"></i></button>
        <button class="remover" onclick="removerItem(${i})"><i class="fa fa-times"></i></button>
         </div>
      </div>
   
    `;

    lista.appendChild(li);
    total += item.preco * item.qtd;
  });

  totalEl.textContent = total.toFixed(2);
}


// Alterar quantidade
function alterarQtd(index, delta) {
  carrinho[index].qtd += delta;
  if (carrinho[index].qtd <= 0) carrinho.splice(index, 1);
  atualizarCarrinho();
}

// Remover item
function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

// Pesquisa
pesquisaInput.addEventListener("input", renderizarProdutos);

// Eventos do card
container.addEventListener("click", (e) => {
  const codigo = e.target.dataset.codigo;
  if (!codigo) return;

  const produto = produtos.find(p => p.codigo === codigo);

  if (e.target.classList.contains("produto-card-btn")) {
    adicionarCarrinho(produto);
  } else if (e.target.classList.contains("produto-nome") || e.target.tagName === "IMG") {
    abrirModal(produto);
  }
});

// Modal
function abrirModal(produto) {
  modalIndex = produto.codigo;
  modalNome.textContent = produto.nome;
  modalImg.src = produto.imagem;

  // Limpa o container do subtítulo e cria elementos separados
  modalSub.innerHTML = "";
  if (produto.marca) {
    const marcaEl = document.createElement("div");
    marcaEl.textContent = `Marca: ${produto.marca}`;
    modalSub.appendChild(marcaEl);
  }
  if (produto.peso) {
    const pesoEl = document.createElement("div");
    pesoEl.textContent = `Peso: ${produto.peso}`;
    modalSub.appendChild(pesoEl);
  }

  qtdInput.value = 1;
  atualizarPrecoModal(produto, 1);
  modal.classList.add("show");
}

function atualizarPrecoModal(produto, qtd) {
  let unidade;
  if (produto.vendidoPor === "KG") {
    unidade = "Kg";
  } else {
    unidade = qtd > 1 ? "Unidades" : "Unidade";
  }

  modalPreco.textContent = `${qtd} ${unidade} por R$ ${(produto.preco * qtd).toFixed(2).replace('.', ',')}`;
}

// Modal botões
document.getElementById("modal-fechar").onclick = () => modal.classList.remove("show");
document.getElementById("menos").onclick = () => {
  let qtd = parseInt(qtdInput.value);
  if (qtd > 1) {
    qtd--;
    qtdInput.value = qtd;
    const produto = produtos.find(p => p.codigo === modalIndex);
    atualizarPrecoModal(produto, qtd);
  }
};
document.getElementById("mais").onclick = () => {
  let qtd = parseInt(qtdInput.value);
  qtd++;
  qtdInput.value = qtd;
  const produto = produtos.find(p => p.codigo === modalIndex);
  atualizarPrecoModal(produto, qtd);
};
document.getElementById("modal-adicionar").onclick = () => {
  const qtd = parseInt(qtdInput.value) || 1;
  const produto = produtos.find(p => p.codigo === modalIndex);
  adicionarCarrinho(produto, qtd);
  modal.classList.remove("show");
};

// Abrir/Fechar carrinho
botaoCarrinho.addEventListener("click", () => {
  painelCarrinho.classList.add("aberto");
  botaoCarrinho.style.display = "none";
});
botaoFecharCarrinho.addEventListener("click", () => {
  painelCarrinho.classList.remove("aberto");
  if (carrinho.length > 0) botaoCarrinho.style.display = "flex";
});

// Rolagem de categorias
const setaEsquerda = document.querySelector("#categorias-wrapper .left");
const setaDireita = document.querySelector("#categorias-wrapper .right");

setaEsquerda.addEventListener("click", () => {
  categoriasContainer.scrollBy({ left: -150, behavior: "smooth" });
});
setaDireita.addEventListener("click", () => {
  categoriasContainer.scrollBy({ left: 150, behavior: "smooth" });
});

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
