/* ---------- ÍCONES (espelham js/main.js) ---------- */
const SERVICE_ICONS = {
  laser: 'Gravação a Laser', mug: 'Caneca', bottle: 'Garrafa', gift: 'Lembrancinha',
  calendar: 'Calendário', card: 'Cartão de Visita', flyer: 'Panfleto', pix: 'Placa Pix',
  tag: 'Tag', mousepad: 'Mouse Pad', bag: 'Mochila/Saco', body: 'Body/Toalhinha',
  shirt: 'Camiseta', party: 'Festa',
};
const DIFF_ICONS = {
  flash: 'Atendimento rápido', star: 'Qualidade', shield: 'Exclusividade',
  grid: 'Acabamento', list: 'Variedade', chat: 'Orçamento', generic: 'Genérico',
};

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
const confirmModalMessage = document.getElementById('confirmModalMessage');
const confirmModalOk = document.getElementById('confirmModalOk');
const confirmModalCancel = document.getElementById('confirmModalCancel');
const confirmModalClose = document.getElementById('confirmModalClose');
let confirmCallback = null;

function openConfirmModal(message, onConfirm){
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

/* ---------- CATEGORIAS (filtro da galeria) ---------- */
let categoriasCache = [];
const categoriasListEl = document.getElementById('categoriasList');
const categoriaForm = document.getElementById('categoriaForm');
const categoriaEditId = document.getElementById('categoriaEditId');
const categoriaLabelInput = document.getElementById('categoriaLabel');
const categoriaSubmitBtn = document.getElementById('categoriaSubmitBtn');
const categoriaCancelBtn = document.getElementById('categoriaCancelEdit');

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
    openConfirmModal(`Excluir a categoria "${cat.label}"? Trabalhos já cadastrados nela continuam salvos, mas ela some dos filtros.`, () => {
      arcDb.ref(`siteConfig/categorias/${cat.id}`).remove();
    });
  } else if (btn.dataset.action === 'edit'){
    categoriaEditId.value = cat.id;
    categoriaLabelInput.value = cat.label;
    categoriaSubmitBtn.textContent = 'Salvar';
    categoriaCancelBtn.style.display = '';
  }
});

categoriaCancelBtn.addEventListener('click', () => {
  categoriaEditId.value = '';
  categoriaForm.reset();
  categoriaSubmitBtn.textContent = 'Adicionar';
  categoriaCancelBtn.style.display = 'none';
});

categoriaForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const label = categoriaLabelInput.value.trim();
  if (!label) return;
  const id = categoriaEditId.value;
  const ref = id ? arcDb.ref(`siteConfig/categorias/${id}`) : arcDb.ref('siteConfig/categorias').push();
  ref.set({ label }).then(() => {
    categoriaEditId.value = '';
    categoriaForm.reset();
    categoriaSubmitBtn.textContent = 'Adicionar';
    categoriaCancelBtn.style.display = 'none';
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

const campoIcon = document.getElementById('campoIcon');
const itemIconSelect = document.getElementById('itemIcon');
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
  servico: 'serviço', diferencial: 'diferencial', galeria: 'trabalho da galeria',
  produto: 'produto', depoimento: 'depoimento',
};
const CONTEXT_COLLECTION = {
  servico: 'servicos', diferencial: 'diferenciais', galeria: 'galeria',
  produto: 'produtos', depoimento: 'depoimentos',
};
const CONTEXT_LABELS = {
  servico: 'Título', diferencial: 'Título', galeria: 'Nome do trabalho',
  produto: 'Nome do produto', depoimento: 'Nome do cliente',
};

function fillIconSelect(map, value){
  itemIconSelect.innerHTML = Object.entries(map).map(([k, label]) => `<option value="${k}">${label}</option>`).join('');
  if (value) itemIconSelect.value = value;
}

function openFormModal(context, existing){
  itemForm.reset();
  itemEditId.value = existing ? existing.id : '';
  itemContextInput.value = context;
  pendingFoto = existing && existing.foto ? existing.foto : null;
  itemFotoPreview.innerHTML = pendingFoto ? `<div class="form-thumb"><img src="${pendingFoto}"></div>` : '';
  itemStatus.textContent = '';

  const hasIcon = context === 'servico' || context === 'diferencial';
  const hasTexto = context !== 'galeria';
  const hasCategoria = context === 'galeria';
  const hasFoto = context === 'galeria' || context === 'produto';

  campoIcon.style.display = hasIcon ? '' : 'none';
  campoTexto.style.display = hasTexto ? '' : 'none';
  campoCategoria.style.display = hasCategoria ? '' : 'none';
  campoFoto.style.display = hasFoto ? '' : 'none';

  if (context === 'servico') fillIconSelect(SERVICE_ICONS, existing ? existing.icon : undefined);
  if (context === 'diferencial') fillIconSelect(DIFF_ICONS, existing ? existing.icon : undefined);

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

document.getElementById('addServicoBtn').addEventListener('click', () => openFormModal('servico'));
document.getElementById('addDiferencialBtn').addEventListener('click', () => openFormModal('diferencial'));
document.getElementById('addGaleriaBtn').addEventListener('click', () => openFormModal('galeria'));
document.getElementById('addProdutoBtn').addEventListener('click', () => openFormModal('produto'));
document.getElementById('addDepoimentoBtn').addEventListener('click', () => openFormModal('depoimento'));

itemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const context = itemContextInput.value;
  const nome = itemTitulo.value.trim();
  if (!nome) return;

  let item = null;
  if (context === 'servico' || context === 'diferencial'){
    const texto = itemTexto.value.trim();
    if (!texto){ itemStatus.textContent = 'Preencha a descrição.'; return; }
    item = { icon: itemIconSelect.value, titulo: nome, texto };
  } else if (context === 'galeria'){
    if (!pendingFoto){ itemStatus.textContent = 'Envie uma foto.'; return; }
    item = { categoria: document.getElementById('itemCategoria').value, label: nome, foto: pendingFoto };
  } else if (context === 'produto'){
    if (!pendingFoto){ itemStatus.textContent = 'Envie uma foto.'; return; }
    const texto = itemTexto.value.trim();
    if (!texto){ itemStatus.textContent = 'Preencha a descrição.'; return; }
    item = { nome, texto, foto: pendingFoto };
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

let dataCache = { servicos: [], diferenciais: [], galeria: [], produtos: [], depoimentos: [] };
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

document.getElementById('servicosList').addEventListener('click', handleListClick('servico'));
document.getElementById('diferenciaisList').addEventListener('click', handleListClick('diferencial'));
document.getElementById('galeriaList').addEventListener('click', handleListClick('galeria'));
document.getElementById('produtosList').addEventListener('click', handleListClick('produto'));
document.getElementById('depoimentosList').addEventListener('click', handleListClick('depoimento'));

/* ---------- SEEDS (mesmos dados padrão do site, só na primeira vez) ---------- */
const SEED_SERVICOS = {
  s1: { icon: 'laser', titulo: 'Gravação a Laser', texto: 'Copos térmicos e garrafas com gravação precisa e duradoura.' },
  s2: { icon: 'mug', titulo: 'Canecas Personalizadas', texto: 'Fotos, frases e logos com impressão de alta qualidade.' },
  s3: { icon: 'bottle', titulo: 'Garrafas Personalizadas', texto: 'Ideal para presentes corporativos e datas especiais.' },
  s4: { icon: 'gift', titulo: 'Lembrancinhas', texto: 'Para casamentos, chás e aniversários com carinho no detalhe.' },
  s5: { icon: 'calendar', titulo: 'Mini Calendários', texto: 'Brindes de fim de ano personalizados com a sua marca.' },
  s6: { icon: 'card', titulo: 'Cartões de Visita', texto: 'Design profissional que representa o seu negócio.' },
  s7: { icon: 'flyer', titulo: 'Panfletos', texto: 'Material impresso para divulgação com arte exclusiva.' },
  s8: { icon: 'pix', titulo: 'Placas Pix', texto: 'Placas personalizadas para facilitar o pagamento no seu ponto.' },
  s9: { icon: 'tag', titulo: 'Tags', texto: 'Etiquetas personalizadas para produtos e embalagens.' },
  s10: { icon: 'mousepad', titulo: 'Mouse Pad', texto: 'Personalize com fotos, logos ou artes exclusivas.' },
  s11: { icon: 'bag', titulo: 'Mochila Saco Infantil', texto: 'Bolsas divertidas e personalizadas para a criançada.' },
  s12: { icon: 'body', titulo: 'Bodies e Toalhinhas', texto: 'Itens fofos e personalizados para o bebê.' },
  s13: { icon: 'shirt', titulo: 'Camisetas', texto: 'Estampas personalizadas para eventos, times e empresas.' },
  s14: { icon: 'party', titulo: 'Kit Festa na Mesa', texto: 'Conjunto completo para decorar a mesa da sua festa.' },
};
const SEED_DIFERENCIAIS = {
  d1: { icon: 'flash', titulo: 'Atendimento rápido', texto: 'Resposta ágil pelo WhatsApp, sem enrolação.' },
  d2: { icon: 'star', titulo: 'Alta qualidade', texto: 'Materiais e acabamento pensados para durar.' },
  d3: { icon: 'shield', titulo: 'Personalização exclusiva', texto: 'Cada peça é feita para o seu pedido, do seu jeito.' },
  d4: { icon: 'grid', titulo: 'Excelente acabamento', texto: 'Atenção aos detalhes em cada etapa da produção.' },
  d5: { icon: 'list', titulo: 'Variedade de produtos', texto: 'De canecas a papelaria — tudo em um só lugar.' },
  d6: { icon: 'chat', titulo: 'Orçamento sem compromisso', texto: 'Você pergunta, a gente responde — sem pressão.' },
};
const SEED_GALERIA = {
  g1: { categoria: 'Canecas', label: 'Caneca "Melhor mãe"', foto: 'https://picsum.photos/seed/gal-caneca1/900/900' },
  g2: { categoria: 'Garrafas', label: 'Garrafa corporativa', foto: 'https://picsum.photos/seed/gal-garrafa1/900/900' },
  g3: { categoria: 'Camisetas', label: 'Camiseta de time', foto: 'https://picsum.photos/seed/gal-camiseta1/900/900' },
  g4: { categoria: 'Papelaria', label: 'Cartão de visita', foto: 'https://picsum.photos/seed/gal-cartao1/900/900' },
  g5: { categoria: 'Festas', label: 'Kit festa na mesa', foto: 'https://picsum.photos/seed/gal-festa1/900/900' },
  g6: { categoria: 'Canecas', label: 'Caneca casal', foto: 'https://picsum.photos/seed/gal-caneca2/900/900' },
  g7: { categoria: 'Garrafas', label: 'Squeeze gravado', foto: 'https://picsum.photos/seed/gal-garrafa2/900/900' },
  g8: { categoria: 'Papelaria', label: 'Mini calendário', foto: 'https://picsum.photos/seed/gal-calendario1/900/900' },
  g9: { categoria: 'Bebês', label: 'Body personalizado', foto: 'https://picsum.photos/seed/gal-body1/900/900' },
  g10: { categoria: 'Camisetas', label: 'Camiseta divertida', foto: 'https://picsum.photos/seed/gal-camiseta2/900/900' },
  g11: { categoria: 'Festas', label: 'Tags de lembrancinha', foto: 'https://picsum.photos/seed/gal-tag1/900/900' },
  g12: { categoria: 'Bebês', label: 'Toalhinha de boca', foto: 'https://picsum.photos/seed/gal-toalha1/900/900' },
};
const SEED_PRODUTOS = {
  p1: { nome: 'Copo Térmico Gravado a Laser', texto: 'Gravação precisa e resistente, ideal para uso diário ou presente.', foto: 'https://picsum.photos/seed/prod-copo/500/380' },
  p2: { nome: 'Caneca Personalizada', texto: 'Estampe fotos, frases ou logotipo com acabamento premium.', foto: 'https://picsum.photos/seed/prod-caneca/500/380' },
  p3: { nome: 'Garrafa Personalizada', texto: 'Perfeita para brindes corporativos e presentes especiais.', foto: 'https://picsum.photos/seed/prod-garrafa/500/380' },
  p4: { nome: 'Camiseta Personalizada', texto: 'Estampas exclusivas para eventos, times e uso pessoal.', foto: 'https://picsum.photos/seed/prod-camiseta/500/380' },
  p5: { nome: 'Kit Festa na Mesa', texto: 'Conjunto completo para decorar a mesa de qualquer comemoração.', foto: 'https://picsum.photos/seed/prod-kitfesta/500/380' },
  p6: { nome: 'Cartão de Visita', texto: 'Design profissional que causa a primeira boa impressão.', foto: 'https://picsum.photos/seed/prod-cartao/500/380' },
  p7: { nome: 'Placa Pix', texto: 'Praticidade e identidade visual para o seu ponto de venda.', foto: 'https://picsum.photos/seed/prod-pix/500/380' },
  p8: { nome: 'Mouse Pad Personalizado', texto: 'Traga sua marca ou arte favorita para o dia a dia.', foto: 'https://picsum.photos/seed/prod-mousepad/500/380' },
};
const SEED_DEPOIMENTOS = {
  t1: { nome: 'Mariana S.', texto: 'A caneca personalizada ficou perfeita, superou minhas expectativas! Atendimento super rápido.' },
  t2: { nome: 'Rodrigo A.', texto: 'Pedi garrafas para o aniversário da empresa e todo mundo elogiou o acabamento da gravação a laser.' },
};
const SEED_CATEGORIAS = {
  canecas: { label: 'Canecas' },
  garrafas: { label: 'Garrafas' },
  camisetas: { label: 'Camisetas' },
  papelaria: { label: 'Papelaria' },
  festas: { label: 'Festas' },
  bebes: { label: 'Bebês' },
};

function seedIfEmpty(path, seed){
  arcDb.ref(path).once('value').then((snap) => {
    if (snap.val() === null) arcDb.ref(path).set(seed);
  });
}

/* ---------- LISTENERS EM TEMPO REAL ---------- */
function startListening(){
  seedIfEmpty('siteConfig/servicos', SEED_SERVICOS);
  seedIfEmpty('siteConfig/diferenciais', SEED_DIFERENCIAIS);
  seedIfEmpty('siteConfig/galeria', SEED_GALERIA);
  seedIfEmpty('siteConfig/produtos', SEED_PRODUTOS);
  seedIfEmpty('siteConfig/depoimentos', SEED_DEPOIMENTOS);
  seedIfEmpty('siteConfig/categorias', SEED_CATEGORIAS);

  const servicosRef = arcDb.ref('siteConfig/servicos');
  const diferenciaisRef = arcDb.ref('siteConfig/diferenciais');
  const galeriaRef = arcDb.ref('siteConfig/galeria');
  const produtosRef = arcDb.ref('siteConfig/produtos');
  const depoimentosRef = arcDb.ref('siteConfig/depoimentos');
  const categoriasRef = arcDb.ref('siteConfig/categorias');

  servicosRef.on('value', (snap) => {
    dataCache.servicos = Object.entries(snap.val() || {}).map(([id, v]) => ({ id, ...v }));
    renderCollection('servicos', document.getElementById('servicosList'), document.getElementById('servicosCount'), 'Nenhum serviço cadastrado.');
  });
  diferenciaisRef.on('value', (snap) => {
    dataCache.diferenciais = Object.entries(snap.val() || {}).map(([id, v]) => ({ id, ...v }));
    renderCollection('diferenciais', document.getElementById('diferenciaisList'), document.getElementById('diferenciaisCount'), 'Nenhum diferencial cadastrado.');
  });
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

  refs = [servicosRef, diferenciaisRef, galeriaRef, produtosRef, depoimentosRef, categoriasRef];
}

function stopListening(){
  refs.forEach(ref => ref.off());
  refs = [];
}
