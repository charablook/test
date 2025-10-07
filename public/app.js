const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const registerStatus = document.getElementById('register-status');
const loginStatus = document.getElementById('login-status');
const dashboardCard = document.getElementById('dashboard-card');
const currentUserName = document.getElementById('current-user-name');
const currentUserRole = document.getElementById('current-user-role');
const logoutBtn = document.getElementById('logout-btn');
const registerGoogle = document.getElementById('register-google');
const loginGoogle = document.getElementById('login-google');

function showStatus(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove('status-success', 'status-error');
  element.style.display = 'block';
  if (type === 'success') {
    element.classList.add('status-success');
  } else {
    element.classList.add('status-error');
  }
}

function hideStatus(element) {
  if (!element) return;
  element.style.display = 'none';
}

async function fetchSession() {
  try {
    const response = await fetch('/api/session');
    const data = await response.json();
    if (data.user) {
      renderDashboard(data.user);
    } else {
      resetDashboard();
    }
  } catch (error) {
    console.error('Erreur récupération session', error);
  }
}

function renderDashboard(user) {
  if (!user) {
    resetDashboard();
    return;
  }
  currentUserName.textContent = user.name || user.email;
  currentUserRole.textContent = user.role === 'professional' ? 'professionnel' : 'particulier';
  dashboardCard.style.display = 'block';
}

function resetDashboard() {
  dashboardCard.style.display = 'none';
  hideStatus(registerStatus);
  hideStatus(loginStatus);
}

async function handleSubmit(event, endpoint, statusElement) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Une erreur est survenue');
    }
    showStatus(statusElement, 'Connexion réussie !', 'success');
    renderDashboard(data.user);
  } catch (error) {
    showStatus(statusElement, error.message, 'error');
  }
}

if (registerForm) {
  registerForm.addEventListener('submit', (event) => handleSubmit(event, '/api/register', registerStatus));
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => handleSubmit(event, '/api/login', loginStatus));
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    resetDashboard();
  });
}

function openGoogleAuth() {
  window.location.href = '/auth/google';
}

if (registerGoogle) {
  registerGoogle.addEventListener('click', openGoogleAuth);
}

if (loginGoogle) {
  loginGoogle.addEventListener('click', openGoogleAuth);
}

function handleAuthRedirect() {
  const params = new URLSearchParams(window.location.search);
  const authStatus = params.get('auth');
  if (!authStatus) {
    return;
  }
  if (authStatus === 'google-success') {
    showStatus(loginStatus, 'Connexion Google réussie !', 'success');
    fetchSession();
  }
  if (authStatus === 'google-failed') {
    showStatus(loginStatus, 'Connexion Google annulée ou échouée.', 'error');
  }
  params.delete('auth');
  const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`;
  window.history.replaceState({}, document.title, newUrl);
}

handleAuthRedirect();
fetchSession();
