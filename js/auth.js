/**
 * WasteMart - Authentication & Session Management
 */

function registerUser(name, email, phone, password, userType) {
  if (!name || !email || !password || !userType) {
    return { success: false, message: 'Please fill in all required fields.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const users = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return { success: false, message: 'An account with this email already exists. Please log in.' };
  }

  const newUser = {
    id: 'USR' + Date.now().toString().slice(-6),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    password: password, // Note: Plaintext for LocalStorage educational demo
    userType: userType, // 'buyer' or 'seller'
    createdAt: new Date().toISOString().split('T')[0]
  };

  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

function loginUser(email, password) {
  if (!email || !password) {
    return { success: false, message: 'Please enter both email and password.' };
  }

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);

  if (!user) {
    return { success: false, message: 'Invalid email or password. Please try again.' };
  }

  setCurrentUser(user);
  return { success: true, user: user };
}

/**
 * Route protection helper. Call this at top of protected pages.
 * @param {Array<string>} allowedRoles e.g. ['seller', 'admin'] or null for any logged-in user
 */
function protectPage(allowedRoles = null) {
  const user = getCurrentUser();
  if (!user) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    sessionStorage.setItem('redirectAfterLogin', currentPath + window.location.search);
    window.location.href = 'login.html?reason=unauthorized';
    return false;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.userType) && user.userType !== 'admin') {
      alert('Access restricted to ' + allowedRoles.join(', ') + ' accounts.');
      window.location.href = 'dashboard.html';
      return false;
    }
  }

  return true;
}

// Quick demo login fill helper
function setDemoCredentials(role) {
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  if (!emailInput || !passInput) return;

  if (role === 'admin') {
    emailInput.value = 'admin@wastemart.com';
    passInput.value = 'admin123';
  } else if (role === 'seller') {
    emailInput.value = 'seller@ecowaste.com';
    passInput.value = 'seller123';
  } else if (role === 'buyer') {
    emailInput.value = 'buyer@greenfuture.com';
    passInput.value = 'buyer123';
  }
}
