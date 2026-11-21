// ==========================================
// 1. LIVE ANIME PETALS, WIND & NIGHT CANVAS
// ==========================================
const canvas = document.getElementById('anime-canvas');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);
let windMultiplier = 1;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

class Petal {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = initial ? Math.random() * width : -30;
    this.y = initial ? Math.random() * height : Math.random() * height * 0.85;
    this.size = 5 + Math.random() * 8;
    this.speedX = 1.6 + Math.random() * 2.4;
    this.speedY = 0.4 + Math.random() * 1.3;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.05;
    this.waveOffset = Math.random() * 100;
    this.glow = Math.random() > 0.35;
  }

  update(time) {
    this.x += this.speedX * windMultiplier;
    this.y += (this.speedY + Math.sin(time * 0.002 + this.waveOffset) * 0.65) * windMultiplier;
    this.angle += this.spin * windMultiplier;

    if (this.x > width + 40 || this.y > height + 40) {
      this.reset(false);
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.glow) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#d946ef';
    }

    const grad = ctx.createLinearGradient(-this.size, -this.size, this.size, this.size);
    grad.addColorStop(0, '#f5d0fe');
    grad.addColorStop(0.6, '#c084fc');
    grad.addColorStop(1, '#7e22ce');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.quadraticCurveTo(this.size, 0, 0, this.size);
    ctx.quadraticCurveTo(-this.size, 0, 0, -this.size);
    ctx.fill();
    ctx.restore();
  }
}

const petals = Array.from({ length: 50 }, () => new Petal());

function animateScene(time) {
  ctx.clearRect(0, 0, width, height);

  // Wind streaks
  ctx.strokeStyle = 'rgba(192, 132, 252, 0.09)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const streakY = (time * 0.05 + i * 210) % height;
    const streakX = ((time * 0.35 * windMultiplier + i * 320) % (width + 200)) - 100;
    ctx.beginPath();
    ctx.moveTo(streakX, streakY);
    ctx.lineTo(streakX + 110 * windMultiplier, streakY + 12);
    ctx.stroke();
  }

  petals.forEach((petal) => {
    petal.update(time);
    petal.draw();
  });

  requestAnimationFrame(animateScene);
}
requestAnimationFrame(animateScene);

// Wind Boost Toggle
const toggleWindBtn = document.getElementById('toggle-wind');
toggleWindBtn.addEventListener('click', () => {
  windMultiplier = windMultiplier === 1 ? 2.4 : 1;
  toggleWindBtn.textContent = `Wind Boost: ${windMultiplier > 1 ? 'ON' : 'OFF'}`;
  showToast(windMultiplier > 1 ? 'Night wind & petal speed boosted!' : 'Calm night breeze restored.');
});

// Companion Robot Interactive Ping
const botSpeech = document.getElementById('bot-speech');
const robotBtn = document.getElementById('robot-interact-btn');
const companionBot = document.getElementById('companion-bot');

const botLines = [
  'EGO BOT ONLINE',
  'CROWN DROP READY!',
  '4.98★ TOP RATED HUB',
  'WELCOME TO EGO GOATSTORE!'
];
let botIndex = 0;

function pingRobot() {
  botIndex = (botIndex + 1) % botLines.length;
  botSpeech.textContent = botLines[botIndex];
  showToast(`Companion Bot: "${botLines[botIndex]}"`);
}

robotBtn.addEventListener('click', pingRobot);
companionBot.addEventListener('click', pingRobot);

// ==========================================
// 2. EGO GOATSTORE CATALOG WITH STAR RATINGS
// ==========================================
const products = [
  {
    id: 1,
    name: 'Shadow Crown Hoodie Skin',
    category: 'cyber',
    price: 19.99,
    rarity: 'MYTHIC',
    rating: 4.9,
    reviewsCount: 342,
    icon: '👑',
    desc: 'Animated violet-trimmed cyber jacket with glowing crown emblem on sleeve.'
  },
  {
    id: 2,
    name: 'Cyan-Eye Mini Companion Bot',
    category: 'companions',
    price: 24.99,
    rarity: 'LEGENDARY',
    rating: 5.0,
    reviewsCount: 518,
    icon: '🤖',
    desc: 'Floating white mecha-pet with blinking cyan optics and purple crown core.'
  },
  {
    id: 3,
    name: 'Moonlit Pagoda VIP Pass',
    category: 'passes',
    price: 14.99,
    rarity: 'VIP',
    rating: 4.9,
    reviewsCount: 289,
    icon: '🏯',
    desc: 'Priority access to midnight drops, custom commands, and VIP badge.'
  },
  {
    id: 4,
    name: 'Violet Sakura Wind FX',
    category: 'cyber',
    price: 12.50,
    rarity: 'RARE',
    rating: 4.8,
    reviewsCount: 194,
    icon: '🌸',
    desc: 'Glowing purple cherry blossom petals drifting in sync with wind.'
  },
  {
    id: 5,
    name: 'Ego Night Creator Suite',
    category: 'passes',
    price: 29.00,
    rarity: 'ULTRA',
    rating: 5.0,
    reviewsCount: 410,
    icon: '⚡',
    desc: '4K anime overlays, robotic UI panels, and custom sound alerts.'
  },
  {
    id: 6,
    name: 'Phantom Scarf Relic',
    category: 'companions',
    price: 16.00,
    rarity: 'EPIC',
    rating: 4.9,
    reviewsCount: 231,
    icon: '🧣',
    desc: 'Physics-reactive dark flowing scarf infused with purple moonlight.'
  }
];

let cart = [];
let currentFilter = 'all';
let searchQuery = '';

const productGrid = document.getElementById('product-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search-input');

function renderProducts() {
  const filtered = products.filter((item) => {
    const matchesCategory = currentFilter === 'all' || item.category === currentFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery) ||
      item.desc.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    productGrid.innerHTML = `<p style="color:#c4b5fd;">No items matched "${searchQuery}". Try another keyword!</p>`;
    return;
  }

  productGrid.innerHTML = filtered
    .map(
      (item) => `
      <article class="product-card">
        <div>
          <div class="card-art">
            <span class="rarity-tag">${item.rarity}</span>
            <span>${item.icon}</span>
          </div>

          <div class="rating-row">
            <span class="stars">★★★★★ ${item.rating.toFixed(1)} (${item.reviewsCount})</span>
            <button class="rate-link" onclick="jumpToRate('${item.name}')">Rate Item</button>
          </div>

          <h3>${item.name}</h3>
          <p>${item.desc}</p>
        </div>

        <div class="card-footer">
          <span class="price robotic-font">$${item.price.toFixed(2)}</span>
          <button class="primary-btn" onclick="addToCart(${item.id})">Add to Cart</button>
        </div>
      </article>
    `
    )
    .join('');
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderProducts();
  });
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  renderProducts();
});

// Jump directly to the rating form with that product pre-selected
function jumpToRate(productName) {
  const selectEl = document.getElementById('review-item');
  selectEl.value = productName;
  document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('reviewer-name').focus();
}

// ==========================================
// 3. COMMUNITY RATINGS & COMMANDS SYSTEM
// ==========================================
const reviewsData = [
  {
    author: 'AetherKuro',
    item: 'Cyan-Eye Mini Companion Bot',
    rating: 5,
    comment: 'Super smooth animation and the robotic UI looks ultra clean! Delivered in less than a second.'
  },
  {
    author: 'Nyx_Valkyrie',
    item: 'Shadow Crown Hoodie Skin',
    rating: 5,
    comment: 'The purple crown glow and dark aesthetic on EGO GOATSTORE are unmatched. 10/10 quality!'
  },
  {
    author: 'RyujinZero',
    item: 'Moonlit Pagoda VIP Pass',
    rating: 5,
    comment: 'Every option on the site is super easy to find and all commands work smoothly.'
  }
];

const reviewItemSelect = document.getElementById('review-item');
const reviewsListEl = document.getElementById('reviews-list');
const reviewForm = document.getElementById('review-form');

function populateReviewDropdown() {
  reviewItemSelect.innerHTML = products
    .map((p) => `<option value="${p.name}">${p.name}</option>`)
    .join('');
}

function renderReviews() {
  reviewsListEl.innerHTML = reviewsData
    .map(
      (rev) => `
      <div class="review-card">
        <div class="review-top">
          <div>
            <span class="review-author">${rev.author}</span>
            <span class="review-badge">VERIFIED BUYER</span>
          </div>
          <span class="review-stars">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)} (${rev.rating}.0)</span>
        </div>
        <div class="review-item-tag">Command / Item: ${rev.item}</div>
        <p>${rev.comment}</p>
      </div>
    `
    )
    .join('');
}

reviewForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const author = document.getElementById('reviewer-name').value.trim();
  const item = reviewItemSelect.value;
  const rating = parseInt(document.getElementById('review-rating').value, 10);
  const comment = document.getElementById('review-text').value.trim();

  if (!author || !comment) return;

  reviewsData.unshift({ author, item, rating, comment });

  // Update product review count dynamically
  const targetProd = products.find((p) => p.name === item);
  if (targetProd) {
    targetProd.reviewsCount += 1;
    renderProducts();
  }

  renderReviews();
  reviewForm.reset();
  showToast(`Thank you ${author}! Your ${rating}★ rating is now live.`);
});

// ==========================================
// 4. CART DRAWER & CHECKOUT
// ==========================================
function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  cart.push(product);
  updateCartUI();
  showToast(`Added "${product.name}" to cart!`);
}

function addBundleToCart() {
  cart.push({
    id: 99,
    name: 'Ego Shadow Crown VIP Bundle',
    price: 49.00
  });
  updateCartUI();
  openCart();
  showToast('VIP Bundle added to your cart!');
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function updateCartUI() {
  document.getElementById('cart-count').textContent = cart.length;
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-msg">Your cart is empty. Select an item from the night drop!</p>';
    cartTotalEl.textContent = '$0.00';
    return;
  }

  let total = 0;
  cartItemsEl.innerHTML = cart
    .map((item, idx) => {
      total += item.price;
      return `
        <div class="cart-item">
          <div>
            <strong>${item.name}</strong>
            <div style="color:#c4b5fd;font-size:0.85rem;">$${item.price.toFixed(2)}</div>
          </div>
          <button class="remove-item" onclick="removeFromCart(${idx})">Remove</button>
        </div>
      `;
    })
    .join('');

  cartTotalEl.textContent = `$${total.toFixed(2)}`;
}

const cartDrawer = document.getElementById('cart-drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');

function openCart() {
  cartDrawer.classList.add('open');
  drawerBackdrop.classList.add('show');
}

function closeCart() {
  cartDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('show');
}

document.getElementById('cart-btn').addEventListener('click', openCart);
document.getElementById('close-cart').addEventListener('click', closeCart);
drawerBackdrop.addEventListener('click', closeCart);

document.getElementById('checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  cart = [];
  updateCartUI();
  closeCart();
  showToast('Order confirmed! Thank you for shopping at EGO GOATSTORE.');
});

// Toast Helper
let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// Initial Setup
populateReviewDropdown();
renderProducts();
renderReviews();
