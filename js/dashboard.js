/**
 * WasteMart - Role-Aware Unified Dashboard
 * Adapts to Buyer, Seller, and Admin roles dynamically.
 */

function initDashboardPage() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Update greeting
  const greetingEl = document.getElementById('dashboardUserGreeting');
  const roleBadgeEl = document.getElementById('dashboardUserRoleBadge');
  if (greetingEl) greetingEl.textContent = `Welcome back, ${user.name}!`;
  if (roleBadgeEl) {
    roleBadgeEl.textContent = user.userType.toUpperCase();
    roleBadgeEl.className = `badge badge-${user.userType}`;
  }

  // Show relevant view container
  const sellerView = document.getElementById('sellerDashboardView');
  const adminView = document.getElementById('adminDashboardView');
  const buyerView = document.getElementById('buyerDashboardView');

  if (user.userType === 'admin') {
    if (adminView) adminView.style.display = 'block';
    if (sellerView) sellerView.style.display = 'none';
    if (buyerView) buyerView.style.display = 'none';
    renderAdminDashboard();
  } else if (user.userType === 'seller') {
    if (sellerView) sellerView.style.display = 'block';
    if (adminView) adminView.style.display = 'none';
    if (buyerView) buyerView.style.display = 'none';
    renderSellerDashboard(user);
  } else {
    // Buyer
    if (buyerView) buyerView.style.display = 'block';
    if (sellerView) sellerView.style.display = 'none';
    if (adminView) adminView.style.display = 'none';
    renderBuyerDashboard(user);
  }
}

// ----------------------------------------------------
// Seller Dashboard
// ----------------------------------------------------
function renderSellerDashboard(user) {
  const allProducts = getProducts();
  const allOrders = getOrders();

  // Filter listings for this seller
  const sellerProducts = allProducts.filter(p => String(p.sellerId) === String(user.id) || p.sellerName === user.name);
  const activeProducts = sellerProducts.filter(p => p.status === 'Active' && p.quantity > 0);

  // Orders containing this seller's products
  const sellerOrders = allOrders.filter(o => 
    o.items && o.items.some(item => String(item.sellerId) === String(user.id) || item.sellerName === user.name)
  );

  const completedOrders = sellerOrders.filter(o => o.status === 'Completed');

  // Calculate total revenue for this seller
  const totalSales = completedOrders.reduce((sum, order) => {
    const sellerItemsTotal = order.items
      .filter(item => String(item.sellerId) === String(user.id) || item.sellerName === user.name)
      .reduce((iSum, item) => iSum + Number(item.total), 0);
    return sum + sellerItemsTotal;
  }, 0);

  // Update statistics cards
  document.getElementById('sellerTotalListings').textContent = sellerProducts.length;
  document.getElementById('sellerActiveListings').textContent = activeProducts.length;
  document.getElementById('sellerTotalOrders').textContent = sellerOrders.length;
  document.getElementById('sellerCompletedOrders').textContent = completedOrders.length;
  document.getElementById('sellerTotalSales').textContent = `₹${Number(totalSales).toLocaleString('en-IN')}`;

  // Render recent listings table preview
  const listingsTable = document.getElementById('sellerRecentListingsBody');
  if (listingsTable) {
    if (sellerProducts.length === 0) {
      listingsTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No waste materials listed yet. <a href="sell.html" class="text-green font-semibold">List Waste Now</a></td></tr>`;
    } else {
      listingsTable.innerHTML = sellerProducts.slice(0, 5).map(p => `
        <tr>
          <td>
            <strong>${p.name}</strong>
            <div class="text-xs text-muted">${p.category} &bull; ${p.location}</div>
          </td>
          <td>₹${Number(p.price).toLocaleString('en-IN')} / ${p.unit}</td>
          <td>${p.quantity} ${p.unit}</td>
          <td><span class="badge ${p.quantity > 0 && p.status === 'Active' ? 'badge-completed' : 'badge-cancelled'}">${p.quantity > 0 && p.status === 'Active' ? 'Active' : 'Sold Out'}</span></td>
          <td class="text-right">
            <a href="my-listings.html" class="btn btn-xs btn-outline">Manage</a>
          </td>
        </tr>
      `).join('');
    }
  }

  // Render recent seller orders table preview
  const ordersTable = document.getElementById('sellerRecentOrdersBody');
  if (ordersTable) {
    if (sellerOrders.length === 0) {
      ordersTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No orders received yet.</td></tr>`;
    } else {
      ordersTable.innerHTML = sellerOrders.slice(0, 5).map(order => `
        <tr>
          <td>#${order.id}</td>
          <td>${order.buyerName}</td>
          <td>${order.date}</td>
          <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
          <td class="text-right">
            <a href="orders.html" class="btn btn-xs btn-outline">Manage</a>
          </td>
        </tr>
      `).join('');
    }
  }
}

// ----------------------------------------------------
// Admin Dashboard
// ----------------------------------------------------
function renderAdminDashboard() {
  const users = getUsers();
  const products = getProducts();
  const orders = getOrders();

  const totalUsers = users.length;
  const totalSellers = users.filter(u => u.userType === 'seller').length;
  const totalBuyers = users.filter(u => u.userType === 'buyer').length;
  const totalProducts = products.length;
  const totalOrders = orders.length;

  // Calculate gross marketplace volume
  const totalGMV = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  document.getElementById('adminTotalUsers').textContent = totalUsers;
  document.getElementById('adminTotalSellers').textContent = totalSellers;
  document.getElementById('adminTotalBuyers').textContent = totalBuyers;
  document.getElementById('adminTotalProducts').textContent = totalProducts;
  document.getElementById('adminTotalOrders').textContent = totalOrders;
  document.getElementById('adminTotalSales').textContent = `₹${Number(totalGMV).toLocaleString('en-IN')}`;

  // Render Users Table
  const usersTable = document.getElementById('adminUsersTableBody');
  if (usersTable) {
    usersTable.innerHTML = users.map(u => `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td>${u.phone || 'N/A'}</td>
        <td><span class="badge badge-${u.userType}">${u.userType.toUpperCase()}</span></td>
        <td>${u.createdAt || 'N/A'}</td>
        <td class="text-right">
          ${u.userType !== 'admin' ? `
            <button class="btn btn-xs btn-danger" onclick="adminDeleteUser('${u.id}')">Remove</button>
          ` : '<span class="text-xs text-muted">Protected</span>'}
        </td>
      </tr>
    `).join('');
  }

  // Render Listings Table
  const listingsTable = document.getElementById('adminListingsTableBody');
  if (listingsTable) {
    listingsTable.innerHTML = products.map(p => `
      <tr>
        <td>
          <strong>${p.name}</strong>
          <div class="text-xs text-muted">${p.category}</div>
        </td>
        <td>₹${Number(p.price).toLocaleString('en-IN')} / ${p.unit}</td>
        <td>${p.quantity} ${p.unit}</td>
        <td>${p.location}</td>
        <td>${p.sellerName}</td>
        <td class="text-right">
          <button class="btn btn-xs btn-danger" onclick="adminDeleteProduct('${p.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  // Render Orders Table
  const ordersTable = document.getElementById('adminOrdersTableBody');
  if (ordersTable) {
    ordersTable.innerHTML = orders.map(o => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>${o.buyerName}</td>
        <td>${o.date}</td>
        <td>₹${Number(o.total).toLocaleString('en-IN')}</td>
        <td><span class="badge ${getStatusBadgeClass(o.status)}">${o.status}</span></td>
        <td class="text-right">
          <button class="btn btn-xs btn-outline" onclick="openOrderDetailModal('${o.id}')">View</button>
        </td>
      </tr>
    `).join('');
  }
}

function adminDeleteUser(userId) {
  if (confirm('Are you sure you want to remove this user?')) {
    let users = getUsers();
    users = users.filter(u => String(u.id) !== String(userId));
    saveUsers(users);
    showToast('User removed successfully.', 'info');
    renderAdminDashboard();
  }
}

function adminDeleteProduct(productId) {
  if (confirm('Are you sure you want to delete this listing from the marketplace?')) {
    let products = getProducts();
    products = products.filter(p => String(p.id) !== String(productId));
    saveProducts(products);
    showToast('Listing deleted by Admin.', 'info');
    renderAdminDashboard();
  }
}

// ----------------------------------------------------
// Buyer Dashboard
// ----------------------------------------------------
function renderBuyerDashboard(user) {
  const allOrders = getOrders();
  const buyerOrders = allOrders.filter(o => String(o.buyerId) === String(user.id) || o.buyerEmail === user.email);

  const pendingOrders = buyerOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');
  const totalSpent = buyerOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  document.getElementById('buyerTotalOrders').textContent = buyerOrders.length;
  document.getElementById('buyerPendingOrders').textContent = pendingOrders.length;
  document.getElementById('buyerTotalSpent').textContent = `₹${Number(totalSpent).toLocaleString('en-IN')}`;

  const recentOrdersTable = document.getElementById('buyerRecentOrdersBody');
  if (recentOrdersTable) {
    if (buyerOrders.length === 0) {
      recentOrdersTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted">You haven't placed any orders yet. <a href="shop.html" class="text-green font-semibold">Start Browsing</a></td></tr>`;
    } else {
      recentOrdersTable.innerHTML = buyerOrders.slice(-5).reverse().map(order => `
        <tr>
          <td><strong>#${order.id}</strong></td>
          <td>${order.date}</td>
          <td>₹${Number(order.total).toLocaleString('en-IN')}</td>
          <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
          <td class="text-right">
            <button class="btn btn-xs btn-outline" onclick="openOrderDetailModal('${order.id}')">View</button>
          </td>
        </tr>
      `).join('');
    }
  }
}

function adminResetDemoData() {
  if (confirm('Reset all marketplace listings, users, and orders back to initial demo seeds? Any custom changes will be replaced.')) {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    initDemoData();
    showToast('Platform reset to clean demo seeds!', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  }
}
