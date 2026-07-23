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

/* ---------- DATA ---------- */
const services = [
  { icon: 'laser', title: 'Gravação a Laser', desc: 'Copos térmicos e garrafas com gravação precisa e duradoura.' },
  { icon: 'mug', title: 'Canecas Personalizadas', desc: 'Fotos, frases e logos com impressão de alta qualidade.' },
  { icon: 'bottle', title: 'Garrafas Personalizadas', desc: 'Ideal para presentes corporativos e datas especiais.' },
  { icon: 'gift', title: 'Lembrancinhas', desc: 'Para casamentos, chás e aniversários com carinho no detalhe.' },
  { icon: 'calendar', title: 'Mini Calendários', desc: 'Brindes de fim de ano personalizados com a sua marca.' },
  { icon: 'card', title: 'Cartões de Visita', desc: 'Design profissional que representa o seu negócio.' },
  { icon: 'flyer', title: 'Panfletos', desc: 'Material impresso para divulgação com arte exclusiva.' },
  { icon: 'pix', title: 'Placas Pix', desc: 'Placas personalizadas para facilitar o pagamento no seu ponto.' },
  { icon: 'tag', title: 'Tags', desc: 'Etiquetas personalizadas para produtos e embalagens.' },
  { icon: 'mousepad', title: 'Mouse Pad', desc: 'Personalize com fotos, logos ou artes exclusivas.' },
  { icon: 'bag', title: 'Mochila Saco Infantil', desc: 'Bolsas divertidas e personalizadas para a criançada.' },
  { icon: 'body', title: 'Bodies e Toalhinhas', desc: 'Itens fofos e personalizados para o bebê.' },
  { icon: 'shirt', title: 'Camisetas', desc: 'Estampas personalizadas para eventos, times e empresas.' },
  { icon: 'party', title: 'Kit Festa na Mesa', desc: 'Conjunto completo para decorar a mesa da sua festa.' },
];

const iconPaths = {
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

function iconSVG(name){
  return `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name]||iconPaths.tag}</svg>`;
}

const servicesGrid = document.getElementById('servicesGrid');
servicesGrid.innerHTML = services.map(s => `
  <div class="service-card">
    <div class="service-icon">${iconSVG(s.icon)}</div>
    <h3>${s.title}</h3>
    <p>${s.desc}</p>
  </div>
`).join('');

/* GALLERY DATA */
const galleryItems = [
  { cat:'Canecas', label:'Caneca "Melhor mãe"', seed:'gal-caneca1', tall:true },
  { cat:'Garrafas', label:'Garrafa corporativa', seed:'gal-garrafa1' },
  { cat:'Camisetas', label:'Camiseta de time', seed:'gal-camiseta1' },
  { cat:'Papelaria', label:'Cartão de visita', seed:'gal-cartao1' },
  { cat:'Festas', label:'Kit festa na mesa', seed:'gal-festa1', tall:true },
  { cat:'Canecas', label:'Caneca casal', seed:'gal-caneca2' },
  { cat:'Garrafas', label:'Squeeze gravado', seed:'gal-garrafa2' },
  { cat:'Papelaria', label:'Mini calendário', seed:'gal-calendario1' },
  { cat:'Bebês', label:'Body personalizado', seed:'gal-body1' },
  { cat:'Camisetas', label:'Camiseta divertida', seed:'gal-camiseta2', tall:true },
  { cat:'Festas', label:'Tags de lembrancinha', seed:'gal-tag1' },
  { cat:'Bebês', label:'Toalhinha de boca', seed:'gal-toalha1' },
];

const categories = ['Todos', ...Array.from(new Set(galleryItems.map(g=>g.cat)))];
const galleryTabs = document.getElementById('galleryTabs');
galleryTabs.innerHTML = categories.map((c,i)=> `<button class="tab-btn ${i===0?'active':''}" data-cat="${c}">${c}</button>`).join('');

const galleryGrid = document.getElementById('galleryGrid');
function renderGallery(filter){
  galleryGrid.innerHTML = galleryItems.map(g => `
    <div class="gallery-item ${g.tall?'tall':''} ${(filter!=='Todos' && filter!==g.cat) ? 'hidden':''}" data-cat="${g.cat}" data-full="https://picsum.photos/seed/${g.seed}/900/900" data-label="${g.label}">
      <img loading="lazy" src="https://picsum.photos/seed/${g.seed}/400/400" alt="${g.label}">
    </div>
  `).join('');
  attachLightboxHandlers();
}
renderGallery('Todos');

galleryTabs.addEventListener('click', (e)=>{
  const btn = e.target.closest('.tab-btn');
  if(!btn) return;
  galleryTabs.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderGallery(btn.dataset.cat);
});

/* LIGHTBOX */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
function attachLightboxHandlers(){
  galleryGrid.querySelectorAll('.gallery-item').forEach(item=>{
    item.addEventListener('click', ()=>{
      lightboxImg.src = item.dataset.full;
      lightboxImg.alt = item.dataset.label;
      lightbox.classList.add('open');
    });
  });
}
document.getElementById('lightboxClose').addEventListener('click', ()=> lightbox.classList.remove('open'));
lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) lightbox.classList.remove('open'); });

/* PRODUCTS */
const products = [
  { name:'Copo Térmico Gravado a Laser', desc:'Gravação precisa e resistente, ideal para uso diário ou presente.', seed:'prod-copo' },
  { name:'Caneca Personalizada', desc:'Estampe fotos, frases ou logotipo com acabamento premium.', seed:'prod-caneca' },
  { name:'Garrafa Personalizada', desc:'Perfeita para brindes corporativos e presentes especiais.', seed:'prod-garrafa' },
  { name:'Camiseta Personalizada', desc:'Estampas exclusivas para eventos, times e uso pessoal.', seed:'prod-camiseta' },
  { name:'Kit Festa na Mesa', desc:'Conjunto completo para decorar a mesa de qualquer comemoração.', seed:'prod-kitfesta' },
  { name:'Cartão de Visita', desc:'Design profissional que causa a primeira boa impressão.', seed:'prod-cartao' },
  { name:'Placa Pix', desc:'Praticidade e identidade visual para o seu ponto de venda.', seed:'prod-pix' },
  { name:'Mouse Pad Personalizado', desc:'Traga sua marca ou arte favorita para o dia a dia.', seed:'prod-mousepad' },
];

const productsGrid = document.getElementById('productsGrid');
productsGrid.innerHTML = products.map(p => {
  const msg = encodeURIComponent(`Olá! Quero solicitar um orçamento para: ${p.name}`);
  return `
  <div class="product-card">
    <div class="product-photo"><img loading="lazy" src="https://picsum.photos/seed/${p.seed}/500/380" alt="${p.name}"></div>
    <div class="product-body">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <a class="btn btn-primary btn-sm" href="https://wa.me/5515998402182?text=${msg}" target="_blank" rel="noopener">Solicitar Orçamento</a>
    </div>
  </div>`;
}).join('');

/* DIFFERENTIALS */
const diffs = [
  { icon:'<path d="M13 2 3 14h7l-1 8 11-14h-7z"/>', title:'Atendimento rápido', desc:'Resposta ágil pelo WhatsApp, sem enrolação.' },
  { icon:'<path d="M12 2l2.9 6.3 6.9.9-5 4.9 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.9 6.9-.9z"/>', title:'Alta qualidade', desc:'Materiais e acabamento pensados para durar.' },
  { icon:'<path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"/><path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/>', title:'Personalização exclusiva', desc:'Cada peça é feita para o seu pedido, do seu jeito.' },
  { icon:'<path d="M4 4h16v16H4z"/><path d="M4 9h16"/><path d="M9 4v16"/>', title:'Excelente acabamento', desc:'Atenção aos detalhes em cada etapa da produção.' },
  { icon:'<path d="M3 7h18M3 12h18M3 17h18"/>', title:'Variedade de produtos', desc:'De canecas a papelaria — tudo em um só lugar.' },
  { icon:'<path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4 8.3 8.3 0 0 1-3.8-.9L3 21l1.9-5.8a8.3 8.3 0 0 1-.9-3.8A8.4 8.4 0 0 1 12.6 3a8.4 8.4 0 0 1 8.4 8.5z"/>', title:'Orçamento sem compromisso', desc:'Você pergunta, a gente responde — sem pressão.' },
];
document.getElementById('diffGrid').innerHTML = diffs.map(d => `
  <div class="diff-item">
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d.icon}</svg>
    <h3>${d.title}</h3>
    <p>${d.desc}</p>
  </div>
`).join('');

/* TESTIMONIALS */
const testimonials = [
  { name:'Mariana S.', text:'A caneca personalizada ficou perfeita, superou minhas expectativas! Atendimento super rápido.' },
  { name:'Rodrigo A.', text:'Pedi garrafas para o aniversário da empresa e todo mundo elogiou o acabamento da gravação a laser.' },
];
const testGrid = document.getElementById('testGrid');
testGrid.innerHTML = testimonials.map(t => `
  <div class="test-card">
    <div class="stars">★★★★★</div>
    <p>“${t.text}”</p>
    <div class="test-author"><div class="test-avatar">${t.name[0]}</div>${t.name}</div>
  </div>
`).join('') + `<div class="test-card empty">Seu depoimento pode aparecer aqui — envie sua avaliação depois de receber seu pedido!</div>`;
