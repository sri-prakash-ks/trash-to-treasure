/**
 * WasteMart - Shopping Cart Management
 */

const FLAT_DELIVERY_FEE = 200;

function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
}

function addToCart(productId, quantity = 1) {
  const product = getProductById(productId);
  if (!product) {
    showToast('Product not found.', 'error');
    return false;
  }

  if (product.quantity <= 0 || product.status === 'Sold Out') {
    showToast('Sorry, this product is out of stock.', 'error');
    return false;
  }

  const requestedQty = parseInt(quantity, 10);
  if (isNaN(requestedQty) || requestedQty <= 0) {
    showToast('Please enter a valid quantity.', 'error');
    return false;
  }

  const cart = getCart();
  const existingItemIndex = cart.findIndex(item => String(item.productId) === String(productId));

  if (existingItemIndex > -1) {
    const newQty = cart[existingItemIndex].quantity + requestedQty;
    if (newQty > product.quantity) {
      showToast(`Cannot add more. Available stock is ${product.quantity} ${product.unit}.`, 'warning');
      return false;
    }
    cart[existingItemIndex].quantity = newQty;
    cart[existingItemIndex].total = cart[existingItemIndex].quantity * cart[existingItemIndex].price;
  } else {
    if (requestedQty > product.quantity) {
      showToast(`Cannot add ${requestedQty} ${product.unit}. Only ${product.quantity} ${product.unit} available.`, 'warning');
      return false;
    }
    cart.push({
      productId: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: requestedQty,
      unit: product.unit,
      availableStock: product.quantity,
      imageUrl: product.imageUrl || 'assets/images/prod-plastic-bottles.jpg',
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      location: product.location,
      total: requestedQty * product.price
    });
  }

  saveCart(cart);
  updateCartBadge();
  showToast(`Added ${product.name} to cart!`, 'success');
  return true;
}

function updateCartItemQuantity(productId, newQty) {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => String(item.productId) === String(productId));

  if (itemIndex === -1) return false;

  const product = getProductById(productId);
  const maxStock = product ? product.quantity : cart[itemIndex].availableStock;

  newQty = parseInt(newQty, 10);
  if (isNaN(newQty) || newQty <= 0) {
    return removeFromCart(productId);
  }

  if (newQty > maxStock) {
    showToast(`Maximum available quantity is ${maxStock} ${cart[itemIndex].unit}.`, 'warning');
    cart[itemIndex].quantity = maxStock;
  } else {
    cart[itemIndex].quantity = newQty;
  }

  cart[itemIndex].total = cart[itemIndex].quantity * cart[itemIndex].price;
  saveCart(cart);
  updateCartBadge();
  renderCartPage();
  return true;
}

function removeFromCart(productId) {
  let cart = getCart();
  const item = cart.find(i => String(i.productId) === String(productId));
  cart = cart.filter(i => String(i.productId) !== String(productId));
  saveCart(cart);
  updateCartBadge();
  if (item) {
    showToast(`Removed ${item.name} from cart.`, 'info');
  }
  renderCartPage();
}

function clearCart() {
  saveCart([]);
  updateCartBadge();
  renderCartPage();
}

function calculateCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const deliveryFee = cart.length > 0 ? FLAT_DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryFee;

  return {
    subtotal,
    deliveryFee,
    grandTotal,
    itemCount: cart.length
  };
}

function renderCartPage() {
  const cartTableBody = document.getElementById('cartTableBody');
  const cartEmptyState = document.getElementById('cartEmptyState');
  const cartContent = document.getElementById('cartContent');
  const subtotalEl = document.getElementById('cartSubtotal');
  const deliveryEl = document.getElementById('cartDelivery');
  const grandTotalEl = document.getElementById('cartGrandTotal');

  if (!cartTableBody) return;

  const cart = getCart();

  if (!cart || cart.length === 0) {
    if (cartEmptyState) cartEmptyState.style.display = 'block';
    if (cartContent) cartContent.style.display = 'none';
    return;
  }

  if (cartEmptyState) cartEmptyState.style.display = 'none';
  if (cartContent) cartContent.style.display = 'grid';

  const totals = calculateCartTotals();

  cartTableBody.innerHTML = cart.map(item => `
    <tr class="cart-item-row">
      <td class="cart-product-cell">
        <div class="cart-item-info">
          <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-img" onerror="this.src='assets/images/prod-plastic-bottles.jpg'">
          <div>
            <a href="product.html?id=${item.productId}" class="cart-item-title">${item.name}</a>
            <div class="cart-item-meta">
              <span class="badge badge-category">${item.category}</span>
              <span class="cart-seller-tag">Seller: ${item.sellerName}</span>
            </div>
            <span class="stock-hint">Available: ${item.availableStock} ${item.unit}</span>
          </div>
        </div>
      </td>
      <td class="text-right"><strong>₹${Number(item.price).toLocaleString('en-IN')}</strong> / ${item.unit}</td>
      <td>
        <div class="qty-control-group">
          <button type="button" class="btn-qty" onclick="updateCartItemQuantity('${item.productId}', ${item.quantity - 1})">-</button>
          <input type="number" class="qty-input" value="${item.quantity}" min="1" max="${item.availableStock}" 
            onchange="updateCartItemQuantity('${item.productId}', this.value)" />
          <button type="button" class="btn-qty" onclick="updateCartItemQuantity('${item.productId}', ${item.quantity + 1})">+</button>
        </div>
      </td>
      <td class="text-right font-bold text-green">₹${Number(item.total).toLocaleString('en-IN')}</td>
      <td class="text-center">
        <button type="button" class="btn-icon-delete" onclick="removeFromCart('${item.productId}')" title="Remove item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = `₹${totals.subtotal.toLocaleString('en-IN')}`;
  if (deliveryEl) deliveryEl.textContent = `₹${totals.deliveryFee.toLocaleString('en-IN')}`;
  if (grandTotalEl) grandTotalEl.textContent = `₹${totals.grandTotal.toLocaleString('en-IN')}`;
}
