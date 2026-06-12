
const DEFAULT_PRODUCTS = [

  { id: 1, name: 'Coxinha de Frango', description: 'Massa crocante com recheio cremoso de frango desfiado e catupiry', price: 5.00, category: 'salgados', image: 'data:image/webp;base64,UklGRu4CAABXRUJQVlA4IOICAABwFQCdASqQAIsAPtlsrFEoJjcip5NpquAbCWMO62HBcQ6EwcsOZWD16eKHzJRZ5lT3Izs1auuIAiQD3qfLu2JVYzSQsKZDAmil0/R2dzUVGDgHkmxouIZcFhRl15pOwX7cxYgmkIqS+lmiV51urroLEHSNg++UIwFnFuIQ1E4cwRl995E933+WTtL5AQURzTNIygldpeO8auLWhVSylBfSKT1pwZzn8pTpzC1FcrjNAhM0xGoA/vP7YMzvrxIGf2w6v9qg0/05NsJk4i6pDLsv8OvRGzHojh8uFnxLCR3bFDyLWF/TsbYmtOFcCYT5IpSHi5B4Y3No5hAQNyvdobgfvCx+AFWE97wEhCkcoW702qqDBTeSERAt1CiBaxY5wpl7mlxwENR2hnqd1km9RRCjcuF60KRk0HIabumKbYP3RoIPd5NYoreYKUTV4RQ2OSM8dcAOqrgCB3lYqgqqI/qx6haABq6grhDintHeuffnH5Y2jxUllNbwuOQekN+C8axfatDRA65/deJMdQXtD5qtDOycYdnQTT1bXLvuuyzckxaNbmRVqtBz3WxG1AFjmmKHeiCHEe+x8hSnubi/PbOkWh8pEi1ycwamr77zPCxKqiADeB+m2dgytBCpEJHnaYDWfSA2VTcFMdPDCtP40GLcQWXGYYEvCU+SsW3JWDSUFqI3SNBb4/7TgWx/MwXvBAzKfTzdaYJYfU2I/RPr5HPtXRE7cnSoUfkZwC1ZbLoYErQCNhuCpWNaLFlwFNtZU8VcNjlFCypeXv6FwHPZDUI1xD8e5w8cFkgobeAfhDgbVIheGZjmS+ZFv0G1reKo7JZ3NPmydWIKm3sUsLAkAlCPH8YdlFbGxERW3DG2x6ldcY8mdGwxpfUVKH4YAZJn3FcSSQFkRdhkv9wbtRl8FM5Napz7SE4lafnGuSiyZbhredlewOK/af0d88lL+XAHAamo57JQT0/KY2vpkRmq4hZgAAA=' },
];

const state = {
  currentView: 'home',
  products: [],
  cart: [],
  activeCategory: 'todos',
  searchQuery: '',
  theme: 'light',
  cartOpen: false,
  sidebarOpen: false,
  editingProductId: null,
  selectedPickupTime: null,
  nextProductId: 20,
  orders: []
};

function loadFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Erro ao carregar ${key}:`, e);
    return fallback;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Erro ao salvar ${key}:`, e);
  }
}

function initApp() {

  state.products = loadFromStorage('cantina_products', DEFAULT_PRODUCTS);
  state.cart = loadFromStorage('cantina_cart', []);
  state.theme = loadFromStorage('cantina_theme', 'light');
  state.nextProductId = loadFromStorage('cantina_nextId', 20);

  applyTheme(state.theme);

  renderPickupTimes();

  renderAll();

  updateCartBadge();

  refreshIcons();

  console.log('🍕 Cantina Virtual inicializada com sucesso!');
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme(state.theme);
  saveToStorage('cantina_theme', state.theme);
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function switchView(view) {
  state.currentView = view;

  document.querySelectorAll('.view-section').forEach(el => {
    el.classList.add('hidden');
  });

  const target = document.getElementById(`view-${view}`);
  if (target) {
    target.classList.remove('hidden');
    target.style.animation = 'none';
    target.offsetHeight; 
    target.style.animation = '';
  }

  updateActiveNav(view);

  if (view === 'home') renderHomeProducts();
  if (view === 'menu') renderMenuProducts();
  if (view === 'checkout') renderCheckout();
  if (view === 'admin') renderAdminProducts();

  window.scrollTo({ top: 0, behavior: 'smooth' });

  refreshIcons();
}

function updateActiveNav(view) {

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
}

function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (state.sidebarOpen) {
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      overlay.classList.remove('opacity-0');
      sidebar.classList.remove('-translate-x-full');
    });
  } else {
    overlay.classList.add('opacity-0');
    sidebar.classList.add('-translate-x-full');
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 300);
  }
}

function toggleCart() {
  state.cartOpen = !state.cartOpen;
  const panel = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');

  if (state.cartOpen) {
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      overlay.classList.remove('opacity-0');
      panel.classList.remove('translate-x-full');
    });
    renderCartPanel();
  } else {
    overlay.classList.add('opacity-0');
    panel.classList.add('translate-x-full');
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 300);
  }
}

function goToCheckout() {
  if (state.cart.length === 0) {
    showToast('Adicione itens ao carrinho primeiro!', 'error');
    return;
  }
  toggleCart();
  switchView('checkout');
}

function getFilteredProducts() {
  let products = [...state.products];

  if (state.activeCategory !== 'todos') {
    products = products.filter(p => p.category === state.activeCategory);
  }

  if (state.searchQuery.trim()) {
    const query = state.searchQuery.toLowerCase().trim();
    products = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }

  return products;
}

function renderProductCard(product) {
  const cartItem = state.cart.find(c => c.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;

  const categoryEmoji = {
    salgados: '🥟',
    doces: '🍰',
    bebidas: '🥤',
    combos: '🎉'
  };

  let actionBtn = '';
  if (qty > 0) {
    actionBtn = `
      <div class="card-qty-controls">
        <button onclick="updateCartQuantity(${product.id}, -1)" class="card-qty-btn">−</button>
        <span class="card-qty-value">${qty}</span>
        <button onclick="updateCartQuantity(${product.id}, 1)" class="card-qty-btn">+</button>
      </div>
    `;
  } else {
    actionBtn = `
      <button onclick="addToCart(${product.id})" class="btn-add-cart">
        <i data-lucide="plus" class="w-4 h-4"></i> Adicionar
      </button>
    `;
  }

  return `
    <div class="product-card animate-fade-in-up" style="animation-fill-mode: both;">
      <div class="relative overflow-hidden">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='http://static.photos/food/320x240'">
        <span class="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/80 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-sm">
          ${categoryEmoji[product.category] || '🍽️'} ${capitalize(product.category)}
        </span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${product.name}</h3>
        <p class="card-desc">${product.description}</p>
        <div class="card-footer">
          <span class="card-price">${formatCurrency(product.price)}</span>
          ${actionBtn}
        </div>
      </div>
    </div>
  `;
}

function renderHomeProducts() {
  const container = document.getElementById('home-products');
  const emptyState = document.getElementById('home-empty');
  const products = getFilteredProducts();

  if (products.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    container.innerHTML = products.map(p => renderProductCard(p)).join('');
  }

  refreshIcons();
}

function renderMenuProducts() {
  const container = document.getElementById('menu-products');
  const emptyState = document.getElementById('menu-empty');
  const products = getFilteredProducts();

  if (products.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    container.innerHTML = products.map(p => renderProductCard(p)).join('');
  }

  refreshIcons();
}

function renderAll() {
  renderHomeProducts();
  renderMenuProducts();
  updateCategoryPills();
}

function filterCategory(category) {
  state.activeCategory = category;
  updateCategoryPills();
  renderHomeProducts();
  renderMenuProducts();
}

function updateCategoryPills() {
  document.querySelectorAll('.category-pill, .category-pill-sm').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.cat === state.activeCategory);
  });
}

function handleSearch(value) {
  state.searchQuery = value;
  // Sincronizar os dois campos de busca
  const homeSearch = document.getElementById('home-search');
  const menuSearch = document.getElementById('menu-search');
  if (homeSearch) homeSearch.value = value;
  if (menuSearch) menuSearch.value = value;

  renderHomeProducts();
  renderMenuProducts();
}

function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const existing = state.cart.find(c => c.id === productId);
  if (existing) {
    existing.quantity++;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartBadge();
  renderHomeProducts();
  renderMenuProducts();

  if (state.cartOpen) renderCartPanel();

  showToast(`${product.name} adicionado ao carrinho! 🛒`, 'success');
}

function updateCartQuantity(productId, delta) {
  const item = state.cart.find(c => c.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(c => c.id !== productId);
  }

  saveCart();
  updateCartBadge();
  renderHomeProducts();
  renderMenuProducts();

  if (state.cartOpen) renderCartPanel();
  if (state.currentView === 'checkout') renderCheckout();
}

function removeFromCart(productId) {
  const item = state.cart.find(c => c.id === productId);
  if (!item) return;

  state.cart = state.cart.filter(c => c.id !== productId);
  saveCart();
  updateCartBadge();
  renderHomeProducts();
  renderMenuProducts();

  if (state.cartOpen) renderCartPanel();
  if (state.currentView === 'checkout') renderCheckout();

  showToast(`${item.name} removido do carrinho`, 'info');
}

function getCartSubtotal() {
  return state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartItemCount() {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
  const count = getCartItemCount();
  const badge = document.getElementById('cart-badge');
  const badgeMobile = document.getElementById('cart-badge-mobile');

  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.classList.remove('hidden');
    badge.classList.add('badge-pulse');
    badgeMobile.textContent = count > 99 ? '99+' : count;
    badgeMobile.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
    badgeMobile.classList.add('hidden');
  }
}

function saveCart() {

  saveToStorage('cantina_cart', state.cart);
}

function renderCartPanel() {
  const itemsContainer = document.getElementById('cart-items');
  const emptyState = document.getElementById('cart-empty');
  const footer = document.getElementById('cart-footer');

  if (state.cart.length === 0) {
    itemsContainer.innerHTML = '';
    emptyState.classList.remove('hidden');
    footer.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  footer.classList.remove('hidden');

  itemsContainer.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='http://static.photos/food/320x240'">
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-sm dark:text-white truncate">${item.name}</h4>
        <span class="text-primary-500 font-bold text-sm">${formatCurrency(item.price * item.quantity)}</span>
        <div class="flex items-center gap-2 mt-1.5">
          <button onclick="updateCartQuantity(${item.id}, -1)" class="cart-qty-btn">−</button>
          <span class="font-bold text-sm dark:text-white w-6 text-center">${item.quantity}</span>
          <button onclick="updateCartQuantity(${item.id}, 1)" class="cart-qty-btn">+</button>
          <button onclick="removeFromCart(${item.id})" class="cart-remove-btn ml-auto">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  const subtotal = getCartSubtotal();
  document.getElementById('cart-subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('cart-total').textContent = formatCurrency(subtotal);

  refreshIcons();
}

function renderCheckout() {
  const listContainer = document.getElementById('checkout-items-list');
  const totalEl = document.getElementById('checkout-total');
  const emptyCart = document.getElementById('checkout-empty-cart');
  const formSection = document.querySelectorAll('#checkout-form-section, #payment-section, #pickup-section');

  if (state.cart.length === 0) {
    listContainer.innerHTML = '';
    emptyCart.classList.remove('hidden');
    formSection.forEach(el => el.classList.add('hidden'));
    return;
  }

  emptyCart.classList.add('hidden');
  formSection.forEach(el => el.classList.remove('hidden'));

  listContainer.innerHTML = state.cart.map(item => `
    <div class="checkout-item">
      <div class="flex items-center gap-2">
        <span class="dark:text-white font-medium">${item.quantity}x</span>
        <span class="text-gray-600 dark:text-gray-400">${item.name}</span>
      </div>
      <span class="font-semibold dark:text-white">${formatCurrency(item.price * item.quantity)}</span>
    </div>
  `).join('');

  totalEl.textContent = formatCurrency(getCartSubtotal());
  refreshIcons();
}

function renderPickupTimes() {
  const container = document.getElementById('pickup-times');
  const times = [];
  for (let h = 7; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  container.innerHTML = times.map(time => `
    <button onclick="selectPickupTime('${time}')" class="pickup-slot" data-time="${time}">${time}</button>
  `).join('');
}

function selectPickupTime(time) {
  state.selectedPickupTime = time;
  document.querySelectorAll('.pickup-slot').forEach(slot => {
    slot.classList.toggle('active', slot.dataset.time === time);
  });
}

function finalizeOrder() {

  if (state.cart.length === 0) {
    showToast('Carrinho vazio! Adicione itens primeiro.', 'error');
    return;
  }

  const name = document.getElementById('student-name').value.trim();
  const ra = document.getElementById('student-ra').value.trim();
  const course = document.getElementById('student-course').value;
  const payment = document.querySelector('input[name="payment"]:checked')?.value;
  const pickup = state.selectedPickupTime;

  if (!name) { showToast('Informe seu nome completo!', 'error'); return; }
  if (!ra) { showToast('Informe seu RA/Matrícula!', 'error'); return; }
  if (!course) { showToast('Selecione seu curso!', 'error'); return; }
  if (!pickup) { showToast('Selecione o horário de retirada!', 'error'); return; }

  const orderNumber = Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const paymentLabels = { pix: 'PIX', cartao: 'Cartão', dinheiro: 'Dinheiro' };

  const order = {
    number: orderNumber,
    date: dateStr,
    name,
    ra,
    course,
    items: state.cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    })),
    total: getCartSubtotal(),
    payment: paymentLabels[payment] || payment,
    paymentType: payment,
    pickup
  };

  const pixKey = '41998786776';
  const pixPayload = `41988270345`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixPayload)}&color=7B2CBF&bgcolor=FFFFFF`;

  document.getElementById('receipt-order-number').textContent = `#${orderNumber}`;
  document.getElementById('receipt-date').textContent = dateStr;
  document.getElementById('receipt-name').textContent = name;
  document.getElementById('receipt-ra').textContent = ra;
  document.getElementById('receipt-course').textContent = course;

  document.getElementById('receipt-items').innerHTML = order.items.map(item => `
    <div class="receipt-item-row">
      <span class="text-gray-600 dark:text-gray-400">${item.quantity}x ${item.name}</span>
      <span class="font-semibold dark:text-white">${formatCurrency(item.total)}</span>
    </div>
  `).join('');

  document.getElementById('receipt-total').textContent = formatCurrency(order.total);
  document.getElementById('receipt-payment').textContent = order.payment;
  document.getElementById('receipt-pickup').textContent = order.pickup;

  const qrSection = document.getElementById('receipt-qr-section');
  if (payment === 'pix') {
    qrSection.classList.remove('hidden');
    document.getElementById('receipt-qr-code').src = qrCodeUrl;
    document.getElementById('receipt-pix-key').textContent = `Chave: ${pixKey}`;
  } else {
    qrSection.classList.add('hidden');
  }

  state.orders.push(order);
  saveToStorage('cantina_orders', state.orders);

  state.cart = [];
  saveCart();
  updateCartBadge();

  document.getElementById('student-name').value = '';
  document.getElementById('student-ra').value = '';
  document.getElementById('student-course').value = '';
  state.selectedPickupTime = null;
  document.querySelectorAll('.pickup-slot').forEach(s => s.classList.remove('active'));

  document.getElementById('receipt-modal').classList.remove('hidden');

  refreshIcons();
}

function closeReceipt() {
  document.getElementById('receipt-modal').classList.add('hidden');
  switchView('home');
}

function renderAdminProducts() {
  const tbody = document.getElementById('admin-products-list');

  if (state.products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-12 text-gray-400">
          <p class="text-lg mb-2">Nenhum produto cadastrado</p>
          <button onclick="openProductForm()" class="text-primary-500 font-semibold hover:underline">Cadastrar primeiro produto</button>
        </td>
      </tr>
    `;
    return;
  }

  const categoryLabels = {
    salgados: '🥟 Salgados',
    doces: '🍰 Doces',
    bebidas: '🥤 Bebidas',
    combos: '🎉 Combos'
  };

  tbody.innerHTML = state.products.map(p => `
    <tr class="admin-product-row">
      <td>
        <div class="flex items-center">
          <img src="${p.image}" alt="${p.name}" class="admin-product-img" onerror="this.src='http://static.photos/food/320x240'">
          <div>
            <p class="font-semibold dark:text-white">${p.name}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 max-w-[200px]">${p.description}</p>
          </div>
        </div>
      </td>
      <td class="hidden sm:table-cell">
        <span class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-lg">${categoryLabels[p.category] || p.category}</span>
      </td>
      <td class="text-right font-bold text-primary-500">${formatCurrency(p.price)}</td>
      <td>
        <div class="flex items-center justify-center gap-2">
          <button onclick="editProduct(${p.id})" class="admin-action-btn edit" title="Editar">
            <i data-lucide="pencil" class="w-4 h-4"></i>
          </button>
          <button onclick="deleteProduct(${p.id})" class="admin-action-btn delete" title="Excluir">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  refreshIcons();
}

function openProductForm(product = null) {
  const modal = document.getElementById('product-form-modal');
  const title = document.getElementById('form-title');

  if (product) {
    title.textContent = 'Editar Produto';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-desc').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-cat').value = product.category;
    document.getElementById('product-img').value = product.image;
    state.editingProductId = product.id;
  } else {
    title.textContent = 'Novo Produto';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    state.editingProductId = null;
  }

  modal.classList.remove('hidden');
  refreshIcons();
}

function closeProductForm() {
  document.getElementById('product-form-modal').classList.add('hidden');
  state.editingProductId = null;
}

function saveProduct(event) {
  event.preventDefault();

  const id = document.getElementById('product-id').value;
  const name = document.getElementById('product-name').value.trim();
  const description = document.getElementById('product-desc').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);
  const category = document.getElementById('product-cat').value;
  let image = document.getElementById('product-img').value.trim();

  if (!image) {
    const catSeeds = { salgados: 10, doces: 20, bebidas: 30, combos: 40 };
    const seed = (catSeeds[category] || 1) + Math.floor(Math.random() * 5);
    image = `http://static.photos/food/320x240/${seed}`;
  }

  if (state.editingProductId) {
    const index = state.products.findIndex(p => p.id === state.editingProductId);
    if (index !== -1) {
      state.products[index] = { ...state.products[index], name, description, price, category, image };
      showToast('Produto atualizado com sucesso! ✏️', 'success');
    }
  } else {

    const newProduct = {
      id: state.nextProductId++,
      name,
      description,
      price,
      category,
      image
    };
    state.products.push(newProduct);
    saveToStorage('cantina_nextId', state.nextProductId);
    showToast('Produto cadastrado com sucesso! 🎉', 'success');
  }

  saveToStorage('cantina_products', state.products);
  closeProductForm();
  renderAdminProducts();
  renderHomeProducts();
  renderMenuProducts();
}

function editProduct(productId) {
  const product = state.products.find(p => p.id === productId);
  if (product) {
    openProductForm(product);
  }
}

function deleteProduct(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  if (!confirm(`Deseja realmente excluir "${product.name}"?`)) return;

  state.products = state.products.filter(p => p.id !== productId);
  state.cart = state.cart.filter(c => c.id !== productId);

  saveToStorage('cantina_products', state.products);
  saveCart();
  updateCartBadge();

  renderAdminProducts();
  renderHomeProducts();
  renderMenuProducts();

  if (state.currentView === 'checkout') renderCheckout();

  showToast('Produto excluído com sucesso! 🗑️', 'info');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="ml-2 hover:opacity-70 transition-opacity">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(toast);
  refreshIcons();

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function refreshIcons() {
  if (typeof lucide !== 'undefined') {
    try {
      lucide.createIcons();
    } catch (e) {
    
    }
  }
}

document.addEventListener('click', (e) => {
  const productFormModal = document.getElementById('product-form-modal');
  if (productFormModal && !productFormModal.classList.contains('hidden')) {
    const modalContent = productFormModal.querySelector('div');
    if (!modalContent.contains(e.target) && e.target === productFormModal) {
      closeProductForm();
    }
  }
});

document.addEventListener('click', (e) => {
  const receiptModal = document.getElementById('receipt-modal');
  if (receiptModal && !receiptModal.classList.contains('hidden')) {
    const modalContent = receiptModal.querySelector('div');
    if (!modalContent.contains(e.target) && e.target === receiptModal) {
      closeReceipt();
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!document.getElementById('receipt-modal')?.classList.contains('hidden')) {
      closeReceipt();
    } else if (!document.getElementById('product-form-modal')?.classList.contains('hidden')) {
      closeProductForm();
    } else if (state.cartOpen) {
      toggleCart();
    } else if (state.sidebarOpen) {
      toggleSidebar();
    }
  }
});

document.addEventListener('DOMContentLoaded', initApp);