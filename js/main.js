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
/* Estrutura unificada: cada categoria carrega nomeProduto, descricao, fotos e thumbKey */
let categorias = [
  { label: 'Gravação a Laser',        nomeProduto: 'Copo Térmico Gravado a Laser',     descricao: 'Gravação precisa e resistente, ideal para uso diário ou presente.',         thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-copo/500/380',      f1: 'https://picsum.photos/seed/gal-laser1/900/900',     f2: 'https://picsum.photos/seed/gal-laser2/900/900',     f3: 'https://picsum.photos/seed/gal-laser3/900/900',     f4: 'https://picsum.photos/seed/gal-laser4/900/900' } },
  { label: 'Mouse Pad',               nomeProduto: 'Mouse Pad Personalizado',            descricao: 'Traga sua marca ou arte favorita para o dia a dia.',                        thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-mousepad/500/380',   f1: 'https://picsum.photos/seed/gal-mousepad1/900/900',  f2: 'https://picsum.photos/seed/gal-mousepad2/900/900',  f3: 'https://picsum.photos/seed/gal-mousepad3/900/900',  f4: 'https://picsum.photos/seed/gal-mousepad4/900/900' } },
  { label: 'Mochila Saco Infantil',   nomeProduto: 'Mochila Saco Infantil',              descricao: 'Bolsas divertidas e personalizadas para a criançada.',                      thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-mochila/500/380',    f1: 'https://picsum.photos/seed/gal-mochila1/900/900',   f2: 'https://picsum.photos/seed/gal-mochila2/900/900',   f3: 'https://picsum.photos/seed/gal-mochila3/900/900',   f4: 'https://picsum.photos/seed/gal-mochila4/900/900' } },
  { label: 'Bodies e Toalhinhas',     nomeProduto: 'Bodies e Toalhinhas',                descricao: 'Itens fofos e personalizados para o bebê.',                                 thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-body/500/380',       f1: 'https://picsum.photos/seed/gal-body1/900/900',      f2: 'https://picsum.photos/seed/gal-body2/900/900',      f3: 'https://picsum.photos/seed/gal-body3/900/900',      f4: 'https://picsum.photos/seed/gal-body4/900/900' } },
  { label: 'Camisetas',               nomeProduto: 'Camiseta Personalizada',             descricao: 'Estampas exclusivas para eventos, times e uso pessoal.',                    thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-camiseta/500/380',  f1: 'https://picsum.photos/seed/gal-camiseta1/900/900',  f2: 'https://picsum.photos/seed/gal-camiseta2/900/900',  f3: 'https://picsum.photos/seed/gal-camiseta3/900/900',  f4: 'https://picsum.photos/seed/gal-camiseta4/900/900' } },
  { label: 'Kit Festa na Mesa',       nomeProduto: 'Kit Festa na Mesa',                  descricao: 'Conjunto completo para decorar a mesa de qualquer comemoração.',             thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-kitfesta/500/380', f1: 'https://picsum.photos/seed/gal-festa1/900/900',     f2: 'https://picsum.photos/seed/gal-festa2/900/900',     f3: 'https://picsum.photos/seed/gal-festa3/900/900',     f4: 'https://picsum.photos/seed/gal-festa4/900/900' } },
  { label: 'Canecas Personalizadas',  nomeProduto: 'Caneca Personalizada',               descricao: 'Estampe fotos, frases ou logotipo com acabamento premium.',                  thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-caneca/500/380',   f1: 'https://picsum.photos/seed/gal-caneca1/900/900',    f2: 'https://picsum.photos/seed/gal-caneca2/900/900',    f3: 'https://picsum.photos/seed/gal-caneca3/900/900',    f4: 'https://picsum.photos/seed/gal-caneca4/900/900' } },
  { label: 'Garrafas Personalizadas', nomeProduto: 'Garrafa Personalizada',              descricao: 'Perfeita para brindes corporativos e presentes especiais.',                  thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-garrafa/500/380',  f1: 'https://picsum.photos/seed/gal-garrafa1/900/900',   f2: 'https://picsum.photos/seed/gal-garrafa2/900/900',   f3: 'https://picsum.photos/seed/gal-garrafa3/900/900',   f4: 'https://picsum.photos/seed/gal-garrafa4/900/900' } },
  { label: 'Lembrancinhas',           nomeProduto: 'Lembrancinha Personalizada',         descricao: 'Para casamentos, chás e aniversários com carinho no detalhe.',               thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-lembranca/500/380', f1: 'https://picsum.photos/seed/gal-lembranca1/900/900', f2: 'https://picsum.photos/seed/gal-lembranca2/900/900', f3: 'https://picsum.photos/seed/gal-lembranca3/900/900', f4: 'https://picsum.photos/seed/gal-lembranca4/900/900' } },
  { label: 'Mini Calendários',        nomeProduto: 'Mini Calendário Personalizado',      descricao: 'Brindes de fim de ano personalizados com a sua marca.',                      thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-calendario/500/380',f1: 'https://picsum.photos/seed/gal-calendario1/900/900',f2: 'https://picsum.photos/seed/gal-calendario2/900/900',f3: 'https://picsum.photos/seed/gal-calendario3/900/900',f4: 'https://picsum.photos/seed/gal-calendario4/900/900' } },
  { label: 'Cartões de Visita',       nomeProduto: 'Cartão de Visita',                   descricao: 'Design profissional que causa a primeira boa impressão.',                    thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-cartao/500/380',   f1: 'https://picsum.photos/seed/gal-cartao1/900/900',    f2: 'https://picsum.photos/seed/gal-cartao2/900/900',    f3: 'https://picsum.photos/seed/gal-cartao3/900/900',    f4: 'https://picsum.photos/seed/gal-cartao4/900/900' } },
  { label: 'Panfletos',               nomeProduto: 'Panfleto Personalizado',             descricao: 'Material impresso para divulgação com arte exclusiva.',                      thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-panfleto/500/380', f1: 'https://picsum.photos/seed/gal-panfleto1/900/900',  f2: 'https://picsum.photos/seed/gal-panfleto2/900/900',  f3: 'https://picsum.photos/seed/gal-panfleto3/900/900',  f4: 'https://picsum.photos/seed/gal-panfleto4/900/900' } },
  { label: 'Placas Pix',              nomeProduto: 'Placa Pix',                          descricao: 'Praticidade e identidade visual para o seu ponto de venda.',                 thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-pix/500/380',       f1: 'https://picsum.photos/seed/gal-pix1/900/900',       f2: 'https://picsum.photos/seed/gal-pix2/900/900',       f3: 'https://picsum.photos/seed/gal-pix3/900/900',       f4: 'https://picsum.photos/seed/gal-pix4/900/900' } },
  { label: 'Tags',                    nomeProduto: 'Tags Personalizadas',                descricao: 'Etiquetas personalizadas para produtos e embalagens.',                       thumbKey: 'f0', fotos: { f0: 'https://picsum.photos/seed/prod-tag/500/380',       f1: 'https://picsum.photos/seed/gal-tag1/900/900',       f2: 'https://picsum.photos/seed/gal-tag2/900/900',       f3: 'https://picsum.photos/seed/gal-tag3/900/900',       f4: 'https://picsum.photos/seed/gal-tag4/900/900' } },
];

let depoimentos = [
  { nome:'Mariana S.', texto:'A caneca personalizada ficou perfeita, superou minhas expectativas! Atendimento super rápido.' },
  { nome:'Rodrigo A.', texto:'Pedi garrafas para o aniversário da empresa e todo mundo elogiou o acabamento da gravação a laser.' },
];

/* ---------- HELPERS DE CATEGORIA ---------- */
function catThumbUrl(cat){
  const fotos = cat.fotos || {};
  return (cat.thumbKey && fotos[cat.thumbKey]) ? fotos[cat.thumbKey] : Object.values(fotos)[0];
}

function representativeFor(catLabel){
  const cat = categorias.find(c => c.label === catLabel);
  if (!cat || !cat.fotos || Object.keys(cat.fotos).length === 0) return null;
  return { titulo: cat.nomeProduto || cat.label, texto: cat.descricao || '', foto: catThumbUrl(cat) };
}

/* Retorna todas as fotos de todas as categorias (ou de uma só) com { categoria, label, foto } */
function catalogImages(filterCat){
  return categorias.flatMap(cat => {
    if (filterCat && cat.label !== filterCat) return [];
    return Object.values(cat.fotos || {}).map(foto => ({ categoria: cat.label, label: cat.nomeProduto || cat.label, foto }));
  });
}

/* ---------- RENDER: CATÁLOGO ---------- */
const catalogGrid = document.getElementById('catalogGrid');

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

  catalogGrid.querySelectorAll('[data-fotos-cat]').forEach(btn => {
    btn.addEventListener('click', () => openCatalogExpand(btn.dataset.fotosCat));
  });
}

/* ---------- EXPANSÃO DA CATEGORIA ---------- */
const catalogExpand = document.getElementById('catalogExpand');
const catalogExpandTitle = document.getElementById('catalogExpandTitle');
const catalogExpandText = document.getElementById('catalogExpandText');
const catalogExpandGrid = document.getElementById('catalogExpandGrid');
const catalogExpandOrcamentoBtn = document.getElementById('catalogExpandOrcamentoBtn');
let currentExpandCat = null;

function openCatalogExpand(cat){
  currentExpandCat = cat;
  const catObj = categorias.find(c => c.label === cat);
  const imgs = catalogImages(cat);
  catalogExpandTitle.textContent = cat;
  catalogExpandText.textContent = catObj && catObj.descricao
    ? catObj.descricao
    : `Fotos reais de trabalhos em ${cat} — confira o acabamento antes de pedir seu orçamento.`;
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

/* ---------- RENDER: GALERIA "VER MAIS" ---------- */
const galleryTabs = document.getElementById('galleryTabs');
const galleryGrid = document.getElementById('galleryGrid');
let currentGalleryFilter = 'Todos';

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

/* LIGHTBOX */
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
  quoteItemPicker.innerHTML = categorias.map(cat => {
    const nome = cat.nomeProduto || cat.label;
    const thumb = catThumbUrl(cat);
    const qty = quoteQuantities[nome] || 0;
    return `
    <div class="quote-pick-row ${qty > 0 ? 'selected' : ''}" data-nome="${nome}">
      ${thumb ? `<div class="quote-pick-photo"><img src="${thumb}" alt="${nome}" loading="lazy"></div>` : ''}
      <span class="quote-pick-name">${nome}</span>
      <div class="quote-pick-qty">
        <button type="button" class="qty-btn" data-action="dec" data-nome="${nome}">−</button>
        <span class="qty-value">${qty}</span>
        <button type="button" class="qty-btn" data-action="inc" data-nome="${nome}">+</button>
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
    const catObj = categorias.find(c => c.label === cat);
    if (catObj) quoteQuantities[catObj.nomeProduto || catObj.label] = 1;
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
      <p>"${t.texto}"</p>
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

/* ---------- CARREGA CONTEÚDO REAL DO FIREBASE ---------- */
if (typeof arcDb !== 'undefined'){
  arcDb.ref('siteConfig').once('value').then((snap) => {
    const data = snap.val() || {};
    let catalogDirty = false;
    if (data.categorias){ categorias = Object.values(data.categorias); catalogDirty = true; }
    if (catalogDirty){ renderCatalog(); renderCatalogGallery(); }
    if (data.depoimentos){
      depoimentos = Object.values(data.depoimentos);
      renderTestimonials();
    }
    applySettings(data.settings);
  }).catch((err) => console.error('Erro ao carregar conteúdo do Firebase:', err));
}
