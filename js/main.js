/**
 * WasteMart - Main Shared Application Logic
 * Manages dynamic navigation, toast notifications, modals, and responsive menus.
 */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  updateCartBadge();
  initModalListeners();
  initToastContainer();
});

// Listen for custom storage cart updates
window.addEventListener('cartUpdated', () => {
  updateCartBadge();
});

// ----------------------------------------------------
// Dynamic Navigation Bar
// ----------------------------------------------------
function renderNavbar() {
  const navContainer = document.getElementById('mainNav');
  if (!navContainer) return;

  const user = getCurrentUser();
  const cartCount = getCartCount();
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const isCurrent = (page) => currentPath === page ? 'nav-link active' : 'nav-link';

  let linksHTML = `
    <a href="index.html" class="${isCurrent('index.html')}">Home</a>
    <a href="shop.html" class="${isCurrent('shop.html')}">Browse Waste</a>
  `;

  if (!user) {
    // Guest Navigation
    linksHTML += `
      <a href="cart.html" class="${isCurrent('cart.html')} nav-cart-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        Cart
        <span class="cart-badge" id="navCartBadge" style="display: ${cartCount > 0 ? 'inline-flex' : 'none'};">${cartCount}</span>
      </a>
      <div class="nav-auth-buttons">
        <a href="login.html" class="btn btn-outline btn-sm">Login</a>
        <a href="register.html" class="btn btn-primary btn-sm">Register</a>
      </div>
    `;
  } else {
    // Logged-in Navigation based on role
    linksHTML += `
      <a href="dashboard.html" class="${isCurrent('dashboard.html')}">Dashboard</a>
    `;

    if (user.userType === 'seller') {
      linksHTML += `
        <a href="sell.html" class="${isCurrent('sell.html')} nav-highlight-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Sell Waste
        </a>
        <a href="my-listings.html" class="${isCurrent('my-listings.html')}">My Listings</a>
      `;
    }

    linksHTML += `
      <a href="orders.html" class="${isCurrent('orders.html')}">Orders</a>
      <a href="cart.html" class="${isCurrent('cart.html')} nav-cart-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        Cart
        <span class="cart-badge" id="navCartBadge" style="display: ${cartCount > 0 ? 'inline-flex' : 'none'};">${cartCount}</span>
      </a>
      
      <div class="user-menu-dropdown">
        <button class="user-profile-btn" onclick="toggleUserDropdown()" id="userDropdownBtn">
          ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">` : `<span class="user-avatar-initial">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>`}
          <span class="user-name-text">${user.name.split(' ')[0]}</span>
          <span class="badge badge-${user.userType} user-role-pill">${user.userType}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"></path>
          </svg>
        </button>
        <div class="user-dropdown-menu" id="userDropdownContent">
          <div class="dropdown-header">
            <strong>${user.name}</strong>
            <span class="text-xs text-muted">${user.email}</span>
          </div>
          <a href="profile.html" class="dropdown-item">My Profile</a>
          <a href="dashboard.html" class="dropdown-item">Dashboard</a>
          <a href="orders.html" class="dropdown-item">My Orders</a>
          ${user.userType === 'seller' ? '<a href="my-listings.html" class="dropdown-item">My Listings</a>' : ''}
          <div class="dropdown-divider"></div>
          <button type="button" class="dropdown-item text-danger" onclick="logout()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>
    `;
  }

  navContainer.innerHTML = linksHTML;

  // Also setup mobile navigation sync
  const mobileNavContainer = document.getElementById('mobileNavLinks');
  if (mobileNavContainer) {
    mobileNavContainer.innerHTML = linksHTML;
  }
}

function toggleUserDropdown() {
  const menu = document.getElementById('userDropdownContent');
  if (menu) {
    menu.classList.toggle('show');
  }
}

// Close user dropdown on outside click
document.addEventListener('click', (e) => {
  const dropdown = document.querySelector('.user-menu-dropdown');
  const menu = document.getElementById('userDropdownContent');
  if (dropdown && menu && !dropdown.contains(e.target)) {
    menu.classList.remove('show');
  }
});

function toggleMobileNav() {
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('mobileBackdrop');
  if (drawer && backdrop) {
    drawer.classList.toggle('open');
    backdrop.classList.toggle('open');
  }
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = getCartCount();
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

// ----------------------------------------------------
// Toast Notification Engine
// ----------------------------------------------------
function initToastContainer() {
  if (!document.getElementById('toastContainer')) {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'info', duration = 3200) {
  initToastContainer();
  const container = document.getElementById('toastContainer');

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else if (type === 'error') {
    iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  } else if (type === 'warning') {
    iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
  } else {
    iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => { toast.remove(); }, 300);
  }, duration);
}

// ----------------------------------------------------
// Modal System
// ----------------------------------------------------
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
}

function initModalListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modal-overlay.modal-open');
      openModals.forEach(m => {
        m.classList.remove('modal-open');
      });
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('modal-open');
      document.body.style.overflow = '';
    }
  });
}
