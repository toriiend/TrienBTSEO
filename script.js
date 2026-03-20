/* ============================================================
   TechZone – Main Script
   Cart system (localStorage) + UI helpers
   ============================================================ */

/* ---------- CART STORAGE HELPERS ---------- */
function getCart() {
  return JSON.parse(localStorage.getItem('tz_cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('tz_cart', JSON.stringify(cart));
}

/* ---------- ADD TO CART ---------- */
function addToCart(id, name, price, cat, emoji) {
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, cat, emoji, qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();
  showToast(`\u2705 \u0110\u00e3 th\u00eam "<strong>${name}</strong>" v\u00e0o gi\u1ecf h\u00e0ng`);
}

/* ---------- REMOVE FROM CART ---------- */
function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  updateCartBadge();
  renderCartPage();
}

/* ---------- UPDATE QUANTITY ---------- */
function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  updateCartBadge();
  renderCartPage();
}

/* ---------- CART BADGE ---------- */
function updateCartBadge() {
  const total = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

/* ---------- FORMAT PRICE ---------- */
function fmt(n) {
  return n.toLocaleString('vi-VN') + '\u20ab';
}

/* ---------- TOAST NOTIFICATION ---------- */
function showToast(msg) {
  let toast = document.getElementById('tz-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'tz-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ---------- INJECT CART ICON INTO HEADER ---------- */
function injectCartIcon() {
  const inner = document.querySelector('.header-inner');
  if (!inner || inner.querySelector('.cart-btn')) return;

  const cartBtn = document.createElement('a');
  cartBtn.href = 'cart.html';
  cartBtn.className = 'cart-btn';
  cartBtn.setAttribute('aria-label', 'Gi\u1ecf h\u00e0ng');
  cartBtn.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
    <span class="cart-badge" style="display:none">0</span>
  `;

  const hamburger = inner.querySelector('.hamburger');
  if (hamburger) inner.insertBefore(cartBtn, hamburger);
  else inner.appendChild(cartBtn);
}

/* ---------- BIND ADD-TO-CART BUTTONS ---------- */
function bindCartButtons() {
  document.querySelectorAll('[data-product-id]').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      addToCart(
        this.dataset.productId,
        this.dataset.productName,
        parseInt(this.dataset.productPrice),
        this.dataset.productCat,
        this.dataset.productEmoji || '\ud83d\udce6'
      );
    });
  });
}

/* ---------- RENDER CART PAGE ---------- */
function renderCartPage() {
  const container = document.getElementById('cart-items-container');
  const summaryEl  = document.getElementById('cart-summary');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">\ud83d\uded2</div>
        <h2>Gi\u1ecf h\u00e0ng c\u1ee7a b\u1ea1n \u0111ang tr\u1ed1ng</h2>
        <p>H\u00e3y kh\u00e1m ph\u00e1 c\u00e1c s\u1ea3n ph\u1ea9m v\u00e0 th\u00eam v\u00e0o gi\u1ecf h\u00e0ng nh\u00e9!</p>
        <a href="index.html" class="btn btn-primary">Ti\u1ebfp T\u1ee5c Mua S\u1eafm</a>
      </div>`;
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }

  if (summaryEl) summaryEl.style.display = '';

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 5000000 ? 0 : 30000;
  const total = subtotal + shipping;

  container.innerHTML = cart.map(item => `
    <div class="cart-item" id="ci-${item.id}">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <p class="cart-item-cat">${item.cat}</p>
        <h3 class="cart-item-name">${item.name}</h3>
        <p class="cart-item-price-unit">${fmt(item.price)} / s\u1ea3n ph\u1ea9m</p>
      </div>
      <div class="cart-item-actions">
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">\u2212</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
        <p class="cart-item-subtotal">${fmt(item.price * item.qty)}</p>
        <button class="cart-remove-btn" onclick="removeFromCart('${item.id}')" aria-label="X\u00f3a">\ud83d\uddd1</button>
      </div>
    </div>
  `).join('');

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="summary-card">
        <h3 class="summary-title">T\u00f3m T\u1eaft \u0110\u01a1n H\u00e0ng</h3>
        <div class="summary-row"><span>T\u1ea1m t\u00ednh</span><span>${fmt(subtotal)}</span></div>
        <div class="summary-row"><span>Ph\u00ed v\u1eadn chuy\u1ec3n</span><span>${shipping === 0 ? '<span class="free-ship">Mi\u1ec5n ph\u00ed</span>' : fmt(shipping)}</span></div>
        ${shipping > 0 ? `<p class="ship-note">Mi\u1ec5n ph\u00ed v\u1eadn chuy\u1ec3n cho \u0111\u01a1n t\u1eeb 5.000.000\u20ab</p>` : ''}
        <div class="summary-row summary-total"><span>T\u1ed5ng c\u1ed9ng</span><span>${fmt(total)}</span></div>
        <a href="checkout.html" class="btn btn-primary" style="width:100%;text-align:center;margin-top:16px;">Ti\u1ebfn H\u00e0nh Thanh To\u00e1n \u2192</a>
        <a href="index.html" class="btn btn-outline" style="width:100%;text-align:center;margin-top:10px;">\u2190 Ti\u1ebfp T\u1ee5c Mua S\u1eafm</a>
      </div>
    `;
  }
}

/* ---------- RENDER CHECKOUT SUMMARY ---------- */
function renderCheckoutSummary() {
  const el = document.getElementById('checkout-order-summary');
  if (!el) return;
  const cart = getCart();
  if (cart.length === 0) {
    el.innerHTML = `<p style="color:var(--text-muted)">Gi\u1ecf h\u00e0ng tr\u1ed1ng. <a href="index.html" style="color:var(--accent)">Quay l\u1ea1i mua s\u1eafm</a></p>`;
    return;
  }
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 5000000 ? 0 : 30000;
  const total = subtotal + shipping;

  el.innerHTML = `
    <div class="co-items">
      ${cart.map(i => `
        <div class="co-item">
          <span class="co-emoji">${i.emoji}</span>
          <div class="co-item-info">
            <span class="co-item-name">${i.name}</span>
            <span class="co-item-qty">x${i.qty}</span>
          </div>
          <span class="co-item-price">${fmt(i.price * i.qty)}</span>
        </div>
      `).join('')}
    </div>
    <div class="co-divider"></div>
    <div class="summary-row"><span>T\u1ea1m t\u00ednh</span><span>${fmt(subtotal)}</span></div>
    <div class="summary-row"><span>Ph\u00ed v\u1eadn chuy\u1ec3n</span><span>${shipping === 0 ? '<span class="free-ship">Mi\u1ec5n ph\u00ed</span>' : fmt(shipping)}</span></div>
    <div class="summary-row summary-total" style="margin-top:12px"><span>T\u1ed5ng c\u1ed9ng</span><span>${fmt(total)}</span></div>
  `;
}

/* ---------- CHECKOUT FORM SUBMIT ---------- */
function handleCheckoutSubmit(e) {
  e.preventDefault();
  const cart = getCart();
  if (cart.length === 0) { showToast('\u26a0\ufe0f Gi\u1ecf h\u00e0ng tr\u1ed1ng!'); return; }

  const fields = ['co-name','co-phone','co-email','co-address','co-city'];
  let ok = true;
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!el.value.trim()) {
      el.classList.add('input-error');
      ok = false;
    } else {
      el.classList.remove('input-error');
    }
  });
  if (!ok) { showToast('\u26a0\ufe0f Vui l\u00f2ng \u0111i\u1ec1n \u0111\u1ea7y \u0111\u1ee7 th\u00f4ng tin'); return; }

  saveCart([]);
  updateCartBadge();
  const successEl = document.getElementById('checkout-success');
  const formEl = document.getElementById('checkout-form-wrap');
  if (successEl) successEl.style.display = 'flex';
  if (formEl) formEl.style.display = 'none';
}

/* ---------- MOBILE NAV ---------- */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (!hamburger || !nav) return;
  hamburger.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => nav.classList.remove('open')));
}

/* ---------- FILTER BUTTONS ---------- */
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

/* ---------- SCROLL REVEAL ---------- */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.product-card, .cat-card, .feature, .cart-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    obs.observe(el);
  });
}

/* ---------- FORM VALIDATION CLEAR ---------- */
function initFormValidation() {
  document.querySelectorAll('.co-input, .co-select').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('input-error'));
  });
  const form = document.getElementById('checkout-form');
  if (form) form.addEventListener('submit', handleCheckoutSubmit);
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  injectCartIcon();
  updateCartBadge();
  bindCartButtons();
  initMobileNav();
  initFilters();
  renderCartPage();
  renderCheckoutSummary();
  initFormValidation();
  initScrollReveal();
});
