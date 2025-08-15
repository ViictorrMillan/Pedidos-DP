// Menu mobile
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('main-nav');
if (hamburger) {
  hamburger.addEventListener('click', () => nav.classList.toggle('active'));
}

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
