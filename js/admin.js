/* ---------- AUTH ---------- */
const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loginError.style.display = 'none';
  loginBtn.disabled = true;
  loginBtn.textContent = 'Entrando...';

  arcAuth.signInWithEmailAndPassword(loginForm.email.value.trim(), loginForm.password.value)
    .catch(() => {
      loginError.textContent = 'E-mail ou senha inválidos.';
      loginError.style.display = 'block';
    })
    .finally(() => {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Entrar';
    });
});

logoutBtn.addEventListener('click', () => arcAuth.signOut());

arcAuth.onAuthStateChanged((user) => {
  if (user){
    loginSection.style.display = 'none';
    adminSection.style.display = '';
    logoutBtn.style.display = '';
    loginForm.reset();
    startListening();
  } else {
    loginSection.style.display = '';
    adminSection.style.display = 'none';
    logoutBtn.style.display = 'none';
    stopListening();
  }
});

/* ---------- CONFIGURAÇÕES: esconder/mostrar seções do site ---------- */
const SETTINGS_DEFAULTS = { catalogo: true, portfolio: false, comoFunciona: true, depoimentos: true, ctaFinal: true };
const settingCheckboxes = {
  catalogo: document.getElementById('settingCatalogo'),
  portfolio: document.getElementById('settingPortfolio'),
  comoFunciona: document.getElementById('settingComoFunciona'),
  depoimentos: document.getElementById('settingDepoimentos'),
  ctaFinal: document.getElementById('settingCtaFinal'),
};

function renderSettings(settings){
  const merged = { ...SETTINGS_DEFAULTS, ...(settings || {}) };
  Object.entries(settingCheckboxes).forEach(([key, el]) => { el.checked = merged[key] !== false; });
  [1, 2, 3, 4].forEach((n) => {
    const preview = document.getElementById(`heroPhoto${n}Preview`);
    const url = merged[`hero${n}`];
    preview.innerHTML = url ? `<div class="form-thumb"><img src="${url}"></div>` : '<div class="form-thumb form-thumb-empty">Padrão</div>';
    document.getElementById(`heroPhoto${n}Remove`).style.display = url ? '' : 'none';
  });
}

Object.entries(settingCheckboxes).forEach(([key, el]) => {
  el.addEventListener('change', () => {
    arcDb.ref(`siteConfig/settings/${key}`).set(el.checked);
  });
});

[1, 2, 3, 4].forEach((n) => {
  document.getElementById(`heroPhoto${n}`).addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await resizeImage(file, 900);
    document.getElementById(`heroPhoto${n}Preview`).innerHTML = `<div class="form-thumb"><img src="${dataUrl}"></div>`;
    document.getElementById(`heroPhoto${n}Remove`).style.display = '';
    arcDb.ref(`siteConfig/settings/hero${n}`).set(dataUrl);
  });
  document.getElementById(`heroPhoto${n}Remove`).addEventListener('click', () => {
    openConfirmModal(`Remover a foto ${n} do carrossel do Hero? O site volta a mostrar a imagem padrão.`, () => {
      arcDb.ref(`siteConfig/settings/hero${n}`).remove();
      document.getElementById(`heroPhoto${n}`).value = '';
    }, { title: 'Remover foto', confirmLabel: 'Remover' });
  });
});

/* ---------- HELPERS ---------- */
function resizeImage(file, maxSize){
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- MODAL DE CONFIRMAÇÃO ---------- */
const confirmModalOverlay = document.getElementById('confirmModalOverlay');
const confirmModalTitle = document.getElementById('confirmModalTitle');
const confirmModalMessage = document.getElementById('confirmModalMessage');
const confirmModalOk = document.getElementById('confirmModalOk');
const confirmModalCancel = document.getElementById('confirmModalCancel');
const confirmModalClose = document.getElementById('confirmModalClose');
let confirmCallback = null;

function openConfirmModal(message, onConfirm, opts){
  confirmModalTitle.textContent = (opts && opts.title) || 'Confirmar exclusão';
  confirmModalOk.textContent = (opts && opts.confirmLabel) || 'Excluir';
  confirmModalMessage.textContent = message;
  confirmCallback = onConfirm;
  confirmModalOverlay.classList.add('open');
}
function closeConfirmModal(){
  confirmModalOverlay.classList.remove('open');
  confirmCallback = null;
}
confirmModalOk.addEventListener('click', () => { const cb = confirmCallback; closeConfirmModal(); if (cb) cb(); });
confirmModalCancel.addEventListener('click', closeConfirmModal);
confirmModalClose.addEventListener('click', closeConfirmModal);
confirmModalOverlay.addEventListener('click', (e) => { if (e.target === confirmModalOverlay) closeConfirmModal(); });

/* ---------- CATEGORIAS ---------- */
let categoriasCache = [];
const categoriasListEl = document.getElementById('categoriasList');
const categoriasCountEl = document.getElementById('categoriasCount');

function refreshCategoriaSelect(selected){
  const select = document.getElementById('itemCategoria');
  const current = selected !== undefined ? selected : select.value;
  select.innerHTML = categoriasCache.map(c => `<option value="${c.label}">${c.label}</option>`).join('');
  if (current && ![...select.options].some(o => o.value === current)){
    const opt = document.createElement('option');
    opt.value = current;
    opt.textContent = current + ' (categoria removida)';
    select.appendChild(opt);
  }
  if (current) select.value = current;
}

function renderCategorias(list){
  categoriasCache = list;
  if (categoriasCountEl) categoriasCountEl.textContent = `(${list.length})`;
  categoriasListEl.innerHTML = list.map(c => `
    <div class="config-item">
      <div class="config-item-body"><strong>${c.label}</strong></div>
      <div class="config-item-actions">
        <button data-action="edit" data-id="${c.id}">Editar</button>
        <button data-action="delete" class="danger" data-id="${c.id}">Excluir</button>
      </div>
    </div>`).join('') || '<p class="config-empty">Nenhuma categoria cadastrada.</p>';
  refreshCategoriaSelect();
}

categoriasListEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const cat = categoriasCache.find(c => c.id === btn.dataset.id);
  if (!cat) return;
  if (btn.dataset.action === 'delete'){
    openConfirmModal(`Excluir a categoria "${cat.label}"? Trabalhos já cadastrados nela continuam salvos, mas ela some do catálogo e dos filtros.`, () => {
      arcDb.ref(`siteConfig/categorias/${cat.id}`).remove();
    });
  } else if (btn.dataset.action === 'edit'){
    openCategoriaModal(cat);
  }
});

/* MODAL: criar/editar categoria */
const categoriaModalOverlay = document.getElementById('categoriaModalOverlay');
const categoriaModalTitle = document.getElementById('categoriaModalTitle');
const categoriaModalClose = document.getElementById('categoriaModalClose');
const categoriaModalCancel = document.getElementById('categoriaModalCancel');
const categoriaForm = document.getElementById('categoriaForm');
const categoriaEditId = document.getElementById('categoriaEditId');
const categoriaLabelInput = document.getElementById('categoriaLabel');
const categoriaStatus = document.getElementById('categoriaStatus');

function openCategoriaModal(existing){
  categoriaForm.reset();
  categoriaEditId.value = existing ? existing.id : '';
  categoriaLabelInput.value = existing ? existing.label : '';
  categoriaStatus.textContent = '';
  categoriaModalTitle.textContent = existing ? 'Editar categoria' : 'Nova categoria';
  categoriaModalOverlay.classList.add('open');
}
function closeCategoriaModal(){ categoriaModalOverlay.classList.remove('open'); }
categoriaModalClose.addEventListener('click', closeCategoriaModal);
categoriaModalCancel.addEventListener('click', closeCategoriaModal);
categoriaModalOverlay.addEventListener('click', (e) => { if (e.target === categoriaModalOverlay) closeCategoriaModal(); });
document.getElementById('addCategoriaBtn').addEventListener('click', () => openCategoriaModal());

categoriaForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const label = categoriaLabelInput.value.trim();
  if (!label) return;
  const id = categoriaEditId.value;
  const ref = id ? arcDb.ref(`siteConfig/categorias/${id}`) : arcDb.ref('siteConfig/categorias').push();
  ref.set({ label }).then(() => closeCategoriaModal()).catch((err) => {
    categoriaStatus.textContent = 'Erro ao salvar. Tente novamente.';
    console.error(err);
  });
});

/* ---------- MODAL DE FORMULÁRIO (compartilhado entre todos os tipos de conteúdo) ---------- */
const formModalOverlay = document.getElementById('formModalOverlay');
const formModalTitle = document.getElementById('formModalTitle');
const formModalClose = document.getElementById('formModalClose');
const formModalCancel = document.getElementById('formModalCancel');
const itemForm = document.getElementById('itemForm');
const itemEditId = document.getElementById('itemEditId');
const itemContextInput = document.getElementById('itemContext');

const itemTituloLabel = document.getElementById('itemTituloLabel');
const itemTitulo = document.getElementById('itemTitulo');
const campoTexto = document.getElementById('campoTexto');
const itemTextoLabel = document.getElementById('itemTextoLabel');
const itemTexto = document.getElementById('itemTexto');
const campoCategoria = document.getElementById('campoCategoria');
const campoFoto = document.getElementById('campoFoto');
const itemFotoInput = document.getElementById('itemFoto');
const itemFotoPreview = document.getElementById('itemFotoPreview');
const itemStatus = document.getElementById('itemStatus');

let pendingFoto = null;

itemFotoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  pendingFoto = await resizeImage(file, 900);
  itemFotoPreview.innerHTML = `<div class="form-thumb"><img src="${pendingFoto}"></div>`;
});

const CONTEXT_TITLES = {
  galeria: 'foto extra', produto: 'produto', depoimento: 'depoimento',
};
const CONTEXT_COLLECTION = {
  galeria: 'galeria', produto: 'produtos', depoimento: 'depoimentos',
};
const CONTEXT_LABELS = {
  galeria: 'Nome do trabalho', produto: 'Nome do produto', depoimento: 'Nome do cliente',
};

function openFormModal(context, existing){
  itemForm.reset();
  itemEditId.value = existing ? existing.id : '';
  itemContextInput.value = context;
  pendingFoto = existing && existing.foto ? existing.foto : null;
  itemFotoPreview.innerHTML = pendingFoto ? `<div class="form-thumb"><img src="${pendingFoto}"></div>` : '';
  itemStatus.textContent = '';

  const hasTexto = context !== 'galeria';
  const hasCategoria = context === 'galeria' || context === 'produto';
  const hasFoto = context === 'galeria' || context === 'produto';

  campoTexto.style.display = hasTexto ? '' : 'none';
  campoCategoria.style.display = hasCategoria ? '' : 'none';
  campoFoto.style.display = hasFoto ? '' : 'none';

  itemTituloLabel.textContent = CONTEXT_LABELS[context];
  itemTextoLabel.textContent = context === 'depoimento' ? 'Depoimento' : 'Descrição';

  formModalTitle.textContent = (existing ? 'Editar ' : 'Novo ') + CONTEXT_TITLES[context];
  if (hasCategoria) refreshCategoriaSelect(existing ? existing.categoria : '');

  if (existing){
    itemTitulo.value = existing.titulo || existing.nome || existing.label || '';
    if (hasTexto) itemTexto.value = existing.texto || '';
  }

  formModalOverlay.classList.add('open');
}
function closeFormModal(){ formModalOverlay.classList.remove('open'); }
formModalClose.addEventListener('click', closeFormModal);
formModalCancel.addEventListener('click', closeFormModal);
formModalOverlay.addEventListener('click', (e) => { if (e.target === formModalOverlay) closeFormModal(); });

document.getElementById('addGaleriaBtn').addEventListener('click', () => openFormModal('galeria'));
document.getElementById('addProdutoBtn').addEventListener('click', () => openFormModal('produto'));
document.getElementById('addDepoimentoBtn').addEventListener('click', () => openFormModal('depoimento'));

itemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const context = itemContextInput.value;
  const nome = itemTitulo.value.trim();
  if (!nome) return;

  let item = null;
  if (context === 'galeria'){
    if (!pendingFoto){ itemStatus.textContent = 'Envie uma foto.'; return; }
    item = { categoria: document.getElementById('itemCategoria').value, label: nome, foto: pendingFoto };
  } else if (context === 'produto'){
    if (!pendingFoto){ itemStatus.textContent = 'Envie uma foto.'; return; }
    const texto = itemTexto.value.trim();
    if (!texto){ itemStatus.textContent = 'Preencha a descrição.'; return; }
    item = { nome, texto, foto: pendingFoto, categoria: document.getElementById('itemCategoria').value };
  } else if (context === 'depoimento'){
    const texto = itemTexto.value.trim();
    if (!texto){ itemStatus.textContent = 'Preencha o depoimento.'; return; }
    item = { nome, texto };
  }
  if (!item) return;

  const collection = CONTEXT_COLLECTION[context];
  const id = itemEditId.value;
  const ref = id ? arcDb.ref(`siteConfig/${collection}/${id}`) : arcDb.ref(`siteConfig/${collection}`).push();
  ref.set(item).then(() => closeFormModal()).catch((err) => {
    itemStatus.textContent = 'Erro ao salvar. Tente com uma foto menor.';
    console.error(err);
  });
});

/* ---------- LISTAS ---------- */
function listItemHtml(item){
  const thumb = item.foto ? `<img class="config-item-thumb" src="${item.foto}">` : '';
  const title = item.titulo || item.nome || item.label;
  const sub = item.texto || item.categoria || '';
  return `
    <div class="config-item">
      ${thumb}
      <div class="config-item-body"><strong>${title}</strong>${sub ? `<span>${sub}</span>` : ''}</div>
      <div class="config-item-actions">
        <button data-action="edit" data-id="${item.id}">Editar</button>
        <button data-action="delete" class="danger" data-id="${item.id}">Excluir</button>
      </div>
    </div>`;
}

let dataCache = { galeria: [], produtos: [], depoimentos: [] };
let refs = [];

function renderCollection(key, listEl, countEl, emptyMsg){
  const list = dataCache[key];
  if (countEl) countEl.textContent = `(${list.length})`;
  listEl.innerHTML = list.map(listItemHtml).join('') || `<p class="config-empty">${emptyMsg}</p>`;
}

function handleListClick(context){
  return (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const collection = CONTEXT_COLLECTION[context];
    const item = dataCache[collection].find(i => i.id === btn.dataset.id);
    if (!item) return;
    if (btn.dataset.action === 'delete'){
      const title = item.titulo || item.nome || item.label;
      openConfirmModal(`Excluir "${title}"? Essa ação não pode ser desfeita.`, () => arcDb.ref(`siteConfig/${collection}/${item.id}`).remove());
    } else if (btn.dataset.action === 'edit'){
      openFormModal(context, item);
    }
  };
}

document.getElementById('galeriaList').addEventListener('click', handleListClick('galeria'));
document.getElementById('produtosList').addEventListener('click', handleListClick('produto'));
document.getElementById('depoimentosList').addEventListener('click', handleListClick('depoimento'));

/* ---------- SEEDS (mesmos dados padrão do site, só na primeira vez) ---------- */
/* slugs usados só para gerar seeds de imagem placeholder variadas por categoria (espelha js/main.js) */
const CATEGORY_SLUGS = {
  'Gravação a Laser': 'laser', 'Mouse Pad': 'mousepad', 'Mochila Saco Infantil': 'mochila',
  'Bodies e Toalhinhas': 'body', 'Camisetas': 'camiseta', 'Kit Festa na Mesa': 'festa',
  'Canecas Personalizadas': 'caneca', 'Garrafas Personalizadas': 'garrafa', 'Lembrancinhas': 'lembranca',
  'Mini Calendários': 'calendario', 'Cartões de Visita': 'cartao', 'Panfletos': 'panfleto',
  'Placas Pix': 'pix', 'Tags': 'tag',
};
const PLACEHOLDER_PHOTOS_PER_CATEGORY = 12;

function buildSeedGaleria(){
  const seed = {};
  let i = 1;
  Object.entries(CATEGORY_SLUGS).forEach(([categoria, slug]) => {
    for (let n = 1; n <= PLACEHOLDER_PHOTOS_PER_CATEGORY; n++){
      seed[`g${String(i).padStart(3, '0')}`] = { categoria, label: `${categoria} ${n}`, foto: `https://picsum.photos/seed/gal-${slug}${n}/900/900` };
      i++;
    }
  });
  return seed;
}
const SEED_GALERIA = buildSeedGaleria();
const SEED_PRODUTOS = {
  p01: { nome: 'Copo Térmico Gravado a Laser', texto: 'Gravação precisa e resistente, ideal para uso diário ou presente.', foto: 'https://picsum.photos/seed/prod-copo/500/380', categoria: 'Gravação a Laser' },
  p02: { nome: 'Mouse Pad Personalizado', texto: 'Traga sua marca ou arte favorita para o dia a dia.', foto: 'https://picsum.photos/seed/prod-mousepad/500/380', categoria: 'Mouse Pad' },
  p03: { nome: 'Mochila Saco Infantil', texto: 'Bolsas divertidas e personalizadas para a criançada.', foto: 'https://picsum.photos/seed/prod-mochila/500/380', categoria: 'Mochila Saco Infantil' },
  p04: { nome: 'Bodies e Toalhinhas', texto: 'Itens fofos e personalizados para o bebê.', foto: 'https://picsum.photos/seed/prod-body/500/380', categoria: 'Bodies e Toalhinhas' },
  p05: { nome: 'Camiseta Personalizada', texto: 'Estampas exclusivas para eventos, times e uso pessoal.', foto: 'https://picsum.photos/seed/prod-camiseta/500/380', categoria: 'Camisetas' },
  p06: { nome: 'Kit Festa na Mesa', texto: 'Conjunto completo para decorar a mesa de qualquer comemoração.', foto: 'https://picsum.photos/seed/prod-kitfesta/500/380', categoria: 'Kit Festa na Mesa' },
  p07: { nome: 'Caneca Personalizada', texto: 'Estampe fotos, frases ou logotipo com acabamento premium.', foto: 'https://picsum.photos/seed/prod-caneca/500/380', categoria: 'Canecas Personalizadas' },
  p08: { nome: 'Garrafa Personalizada', texto: 'Perfeita para brindes corporativos e presentes especiais.', foto: 'https://picsum.photos/seed/prod-garrafa/500/380', categoria: 'Garrafas Personalizadas' },
  p09: { nome: 'Lembrancinha Personalizada', texto: 'Para casamentos, chás e aniversários com carinho no detalhe.', foto: 'https://picsum.photos/seed/prod-lembranca/500/380', categoria: 'Lembrancinhas' },
  p10: { nome: 'Mini Calendário Personalizado', texto: 'Brindes de fim de ano personalizados com a sua marca.', foto: 'https://picsum.photos/seed/prod-calendario/500/380', categoria: 'Mini Calendários' },
  p11: { nome: 'Cartão de Visita', texto: 'Design profissional que causa a primeira boa impressão.', foto: 'https://picsum.photos/seed/prod-cartao/500/380', categoria: 'Cartões de Visita' },
  p12: { nome: 'Panfleto Personalizado', texto: 'Material impresso para divulgação com arte exclusiva.', foto: 'https://picsum.photos/seed/prod-panfleto/500/380', categoria: 'Panfletos' },
  p13: { nome: 'Placa Pix', texto: 'Praticidade e identidade visual para o seu ponto de venda.', foto: 'https://picsum.photos/seed/prod-pix/500/380', categoria: 'Placas Pix' },
  p14: { nome: 'Tags Personalizadas', texto: 'Etiquetas personalizadas para produtos e embalagens.', foto: 'https://picsum.photos/seed/prod-tag/500/380', categoria: 'Tags' },
};
const SEED_DEPOIMENTOS = {
  t1: { nome: 'Mariana S.', texto: 'A caneca personalizada ficou perfeita, superou minhas expectativas! Atendimento super rápido.' },
  t2: { nome: 'Rodrigo A.', texto: 'Pedi garrafas para o aniversário da empresa e todo mundo elogiou o acabamento da gravação a laser.' },
};
const SEED_CATEGORIAS = {
  cat01: { label: 'Gravação a Laser' },
  cat02: { label: 'Mouse Pad' },
  cat03: { label: 'Mochila Saco Infantil' },
  cat04: { label: 'Bodies e Toalhinhas' },
  cat05: { label: 'Camisetas' },
  cat06: { label: 'Kit Festa na Mesa' },
  cat07: { label: 'Canecas Personalizadas' },
  cat08: { label: 'Garrafas Personalizadas' },
  cat09: { label: 'Lembrancinhas' },
  cat10: { label: 'Mini Calendários' },
  cat11: { label: 'Cartões de Visita' },
  cat12: { label: 'Panfletos' },
  cat13: { label: 'Placas Pix' },
  cat14: { label: 'Tags' },
};

function seedIfEmpty(path, seed){
  arcDb.ref(path).once('value').then((snap) => {
    if (snap.val() === null) arcDb.ref(path).set(seed);
  });
}

/* ---------- PEDIDOS DE ORÇAMENTO ---------- */
const STATUS_LABELS = { novo: 'Novo', andamento: 'Em andamento', concluido: 'Concluído' };
const STATUS_NEXT = { novo: 'andamento', andamento: 'concluido', concluido: 'novo' };

function orcamentoItemHtml(orc){
  const itens = (orc.itens || []).map(i => `${i.quantidade}x ${i.nome}`).join(', ');
  const data = orc.criadoEm ? new Date(orc.criadoEm).toLocaleString('pt-BR') : '';
  return `
    <div class="config-item orcamento-item">
      <div class="config-item-body">
        <strong>${orc.nome || 'Sem nome'} <span class="orcamento-status orcamento-status-${orc.status || 'novo'}">${STATUS_LABELS[orc.status] || 'Novo'}</span></strong>
        <span>${itens || 'Sem itens'}</span>
        <span>Tel: ${orc.telefone || '-'}${data ? ' · ' + data : ''}</span>
        ${orc.observacoes ? `<span>Obs: ${orc.observacoes}</span>` : ''}
      </div>
      <div class="config-item-actions">
        <button data-action="status" data-id="${orc.id}">Avançar status</button>
        <button data-action="delete" class="danger" data-id="${orc.id}">Excluir</button>
      </div>
    </div>`;
}

let orcamentosCache = [];
const orcamentosListEl = document.getElementById('orcamentosList');
const orcamentosCountEl = document.getElementById('orcamentosCount');

function renderOrcamentos(list){
  orcamentosCache = list.sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0));
  orcamentosCountEl.textContent = `(${orcamentosCache.length})`;
  orcamentosListEl.innerHTML = orcamentosCache.map(orcamentoItemHtml).join('') || '<p class="config-empty">Nenhum pedido de orçamento recebido ainda.</p>';
}

orcamentosListEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const orc = orcamentosCache.find(o => o.id === btn.dataset.id);
  if (!orc) return;
  if (btn.dataset.action === 'delete'){
    openConfirmModal(`Excluir o pedido de orçamento de "${orc.nome || 'cliente'}"?`, () => arcDb.ref(`orcamentos/${orc.id}`).remove());
  } else if (btn.dataset.action === 'status'){
    const next = STATUS_NEXT[orc.status] || 'andamento';
    arcDb.ref(`orcamentos/${orc.id}/status`).set(next);
  }
});

/* ---------- ZONA DE PERIGO: RESTAURAR CATÁLOGO PADRÃO ---------- */
const resetCatalogoBtn = document.getElementById('resetCatalogoBtn');
const resetCatalogoStatus = document.getElementById('resetCatalogoStatus');

resetCatalogoBtn.addEventListener('click', () => {
  openConfirmModal(
    'Isso vai substituir TODAS as categorias, produtos e fotos atuais pelos 14 padrão de fábrica. Qualquer categoria, produto ou foto que você criou ou editou será perdido. Depoimentos e pedidos de orçamento não são afetados. Essa ação não pode ser desfeita.',
    () => {
      resetCatalogoStatus.textContent = 'Restaurando...';
      Promise.all([
        arcDb.ref('siteConfig/categorias').set(SEED_CATEGORIAS),
        arcDb.ref('siteConfig/produtos').set(SEED_PRODUTOS),
        arcDb.ref('siteConfig/galeria').set(SEED_GALERIA),
      ]).then(() => {
        resetCatalogoStatus.textContent = 'Catálogo padrão restaurado com sucesso.';
      }).catch((err) => {
        resetCatalogoStatus.textContent = 'Erro ao restaurar. Tente novamente.';
        console.error(err);
      });
    },
    { title: 'Restaurar catálogo padrão', confirmLabel: 'Restaurar' }
  );
});

/* ---------- LISTENERS EM TEMPO REAL ---------- */
function startListening(){
  seedIfEmpty('siteConfig/galeria', SEED_GALERIA);
  seedIfEmpty('siteConfig/produtos', SEED_PRODUTOS);
  seedIfEmpty('siteConfig/depoimentos', SEED_DEPOIMENTOS);
  seedIfEmpty('siteConfig/categorias', SEED_CATEGORIAS);

  const galeriaRef = arcDb.ref('siteConfig/galeria');
  const produtosRef = arcDb.ref('siteConfig/produtos');
  const depoimentosRef = arcDb.ref('siteConfig/depoimentos');
  const categoriasRef = arcDb.ref('siteConfig/categorias');
  const orcamentosRef = arcDb.ref('orcamentos');
  const settingsRef = arcDb.ref('siteConfig/settings');

  galeriaRef.on('value', (snap) => {
    dataCache.galeria = Object.entries(snap.val() || {}).map(([id, v]) => ({ id, ...v }));
    renderCollection('galeria', document.getElementById('galeriaList'), document.getElementById('galeriaCount'), 'Nenhum trabalho cadastrado.');
  });
  produtosRef.on('value', (snap) => {
    dataCache.produtos = Object.entries(snap.val() || {}).map(([id, v]) => ({ id, ...v }));
    renderCollection('produtos', document.getElementById('produtosList'), document.getElementById('produtosCount'), 'Nenhum produto cadastrado.');
  });
  depoimentosRef.on('value', (snap) => {
    dataCache.depoimentos = Object.entries(snap.val() || {}).map(([id, v]) => ({ id, ...v }));
    renderCollection('depoimentos', document.getElementById('depoimentosList'), document.getElementById('depoimentosCount'), 'Nenhum depoimento cadastrado.');
  });
  categoriasRef.on('value', (snap) => {
    renderCategorias(Object.entries(snap.val() || {}).map(([id, v]) => ({ id, ...v })));
  });
  orcamentosRef.on('value', (snap) => {
    renderOrcamentos(Object.entries(snap.val() || {}).map(([id, v]) => ({ id, ...v })));
  });
  settingsRef.on('value', (snap) => {
    renderSettings(snap.val());
  });

  refs = [galeriaRef, produtosRef, depoimentosRef, categoriasRef, orcamentosRef, settingsRef];
}

function stopListening(){
  refs.forEach(ref => ref.off());
  refs = [];
}
