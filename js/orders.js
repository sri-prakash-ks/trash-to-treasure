/**
 * WasteMart - Orders & Checkout Management
 */

const ORDER_STATUSES = ['Pending', 'Accepted', 'Processing', 'Ready for Pickup', 'Completed', 'Cancelled'];

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Pending': return 'badge-pending';
    case 'Accepted': return 'badge-accepted';
    case 'Processing': return 'badge-processing';
    case 'Ready for Pickup': return 'badge-pickup';
    case 'Completed': return 'badge-completed';
    case 'Cancelled': return 'badge-cancelled';
    default: return 'badge-pending';
  }
}

// ----------------------------------------------------
// Checkout Page Logic
// ----------------------------------------------------
function initCheckoutPage() {
  const user = getCurrentUser();
  const cart = getCart();

  if (!cart || cart.length === 0) {
    showToast('Your shopping cart is empty.', 'info');
    window.location.href = 'shop.html';
    return;
  }

  // Pre-fill user information if logged in
  if (user) {
    const nameInput = document.getElementById('checkoutName');
    const phoneInput = document.getElementById('checkoutPhone');
    if (nameInput && !nameInput.value) nameInput.value = user.name || '';
    if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '';
  }

  renderCheckoutSummary();
}

function renderCheckoutSummary() {
  const container = document.getElementById('checkoutItemsList');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const deliveryEl = document.getElementById('checkoutDelivery');
  const totalEl = document.getElementById('checkoutTotal');

  const cart = getCart();
  const totals = calculateCartTotals();

  if (container) {
    container.innerHTML = cart.map(item => `
      <div class="checkout-item-row">
        <div class="checkout-item-details">
          <span class="checkout-item-name">${item.name}</span>
          <span class="checkout-item-meta">${item.quantity} ${item.unit} &times; ₹${Number(item.price).toLocaleString('en-IN')}</span>
        </div>
        <div class="checkout-item-price">
          ₹${Number(item.total).toLocaleString('en-IN')}
        </div>
      </div>
    `).join('');
  }

  if (subtotalEl) subtotalEl.textContent = `₹${totals.subtotal.toLocaleString('en-IN')}`;
  if (deliveryEl) deliveryEl.textContent = `₹${totals.deliveryFee.toLocaleString('en-IN')}`;
  if (totalEl) totalEl.textContent = `₹${totals.grandTotal.toLocaleString('en-IN')}`;
}

function handlePlaceOrderSubmit(e) {
  e.preventDefault();

  const cart = getCart();
  if (!cart || cart.length === 0) {
    showToast('Your cart is empty. Please add items before placing an order.', 'error');
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    showToast('Please log in or create an account to complete your order.', 'warning');
    sessionStorage.setItem('redirectAfterLogin', 'checkout.html');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    return;
  }

  const name = document.getElementById('checkoutName').value.trim();
  const phone = document.getElementById('checkoutPhone').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const city = document.getElementById('checkoutCity').value.trim();
  const state = document.getElementById('checkoutState').value.trim();
  const pincode = document.getElementById('checkoutPincode').value.trim();
  
  const paymentMethodInput = document.querySelector('input[name="paymentMethod"]:checked');
  const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'Cash on Delivery';

  if (!name || !phone || !address || !city || !state || !pincode) {
    showToast('Please fill in all shipping details.', 'error');
    return;
  }

  const totals = calculateCartTotals();

  // Create order
  const newOrder = {
    id: 'ORD' + Date.now().toString().slice(-6),
    buyerId: user.id || 'USR_GUEST',
    buyerName: name,
    buyerEmail: user.email || '',
    buyerPhone: phone,
    shippingAddress: {
      address,
      city,
      state,
      pincode
    },
    items: [...cart],
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.grandTotal,
    paymentMethod: paymentMethod,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  // Update product inventory in LocalStorage
  const products = getProducts();
  cart.forEach(item => {
    const prodIndex = products.findIndex(p => String(p.id) === String(item.productId));
    if (prodIndex > -1) {
      products[prodIndex].quantity = Math.max(0, products[prodIndex].quantity - item.quantity);
      if (products[prodIndex].quantity === 0) {
        products[prodIndex].status = 'Sold Out';
      }
    }
  });
  saveProducts(products);

  // Save new order
  const orders = getOrders();
  orders.push(newOrder);
  saveOrders(orders);

  // Clear shopping cart
  clearCart();

  showToast('Order placed successfully!', 'success');
  setTimeout(() => {
    window.location.href = `orders.html?newOrderId=${newOrder.id}`;
  }, 1200);
}

// ----------------------------------------------------
// Orders Page Rendering & Tracking
// ----------------------------------------------------
let currentOrdersTab = 'my-orders'; // 'my-orders' or 'seller-orders'

function initOrdersPage() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Show or hide seller/admin order tabs based on role
  const sellerTabBtn = document.getElementById('tabSellerOrdersBtn');
  if (sellerTabBtn) {
    if (user.userType === 'seller' || user.userType === 'admin') {
      sellerTabBtn.style.display = 'inline-block';
    } else {
      sellerTabBtn.style.display = 'none';
    }
  }

  // Switch tabs
  const tabBuyerBtn = document.getElementById('tabBuyerOrdersBtn');
  if (tabBuyerBtn && sellerTabBtn) {
    tabBuyerBtn.addEventListener('click', () => {
      currentOrdersTab = 'my-orders';
      tabBuyerBtn.classList.add('active');
      sellerTabBtn.classList.remove('active');
      renderOrdersList();
    });

    sellerTabBtn.addEventListener('click', () => {
      currentOrdersTab = 'seller-orders';
      sellerTabBtn.classList.add('active');
      tabBuyerBtn.classList.remove('active');
      renderOrdersList();
    });
  }

  renderOrdersList();

  // Check if directed with newly placed order ID
  const urlParams = new URLSearchParams(window.location.search);
  const newOrderId = urlParams.get('newOrderId');
  if (newOrderId) {
    openOrderDetailModal(newOrderId);
  }
}

function renderOrdersList() {
  const container = document.getElementById('ordersListContainer');
  const emptyState = document.getElementById('ordersEmptyState');
  if (!container) return;

  const user = getCurrentUser();
  if (!user) return;

  const allOrders = getOrders();
  let filteredOrders = [];

  if (currentOrdersTab === 'my-orders') {
    // Orders placed by this user
    filteredOrders = allOrders.filter(o => String(o.buyerId) === String(user.id) || o.buyerEmail === user.email);
  } else {
    // Seller view: orders containing items sold by this seller (or all for admin)
    if (user.userType === 'admin') {
      filteredOrders = [...allOrders];
    } else {
      filteredOrders = allOrders.filter(order => 
        order.items && order.items.some(item => String(item.sellerId) === String(user.id) || item.sellerName === user.name)
      );
    }
  }

  // Sort newest first
  filteredOrders.reverse();

  if (filteredOrders.length === 0) {
    container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  container.style.display = 'flex';
  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = filteredOrders.map(order => {
    const isSellerView = currentOrdersTab === 'seller-orders';
    const statusClass = getStatusBadgeClass(order.status);

    const itemsSummary = (order.items || []).map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');

    return `
      <div class="order-card" data-order-id="${order.id}">
        <div class="order-card-header">
          <div>
            <div class="order-id-label">Order #${order.id}</div>
            <div class="order-date-text">Placed on ${order.date}</div>
          </div>
          <div class="order-status-wrap">
            <span class="badge ${statusClass}">${order.status}</span>
          </div>
        </div>

        <div class="order-card-body">
          <div class="order-summary-info">
            <p class="order-items-preview"><strong>Items:</strong> ${itemsSummary}</p>
            <div class="order-buyer-tag">
              ${isSellerView ? `<span>Buyer: <strong>${order.buyerName}</strong> (${order.shippingAddress ? order.shippingAddress.city : 'N/A'})</span>` : `<span>Payment: <strong>${order.paymentMethod}</strong></span>`}
            </div>
          </div>

          <div class="order-card-financials">
            <div class="order-price-label">Total Amount:</div>
            <div class="order-price-value">₹${Number(order.total).toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div class="order-card-footer">
          ${isSellerView ? `
            <div class="seller-status-updater">
              <label for="status_${order.id}" class="text-sm font-semibold">Change Status:</label>
              <select id="status_${order.id}" class="form-select status-select-sm" onchange="updateOrderStatus('${order.id}', this.value)">
                ${ORDER_STATUSES.map(st => `<option value="${st}" ${order.status === st ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
            </div>
          ` : `
            <div class="order-delivery-tag">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Shipping to ${order.shippingAddress ? order.shippingAddress.city : 'Specified Address'}
            </div>
          `}
          
          <div class="flex gap-2 items-center">
            ${!isSellerView && order.status === 'Pending' ? `
              <button type="button" class="btn btn-danger btn-sm" onclick="cancelBuyerOrder('${order.id}')">
                Cancel Order
              </button>
            ` : ''}
            <button type="button" class="btn btn-outline btn-sm" onclick="openOrderDetailModal('${order.id}')">
              View Order Details
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function cancelBuyerOrder(orderId) {
  if (!confirm(`Are you sure you want to cancel Order #${orderId}? Your ordered materials will be returned to active inventory.`)) {
    return;
  }

  const orders = getOrders();
  const orderIndex = orders.findIndex(o => String(o.id) === String(orderId));
  if (orderIndex === -1) {
    showToast('Order not found.', 'error');
    return;
  }

  const order = orders[orderIndex];
  if (order.status !== 'Pending') {
    showToast(`Cannot cancel order. Current status is ${order.status}.`, 'warning');
    return;
  }

  // Restore inventory in LocalStorage
  const products = getProducts();
  if (order.items && Array.isArray(order.items)) {
    order.items.forEach(item => {
      const prodIndex = products.findIndex(p => String(p.id) === String(item.productId));
      if (prodIndex > -1) {
        products[prodIndex].quantity += Number(item.quantity || 0);
        if (products[prodIndex].status === 'Sold Out') {
          products[prodIndex].status = 'Active';
        }
      }
    });
    saveProducts(products);
  }

  orders[orderIndex].status = 'Cancelled';
  saveOrders(orders);
  showToast(`Order #${orderId} cancelled. Inventory restored.`, 'info');
  renderOrdersList();
}

function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const index = orders.findIndex(o => String(o.id) === String(orderId));

  if (index === -1) {
    showToast('Order not found.', 'error');
    return;
  }

  orders[index].status = newStatus;
  saveOrders(orders);
  showToast(`Order #${orderId} status updated to "${newStatus}"!`, 'success');
  renderOrdersList();
}

function openOrderDetailModal(orderId) {
  const orders = getOrders();
  const order = orders.find(o => String(o.id) === String(orderId));

  if (!order) {
    showToast('Order details not found.', 'error');
    return;
  }

  const modalBody = document.getElementById('orderDetailModalBody');
  if (!modalBody) return;

  const addr = order.shippingAddress || {};
  const statusClass = getStatusBadgeClass(order.status);

  modalBody.innerHTML = `
    <div class="order-modal-header">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-bold">Order #${order.id}</h3>
        <span class="badge ${statusClass}">${order.status}</span>
      </div>
      <p class="text-sm text-muted">Placed on ${order.date} &bull; Payment: ${order.paymentMethod}</p>
    </div>

    <div class="order-modal-section">
      <h5 class="section-title">Delivery Address</h5>
      <div class="address-box">
        <p><strong>${order.buyerName}</strong> (${order.buyerPhone})</p>
        <p>${addr.address || ''}</p>
        <p>${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}</p>
      </div>
    </div>

    <div class="order-modal-section">
      <h5 class="section-title">Ordered Items</h5>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Price</th>
              <th>Qty</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map(item => `
              <tr>
                <td>
                  <strong>${item.name}</strong>
                  <div class="text-xs text-muted">Seller: ${item.sellerName}</div>
                </td>
                <td>₹${Number(item.price).toLocaleString('en-IN')} / ${item.unit}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td class="text-right font-bold">₹${Number(item.total).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="order-modal-totals">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>₹${Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
      </div>
      <div class="totals-row">
        <span>Delivery Charge:</span>
        <span>₹${Number(order.deliveryFee || 200).toLocaleString('en-IN')}</span>
      </div>
      <div class="totals-row grand-total">
        <span>Grand Total:</span>
        <span class="text-green">₹${Number(order.total || 0).toLocaleString('en-IN')}</span>
      </div>
    </div>

    <div class="mt-4 pt-3 border-top flex justify-between items-center" style="border-top: 1px solid var(--border-light);">
      <span class="text-xs text-muted">Official Waste Consignment Note</span>
      <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        Print Invoice
      </button>
    </div>
  `;

  openModal('orderDetailModal');
}
