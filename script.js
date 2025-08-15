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
  if (window.innerWidth > 768) {
    nav.style.display = '';
    nav.classList.remove('active', 'closing');
  }
});


// Validação: placeholder vermelho
document.getElementById('form-dados').addEventListener('submit', function(e){
  e.preventDefault();

  const obrigatorios = [
    { id: 'nome',       msg: 'Campo obrigatório' },
    { id: 'pizzaria',   msg: 'Campo obrigatório' },
    { id: 'telefone',   msg: 'Campo obrigatório' },
  ];

  let ok = true;

  obrigatorios.forEach(({id, msg}) => {
    const el = document.getElementById(id);
    const valor = el.value.trim();
    el.classList.remove('error');

    if (!valor || (id === 'telefone' && !/^\d{11}$/.test(valor))) {
      ok = false;
      el.classList.add('error');
      el.placeholder = msg;
      el.value = '';
    }

    // Remove o erro quando digitar
    el.addEventListener('input', () => {
      el.classList.remove('error');
      if(id==='telefone') el.placeholder='Somente números';
      if(id==='nome') el.placeholder='Insira seu nome';
      if(id==='pizzaria') el.placeholder='Insira o nome da pizzaria';
    });
  });

  if (ok) alert('Formulário válido! Próxima etapa...');
});


// Slider
const container = document.querySelector('.marcas-container');
const images = Array.from(container.children);
const speed = 0.1; // px por frame

// Duplicar o conteúdo várias vezes para efeito infinito suave
for (let i = 0; i < 2; i++) {
  images.forEach(img => container.appendChild(img.cloneNode(true)));
}

let offset = 0;
const totalWidth = container.scrollWidth / 2; // largura real antes da duplicação

function animate() {
  offset += speed;
  if (offset >= totalWidth) offset = 0; // reseta sem pular
  container.style.transform = `translateX(${-offset}px)`;
  requestAnimationFrame(animate);
}

animate();


