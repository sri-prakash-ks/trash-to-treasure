/**
 * WasteMart - Products & Listings Management
 */

// Category image map helper
const CATEGORY_DEFAULT_IMAGES = {
  'Plastic': 'assets/images/prod-plastic-bottles.jpg',
  'Paper': 'assets/images/prod-paper-scrap.jpg',
  'Metal': 'assets/images/prod-copper-scrap.jpg',
  'Glass': 'assets/images/prod-glass-bottles.jpg',
  'E-Waste': 'assets/images/prod-electronic-scrap.jpg',
  'Cardboard': 'assets/images/prod-cardboard-bales.jpg',
  'Rubber': 'assets/images/prod-rubber-scrap.jpg',
  'Textile': 'assets/images/prod-textile-scrap.jpg',
  'Other': 'assets/images/hero-recycling.jpg'
};

// Render Product Card HTML component
function createProductCardHTML(product) {
  const isOutOfStock = product.quantity <= 0 || product.status === 'Sold Out';
  const imgUrl = product.imageUrl || CATEGORY_DEFAULT_IMAGES[product.category] || 'assets/images/prod-plastic-bottles.jpg';

  return `
    <div class="product-card ${isOutOfStock ? 'is-out-of-stock' : ''}" data-id="${product.id}">
      <div class="product-card-img-wrap">
        <img src="${imgUrl}" alt="${product.name}" class="product-card-img" loading="lazy" onerror="this.src='assets/images/prod-plastic-bottles.jpg'">
        <span class="product-category-pill">${product.category}</span>
        ${isOutOfStock ? '<span class="badge-stock-out">Sold Out</span>' : ''}
      </div>
      <div class="product-card-body">
        <h3 class="product-card-title">
          <a href="product.html?id=${product.id}">${product.name}</a>
        </h3>
        
        <div class="product-card-meta">
          <span class="product-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${product.location}
          </span>
          <span class="product-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            ${product.sellerName || 'Verified Seller'}
          </span>
        </div>

        <div class="product-card-pricing">
          <div>
            <span class="price-value">₹${Number(product.price).toLocaleString('en-IN')}</span>
            <span class="price-unit">/ ${product.unit}</span>
          </div>
          <div class="stock-badge">
            Stock: <strong>${product.quantity} ${product.unit}</strong>
          </div>
        </div>

        <div class="product-card-actions">
          <a href="product.html?id=${product.id}" class="btn btn-outline btn-sm">View Details</a>
          <button type="button" class="btn btn-primary btn-sm btn-add-cart" 
            onclick="addToCart('${product.id}', 1)" ${isOutOfStock ? 'disabled' : ''}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// Home Page Featured Products (Latest 6)
// ----------------------------------------------------
function renderLatestProducts(containerId = 'latestProductsGrid') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const products = getProducts();
  const latest = [...products].reverse().slice(0, 6);

  if (latest.length === 0) {
    container.innerHTML = '<p class="text-center text-muted">No waste materials listed yet.</p>';
    return;
  }

  container.innerHTML = latest.map(p => createProductCardHTML(p)).join('');
}

// ----------------------------------------------------
// Shop / Browse Waste Page Filtering & Search
// ----------------------------------------------------
let activeCategory = 'All';
let activeLocation = 'All';
let activeSort = 'newest';
let activeSearchTerm = '';

function initShopPage() {
  const grid = document.getElementById('shopProductsGrid');
  if (!grid) return;

  // Read URL query params if any (e.g. ?category=Metal or ?search=copper)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('category')) {
    activeCategory = urlParams.get('category');
  }
  if (urlParams.has('search')) {
    activeSearchTerm = urlParams.get('search');
    const searchInput = document.getElementById('shopSearchInput');
    if (searchInput) searchInput.value = activeSearchTerm;
  }

  // Populate Location Dropdown options dynamically from existing products
  populateLocationFilter();

  // Attach event listeners
  const searchInput = document.getElementById('shopSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearchTerm = e.target.value.trim().toLowerCase();
      applyFiltersAndRenderShop();
    });
  }

  const sortSelect = document.getElementById('shopSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      applyFiltersAndRenderShop();
    });
  }

  const locationSelect = document.getElementById('shopLocationSelect');
  if (locationSelect) {
    locationSelect.addEventListener('change', (e) => {
      activeLocation = e.target.value;
      applyFiltersAndRenderShop();
    });
  }

  // Category filter pills
  const catButtons = document.querySelectorAll('.category-filter-btn');
  catButtons.forEach(btn => {
    if (btn.dataset.category === activeCategory) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      applyFiltersAndRenderShop();
    });
  });

  applyFiltersAndRenderShop();
}

function populateLocationFilter() {
  const select = document.getElementById('shopLocationSelect');
  if (!select) return;

  const products = getProducts();
  const locations = [...new Set(products.map(p => p.location).filter(Boolean))].sort();

  select.innerHTML = '<option value="All">All Locations</option>' +
    locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
}

function applyFiltersAndRenderShop() {
  const grid = document.getElementById('shopProductsGrid');
  const countEl = document.getElementById('productCountText');
  if (!grid) return;

  let products = getProducts();

  // 1. Filter by Category
  if (activeCategory && activeCategory !== 'All') {
    products = products.filter(p => p.category && p.category.toLowerCase() === activeCategory.toLowerCase());
  }

  // 2. Filter by Location
  if (activeLocation && activeLocation !== 'All') {
    products = products.filter(p => p.location && p.location.toLowerCase() === activeLocation.toLowerCase());
  }

  // 3. Search Filter
  if (activeSearchTerm) {
    products = products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const loc = (p.location || '').toLowerCase();
      const seller = (p.sellerName || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(activeSearchTerm) ||
             cat.includes(activeSearchTerm) ||
             loc.includes(activeSearchTerm) ||
             seller.includes(activeSearchTerm) ||
             desc.includes(activeSearchTerm);
    });
  }

  // 4. Sort
  if (activeSort === 'price-low') {
    products.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (activeSort === 'price-high') {
    products.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (activeSort === 'quantity-high') {
    products.sort((a, b) => Number(b.quantity) - Number(a.quantity));
  } else {
    // Newest first by default
    products.reverse();
  }

  // Update counter
  if (countEl) {
    countEl.textContent = `Showing ${products.length} material${products.length === 1 ? '' : 's'}`;
  }

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-box col-span-full">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h3>No matching waste materials found</h3>
        <p class="text-muted">Try adjusting your search terms, changing the category, or selecting another location.</p>
        <button class="btn btn-outline btn-sm mt-3" onclick="resetShopFilters()">Clear All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => createProductCardHTML(p)).join('');
}

function resetShopFilters() {
  activeCategory = 'All';
  activeLocation = 'All';
  activeSort = 'newest';
  activeSearchTerm = '';

  const searchInput = document.getElementById('shopSearchInput');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('shopSortSelect');
  if (sortSelect) sortSelect.value = 'newest';

  const locSelect = document.getElementById('shopLocationSelect');
  if (locSelect) locSelect.value = 'All';

  const catButtons = document.querySelectorAll('.category-filter-btn');
  catButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === 'All');
  });

  applyFiltersAndRenderShop();
}

// ----------------------------------------------------
// Single Product Detail Page
// ----------------------------------------------------
function renderProductDetailPage() {
  const container = document.getElementById('productDetailContainer');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    container.innerHTML = `
      <div class="empty-state-box">
        <h3>No Product Specified</h3>
        <p class="text-muted">Please select a waste material from our marketplace.</p>
        <a href="shop.html" class="btn btn-primary mt-3">Browse Marketplace</a>
      </div>
    `;
    return;
  }

  const product = getProductById(productId);

  if (!product) {
    container.innerHTML = `
      <div class="empty-state-box">
        <h3>Product Not Found</h3>
        <p class="text-muted">The requested listing may have been removed or sold out.</p>
        <a href="shop.html" class="btn btn-primary mt-3">Browse Available Waste</a>
      </div>
    `;
    return;
  }

  const isOutOfStock = product.quantity <= 0 || product.status === 'Sold Out';
  const imgUrl = product.imageUrl || CATEGORY_DEFAULT_IMAGES[product.category] || 'assets/images/prod-plastic-bottles.jpg';

  container.innerHTML = `
    <div class="product-detail-layout">
      <!-- Left: Large Image & Gallery -->
      <div class="product-detail-gallery">
        <div class="product-detail-main-img-wrap">
          <img src="${imgUrl}" alt="${product.name}" id="detailMainImg" class="product-detail-main-img" onerror="this.src='assets/images/prod-plastic-bottles.jpg'">
          <span class="product-category-pill">${product.category}</span>
        </div>
      </div>

      <!-- Right: Detailed Information & Actions -->
      <div class="product-detail-info">
        <div class="product-detail-header">
          <div class="breadcrumbs">
            <a href="index.html">Home</a> &gt; 
            <a href="shop.html">Browse Waste</a> &gt; 
            <a href="shop.html?category=${product.category}">${product.category}</a>
          </div>
          <h1 class="product-detail-title">${product.name}</h1>
          <div class="product-detail-meta-row">
            <span class="badge badge-category">${product.category}</span>
            <span class="meta-location">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              ${product.location}
            </span>
            <span class="meta-date">Posted: ${product.createdAt || 'Recent'}</span>
          </div>
        </div>

        <div class="product-detail-price-box">
          <div class="price-display">
            <span class="currency">₹</span>
            <span class="amount">${Number(product.price).toLocaleString('en-IN')}</span>
            <span class="unit">per ${product.unit}</span>
          </div>
          <div class="stock-status-pill ${isOutOfStock ? 'stock-out' : 'stock-in'}">
            ${isOutOfStock ? 'Out of Stock' : `In Stock: ${product.quantity} ${product.unit} available`}
          </div>
        </div>

        <div class="product-detail-description">
          <h4>Material Description &amp; Specifications</h4>
          <p>${product.description || 'No detailed specifications provided for this listing.'}</p>
        </div>

        <!-- Seller Profile Card -->
        <div class="seller-info-card">
          <div class="seller-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="seller-details">
            <h5>${product.sellerName || 'Verified Recycler'}</h5>
            <p class="seller-location">Location: ${product.location} &bull; Contact: ${product.sellerPhone || 'Verified Member'}</p>
          </div>
        </div>

        <!-- Purchase Controls -->
        <div class="product-order-controls">
          <div class="qty-selector-wrap">
            <label for="detailQtyInput">Quantity (${product.unit}):</label>
            <div class="qty-control-group">
              <button type="button" class="btn-qty" onclick="adjustDetailQty(-1, ${product.quantity})">-</button>
              <input type="number" id="detailQtyInput" class="qty-input" value="1" min="1" max="${product.quantity}" 
                oninput="validateDetailQty(this, ${product.quantity})">
              <button type="button" class="btn-qty" onclick="adjustDetailQty(1, ${product.quantity})">+</button>
            </div>
          </div>

          <div class="detail-action-buttons">
            <button type="button" class="btn btn-outline btn-lg" 
              onclick="handleDetailAddToCart('${product.id}')" ${isOutOfStock ? 'disabled' : ''}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add to Cart
            </button>
            <button type="button" class="btn btn-primary btn-lg" 
              onclick="handleDetailBuyNow('${product.id}')" ${isOutOfStock ? 'disabled' : ''}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function adjustDetailQty(delta, maxStock) {
  const input = document.getElementById('detailQtyInput');
  if (!input) return;
  let val = parseInt(input.value, 10) || 1;
  val += delta;
  if (val < 1) val = 1;
  if (val > maxStock) val = maxStock;
  input.value = val;
}

function validateDetailQty(input, maxStock) {
  let val = parseInt(input.value, 10);
  if (isNaN(val) || val < 1) val = 1;
  if (val > maxStock) val = maxStock;
  input.value = val;
}

function handleDetailAddToCart(productId) {
  const input = document.getElementById('detailQtyInput');
  const qty = input ? parseInt(input.value, 10) : 1;
  addToCart(productId, qty);
}

function handleDetailBuyNow(productId) {
  const input = document.getElementById('detailQtyInput');
  const qty = input ? parseInt(input.value, 10) : 1;
  const added = addToCart(productId, qty);
  if (added) {
    window.location.href = 'checkout.html';
  }
}

// ----------------------------------------------------
// Sell Waste Listing Creation
// ----------------------------------------------------
function handleCreateListingSubmit(e) {
  e.preventDefault();

  const user = getCurrentUser();
  if (!user) {
    showToast('Please log in as a seller to list waste materials.', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    return;
  }

  const name = document.getElementById('wasteName').value.trim();
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value.trim();
  const price = parseFloat(document.getElementById('price').value);
  const quantity = parseFloat(document.getElementById('quantity').value);
  const unit = document.getElementById('unit').value;
  const location = document.getElementById('location').value.trim();
  let imageUrl = document.getElementById('imageUrl').value.trim();
  const sellerNameInput = document.getElementById('sellerName');
  const sellerName = (sellerNameInput && sellerNameInput.value.trim()) || user.name || 'Verified Seller';

  if (!name || !category || isNaN(price) || isNaN(quantity) || !location) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  if (price <= 0 || quantity <= 0) {
    showToast('Price and quantity must be greater than zero.', 'error');
    return;
  }

  if (!imageUrl) {
    imageUrl = CATEGORY_DEFAULT_IMAGES[category] || 'assets/images/prod-plastic-bottles.jpg';
  }

  const newProduct = {
    id: 'PROD' + Date.now().toString().slice(-6),
    name,
    category,
    description,
    price,
    quantity,
    unit,
    location,
    imageUrl,
    sellerId: user.id || 'USR_SELLER',
    sellerName: sellerName,
    sellerPhone: user.phone || '+91 98765 43210',
    status: 'Active',
    createdAt: new Date().toISOString().split('T')[0]
  };

  const products = getProducts();
  products.push(newProduct);
  saveProducts(products);

  showToast('Waste listing created successfully!', 'success');
  setTimeout(() => {
    window.location.href = 'my-listings.html';
  }, 1200);
}

// ----------------------------------------------------
// My Listings (Seller) Management
// ----------------------------------------------------
function renderMyListings() {
  const tableBody = document.getElementById('myListingsTableBody');
  const emptyState = document.getElementById('myListingsEmptyState');
  if (!tableBody) return;

  const user = getCurrentUser();
  if (!user) return;

  let products = getProducts();
  // If admin, show all; if seller, show their own
  if (user.userType !== 'admin') {
    products = products.filter(p => String(p.sellerId) === String(user.id) || p.sellerName === user.name);
  }

  if (products.length === 0) {
    if (tableBody.closest('table')) tableBody.closest('table').style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (tableBody.closest('table')) tableBody.closest('table').style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';

  tableBody.innerHTML = products.map(product => {
    const isSoldOut = product.quantity <= 0 || product.status === 'Sold Out';
    return `
      <tr>
        <td>
          <div class="cart-item-info">
            <img src="${product.imageUrl || 'assets/images/prod-plastic-bottles.jpg'}" alt="${product.name}" class="table-thumb" onerror="this.src='assets/images/prod-plastic-bottles.jpg'">
            <div>
              <strong>${product.name}</strong>
              <div class="text-muted text-sm">${product.location} &bull; ${product.category}</div>
            </div>
          </div>
        </td>
        <td><strong>₹${Number(product.price).toLocaleString('en-IN')}</strong> / ${product.unit}</td>
        <td>${product.quantity} ${product.unit}</td>
        <td>
          <span class="badge ${isSoldOut ? 'badge-cancelled' : 'badge-completed'}">
            ${isSoldOut ? 'Sold Out' : 'Active'}
          </span>
        </td>
        <td>${product.createdAt || 'N/A'}</td>
        <td class="text-right">
          <div class="action-btn-group">
            <button class="btn btn-sm btn-outline" onclick="openEditListingModal('${product.id}')" title="Edit Listing">
              Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="confirmDeleteListing('${product.id}')" title="Delete Listing">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openEditListingModal(productId) {
  const product = getProductById(productId);
  if (!product) return;

  document.getElementById('editListingId').value = product.id;
  document.getElementById('editWasteName').value = product.name;
  document.getElementById('editCategory').value = product.category;
  document.getElementById('editPrice').value = product.price;
  document.getElementById('editQuantity').value = product.quantity;
  document.getElementById('editUnit').value = product.unit;
  document.getElementById('editLocation').value = product.location;
  document.getElementById('editDescription').value = product.description || '';
  document.getElementById('editStatus').value = product.status || 'Active';

  openModal('editListingModal');
}

function saveEditedListing(e) {
  e.preventDefault();
  const id = document.getElementById('editListingId').value;
  const products = getProducts();
  const index = products.findIndex(p => String(p.id) === String(id));

  if (index === -1) {
    showToast('Listing not found.', 'error');
    return;
  }

  products[index].name = document.getElementById('editWasteName').value.trim();
  products[index].category = document.getElementById('editCategory').value;
  products[index].price = parseFloat(document.getElementById('editPrice').value);
  products[index].quantity = parseFloat(document.getElementById('editQuantity').value);
  products[index].unit = document.getElementById('editUnit').value;
  products[index].location = document.getElementById('editLocation').value.trim();
  products[index].description = document.getElementById('editDescription').value.trim();
  products[index].status = document.getElementById('editStatus').value;

  saveProducts(products);
  closeModal('editListingModal');
  showToast('Listing updated successfully!', 'success');
  renderMyListings();
}

function confirmDeleteListing(productId) {
  const product = getProductById(productId);
  if (!product) return;

  if (confirm(`Are you sure you want to delete the listing for "${product.name}"? This action cannot be undone.`)) {
    let products = getProducts();
    products = products.filter(p => String(p.id) !== String(productId));
    saveProducts(products);
    showToast('Listing deleted successfully.', 'info');
    renderMyListings();
  }
}
