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

/* ---------- DADOS PADRÃO (usados até o conteúdo do Firebase carregar) ---------- */
let categorias = [
  { label: 'Gravação a Laser' }, { label: 'Mouse Pad' }, { label: 'Mochila Saco Infantil' },
  { label: 'Bodies e Toalhinhas' }, { label: 'Camisetas' }, { label: 'Kit Festa na Mesa' },
  { label: 'Canecas Personalizadas' }, { label: 'Garrafas Personalizadas' }, { label: 'Lembrancinhas' },
  { label: 'Mini Calendários' }, { label: 'Cartões de Visita' }, { label: 'Panfletos' },
  { label: 'Placas Pix' }, { label: 'Tags' },
];

/* slugs usados só para gerar seeds de imagem placeholder variadas por categoria */
const CATEGORY_SLUGS = {
  'Gravação a Laser': 'laser', 'Mouse Pad': 'mousepad', 'Mochila Saco Infantil': 'mochila',
  'Bodies e Toalhinhas': 'body', 'Camisetas': 'camiseta', 'Kit Festa na Mesa': 'festa',
  'Canecas Personalizadas': 'caneca', 'Garrafas Personalizadas': 'garrafa', 'Lembrancinhas': 'lembranca',
  'Mini Calendários': 'calendario', 'Cartões de Visita': 'cartao', 'Panfletos': 'panfleto',
  'Placas Pix': 'pix', 'Tags': 'tag',
};
const PLACEHOLDER_PHOTOS_PER_CATEGORY = 12;

function buildPlaceholderGaleria(){
  const arr = [];
  Object.entries(CATEGORY_SLUGS).forEach(([categoria, slug]) => {
    for (let n = 1; n <= PLACEHOLDER_PHOTOS_PER_CATEGORY; n++){
      arr.push({ categoria, label: `${categoria} ${n}`, foto: `https://picsum.photos/seed/gal-${slug}${n}/900/900` });
    }
  });
  return arr;
}

let galeria = buildPlaceholderGaleria();

let produtos = [
  { nome:'Copo Térmico Gravado a Laser', texto:'Gravação precisa e resistente, ideal para uso diário ou presente.', foto:'https://picsum.photos/seed/prod-copo/500/380', categoria:'Gravação a Laser' },
  { nome:'Mouse Pad Personalizado', texto:'Traga sua marca ou arte favorita para o dia a dia.', foto:'https://picsum.photos/seed/prod-mousepad/500/380', categoria:'Mouse Pad' },
  { nome:'Mochila Saco Infantil', texto:'Bolsas divertidas e personalizadas para a criançada.', foto:'https://picsum.photos/seed/prod-mochila/500/380', categoria:'Mochila Saco Infantil' },
  { nome:'Bodies e Toalhinhas', texto:'Itens fofos e personalizados para o bebê.', foto:'https://picsum.photos/seed/prod-body/500/380', categoria:'Bodies e Toalhinhas' },
  { nome:'Camiseta Personalizada', texto:'Estampas exclusivas para eventos, times e uso pessoal.', foto:'https://picsum.photos/seed/prod-camiseta/500/380', categoria:'Camisetas' },
  { nome:'Kit Festa na Mesa', texto:'Conjunto completo para decorar a mesa de qualquer comemoração.', foto:'https://picsum.photos/seed/prod-kitfesta/500/380', categoria:'Kit Festa na Mesa' },
  { nome:'Caneca Personalizada', texto:'Estampe fotos, frases ou logotipo com acabamento premium.', foto:'https://picsum.photos/seed/prod-caneca/500/380', categoria:'Canecas Personalizadas' },
  { nome:'Garrafa Personalizada', texto:'Perfeita para brindes corporativos e presentes especiais.', foto:'https://picsum.photos/seed/prod-garrafa/500/380', categoria:'Garrafas Personalizadas' },
  { nome:'Lembrancinha Personalizada', texto:'Para casamentos, chás e aniversários com carinho no detalhe.', foto:'https://picsum.photos/seed/prod-lembranca/500/380', categoria:'Lembrancinhas' },
  { nome:'Mini Calendário Personalizado', texto:'Brindes de fim de ano personalizados com a sua marca.', foto:'https://picsum.photos/seed/prod-calendario/500/380', categoria:'Mini Calendários' },
  { nome:'Cartão de Visita', texto:'Design profissional que causa a primeira boa impressão.', foto:'https://picsum.photos/seed/prod-cartao/500/380', categoria:'Cartões de Visita' },
  { nome:'Panfleto Personalizado', texto:'Material impresso para divulgação com arte exclusiva.', foto:'https://picsum.photos/seed/prod-panfleto/500/380', categoria:'Panfletos' },
  { nome:'Placa Pix', texto:'Praticidade e identidade visual para o seu ponto de venda.', foto:'https://picsum.photos/seed/prod-pix/500/380', categoria:'Placas Pix' },
  { nome:'Tags Personalizadas', texto:'Etiquetas personalizadas para produtos e embalagens.', foto:'https://picsum.photos/seed/prod-tag/500/380', categoria:'Tags' },
];

let depoimentos = [
  { nome:'Mariana S.', texto:'A caneca personalizada ficou perfeita, superou minhas expectativas! Atendimento super rápido.' },
  { nome:'Rodrigo A.', texto:'Pedi garrafas para o aniversário da empresa e todo mundo elogiou o acabamento da gravação a laser.' },
];

/* ---------- RENDER: CATÁLOGO (Serviços + Galeria + Produtos unificados) ---------- */
const catalogGrid = document.getElementById('catalogGrid');

function representativeFor(catLabel){
  const prod = produtos.find(p => p.categoria === catLabel);
  if (prod) return { titulo: prod.nome, texto: prod.texto, foto: prod.foto };
  const gal = galeria.find(g => g.categoria === catLabel);
  if (gal) return { titulo: gal.label, texto: '', foto: gal.foto };
  return null;
}

function renderCatalog(){
  const cards = categorias
    .map(c => ({ cat: c.label, rep: representativeFor(c.label) }))
    .filter(x => x.rep);

  catalogGrid.innerHTML = cards.map(({ cat, rep }) => `
    <div class="catalog-card reveal is-visible" data-cat="${cat}">
      <div class="catalog-photo"><img loading="lazy" src="${rep.foto}" alt="${rep.titulo}"></div>
      <div class="catalog-body">
        <h3>${rep.titulo}</h3>
        <p>${rep.texto || `Confira nossos trabalhos de ${cat}.`}</p>
        <div class="catalog-card-actions">
          <button type="button" class="btn btn-primary btn-sm" data-fotos-cat="${cat}">Ver fotos</button>
        </div>
      </div>
    </div>
  `).join('');

  attachCatalogHandlers();
}

function attachCatalogHandlers(){
  catalogGrid.querySelectorAll('[data-fotos-cat]').forEach(btn => {
    btn.addEventListener('click', () => openCatalogExpand(btn.dataset.fotosCat));
  });
}

/* ---------- EXPANSÃO DA CATEGORIA: fotos reais + orçamento embutido ---------- */
const catalogExpand = document.getElementById('catalogExpand');
const catalogExpandTitle = document.getElementById('catalogExpandTitle');
const catalogExpandText = document.getElementById('catalogExpandText');
const catalogExpandGrid = document.getElementById('catalogExpandGrid');
const catalogExpandOrcamentoBtn = document.getElementById('catalogExpandOrcamentoBtn');
let currentExpandCat = null;

function openCatalogExpand(cat){
  currentExpandCat = cat;
  const imgs = catalogImages().filter(i => i.categoria === cat);
  catalogExpandTitle.textContent = cat;
  catalogExpandText.textContent = `Fotos reais de trabalhos em ${cat} — confira o acabamento antes de pedir seu orçamento.`;
  catalogExpandGrid.innerHTML = imgs.map(i => `<img loading="lazy" src="${i.foto}" alt="${i.label}">`).join('') || '<p>Em breve, novas fotos por aqui.</p>';
  catalogExpandGrid.querySelectorAll('img').forEach((img, idx) => {
    img.addEventListener('click', () => openLightbox(imgs, idx));
  });
  catalogExpand.classList.add('open');
}
function closeCatalogExpand(){ catalogExpand.classList.remove('open'); currentExpandCat = null; }
document.getElementById('catalogExpandClose').addEventListener('click', closeCatalogExpand);
catalogExpand.addEventListener('click', (e) => { if (e.target === catalogExpand) closeCatalogExpand(); });
catalogExpandOrcamentoBtn.addEventListener('click', () => {
  const cat = currentExpandCat;
  closeCatalogExpand();
  openQuoteModal(cat);
});

/* "ver todos os trabalhos": link secundário para o portfólio completo */
document.getElementById('catalogViewAllBtn').addEventListener('click', () => {
  document.getElementById('catalogGallery').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ---------- RENDER: GALERIA "VER MAIS" (produtos + fotos extras, com filtro por categoria) ---------- */
const galleryTabs = document.getElementById('galleryTabs');
const galleryGrid = document.getElementById('galleryGrid');
let currentGalleryFilter = 'Todos';

function catalogImages(){
  const prodImgs = produtos.map(p => ({ categoria: p.categoria || 'Geral', label: p.nome, foto: p.foto }));
  const galImgs = galeria.map(g => ({ categoria: g.categoria || 'Geral', label: g.label, foto: g.foto }));
  return [...prodImgs, ...galImgs];
}

function renderGalleryTabs(){
  const cats = ['Todos', ...Array.from(new Set(catalogImages().map(i => i.categoria)))];
  if (!cats.includes(currentGalleryFilter)) currentGalleryFilter = 'Todos';
  galleryTabs.innerHTML = cats.map(c => `<button class="tab-btn ${c === currentGalleryFilter ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');
}

function renderGalleryGrid(){
  const allImgs = catalogImages();
  galleryGrid.innerHTML = allImgs.map(i => `
    <div class="gallery-item ${(currentGalleryFilter !== 'Todos' && currentGalleryFilter !== i.categoria) ? 'hidden' : ''}" data-cat="${i.categoria}">
      <img loading="lazy" src="${i.foto}" alt="${i.label}">
    </div>
  `).join('');
  attachLightboxHandlers(allImgs);
}

function renderCatalogGallery(){
  renderGalleryTabs();
  renderGalleryGrid();
}

galleryTabs.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  currentGalleryFilter = btn.dataset.cat;
  renderCatalogGallery();
});

/* LIGHTBOX (com navegação para as fotos ao lado) */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
let lightboxImages = [];
let lightboxIndex = 0;

function updateLightboxImage(){
  const img = lightboxImages[lightboxIndex];
  if (!img) return;
  lightboxImg.src = img.foto;
  lightboxImg.alt = img.label;
}
function openLightbox(images, index){
  lightboxImages = images;
  lightboxIndex = index;
  updateLightboxImage();
  lightbox.classList.add('open');
}
function closeLightbox(){ lightbox.classList.remove('open'); }
function lightboxPrev(){ lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length; updateLightboxImage(); }
function lightboxNext(){ lightboxIndex = (lightboxIndex + 1) % lightboxImages.length; updateLightboxImage(); }

function attachLightboxHandlers(allImgs){
  const items = [...galleryGrid.querySelectorAll('.gallery-item')];
  const visibleImgs = allImgs.filter((_, i) => !items[i].classList.contains('hidden'));
  let visIdx = 0;
  items.forEach((item) => {
    if (item.classList.contains('hidden')) return;
    const idx = visIdx++;
    item.addEventListener('click', () => openLightbox(visibleImgs, idx));
  });
}
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', (e) => { e.stopPropagation(); lightboxPrev(); });
document.getElementById('lightboxNext').addEventListener('click', (e) => { e.stopPropagation(); lightboxNext(); });
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxPrev();
  if (e.key === 'ArrowRight') lightboxNext();
});

/* ---------- MODAL DE ORÇAMENTO ---------- */
const quoteModal = document.getElementById('quoteModal');
const quoteFormWrap = document.getElementById('quoteFormWrap');
const quoteForm = document.getElementById('quoteForm');
const quoteNome = document.getElementById('quoteNome');
const quoteTelefone = document.getElementById('quoteTelefone');
const quoteItemPicker = document.getElementById('quoteItemPicker');
const quoteObs = document.getElementById('quoteObs');
const quoteStatus = document.getElementById('quoteStatus');
const quoteSuccess = document.getElementById('quoteSuccess');

let quoteQuantities = {};

function renderQuoteItemPicker(){
  quoteItemPicker.innerHTML = produtos.map(p => {
    const qty = quoteQuantities[p.nome] || 0;
    return `
    <div class="quote-pick-row ${qty > 0 ? 'selected' : ''}" data-nome="${p.nome}">
      <div class="quote-pick-photo"><img src="${p.foto}" alt="${p.nome}" loading="lazy"></div>
      <span class="quote-pick-name">${p.nome}</span>
      <div class="quote-pick-qty">
        <button type="button" class="qty-btn" data-action="dec" data-nome="${p.nome}">−</button>
        <span class="qty-value">${qty}</span>
        <button type="button" class="qty-btn" data-action="inc" data-nome="${p.nome}">+</button>
      </div>
    </div>`;
  }).join('');
}

quoteItemPicker.addEventListener('click', (e) => {
  const btn = e.target.closest('.qty-btn');
  if (!btn) return;
  const nome = btn.dataset.nome;
  const current = quoteQuantities[nome] || 0;
  if (btn.dataset.action === 'inc'){
    quoteQuantities[nome] = current + 1;
  } else {
    const next = current - 1;
    if (next > 0) quoteQuantities[nome] = next;
    else delete quoteQuantities[nome];
  }
  renderQuoteItemPicker();
});

function openQuoteModal(cat){
  quoteQuantities = {};
  if (cat){
    const rep = representativeFor(cat);
    if (rep) quoteQuantities[rep.titulo] = 1;
  }
  renderQuoteItemPicker();
  quoteForm.reset();
  quoteStatus.textContent = '';
  quoteFormWrap.style.display = '';
  quoteSuccess.style.display = 'none';
  quoteModal.classList.add('open');
}
function closeQuoteModal(){ quoteModal.classList.remove('open'); }
document.getElementById('quoteModalClose').addEventListener('click', closeQuoteModal);
document.getElementById('quoteSuccessClose').addEventListener('click', closeQuoteModal);
quoteModal.addEventListener('click', (e) => { if (e.target === quoteModal) closeQuoteModal(); });

document.getElementById('quoteWhatsappBtn').addEventListener('click', (e) => {
  e.preventDefault();
  const itens = Object.entries(quoteQuantities).map(([nome, qtd]) => `${qtd}x ${nome}`).join(', ');
  let msg = 'Olá! Quero solicitar um orçamento.';
  if (itens) msg += ` Itens: ${itens}.`;
  if (quoteObs.value.trim()) msg += ` Observações: ${quoteObs.value.trim()}.`;
  window.open(`https://wa.me/5515998402182?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
});

quoteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const itens = Object.entries(quoteQuantities).map(([nome, quantidade]) => ({ nome, quantidade }));
  if (itens.length === 0){
    quoteStatus.textContent = 'Escolha ao menos um item ao pedido.';
    return;
  }
  if (typeof arcDb === 'undefined'){
    quoteStatus.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
    return;
  }
  const pedido = {
    nome: quoteNome.value.trim(),
    telefone: quoteTelefone.value.trim(),
    itens,
    observacoes: quoteObs.value.trim(),
    status: 'novo',
    criadoEm: Date.now(),
  };
  quoteStatus.textContent = 'Enviando...';
  arcDb.ref('orcamentos').push().set(pedido).then(() => {
    quoteFormWrap.style.display = 'none';
    quoteSuccess.style.display = '';
  }).catch((err) => {
    console.error('Erro ao enviar orçamento:', err);
    quoteStatus.textContent = 'Erro ao enviar. Tente novamente.';
  });
});

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

/* ---------- CONFIGURAÇÕES: esconder/mostrar seções ---------- */
function applySettings(settings){
  const s = settings || {};
  const sectionMap = {
    catalogo: document.getElementById('catalogo'),
    comoFunciona: document.querySelector('.how'),
    depoimentos: document.querySelector('.testimonials'),
    ctaFinal: document.querySelector('.final-cta'),
  };
  Object.entries(sectionMap).forEach(([key, el]) => {
    if (el) el.style.display = s[key] === false ? 'none' : '';
  });
  const portfolioVisible = s.portfolio === true;
  const catalogGalleryEl = document.getElementById('catalogGallery');
  const viewAllWrap = document.getElementById('catalogViewAllWrap');
  if (catalogGalleryEl) catalogGalleryEl.style.display = portfolioVisible ? '' : 'none';
  if (viewAllWrap) viewAllWrap.style.display = portfolioVisible ? '' : 'none';

  [1, 2, 3, 4].forEach((n) => {
    const url = s[`hero${n}`];
    const img = document.getElementById(`heroImg${n}`);
    if (img && url) img.src = url;
  });
}

/* ---------- RENDER INICIAL (dados padrão) ---------- */
renderCatalog();
renderCatalogGallery();
renderTestimonials();

/* ---------- CARREGA CONTEÚDO REAL DO FIREBASE (se configurado) ---------- */
if (typeof arcDb !== 'undefined'){
  arcDb.ref('siteConfig').once('value').then((snap) => {
    const data = snap.val() || {};
    let catalogDirty = false;
    if (data.categorias){ categorias = Object.values(data.categorias); catalogDirty = true; }
    if (data.galeria){ galeria = Object.values(data.galeria); catalogDirty = true; }
    if (data.produtos){ produtos = Object.values(data.produtos); catalogDirty = true; }
    if (catalogDirty){ renderCatalog(); renderCatalogGallery(); }
    if (data.depoimentos){
      depoimentos = Object.values(data.depoimentos);
      renderTestimonials();
    }
    applySettings(data.settings);
  }).catch((err) => console.error('Erro ao carregar conteúdo do Firebase:', err));
}
