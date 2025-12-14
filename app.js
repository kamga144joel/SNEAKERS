const sections = document.querySelectorAll('section');
const header = document.querySelector('nav');
const btnBurger = document.querySelector('#burger-menu');
const nav = document.querySelector('.navigation');
const linkNav = document.querySelectorAll('.navigation a');
const userIcon = document.querySelector('.nav-icons .bx-user');


btnBurger.addEventListener('click', ()=> {
  nav.classList.toggle('active')
  btnBurger.classList.toggle('bx-x')
  if(window.scrollY == 0){
    header.classList.toggle('active')
 }
});
btnBurger.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') btnBurger.click();
});

linkNav.forEach(link => {
    link.addEventListener('click', ()=> {
        nav.classList.remove('active')
       btnBurger.classList.remove('bx-x')
    });
})

window.addEventListener('scroll', ()=> {
  nav.classList.remove('active')
  btnBurger.classList.remove('bx-x')
});


window.addEventListener('scroll', ()=> {
  header.classList.toggle('active', window.scrollY > 0)
});


const scrollActive = () => {
  sections.forEach(section => {
      let top = window.scrollY;
      let offset = section.offsetTop - 150;
      let height = section.offsetHeight;
      let id = section.getAttribute('id');

      if (!id) return;
      if(top >= offset && top < offset + height) {
          linkNav.forEach(links => {
              links.classList.remove('active');
              const target = document.querySelector(`.navigation a[href="#${id}"]`);
              if (target) target.classList.add('active');
          })
      }
  })
}

window.addEventListener('scroll', scrollActive)
const shopIcon = document.querySelector('#shop-icon');
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('eshop-cart')) || [];
  } catch (e) {
    return [];
  }
}
function setCart(cart) {
  localStorage.setItem('eshop-cart', JSON.stringify(cart));
}
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + (i.qty || 1), 0);
  if (shopIcon) shopIcon.setAttribute('data-count', String(count));
  updateMiniCartBar();
}
function addItem(product) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx > -1) {
    cart[idx].qty = (cart[idx].qty || 1) + 1;
  } else {
    product.qty = 1;
    cart.push(product);
  }
  setCart(cart);
  updateCartCount();
}
function initCart() {
  updateCartCount();
  const buttons = document.querySelectorAll('.box .bx-cart-alt');
  buttons.forEach(btn => {
    const link = btn.closest('a');
    const target = link || btn;
    target.addEventListener('click', e => {
      e.preventDefault();
      const box = btn.closest('.box');
      if (!box) return;
      const data = getProductData(box);
      addItem(data);
      renderCart();
      showToast('Article ajouté au panier');
    });
  });
  if (shopIcon) {
    shopIcon.addEventListener('click', () => {
      const cartSection = document.querySelector('#cart');
      if (cartSection) cartSection.scrollIntoView({ behavior: 'smooth' });
    });
    shopIcon.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') shopIcon.click();
    });
  }
  renderCart();
}
document.addEventListener('DOMContentLoaded', initCart);
document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  initWishlist();
  initBackToTop();
  initNewsletter();
  initPaymentMethods();
  initPayPalButton();
  initOrderShare();
  initProductModal();
  initAuth();
});

function formatPrice(v) {
  const n = Math.round(v);
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
}
function renderCart() {
  const itemsEl = document.querySelector('#cart-items');
  const totalEl = document.querySelector('#cart-total');
  if (!itemsEl || !totalEl) return;
  const cart = getCart();
  if (!cart.length) {
    itemsEl.innerHTML = '<p>Votre panier est vide.</p>';
    totalEl.textContent = formatPrice(0);
    return;
  }
  let html = '';
  cart.forEach(i => {
    const qty = i.qty || 1;
    html += `
    <div class="cart-item" data-id="${i.id}">
      <img src="${i.img || ''}" alt="">
      <div class="ci-info">
        <h4>${i.title || ''}</h4>
        <span class="ci-price">${formatPrice(i.price || 0)}</span>
      </div>
      <div class="ci-qty">
        <button class="qty-minus">-</button>
        <span class="qty-val">${qty}</span>
        <button class="qty-plus">+</button>
      </div>
      <div class="ci-sub">${formatPrice((i.price || 0) * qty)}</div>
      <button class="remove-item">Supprimer</button>
    </div>`;
  });
  itemsEl.innerHTML = html;
  const total = cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  totalEl.textContent = formatPrice(total);
}

document.addEventListener('click', e => {
  const plus = e.target.closest('.qty-plus');
  const minus = e.target.closest('.qty-minus');
  const remove = e.target.closest('.remove-item');
  if (!plus && !minus && !remove) return;
  const ci = e.target.closest('.cart-item');
  if (!ci) return;
  const id = ci.getAttribute('data-id');
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) return;
  if (plus) cart[idx].qty = (cart[idx].qty || 1) + 1;
  if (minus) cart[idx].qty = Math.max(1, (cart[idx].qty || 1) - 1);
  if (remove) cart.splice(idx, 1);
  setCart(cart);
  updateCartCount();
  renderCart();
  if (remove) showToast('Article supprimé du panier');
});

document.addEventListener('submit', e => {
  const form = e.target.closest('#checkout-form');
  if (!form) return;
  e.preventDefault();
  const cart = getCart();
  const msg = document.querySelector('#checkout-message');
  if (!cart.length) {
    if (msg) msg.textContent = 'Votre panier est vide.';
    return;
  }
  const method = document.querySelector('input[name="paymethod"]:checked')?.value || 'card';
  const name = form.querySelector('input[name="name"]').value.trim();
  const email = form.querySelector('input[name="email"]').value.trim();
  const address = form.querySelector('input[name="address"]').value.trim();
  const card = form.querySelector('input[name="card"]').value.trim();
  const mmProvider = form.querySelector('#mm-provider')?.value || '';
  const mmPhone = form.querySelector('#mm-phone')?.value.trim() || '';
  const accept = form.querySelector('#accept-terms')?.checked;
  if (!name || !email || !address || (!accept)) {
    if (msg) msg.textContent = 'Veuillez remplir tous les champs.';
    return;
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) { if (msg) msg.textContent = 'E-mail invalide.'; return; }
  if (method === 'card') {
    const digits = card.replace(/\D/g, '');
    if (digits.length < 12 || digits.length > 19) { if (msg) msg.textContent = 'Numéro de carte invalide.'; return; }
    const luhn = (num) => { let sum = 0; let shouldDouble = false; for (let i = num.length - 1; i >= 0; i--) { let d = parseInt(num[i], 10); if (shouldDouble) { d *= 2; if (d > 9) d -= 9; } sum += d; shouldDouble = !shouldDouble; } return sum % 10 === 0; };
    if (!luhn(digits)) { if (msg) msg.textContent = 'Numéro de carte invalide.'; return; }
  }
  if (method === 'mobile') {
    if (!mmProvider) { if (msg) msg.textContent = 'Choisissez un opérateur Mobile Money.'; return; }
    const digits = mmPhone.replace(/\D/g, '');
    const cmValid = /^(?:\+?237)?6\d{8}$/;
    if (!cmValid.test(mmPhone) && !(digits.length === 9 && digits.startsWith('6'))) { if (msg) msg.textContent = 'Numéro Mobile Money invalide.'; return; }
  }
  const payBtn = form.querySelector('button[type="submit"]');
  if (payBtn) { payBtn.disabled = true; payBtn.textContent = 'Paiement en cours...'; }
  if (method === 'paypal') {
    startPayPalCheckout(cart, { name, email, address }).then(() => {
      finalizeOrder(msg, form, payBtn);
    }).catch(() => {
      if (msg) msg.textContent = 'Paiement PayPal non abouti.'; if (payBtn) { payBtn.disabled = false; payBtn.textContent = 'Payer'; }
    });
  } else if (method === 'mobile') {
    startMobileMoneyCheckout(cart, { name, email, address, mmProvider, mmPhone }).then(() => {
      finalizeOrder(msg, form, payBtn);
    }).catch(() => {
      if (msg) msg.textContent = 'Paiement Mobile Money non abouti.'; if (payBtn) { payBtn.disabled = false; payBtn.textContent = 'Payer'; }
    });
  } else {
    setTimeout(() => finalizeOrder(msg, form, payBtn), 400);
  }
});

function showToast(message) {
  const t = document.querySelector('#toast');
  if (!t) return;
  t.textContent = message;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 1800);
}

function updateMiniCartBar() {
  const bar = document.querySelector('#mini-cart-bar');
  const totalEl = document.querySelector('#mini-cart-total');
  const btn = document.querySelector('#mini-cart-checkout');
  if (!bar || !totalEl || !btn) return;
  const cart = getCart();
  const total = cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  totalEl.textContent = formatPrice(total);
  if (total > 0) {
    bar.classList.remove('mini-cart-hidden');
  } else {
    bar.classList.add('mini-cart-hidden');
  }
  btn.onclick = () => {
    const cartSection = document.querySelector('#cart');
    if (cartSection) cartSection.scrollIntoView({ behavior: 'smooth' });
  };
}

function initFilters() {
  const container = document.querySelector('.shop-content.container');
  const boxes = Array.from(document.querySelectorAll('.shop .box'));
  const search = document.querySelector('#product-search');
  const category = document.querySelector('#category-select');
  const sort = document.querySelector('#sort-select');
  const tag = document.querySelector('#tag-select');
  if (!container || !search || !category || !sort || !tag || !boxes.length) return;
  const apply = () => {
    const q = search.value.trim().toLowerCase();
    const cat = category.value;
    const tagVal = tag.value;
    const sorted = boxes.filter(b => {
      const title = (b.querySelector('h3')?.textContent || '').toLowerCase();
      const matchQ = !q || title.includes(q);
      const matchCat = cat === 'all' || (b.getAttribute('data-category') === cat);
      const isPromo = !!b.getAttribute('data-promo');
      const isNew = !!b.getAttribute('data-new');
      const matchTag = tagVal === 'all' || (tagVal === 'promo' && isPromo) || (tagVal === 'new' && isNew);
      return matchQ && matchCat && matchTag;
    }).sort((a,b) => {
      const pa = parseFloat((a.getAttribute('data-price')||'0').replace(/[^0-9.]/g,''));
      const pb = parseFloat((b.getAttribute('data-price')||'0').replace(/[^0-9.]/g,''));
      if (sort.value === 'price_asc') return pa - pb;
      if (sort.value === 'price_desc') return pb - pa;
      return 0;
    });
    container.innerHTML = '';
    sorted.forEach(el => container.appendChild(el));
  };
  ['input','change'].forEach(ev => {
    search.addEventListener(ev, apply);
    category.addEventListener(ev, apply);
    sort.addEventListener(ev, apply);
  });
  tag.addEventListener('change', apply);
  apply();
}

function getFavs(){
  try { return JSON.parse(localStorage.getItem('eshop-favs')) || []; } catch(e){ return []; }
}
function setFavs(f){ localStorage.setItem('eshop-favs', JSON.stringify(f)); }
function initWishlist(){
  const favBtns = document.querySelectorAll('.shop .fav-btn');
  const favs = getFavs();
  favBtns.forEach(btn => {
    const box = btn.closest('.box');
    const img = box?.querySelector('img')?.getAttribute('src') || '';
    const id = img || (box?.querySelector('h3')?.textContent || '');
    if (favs.includes(id)) btn.classList.add('active');
    btn.addEventListener('click', () => {
      const list = getFavs();
      const idx = list.indexOf(id);
      if (idx === -1) { list.push(id); btn.classList.add('active'); showToast('Ajouté aux favoris'); }
      else { list.splice(idx,1); btn.classList.remove('active'); showToast('Retiré des favoris'); }
      setFavs(list);
    });
  });
}

function initBackToTop(){
  const btn = document.querySelector('#back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 300);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initNewsletter(){
  const form = document.querySelector('.newsletter form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value.trim() || '';
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    showToast(ok ? 'Inscription réussie' : 'E-mail invalide');
  if (ok) form.reset();
  });
}

function getProfiles(){
  try { return JSON.parse(localStorage.getItem('eshop-profiles')) || {}; } catch(e){ return {}; }
}
function setProfiles(p){ localStorage.setItem('eshop-profiles', JSON.stringify(p)); }
function getCurrentEmail(){ return localStorage.getItem('eshop-current-email') || ''; }
function setCurrentEmail(e){ if (e) localStorage.setItem('eshop-current-email', e); else localStorage.removeItem('eshop-current-email'); }
function getCurrentProfile(){ const email = getCurrentEmail(); const all = getProfiles(); return email && all[email] ? all[email] : {}; }
function prefillCheckout(){
  const profile = getCurrentProfile();
  const form = document.querySelector('#checkout-form');
  if (!form || !profile) return;
  if (profile.name) form.querySelector('input[name="name"]').value = profile.name;
  if (profile.email) form.querySelector('input[name="email"]').value = profile.email;
  if (profile.address) form.querySelector('input[name="address"]').value = profile.address;
}
function initAuth(){
  const modal = document.querySelector('#account-modal');
  if (!modal) return;
  const closeBtn = modal.querySelector('.modal-close');
  const tabs = modal.querySelectorAll('.tab');
  const loginPanel = modal.querySelector('#tab-login');
  const registerPanel = modal.querySelector('#tab-register');
  const loginForm = modal.querySelector('#login-form');
  const registerForm = modal.querySelector('#register-form');
  const logoutBtn = modal.querySelector('#logout-btn');
  const open = () => { modal.classList.remove('hidden'); };
  const close = () => modal.classList.add('hidden');
  if (userIcon) {
    userIcon.addEventListener('click', open);
    userIcon.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
  }
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    const key = t.getAttribute('data-tab');
    loginPanel.classList.toggle('hidden', key !== 'login');
    registerPanel.classList.toggle('hidden', key !== 'register');
    tabs.forEach(x => x.setAttribute('aria-selected', x === t ? 'true' : 'false'));
    loginPanel.setAttribute('aria-hidden', key !== 'login' ? 'true' : 'false');
    registerPanel.setAttribute('aria-hidden', key !== 'register' ? 'true' : 'false');
  }));
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = loginForm.querySelector('input[name="email"]').value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) { showToast('E-mail invalide'); return; }
    const all = getProfiles();
    if (!all[email]) { showToast('Aucun profil trouvé'); return; }
    setCurrentEmail(email);
    prefillCheckout();
    showToast('Connexion réussie');
    updateUserIconState();
    close();
  });
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = registerForm.querySelector('input[name="name"]').value.trim();
    const email = registerForm.querySelector('input[name="email"]').value.trim();
    const phone = registerForm.querySelector('input[name="phone"]').value.trim();
    const address = registerForm.querySelector('input[name="address"]').value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !email || !address || !ok) { showToast('Complétez vos informations'); return; }
    const all = getProfiles();
    all[email] = { name, email, phone, address };
    setProfiles(all);
    setCurrentEmail(email);
    prefillCheckout();
    showToast('Inscription réussie');
    updateUserIconState();
    close();
  });
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      setCurrentEmail('');
      prefillCheckout();
      updateUserIconState();
      showToast('Déconnecté');
      close();
    });
  }
  updateUserIconState();
  prefillCheckout();
}

function updateUserIconState(){
  const email = getCurrentEmail();
  const welcomeEl = document.querySelector('#welcome');
  if (userIcon) {
    userIcon.classList.toggle('connected', !!email);
    userIcon.setAttribute('aria-label', email ? 'Compte (connecté)' : 'Compte');
  }
  if (welcomeEl) {
    if (email) {
      const prof = getCurrentProfile();
      const first = (prof.name || '').split(' ')[0] || '';
      welcomeEl.textContent = first ? `Bonjour, ${first}` : 'Bonjour';
      welcomeEl.style.display = 'inline';
    } else {
      welcomeEl.textContent = '';
      welcomeEl.style.display = 'none';
    }
  }
}

function initPaymentMethods(){
  const form = document.querySelector('#checkout-form');
  if (!form) return;
  const radios = form.querySelectorAll('input[name="paymethod"]');
  const cardBox = form.querySelector('.card-fields');
  const mmBox = form.querySelector('.mm-fields');
  const paypalBox = form.querySelector('.paypal-fields');
  const submitBtn = form.querySelector('#checkout-submit');
  const apply = () => {
    const method = form.querySelector('input[name="paymethod"]:checked')?.value || 'card';
    cardBox?.classList.toggle('hidden', method !== 'card');
    mmBox?.classList.toggle('hidden', method !== 'mobile');
    paypalBox?.classList.toggle('hidden', method !== 'paypal');
    if (method === 'paypal') submitBtn.textContent = 'Payer avec PayPal'; else submitBtn.textContent = 'Payer';
    const cardInput = form.querySelector('input[name="card"]');
    const mmProvider = form.querySelector('#mm-provider');
    const mmPhone = form.querySelector('#mm-phone');
    if (cardInput) cardInput.required = method === 'card';
    if (mmProvider) mmProvider.required = method === 'mobile';
    if (mmPhone) mmPhone.required = method === 'mobile';
  };
  radios.forEach(r => r.addEventListener('change', apply));
  apply();
}

function startPayPalCheckout(cart, customer){
  return new Promise((resolve) => setTimeout(resolve, 600));
}
function startMobileMoneyCheckout(cart, customer){
  return new Promise((resolve) => setTimeout(resolve, 800));
}
function finalizeOrder(msg, form, payBtn){
  const cartSnapshot = getCart();
  const total = cartSnapshot.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  const method = document.querySelector('input[name="paymethod"]:checked')?.value || 'card';
  const id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
  const order = { id, date: new Date().toLocaleString('fr-FR'), method, total, items: cartSnapshot };
  localStorage.setItem('eshop-last-order', JSON.stringify(order));
  setCart([]);
  updateCartCount();
  renderCart();
  if (msg) msg.textContent = 'Commande confirmée. Merci pour votre achat.';
  showToast('Commande confirmée');
  form.reset();
  if (payBtn) { payBtn.disabled = false; payBtn.textContent = 'Payer'; }
  showConfirmation(order);
}

function initPayPalButton(){
  const btn = document.querySelector('#paypal-pay-btn');
  const form = document.querySelector('#checkout-form');
  if (!btn || !form) return;
  btn.addEventListener('click', () => {
    const cart = getCart();
    const msg = document.querySelector('#checkout-message');
    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const address = form.querySelector('input[name="address"]').value.trim();
    const accept = form.querySelector('#accept-terms')?.checked;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!cart.length) { if (msg) msg.textContent = 'Votre panier est vide.'; return; }
    if (!name || !email || !address || !accept || !emailOk) { if (msg) msg.textContent = 'Complétez vos informations.'; return; }
    startPayPalCheckout(cart, { name, email, address }).then(() => finalizeOrder(msg, form, btn));
  });
}

function initOrderShare(){
  const waBtn = document.querySelector('#wa-order-btn');
  const emailBtn = document.querySelector('#email-order-btn');
  const form = document.querySelector('#checkout-form');
  if (!form) return;
  const makeMessage = () => {
    const cart = getCart();
    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const address = form.querySelector('input[name="address"]').value.trim();
    const lines = cart.map(i => `- ${i.title} x${i.qty || 1} = ${formatPrice((i.price||0)*(i.qty||1))}`);
    const total = formatPrice(cart.reduce((s,i)=> s + (i.price||0)*(i.qty||1), 0));
    return `Commande SNEAKERS\nClient: ${name}\nEmail: ${email}\nAdresse: ${address}\nTotal: ${total}\nArticles:\n${lines.join('\n')}`;
  };
  waBtn?.addEventListener('click', () => {
    const cart = getCart(); if (!cart.length) { showToast('Panier vide'); return; }
    const msg = encodeURIComponent(makeMessage());
    const phone = '237656973647';
    const url = `https://wa.me/${phone}?text=${msg}`;
    window.open(url, '_blank');
  });
  emailBtn?.addEventListener('click', () => {
    const cart = getCart(); if (!cart.length) { showToast('Panier vide'); return; }
    const msg = encodeURIComponent(makeMessage());
    const subject = encodeURIComponent('Commande SNEAKERS');
    const url = `mailto:kamgajoel144@gmail.com?subject=${subject}&body=${msg}`;
    window.location.href = url;
  });
}

function showConfirmation(order){
  const idEl = document.querySelector('#order-id');
  const dateEl = document.querySelector('#order-date');
  const methodEl = document.querySelector('#order-method');
  const totalEl = document.querySelector('#order-total-confirm');
  const itemsEl = document.querySelector('#order-items');
  if (!idEl || !dateEl || !methodEl || !totalEl || !itemsEl) return;
  idEl.textContent = order.id;
  dateEl.textContent = order.date;
  methodEl.textContent = order.method === 'card' ? 'Carte bancaire' : order.method === 'mobile' ? 'Mobile Money' : order.method === 'paypal' ? 'PayPal' : 'Paiement à la livraison';
  totalEl.textContent = formatPrice(order.total);
  let html = '';
  order.items.forEach(i => {
    const qty = i.qty || 1;
    html += `
    <div class="order-item">
      <img src="${i.img || ''}" alt="">
      <div>
        <h4>${i.title || ''}</h4>
        <div>${formatPrice(i.price || 0)} x ${qty}</div>
      </div>
      <div>${formatPrice((i.price || 0) * qty)}</div>
    </div>`;
  });
  itemsEl.innerHTML = html;
  const section = document.querySelector('#confirmation');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
  const printBtn = document.querySelector('#print-receipt');
  if (printBtn) {
    printBtn.onclick = () => printOrder(order);
  }
}

function printOrder(order){
  const w = window.open('', '_blank');
  if (!w) return;
  const itemsHtml = order.items.map(i => `<tr><td>${i.title}</td><td>${i.qty || 1}</td><td>${formatPrice(i.price || 0)}</td><td>${formatPrice((i.price||0)*(i.qty||1))}</td></tr>`).join('');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Reçu ${order.id}</title><style>body{font-family:Poppins,Arial,sans-serif;padding:20px}h1{font-size:18px}table{width:100%;border-collapse:collapse;margin-top:10px}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body><h1>Reçu de commande</h1><p><strong>Commande:</strong> ${order.id}</p><p><strong>Date:</strong> ${order.date}</p><p><strong>Méthode:</strong> ${order.method}</p><p><strong>Total:</strong> ${formatPrice(order.total)}</p><table><thead><tr><th>Produit</th><th>Qté</th><th>Prix</th><th>Sous-total</th></tr></thead><tbody>${itemsHtml}</tbody></table></body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

function getProductData(box){
  const title = box.getAttribute('data-title') || box.querySelector('h3')?.textContent.trim() || '';
  const priceAttr = box.getAttribute('data-price') || (box.querySelector('span')?.textContent.trim() || '');
  const img = box.querySelector('img')?.getAttribute('src') || '';
  const price = parseFloat(String(priceAttr).replace(',', '.').replace(/[^0-9.]/g, '')) || 0;
  const id = box.getAttribute('data-id') || img || title + '-' + price;
  const desc = box.getAttribute('data-desc') || '';
  return { id, title, price, img, desc };
}

function initProductModal(){
  const modal = document.querySelector('#product-modal');
  if (!modal) return;
  const titleEl = modal.querySelector('#pm-title');
  const descEl = modal.querySelector('#pm-desc');
  const priceEl = modal.querySelector('#pm-price');
  const imgEl = modal.querySelector('#pm-img');
  const addBtn = modal.querySelector('#pm-add');
  const closeBtn = modal.querySelector('.modal-close');
  let current;
  document.querySelectorAll('.shop .box img, .shop .box h3').forEach(el => {
    el.addEventListener('click', () => {
      const box = el.closest('.box');
      if (!box) return;
      const data = getProductData(box);
      current = data;
      titleEl.textContent = data.title;
      descEl.textContent = data.desc;
      priceEl.textContent = formatPrice(data.price);
      imgEl.setAttribute('src', data.img || '');
      imgEl.setAttribute('alt', data.title || '');
      modal.classList.remove('hidden');
    });
  });
  addBtn.addEventListener('click', () => {
    if (!current) return;
    addItem(current);
    updateCartCount();
    renderCart();
    showToast('Article ajouté au panier');
    modal.classList.add('hidden');
  });
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.add('hidden'); });
}
