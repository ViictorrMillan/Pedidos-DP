const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('header nav');

hamburger.addEventListener('click', () => {
  if (nav.classList.contains('active')) {
    nav.classList.add('closing');
    nav.classList.remove('active');

    nav.addEventListener('animationend', function handler() {
      nav.classList.remove('closing');
      nav.style.display = 'none';
      nav.removeEventListener('animationend', handler);
    });
  } else {
    nav.style.display = 'flex';
    nav.classList.add('active');
  }
});

// Reseta o menu ao redimensionar a tela
window.addEventListener('resize', () => {
  if (window.innerWidth > 850) {
    nav.style.display = '';
    nav.classList.remove('active', 'closing');
  }
});


// Validação: placeholder vermelho + avançar para compras
document.getElementById('form-dados').addEventListener('submit', function(e){
  e.preventDefault();

  const obrigatorios = [
    { id: 'nome',       msg: 'Campo obrigatório' },
    { id: 'pizzaria',   msg: 'Campo obrigatório' },
    { id: 'telefone',   msg: 'Campo obrigatório' },
    { id: 'pagamento',  msg: 'Campo obrigatório' }
  ];

  let ok = true;

  obrigatorios.forEach(({id, msg}) => {
    const el = document.getElementById(id);
    const valor = el.value.trim();
    el.classList.remove('error');

    if (!valor || (id === 'telefone' && !/^\d{8,11}$/.test(valor))) {
      ok = false;
      el.classList.add('error');
      el.placeholder = msg;
      el.value = '';
    }
    el.addEventListener('input', () => {
      el.classList.remove('error');
    });
  });

  if(ok){
    // Esconder form e mostrar compras
    document.querySelector('.dados-pessoais').style.display = 'none';
    document.getElementById('compras-container').style.display = 'block';
    carregarProdutos(); // garante que produtos/categorias carreguem
  }
});


// slide
const marcasContainer = document.querySelector('.marcas-container');
const images = Array.from(marcasContainer.children);
const speed = 0.2; // ajuste conforme quiser

const repeatCount = 3; // repete 3 vezes
for (let i = 0; i < repeatCount; i++) {
  images.forEach(img => marcasContainer.appendChild(img.cloneNode(true)));
}

let offset = 0;
const originalWidth = marcasContainer.scrollWidth / repeatCount;

function animate() {
  offset += speed;
  if (offset >= originalWidth) offset = offset % originalWidth; // reset contínuo
  marcasContainer.style.transform = `translateX(${-offset}px)`;
  requestAnimationFrame(animate);
}

animate();

// Função para permitir somente números
function permitirSomenteNumeros(input) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, ""); // remove tudo que não for número
  });
}

// Campos numéricos
["telefone", "cep", "numero"].forEach(id => {
  const campo = document.getElementById(id);
  if (campo) permitirSomenteNumeros(campo);
});

