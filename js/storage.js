/**
 * WasteMart - LocalStorage Database Layer
 * Provides clean CRUD accessors for users, products, cart, and orders.
 * Note: Educational demo using LocalStorage. In production, connect to a secure backend API.
 */

const STORAGE_KEYS = {
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  PRODUCTS: 'products',
  CART: 'cart',
  ORDERS: 'orders'
};

// Users
function getUsers() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading users from LocalStorage:', e);
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to LocalStorage:', e);
  }
}

// Current User Session
function getCurrentUser() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error reading currentUser from LocalStorage:', e);
    return null;
  }
}

function setCurrentUser(user) {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Error setting currentUser in LocalStorage:', e);
  }
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.location.href = 'login.html';
}

// Products
function getProducts() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading products from LocalStorage:', e);
    return [];
  }
}

function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products to LocalStorage:', e);
  }
}

function getProductById(id) {
  const products = getProducts();
  return products.find(p => String(p.id) === String(id)) || null;
}

// Shopping Cart
function getCart() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CART);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading cart from LocalStorage:', e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    // Trigger storage event for cart counter updates
    window.dispatchEvent(new Event('cartUpdated'));
  } catch (e) {
    console.error('Error saving cart to LocalStorage:', e);
  }
}

// Orders
function getOrders() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading orders from LocalStorage:', e);
    return [];
  }
}

function saveOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders to LocalStorage:', e);
  }
}

// Demo Data Initialization
function initDemoData() {
  const existingUsers = getUsers();
  const existingProducts = getProducts();

  // Seed default demo users if none exist
  if (!existingUsers || existingUsers.length === 0) {
    const demoUsers = [
      {
        id: 'USR001',
        name: 'WasteMart Administrator',
        email: 'admin@wastemart.com',
        phone: '+91 98765 43210',
        password: 'admin123',
        userType: 'admin',
        location: 'Bengaluru',
        avatar: 'assets/images/avatar-admin.jpg',
        createdAt: '2026-08-01'
      },
      {
        id: 'USR002',
        name: 'Rajesh Recycling Hub',
        email: 'seller@ecowaste.com',
        phone: '+91 98765 43211',
        password: 'seller123',
        userType: 'seller',
        location: 'Chennai',
        avatar: 'assets/images/avatar-rajesh.jpg',
        createdAt: '2026-08-10'
      },
      {
        id: 'USR003',
        name: 'Priya Sharma',
        email: 'buyer@greenfuture.com',
        phone: '+91 98765 43212',
        password: 'buyer123',
        userType: 'buyer',
        location: 'Bengaluru',
        avatar: 'assets/images/avatar-priya.jpg',
        createdAt: '2026-08-15'
      },
      {
        id: 'USR004',
        name: 'EcoTech Recyclers Ltd',
        email: 'ecotech@waste.in',
        phone: '+91 98765 43213',
        password: 'seller123',
        userType: 'seller',
        location: 'Mumbai',
        avatar: 'assets/images/avatar-rajesh.jpg',
        createdAt: '2026-08-18'
      }
    ];
    saveUsers(demoUsers);
  }

  // Image mapping for realistic scrap photos
  const photoMap = {
    'Plastic': 'assets/images/prod-plastic-bottles.jpg',
    'Metal': 'assets/images/prod-copper-scrap.jpg',
    'Cardboard': 'assets/images/prod-cardboard-bales.jpg',
    'Glass': 'assets/images/prod-glass-bottles.jpg',
    'E-Waste': 'assets/images/prod-electronic-scrap.jpg',
    'Paper': 'assets/images/prod-paper-scrap.jpg',
    'Rubber': 'assets/images/prod-rubber-scrap.jpg',
    'Textile': 'assets/images/prod-textile-scrap.jpg'
  };

  // Seed default sample products if none exist
  if (!existingProducts || existingProducts.length === 0) {
    const demoProducts = [
      {
        id: 'PROD101',
        name: 'Plastic Bottles (Clean PET Flakes)',
        category: 'Plastic',
        description: 'Hot-washed, crushed PET bottle flakes ready for polymer processing and textile fiber manufacturing. Moisture below 1%, 100% transparent and blue mix.',
        price: 35,
        quantity: 500,
        unit: 'kg',
        location: 'Chennai',
        imageUrl: 'assets/images/prod-plastic-bottles.jpg',
        sellerId: 'USR002',
        sellerName: 'Rajesh Recycling Hub',
        sellerPhone: '+91 98765 43211',
        status: 'Active',
        createdAt: '2026-09-01'
      },
      {
        id: 'PROD102',
        name: 'Copper Scrap (Millberry Wire 99.9%)',
        category: 'Metal',
        description: 'Grade 1 Bare Bright Millberry Copper wire scrap. Stripped of insulation, free of brittle burnt wire, high electrical conductivity. Excellent smelting yield.',
        price: 680,
        quantity: 120,
        unit: 'kg',
        location: 'Coimbatore',
        imageUrl: 'assets/images/prod-copper-scrap.jpg',
        sellerId: 'USR002',
        sellerName: 'Rajesh Recycling Hub',
        sellerPhone: '+91 98765 43211',
        status: 'Active',
        createdAt: '2026-09-02'
      },
      {
        id: 'PROD103',
        name: 'Aluminium Scrap (Clean 6063 Extrusions)',
        category: 'Metal',
        description: 'Clean architectural grade aluminium extrusion scrap cuttings, unpainted, devoid of iron screws, rubber inserts or zinc attachments. Ready for furnace charge.',
        price: 165,
        quantity: 350,
        unit: 'kg',
        location: 'Bengaluru',
        imageUrl: 'assets/images/prod-aluminium-scrap.jpg',
        sellerId: 'USR002',
        sellerName: 'Rajesh Recycling Hub',
        sellerPhone: '+91 98765 43211',
        status: 'Active',
        createdAt: '2026-09-02'
      },
      {
        id: 'PROD104',
        name: 'Cardboard Waste (Baled OCC Grade 11)',
        category: 'Cardboard',
        description: 'High-density baled Old Corrugated Containers (OCC). Industrial packaging boxes with minimal contamination, stored indoors in a dry warehouse.',
        price: 14,
        quantity: 1200,
        unit: 'kg',
        location: 'Hyderabad',
        imageUrl: 'assets/images/prod-cardboard-bales.jpg',
        sellerId: 'USR002',
        sellerName: 'Rajesh Recycling Hub',
        sellerPhone: '+91 98765 43211',
        status: 'Active',
        createdAt: '2026-09-03'
      },
      {
        id: 'PROD105',
        name: 'Used Glass Bottles (Sorted Amber & Flint Cullet)',
        category: 'Glass',
        description: 'Crushed and sorted beverage glass cullet. Color separated (flint and amber), cleaned of crown caps, ready for glassworks re-melting.',
        price: 8,
        quantity: 2000,
        unit: 'kg',
        location: 'Mumbai',
        imageUrl: 'assets/images/prod-glass-bottles.jpg',
        sellerId: 'USR004',
        sellerName: 'EcoTech Recyclers Ltd',
        sellerPhone: '+91 98765 43213',
        status: 'Active',
        createdAt: '2026-09-03'
      },
      {
        id: 'PROD106',
        name: 'Electronic Scrap (Mixed Motherboards & RAM)',
        category: 'E-Waste',
        description: 'De-soldered and sorted green telecom/computer motherboards, memory cards, and gold-plated pins. RoHS compliant electronic disassembly.',
        price: 450,
        quantity: 85,
        unit: 'kg',
        location: 'Bengaluru',
        imageUrl: 'assets/images/prod-electronic-scrap.jpg',
        sellerId: 'USR002',
        sellerName: 'Rajesh Recycling Hub',
        sellerPhone: '+91 98765 43211',
        status: 'Active',
        createdAt: '2026-09-04'
      },
      {
        id: 'PROD107',
        name: 'Paper Waste (Sorted White Office Paper)',
        category: 'Paper',
        description: 'Baled 100% sorted white ledger paper and document shreddings. De-inkable grade, free of carbon paper, plastic sleeves, and metallic bindings.',
        price: 18,
        quantity: 800,
        unit: 'kg',
        location: 'Chennai',
        imageUrl: 'assets/images/prod-paper-scrap.jpg',
        sellerId: 'USR002',
        sellerName: 'Rajesh Recycling Hub',
        sellerPhone: '+91 98765 43211',
        status: 'Active',
        createdAt: '2026-09-04'
      },
      {
        id: 'PROD108',
        name: 'Rubber Waste (Crumb Tyre Granules 2-4mm)',
        category: 'Rubber',
        description: 'Steel-free recycled tire crumb granules (ambient ground). Suitable for athletic turf infill, asphalt rubber modification, and molded gym mats.',
        price: 24,
        quantity: 1500,
        unit: 'kg',
        location: 'Coimbatore',
        imageUrl: 'assets/images/prod-rubber-scrap.jpg',
        sellerId: 'USR004',
        sellerName: 'EcoTech Recyclers Ltd',
        sellerPhone: '+91 98765 43213',
        status: 'Active',
        createdAt: '2026-09-04'
      },
      {
        id: 'PROD109',
        name: 'Textile Fabric Scraps (100% Cotton Cuttings)',
        category: 'Textile',
        description: 'Garment factory waste clippings in white and colored pure cotton. Ideal for spinning into recycled yarn, paper pulping, or rag wiping solutions.',
        price: 26,
        quantity: 450,
        unit: 'kg',
        location: 'Mumbai',
        imageUrl: 'assets/images/prod-textile-scrap.jpg',
        sellerId: 'USR004',
        sellerName: 'EcoTech Recyclers Ltd',
        sellerPhone: '+91 98765 43213',
        status: 'Active',
        createdAt: '2026-09-04'
      }
    ];
    saveProducts(demoProducts);
  } else {
    // If user already loaded the page with SVG paths, upgrade them gracefully to rich photos
    let updated = false;
    existingProducts.forEach(p => {
      if (p.imageUrl && p.imageUrl.endsWith('.svg')) {
        if (p.id === 'PROD103') {
          p.imageUrl = 'assets/images/prod-aluminium-scrap.jpg';
          updated = true;
        } else if (photoMap[p.category]) {
          p.imageUrl = photoMap[p.category];
          updated = true;
        }
      }
    });
    if (updated) {
      saveProducts(existingProducts);
    }
  }

  // Seed sample orders if none exist
  const existingOrders = getOrders();
  if (!existingOrders || existingOrders.length === 0) {
    const demoOrders = [
      {
        id: 'ORD1001',
        buyerId: 'USR003',
        buyerName: 'Priya Sharma',
        buyerEmail: 'buyer@greenfuture.com',
        buyerPhone: '+91 98765 43212',
        shippingAddress: {
          address: '42 Green Valley Tech Park, Outer Ring Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103'
        },
        items: [
          {
            productId: 'PROD101',
            name: 'Plastic Bottles (Clean PET Flakes)',
            category: 'Plastic',
            price: 35,
            quantity: 100,
            unit: 'kg',
            total: 3500,
            imageUrl: 'assets/images/prod-plastic-bottles.jpg',
            sellerId: 'USR002',
            sellerName: 'Rajesh Recycling Hub'
          }
        ],
        subtotal: 3500,
        deliveryFee: 200,
        total: 3700,
        paymentMethod: 'Cash on Delivery',
        status: 'Processing',
        date: '2026-09-02'
      },
      {
        id: 'ORD1002',
        buyerId: 'USR003',
        buyerName: 'Priya Sharma',
        buyerEmail: 'buyer@greenfuture.com',
        buyerPhone: '+91 98765 43212',
        shippingAddress: {
          address: '42 Green Valley Tech Park, Outer Ring Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103'
        },
        items: [
          {
            productId: 'PROD102',
            name: 'Copper Scrap (Millberry Wire 99.9%)',
            category: 'Metal',
            price: 680,
            quantity: 50,
            unit: 'kg',
            total: 34000,
            imageUrl: 'assets/images/prod-copper-scrap.jpg',
            sellerId: 'USR002',
            sellerName: 'Rajesh Recycling Hub'
          }
        ],
        subtotal: 34000,
        deliveryFee: 200,
        total: 34200,
        paymentMethod: 'Pay Later',
        status: 'Completed',
        date: '2026-08-28'
      }
    ];
    saveOrders(demoOrders);
  }
}

// Automatically initialize sample data on load
initDemoData();
