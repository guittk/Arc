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

/* ---------- CATÁLOGO (unificado: categoria + produto + fotos) ---------- */
let categoriasCache = [];
const categoriasListEl = document.getElementById('categoriasList');
const catalogoCountEl = document.getElementById('catalogoCount');

function renderCategorias(list){
  categoriasCache = list;
  if (catalogoCountEl) catalogoCountEl.textContent = `(${list.length})`;
  categoriasListEl.innerHTML = list.map(cat => {
    const fotos = cat.fotos || {};
    const thumbUrl = cat.thumbKey && fotos[cat.thumbKey] ? fotos[cat.thumbKey] : Object.values(fotos)[0];
    const fotoCount = Object.keys(fotos).length;
    const thumb = thumbUrl ? `<img class="config-item-thumb" src="${thumbUrl}">` : '<div class="config-item-thumb config-item-thumb-empty"></div>';
    const sub = [cat.nomeProduto, fotoCount > 0 ? `${fotoCount} foto${fotoCount !== 1 ? 's' : ''}` : null].filter(Boolean).join(' · ');
    return `
      <div class="config-item">
        ${thumb}
        <div class="config-item-body">
          <strong>${cat.label}</strong>
          ${sub ? `<span>${sub}</span>` : ''}
          ${cat.descricao ? `<span class="config-item-desc">${cat.descricao}</span>` : ''}
        </div>
        <div class="config-item-actions">
          <button data-action="edit" data-id="${cat.id}">Editar</button>
          <button data-action="delete" class="danger" data-id="${cat.id}">Excluir</button>
        </div>
      </div>`;
  }).join('') || '<p class="config-empty">Nenhuma categoria cadastrada.</p>';
}

categoriasListEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const cat = categoriasCache.find(c => c.id === btn.dataset.id);
  if (!cat) return;
  if (btn.dataset.action === 'delete'){
    openConfirmModal(`Excluir a categoria "${cat.label}" e todas as suas fotos? Essa ação não pode ser desfeita.`, () => {
      arcDb.ref(`siteConfig/categorias/${cat.id}`).remove();
    });
  } else if (btn.dataset.action === 'edit'){
    openCatModal(cat);
  }
});

/* MODAL: criar/editar categoria (unificado) */
const catModalOverlay = document.getElementById('catModalOverlay');
const catModalTitle = document.getElementById('catModalTitle');
const catModalClose = document.getElementById('catModalClose');
const catModalCancel = document.getElementById('catModalCancel');
const catForm = document.getElementById('catForm');
const catEditId = document.getElementById('catEditId');
const catLabel = document.getElementById('catLabel');
const catNomeProduto = document.getElementById('catNomeProduto');
const catDescricao = document.getElementById('catDescricao');
const catFotosGrid = document.getElementById('catFotosGrid');
const catFotoInput = document.getElementById('catFotoInput');
const catStatus = document.getElementById('catStatus');

let pendingFotos = {};
let pendingThumbKey = null;

function renderCatFotos(){
  const keys = Object.keys(pendingFotos);
  if (keys.length === 0){
    catFotosGrid.innerHTML = '<p class="cat-fotos-empty">Nenhuma foto adicionada ainda.</p>';
    return;
  }
  catFotosGrid.innerHTML = keys.map(k => `
    <div class="cat-foto-item ${k === pendingThumbKey ? 'is-thumb' : ''}" data-key="${k}">
      <img src="${pendingFotos[k]}" loading="lazy">
      <div class="cat-foto-badge">Capa</div>
      <button type="button" class="cat-foto-remove" data-remove="${k}" aria-label="Remover">✕</button>
    </div>`).join('');
}

catFotosGrid.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('[data-remove]');
  if (removeBtn){
    e.stopPropagation();
    const k = removeBtn.dataset.remove;
    delete pendingFotos[k];
    if (pendingThumbKey === k) pendingThumbKey = Object.keys(pendingFotos)[0] || null;
    renderCatFotos();
    return;
  }
  const item = e.target.closest('.cat-foto-item');
  if (item){
    pendingThumbKey = item.dataset.key;
    renderCatFotos();
  }
});

catFotoInput.addEventListener('change', async (e) => {
  const files = [...(e.target.files || [])];
  if (!files.length) return;
  catStatus.textContent = `Processando ${files.length > 1 ? files.length + ' fotos' : 'foto'}...`;
  for (const file of files){
    const key = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 4)}`;
    const dataUrl = await resizeImage(file, 900);
    pendingFotos[key] = dataUrl;
    if (!pendingThumbKey) pendingThumbKey = key;
  }
  catStatus.textContent = '';
  renderCatFotos();
  e.target.value = '';
});

function openCatModal(existing){
  catForm.reset();
  catEditId.value = existing ? existing.id : '';
  catLabel.value = existing ? (existing.label || '') : '';
  catNomeProduto.value = existing ? (existing.nomeProduto || '') : '';
  catDescricao.value = existing ? (existing.descricao || '') : '';
  pendingFotos = existing && existing.fotos ? { ...existing.fotos } : {};
  pendingThumbKey = existing ? (existing.thumbKey || Object.keys(pendingFotos)[0] || null) : null;
  catStatus.textContent = '';
  catModalTitle.textContent = existing ? 'Editar categoria' : 'Nova categoria';
  renderCatFotos();
  catModalOverlay.classList.add('open');
}
function closeCatModal(){ catModalOverlay.classList.remove('open'); }
catModalClose.addEventListener('click', closeCatModal);
catModalCancel.addEventListener('click', closeCatModal);
catModalOverlay.addEventListener('click', (e) => { if (e.target === catModalOverlay) closeCatModal(); });
document.getElementById('addCategoriaBtn').addEventListener('click', () => openCatModal());

catForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const label = catLabel.value.trim();
  const nomeProduto = catNomeProduto.value.trim();
  if (!label || !nomeProduto){ catStatus.textContent = 'Preencha o nome da categoria e do produto.'; return; }

  const item = { label, nomeProduto, descricao: catDescricao.value.trim() };
  const fotoKeys = Object.keys(pendingFotos);
  if (fotoKeys.length > 0){
    item.fotos = { ...pendingFotos };
    item.thumbKey = pendingThumbKey && pendingFotos[pendingThumbKey] ? pendingThumbKey : fotoKeys[0];
  }

  const id = catEditId.value;
  const ref = id ? arcDb.ref(`siteConfig/categorias/${id}`) : arcDb.ref('siteConfig/categorias').push();
  ref.set(item).then(() => closeCatModal()).catch((err) => {
    catStatus.textContent = 'Erro ao salvar. Tente com fotos menores.';
    console.error(err);
  });
});

/* ---------- DEPOIMENTOS ---------- */
const depoimentoModalOverlay = document.getElementById('depoimentoModalOverlay');
const depoimentoModalTitle = document.getElementById('depoimentoModalTitle');
const depoimentoModalClose = document.getElementById('depoimentoModalClose');
const depoimentoModalCancel = document.getElementById('depoimentoModalCancel');
const depoimentoForm = document.getElementById('depoimentoForm');
const depoimentoEditId = document.getElementById('depoimentoEditId');
const depoimentoNome = document.getElementById('depoimentoNome');
const depoimentoTexto = document.getElementById('depoimentoTexto');
const depoimentoStatus = document.getElementById('depoimentoStatus');

let depoimentosCache = [];

function renderDepoimentos(list){
  depoimentosCache = list;
  const listEl = document.getElementById('depoimentosList');
  const countEl = document.getElementById('depoimentosCount');
  if (countEl) countEl.textContent = `(${list.length})`;
  listEl.innerHTML = list.map(dep => `
    <div class="config-item">
      <div class="config-item-body">
        <strong>${dep.nome}</strong>
        <span>${dep.texto}</span>
      </div>
      <div class="config-item-actions">
        <button data-action="edit" data-id="${dep.id}">Editar</button>
        <button data-action="delete" class="danger" data-id="${dep.id}">Excluir</button>
      </div>
    </div>`).join('') || '<p class="config-empty">Nenhum depoimento cadastrado.</p>';
}

document.getElementById('depoimentosList').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const dep = depoimentosCache.find(d => d.id === btn.dataset.id);
  if (!dep) return;
  if (btn.dataset.action === 'delete'){
    openConfirmModal(`Excluir o depoimento de "${dep.nome}"?`, () => arcDb.ref(`siteConfig/depoimentos/${dep.id}`).remove());
  } else {
    openDepoimentoModal(dep);
  }
});

function openDepoimentoModal(existing){
  depoimentoForm.reset();
  depoimentoEditId.value = existing ? existing.id : '';
  depoimentoNome.value = existing ? (existing.nome || '') : '';
  depoimentoTexto.value = existing ? (existing.texto || '') : '';
  depoimentoStatus.textContent = '';
  depoimentoModalTitle.textContent = existing ? 'Editar depoimento' : 'Novo depoimento';
  depoimentoModalOverlay.classList.add('open');
}
function closeDepoimentoModal(){ depoimentoModalOverlay.classList.remove('open'); }
depoimentoModalClose.addEventListener('click', closeDepoimentoModal);
depoimentoModalCancel.addEventListener('click', closeDepoimentoModal);
depoimentoModalOverlay.addEventListener('click', (e) => { if (e.target === depoimentoModalOverlay) closeDepoimentoModal(); });
document.getElementById('addDepoimentoBtn').addEventListener('click', () => openDepoimentoModal());

depoimentoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = depoimentoNome.value.trim();
  const texto = depoimentoTexto.value.trim();
  if (!nome || !texto){ depoimentoStatus.textContent = 'Preencha todos os campos.'; return; }
  const item = { nome, texto };
  const id = depoimentoEditId.value;
  const ref = id ? arcDb.ref(`siteConfig/depoimentos/${id}`) : arcDb.ref('siteConfig/depoimentos').push();
  ref.set(item).then(() => closeDepoimentoModal()).catch((err) => {
    depoimentoStatus.textContent = 'Erro ao salvar. Tente novamente.';
    console.error(err);
  });
});

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

/* ---------- SEEDS ---------- */
const CATEGORY_DEFS = [
  { label: 'Gravação a Laser',       slug: 'laser',     nomeProduto: 'Copo Térmico Gravado a Laser',    descricao: 'Gravação precisa e resistente, ideal para uso diário ou presente.',         prodSeed: 'prod-copo' },
  { label: 'Mouse Pad',              slug: 'mousepad',  nomeProduto: 'Mouse Pad Personalizado',          descricao: 'Traga sua marca ou arte favorita para o dia a dia.',                        prodSeed: 'prod-mousepad' },
  { label: 'Mochila Saco Infantil',  slug: 'mochila',   nomeProduto: 'Mochila Saco Infantil',            descricao: 'Bolsas divertidas e personalizadas para a criançada.',                      prodSeed: 'prod-mochila' },
  { label: 'Bodies e Toalhinhas',    slug: 'body',      nomeProduto: 'Bodies e Toalhinhas',              descricao: 'Itens fofos e personalizados para o bebê.',                                 prodSeed: 'prod-body' },
  { label: 'Camisetas',              slug: 'camiseta',  nomeProduto: 'Camiseta Personalizada',           descricao: 'Estampas exclusivas para eventos, times e uso pessoal.',                    prodSeed: 'prod-camiseta' },
  { label: 'Kit Festa na Mesa',      slug: 'festa',     nomeProduto: 'Kit Festa na Mesa',                descricao: 'Conjunto completo para decorar a mesa de qualquer comemoração.',             prodSeed: 'prod-kitfesta' },
  { label: 'Canecas Personalizadas', slug: 'caneca',    nomeProduto: 'Caneca Personalizada',             descricao: 'Estampe fotos, frases ou logotipo com acabamento premium.',                  prodSeed: 'prod-caneca' },
  { label: 'Garrafas Personalizadas',slug: 'garrafa',   nomeProduto: 'Garrafa Personalizada',            descricao: 'Perfeita para brindes corporativos e presentes especiais.',                  prodSeed: 'prod-garrafa' },
  { label: 'Lembrancinhas',          slug: 'lembranca', nomeProduto: 'Lembrancinha Personalizada',       descricao: 'Para casamentos, chás e aniversários com carinho no detalhe.',               prodSeed: 'prod-lembranca' },
  { label: 'Mini Calendários',       slug: 'calendario',nomeProduto: 'Mini Calendário Personalizado',    descricao: 'Brindes de fim de ano personalizados com a sua marca.',                      prodSeed: 'prod-calendario' },
  { label: 'Cartões de Visita',      slug: 'cartao',    nomeProduto: 'Cartão de Visita',                 descricao: 'Design profissional que causa a primeira boa impressão.',                    prodSeed: 'prod-cartao' },
  { label: 'Panfletos',              slug: 'panfleto',  nomeProduto: 'Panfleto Personalizado',           descricao: 'Material impresso para divulgação com arte exclusiva.',                      prodSeed: 'prod-panfleto' },
  { label: 'Placas Pix',             slug: 'pix',       nomeProduto: 'Placa Pix',                        descricao: 'Praticidade e identidade visual para o seu ponto de venda.',                 prodSeed: 'prod-pix' },
  { label: 'Tags',                   slug: 'tag',       nomeProduto: 'Tags Personalizadas',              descricao: 'Etiquetas personalizadas para produtos e embalagens.',                       prodSeed: 'prod-tag' },
];

function buildSeedCategorias(){
  const seed = {};
  CATEGORY_DEFS.forEach(({ label, slug, nomeProduto, descricao, prodSeed }, i) => {
    const id = `cat${String(i + 1).padStart(2, '0')}`;
    const fotos = { f0: `https://picsum.photos/seed/${prodSeed}/500/380` };
    for (let n = 1; n <= 4; n++) fotos[`f${n}`] = `https://picsum.photos/seed/gal-${slug}${n}/900/900`;
    seed[id] = { label, nomeProduto, descricao, thumbKey: 'f0', fotos };
  });
  return seed;
}
const SEED_CATEGORIAS = buildSeedCategorias();

const SEED_DEPOIMENTOS = {
  t1: { nome: 'Mariana S.', texto: 'A caneca personalizada ficou perfeita, superou minhas expectativas! Atendimento super rápido.' },
  t2: { nome: 'Rodrigo A.', texto: 'Pedi garrafas para o aniversário da empresa e todo mundo elogiou o acabamento da gravação a laser.' },
};

function seedIfEmpty(path, seed){
  arcDb.ref(path).once('value').then((snap) => {
    if (snap.val() === null) arcDb.ref(path).set(seed);
  });
}

/* ---------- ZONA DE PERIGO: RESTAURAR CATÁLOGO PADRÃO ---------- */
const resetCatalogoBtn = document.getElementById('resetCatalogoBtn');
const resetCatalogoStatus = document.getElementById('resetCatalogoStatus');

resetCatalogoBtn.addEventListener('click', () => {
  openConfirmModal(
    'Isso vai substituir TODAS as categorias, produtos e fotos atuais pelos 14 padrão de fábrica. Qualquer conteúdo que você criou ou editou será perdido. Depoimentos e pedidos de orçamento não são afetados. Essa ação não pode ser desfeita.',
    () => {
      resetCatalogoStatus.textContent = 'Restaurando...';
      arcDb.ref('siteConfig/categorias').set(SEED_CATEGORIAS).then(() => {
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
let refs = [];

function startListening(){
  seedIfEmpty('siteConfig/categorias', SEED_CATEGORIAS);
  seedIfEmpty('siteConfig/depoimentos', SEED_DEPOIMENTOS);

  const categoriasRef = arcDb.ref('siteConfig/categorias');
  const depoimentosRef = arcDb.ref('siteConfig/depoimentos');
  const orcamentosRef  = arcDb.ref('orcamentos');
  const settingsRef    = arcDb.ref('siteConfig/settings');

  categoriasRef.on('value', (snap) => {
    renderCategorias(Object.entries(snap.val() || {}).map(([id, v]) => ({ id, ...v })));
  });
  depoimentosRef.on('value', (snap) => {
    renderDepoimentos(Object.entries(snap.val() || {}).map(([id, v]) => ({ id, ...v })));
  });
  orcamentosRef.on('value', (snap) => {
    renderOrcamentos(Object.entries(snap.val() || {}).map(([id, v]) => ({ id, ...v })));
  });
  settingsRef.on('value', (snap) => {
    renderSettings(snap.val());
  });

  refs = [categoriasRef, depoimentosRef, orcamentosRef, settingsRef];
}

function stopListening(){
  refs.forEach(ref => ref.off());
  refs = [];
}
