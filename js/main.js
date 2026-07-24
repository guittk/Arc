document.getElementById('year').textContent = new Date().getFullYear();

/* MOBILE NAV */
const burger = document.getElementById('burgerBtn');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* SCROLL REVEAL */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); } });
}, { threshold: .15 });
revealEls.forEach(el => io.observe(el));

/* ---------- ICON SETS ---------- */
const serviceIconPaths = {
  laser: '<path d="M3 17l6-6M9 11l4-4 4 4-4 4-4-4z"/><path d="M19 5l2 2"/>',
  mug: '<path d="M4 4h11v9a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V4z"/><path d="M15 8h2a3 3 0 0 1 0 6h-2"/>',
  bottle: '<path d="M9 2h4v3l1.5 2v13a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V7L9 5z"/><path d="M8 11h6"/>',
  gift: '<rect x="3" y="9" width="16" height="11" rx="1"/><path d="M3 13h16"/><path d="M11 9v11"/><path d="M11 9C9 9 7 7.5 7 5.5A2.5 2.5 0 0 1 9.5 3C11 3 11 6 11 9z"/><path d="M11 9c2 0 4-1.5 4-3.5A2.5 2.5 0 0 0 12.5 3C11 3 11 6 11 9z"/>',
  calendar: '<rect x="3" y="5" width="16" height="15" rx="2"/><path d="M3 10h16"/><path d="M7 3v4"/><path d="M15 3v4"/>',
  card: '<rect x="2" y="6" width="18" height="12" rx="2"/><path d="M6 15h4"/><path d="M14 10h4"/><path d="M14 13h4"/>',
  flyer: '<path d="M5 3h11l3 3v15H5z"/><path d="M16 3v3h3"/><path d="M8 12h8"/><path d="M8 16h8"/>',
  pix: '<rect x="4" y="4" width="14" height="16" rx="2"/><path d="M11 8l3 3-3 3-3-3z"/>',
  tag: '<path d="M11 3l8 8-8 8-8-8V3z"/><circle cx="7" cy="7" r="1"/>',
  mousepad: '<rect x="3" y="6" width="16" height="12" rx="3"/><circle cx="14" cy="12" r="2"/>',
  bag: '<path d="M5 8h12l1 12H4z"/><path d="M8 8V6a3 3 0 0 1 6 0v2"/>',
  body: '<path d="M7 3h8l1 4-2 2v10H8V9L6 7z"/>',
  shirt: '<path d="M7 3l-4 3 2 3 2-1v11h8V8l2 1 2-3-4-3-2 2h-2z"/>',
  party: '<path d="M4 20l3-11 11 3-11 3z"/><path d="M15 4l1 3"/><path d="M19 8l3 1"/><path d="M13 3l2 1"/>'
};

const diffIconPaths = {
  flash: '<path d="M13 2 3 14h7l-1 8 11-14h-7z"/>',
  star: '<path d="M12 2l2.9 6.3 6.9.9-5 4.9 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.9 6.9-.9z"/>',
  shield: '<path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"/><path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/>',
  grid: '<path d="M4 4h16v16H4z"/><path d="M4 9h16"/><path d="M9 4v16"/>',
  list: '<path d="M3 7h18M3 12h18M3 17h18"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4 8.3 8.3 0 0 1-3.8-.9L3 21l1.9-5.8a8.3 8.3 0 0 1-.9-3.8A8.4 8.4 0 0 1 12.6 3a8.4 8.4 0 0 1 8.4 8.5z"/>',
  generic: '<circle cx="12" cy="12" r="9"/>'
};

function iconSVG(paths, name){
  return `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.generic || Object.values(paths)[0]}</svg>`;
}

/* ---------- DADOS PADRÃO (usados até o conteúdo do Firebase carregar) ---------- */
let services = [
  { icon: 'laser', titulo: 'Gravação a Laser', texto: 'Copos térmicos e garrafas com gravação precisa e duradoura.' },
  { icon: 'mug', titulo: 'Canecas Personalizadas', texto: 'Fotos, frases e logos com impressão de alta qualidade.' },
  { icon: 'bottle', titulo: 'Garrafas Personalizadas', texto: 'Ideal para presentes corporativos e datas especiais.' },
  { icon: 'gift', titulo: 'Lembrancinhas', texto: 'Para casamentos, chás e aniversários com carinho no detalhe.' },
  { icon: 'calendar', titulo: 'Mini Calendários', texto: 'Brindes de fim de ano personalizados com a sua marca.' },
  { icon: 'card', titulo: 'Cartões de Visita', texto: 'Design profissional que representa o seu negócio.' },
  { icon: 'flyer', titulo: 'Panfletos', texto: 'Material impresso para divulgação com arte exclusiva.' },
  { icon: 'pix', titulo: 'Placas Pix', texto: 'Placas personalizadas para facilitar o pagamento no seu ponto.' },
  { icon: 'tag', titulo: 'Tags', texto: 'Etiquetas personalizadas para produtos e embalagens.' },
  { icon: 'mousepad', titulo: 'Mouse Pad', texto: 'Personalize com fotos, logos ou artes exclusivas.' },
  { icon: 'bag', titulo: 'Mochila Saco Infantil', texto: 'Bolsas divertidas e personalizadas para a criançada.' },
  { icon: 'body', titulo: 'Bodies e Toalhinhas', texto: 'Itens fofos e personalizados para o bebê.' },
  { icon: 'shirt', titulo: 'Camisetas', texto: 'Estampas personalizadas para eventos, times e empresas.' },
  { icon: 'party', titulo: 'Kit Festa na Mesa', texto: 'Conjunto completo para decorar a mesa da sua festa.' },
];

let galeria = [
  { categoria:'Canecas', label:'Caneca "Melhor mãe"', foto:'https://picsum.photos/seed/gal-caneca1/900/900', tall:true },
  { categoria:'Garrafas', label:'Garrafa corporativa', foto:'https://picsum.photos/seed/gal-garrafa1/900/900' },
  { categoria:'Camisetas', label:'Camiseta de time', foto:'https://picsum.photos/seed/gal-camiseta1/900/900' },
  { categoria:'Papelaria', label:'Cartão de visita', foto:'https://picsum.photos/seed/gal-cartao1/900/900' },
  { categoria:'Festas', label:'Kit festa na mesa', foto:'https://picsum.photos/seed/gal-festa1/900/900', tall:true },
  { categoria:'Canecas', label:'Caneca casal', foto:'https://picsum.photos/seed/gal-caneca2/900/900' },
  { categoria:'Garrafas', label:'Squeeze gravado', foto:'https://picsum.photos/seed/gal-garrafa2/900/900' },
  { categoria:'Papelaria', label:'Mini calendário', foto:'https://picsum.photos/seed/gal-calendario1/900/900' },
  { categoria:'Bebês', label:'Body personalizado', foto:'https://picsum.photos/seed/gal-body1/900/900' },
  { categoria:'Camisetas', label:'Camiseta divertida', foto:'https://picsum.photos/seed/gal-camiseta2/900/900', tall:true },
  { categoria:'Festas', label:'Tags de lembrancinha', foto:'https://picsum.photos/seed/gal-tag1/900/900' },
  { categoria:'Bebês', label:'Toalhinha de boca', foto:'https://picsum.photos/seed/gal-toalha1/900/900' },
];

let produtos = [
  { nome:'Copo Térmico Gravado a Laser', texto:'Gravação precisa e resistente, ideal para uso diário ou presente.', foto:'https://picsum.photos/seed/prod-copo/500/380' },
  { nome:'Caneca Personalizada', texto:'Estampe fotos, frases ou logotipo com acabamento premium.', foto:'https://picsum.photos/seed/prod-caneca/500/380' },
  { nome:'Garrafa Personalizada', texto:'Perfeita para brindes corporativos e presentes especiais.', foto:'https://picsum.photos/seed/prod-garrafa/500/380' },
  { nome:'Camiseta Personalizada', texto:'Estampas exclusivas para eventos, times e uso pessoal.', foto:'https://picsum.photos/seed/prod-camiseta/500/380' },
  { nome:'Kit Festa na Mesa', texto:'Conjunto completo para decorar a mesa de qualquer comemoração.', foto:'https://picsum.photos/seed/prod-kitfesta/500/380' },
  { nome:'Cartão de Visita', texto:'Design profissional que causa a primeira boa impressão.', foto:'https://picsum.photos/seed/prod-cartao/500/380' },
  { nome:'Placa Pix', texto:'Praticidade e identidade visual para o seu ponto de venda.', foto:'https://picsum.photos/seed/prod-pix/500/380' },
  { nome:'Mouse Pad Personalizado', texto:'Traga sua marca ou arte favorita para o dia a dia.', foto:'https://picsum.photos/seed/prod-mousepad/500/380' },
];

let diferenciais = [
  { icon:'flash', titulo:'Atendimento rápido', texto:'Resposta ágil pelo WhatsApp, sem enrolação.' },
  { icon:'star', titulo:'Alta qualidade', texto:'Materiais e acabamento pensados para durar.' },
  { icon:'shield', titulo:'Personalização exclusiva', texto:'Cada peça é feita para o seu pedido, do seu jeito.' },
  { icon:'grid', titulo:'Excelente acabamento', texto:'Atenção aos detalhes em cada etapa da produção.' },
  { icon:'list', titulo:'Variedade de produtos', texto:'De canecas a papelaria — tudo em um só lugar.' },
  { icon:'chat', titulo:'Orçamento sem compromisso', texto:'Você pergunta, a gente responde — sem pressão.' },
];

let depoimentos = [
  { nome:'Mariana S.', texto:'A caneca personalizada ficou perfeita, superou minhas expectativas! Atendimento super rápido.' },
  { nome:'Rodrigo A.', texto:'Pedi garrafas para o aniversário da empresa e todo mundo elogiou o acabamento da gravação a laser.' },
];

/* ---------- RENDER: SERVIÇOS ---------- */
const servicesGrid = document.getElementById('servicesGrid');
function renderServices(){
  servicesGrid.innerHTML = services.map(s => `
    <div class="service-card">
      <div class="service-icon">${iconSVG(serviceIconPaths, s.icon)}</div>
      <h3>${s.titulo}</h3>
      <p>${s.texto}</p>
    </div>
  `).join('');
}

/* ---------- RENDER: GALERIA ---------- */
const galleryTabs = document.getElementById('galleryTabs');
const galleryGrid = document.getElementById('galleryGrid');
let currentGalleryFilter = 'Todos';

function renderGalleryTabs(){
  const categories = ['Todos', ...Array.from(new Set(galeria.map(g => g.categoria)))];
  if (!categories.includes(currentGalleryFilter)) currentGalleryFilter = 'Todos';
  galleryTabs.innerHTML = categories.map(c => `<button class="tab-btn ${c === currentGalleryFilter ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');
}

function renderGalleryGrid(){
  galleryGrid.innerHTML = galeria.map(g => `
    <div class="gallery-item ${g.tall ? 'tall' : ''} ${(currentGalleryFilter !== 'Todos' && currentGalleryFilter !== g.categoria) ? 'hidden' : ''}" data-cat="${g.categoria}" data-full="${g.foto}" data-label="${g.label}">
      <img loading="lazy" src="${g.foto}" alt="${g.label}">
    </div>
  `).join('');
  attachLightboxHandlers();
}

function renderGallery(){
  renderGalleryTabs();
  renderGalleryGrid();
}

galleryTabs.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  currentGalleryFilter = btn.dataset.cat;
  renderGallery();
});

/* LIGHTBOX */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
function attachLightboxHandlers(){
  galleryGrid.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      lightboxImg.src = item.dataset.full;
      lightboxImg.alt = item.dataset.label;
      lightbox.classList.add('open');
    });
  });
}
document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });

/* ---------- RENDER: PRODUTOS ---------- */
const productsGrid = document.getElementById('productsGrid');
function renderProducts(){
  productsGrid.innerHTML = produtos.map(p => {
    const msg = encodeURIComponent(`Olá! Quero solicitar um orçamento para: ${p.nome}`);
    return `
    <div class="product-card">
      <div class="product-photo"><img loading="lazy" src="${p.foto}" alt="${p.nome}"></div>
      <div class="product-body">
        <h3>${p.nome}</h3>
        <p>${p.texto}</p>
        <a class="btn btn-primary btn-sm" href="https://wa.me/5515998402182?text=${msg}" target="_blank" rel="noopener">Solicitar Orçamento</a>
      </div>
    </div>`;
  }).join('');
}

/* ---------- RENDER: DIFERENCIAIS ---------- */
const diffGrid = document.getElementById('diffGrid');
function renderDiffs(){
  diffGrid.innerHTML = diferenciais.map(d => `
    <div class="diff-item">
      ${iconSVG(diffIconPaths, d.icon)}
      <h3>${d.titulo}</h3>
      <p>${d.texto}</p>
    </div>
  `).join('');
}

/* ---------- RENDER: DEPOIMENTOS ---------- */
const testGrid = document.getElementById('testGrid');
function renderTestimonials(){
  testGrid.innerHTML = depoimentos.map(t => `
    <div class="test-card">
      <div class="stars">★★★★★</div>
      <p>“${t.texto}”</p>
      <div class="test-author"><div class="test-avatar">${t.nome[0]}</div>${t.nome}</div>
    </div>
  `).join('') + `<div class="test-card empty">Seu depoimento pode aparecer aqui — envie sua avaliação depois de receber seu pedido!</div>`;
}

/* ---------- RENDER INICIAL (dados padrão) ---------- */
renderServices();
renderGallery();
renderProducts();
renderDiffs();
renderTestimonials();

/* ---------- CARREGA CONTEÚDO REAL DO FIREBASE (se configurado) ---------- */
if (typeof arcDb !== 'undefined'){
  arcDb.ref('siteConfig').once('value').then((snap) => {
    const data = snap.val() || {};
    if (data.servicos){
      services = Object.values(data.servicos);
      renderServices();
    }
    if (data.galeria){
      galeria = Object.values(data.galeria);
      renderGallery();
    }
    if (data.produtos){
      produtos = Object.values(data.produtos);
      renderProducts();
    }
    if (data.diferenciais){
      diferenciais = Object.values(data.diferenciais);
      renderDiffs();
    }
    if (data.depoimentos){
      depoimentos = Object.values(data.depoimentos);
      renderTestimonials();
    }
  }).catch((err) => console.error('Erro ao carregar conteúdo do Firebase:', err));
}
