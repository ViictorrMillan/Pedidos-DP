let produtos = [];
let carrinho = [];
let categoriaAtiva = null;

// DOM Elements
const categoriasContainer = document.getElementById("categorias-container");
const container = document.getElementById("produtos-container");
const pesquisaInput = document.getElementById("pesquisa");

const modal = document.getElementById("modal");
const modalNome = document.getElementById("modal-nome");
const modalImg = document.getElementById("modal-img");
const modalPreco = document.getElementById("modal-preco");
const modalSub = document.getElementById("modal-descricao");
const qtdInput = document.getElementById("modal-quantidade");

let modalProduto = null;

const painelCarrinho = document.getElementById("painel-carrinho");
const botaoCarrinho = document.getElementById("carrinho");
const botaoFecharCarrinho = document.getElementById("carrinho-fechar");

// ----------------------------
// Atualiza visibilidade do ícone do carrinho
// ----------------------------
function atualizarIconeCarrinho() {
  if (modal.classList.contains("show") || painelCarrinho.classList.contains("aberto") || carrinho.length === 0) {
    botaoCarrinho.style.display = "none";
  } else {
    botaoCarrinho.style.display = "flex";
  }
}

// ----------------------------
// Carregar produtos
// ----------------------------
async function carregarProdutos() {
  try {
    const resposta = await fetch("produtos_refatorado.json");
    produtos = await resposta.json();
    categoriaAtiva = null;
    renderizarCategorias();
    renderizarProdutos();
    atualizarCarrinho();
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }
}

// ----------------------------
// Renderizar Categorias
// ----------------------------
function renderizarCategorias() {
  const categorias = [...new Set(produtos.map(p => p.categoria))].sort();
  categoriasContainer.innerHTML = "";

  const criarBtn = (texto, ativo, onClick) => {
    const btn = document.createElement("button");
    btn.className = "categoria-btn" + (ativo ? " ativo" : "");
    btn.textContent = texto;
    btn.onclick = onClick;
    return btn;
  };

  categoriasContainer.appendChild(
    criarBtn("Todos", categoriaAtiva === null, () => {
      categoriaAtiva = null;
      renderizarCategorias();
      renderizarProdutos();
    })
  );

  categoriasContainer.appendChild(
    criarBtn("Promoções", categoriaAtiva === "promoção", () => {
      categoriaAtiva = categoriaAtiva === "promoção" ? null : "promoção";
      renderizarCategorias();
      renderizarProdutos();
    })
  );

  categorias.forEach(cat => {
    categoriasContainer.appendChild(
      criarBtn(cat, cat === categoriaAtiva, () => {
        categoriaAtiva = categoriaAtiva === cat ? null : cat;
        renderizarCategorias();
        renderizarProdutos();
      })
    );
  });
}

// ----------------------------
// Renderizar Produtos
// ----------------------------
function renderizarProdutos() {
  const termo = pesquisaInput.value.toLowerCase();
  container.innerHTML = "";

  produtos
    .filter(p => {
      let correspondeCategoria = true;
      if (categoriaAtiva) {
        correspondeCategoria = categoriaAtiva === "promoção" ? p.promocao : p.categoria === categoriaAtiva;
      }
      return correspondeCategoria && p.nome.toLowerCase().includes(termo);
    })
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "produto-card";

      let precoTexto = "";
      if (p.precoPorKg) {
        precoTexto = `R$ ${p.precoPorKg.toFixed(2).replace('.', ',')} / Kg`;
      } else if (p.precoUnitario) {
        precoTexto = `R$ ${p.precoUnitario.toFixed(2).replace('.', ',')}`;
      } else {
        precoTexto = "Preço após pesagem";
      }

      card.innerHTML = `
        ${p.promocao ? '<div class="promocao-badge">Promoção!</div>' : ""}
        <img src="${p.imagem}" alt="${p.nome}" data-codigo="${p.codigo}">
        <div class="produto-nome" data-codigo="${p.codigo}" title="${p.nome}">${p.nome}</div>
        <div class="produto-subt">${precoTexto}</div>
        <button class="produto-card-btn" data-codigo="${p.codigo}">Colocar no carrinho</button>
      `;

      container.appendChild(card);
    });
}

// ----------------------------
// Modal
// ----------------------------
function abrirModal(produto) {
  modalProduto = produto;
  modalNome.textContent = produto.nome;
  modalImg.src = produto.imagem;

  modalSub.innerHTML = "";

  const addInfo = (label, value) => {
    if (value && value.trim() !== "") {
      modalSub.innerHTML += `<div><strong>${label}:</strong> ${value}</div>`;
    }
  };

  addInfo("Marca", produto.marca);
  addInfo("Peso Unidade", produto.pesoUn);
  addInfo("Peso Total", produto.pesoTotal);
  addInfo("Caixa com", produto.caixaCom);

  if (produto.descricao && produto.descricao.trim() !== "") {
    modalSub.innerHTML += `<div style="grid-column: span 2;">${produto.descricao}</div>`;
  }

  qtdInput.value = 1;
  atualizarPrecoModal(produto, 1);

  // Fecha painel do carrinho se estiver aberto
  painelCarrinho.classList.remove("aberto");

  modal.classList.add("show");
  atualizarIconeCarrinho();
}

function fecharModal() {
  modal.classList.remove("show");
  atualizarIconeCarrinho();
}

// ----------------------------
// Atualizar Preço Modal
// ----------------------------
function atualizarPrecoModal(produto, qtd) {
  if (produto.precoPorKg) {
    modalPreco.innerHTML = `
      <div class="modal-preco-container">
        <div class="linha-quantidade">
          <div class="modal-preco-item quantidade">Quantidade: ${qtd} ${qtd > 1 ? 'unidades' : 'unidade'}</div>
        </div>
        <div class="linha-preco">
          <div class="modal-preco-item preco-kg">Preço por Kg: R$ ${produto.precoPorKg.toFixed(2).replace('.', ',')}</div>
          <div class="modal-preco-item preco-final aviso">Preço final após pesagem</div>
        </div>
      </div>
    `;
  } else if (produto.precoUnitario) {
    let unidade = (produto.vendidoPor === "unidade" && qtd > 1) ? "unidades" : produto.vendidoPor;
    modalPreco.innerHTML = `
      <span class="modal-preco-info">${qtd} ${qtd > 1 ? unidade : produto.vendidoPor} por R$ ${(produto.precoUnitario * qtd).toFixed(2).replace('.', ',')}</span>
    `;
  } else {
    modalPreco.innerHTML = `<span class="modal-preco-aviso">Preço após pesagem</span>`;
  }
}

// ----------------------------
// Carrinho
// ----------------------------
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

  carrinho.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "carrinho-item";

    let precoInfo;
    if (item.precoPorKg) {
      precoInfo = `<span class="item-preco item-preco-pequeno">Preço após pesagem</span>`;
    } else {
      precoInfo = `<span class="item-preco">R$ ${(item.precoUnitario * item.qtd).toFixed(2).replace('.', ',')}</span>`;
      total += item.precoUnitario * item.qtd;
    }

    li.innerHTML = `
      <img class="carrinho-img" src="${item.imagem}" alt="${item.nome}">
      <div class="item-info">
        <span class="nome-produto" title="${item.nome}">${item.nome}</span>
        <div class="qtd-preco-carrinho">
          <span class="item-qtd">${item.qtd} ${item.vendidoPor === 'unidade' ? (item.qtd > 1 ? 'unidades' : 'unidade') : item.vendidoPor}</span>
          ${precoInfo}
        </div>
        <div class="item-controles">
          <button class="mais"><i class="fa fa-plus"></i></button>
          <button class="menos"><i class="fa fa-minus"></i></button>
          <button class="remover"><i class="fa fa-times"></i></button>
        </div>
      </div>
    `;

    li.querySelector(".mais").addEventListener("click", () => alterarQtd(i, 1));
    li.querySelector(".menos").addEventListener("click", () => alterarQtd(i, -1));
    li.querySelector(".remover").addEventListener("click", () => removerItem(i));

    lista.appendChild(li);
  });

  totalEl.textContent = total.toFixed(2).replace('.', ',');

  atualizarIconeCarrinho();
  botaoFinal.style.display = carrinho.length ? "flex" : "none";
}

// ----------------------------
// Funções do Carrinho
// ----------------------------
function alterarQtd(index, delta) {
  if (carrinho[index]) {
    carrinho[index].qtd += delta;
    if (carrinho[index].qtd < 1) {
      carrinho.splice(index, 1);
    }
    atualizarCarrinho();
  }
}

function removerItem(index) {
  if (carrinho[index]) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
  }
}

// ----------------------------
// Eventos
// ----------------------------
pesquisaInput.addEventListener("input", renderizarProdutos);

container.addEventListener("click", e => {
  const codigo = e.target.dataset.codigo;
  if (!codigo) return;

  const produto = produtos.find(p => p.codigo === codigo);

  if (e.target.classList.contains("produto-card-btn")) {
    adicionarCarrinho(produto);
  } else if (e.target.classList.contains("produto-nome") || e.target.tagName === "IMG") {
    abrirModal(produto);
  }
});

document.getElementById("modal-fechar").onclick = fecharModal;
document.getElementById("menos").onclick = () => {
  let qtd = Math.max(1, parseInt(qtdInput.value) - 1);
  qtdInput.value = qtd;
  atualizarPrecoModal(modalProduto, qtd);
};
document.getElementById("mais").onclick = () => {
  let qtd = parseInt(qtdInput.value) + 1;
  qtdInput.value = qtd;
  atualizarPrecoModal(modalProduto, qtd);
};
document.getElementById("modal-adicionar").onclick = () => {
  const qtd = parseInt(qtdInput.value) || 1;
  adicionarCarrinho(modalProduto, qtd);
  fecharModal();
};

botaoCarrinho.addEventListener("click", () => {
  painelCarrinho.classList.add("aberto");
  atualizarIconeCarrinho();
});
botaoFecharCarrinho.addEventListener("click", () => {
  painelCarrinho.classList.remove("aberto");
  atualizarIconeCarrinho();
});

// ----------------------------
// Toast
// ----------------------------
function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerHTML = `<i class="fas fa-shopping-cart"></i> ${msg}`;
  toast.className = "show";
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// ----------------------------
// Inicialização
// ----------------------------
carregarProdutos();
