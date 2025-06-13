const form = document.getElementById('auth-form') as HTMLFormElement;
const nameInput = document.getElementById('name') as HTMLInputElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const toggleText = document.getElementById('toggle-text') as HTMLParagraphElement;
const formTitle = document.getElementById('form-title') as HTMLElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;

let isLogin = true;

function updateFormUI() {
  nameInput.classList.toggle('hidden', isLogin);
  submitBtn.textContent = isLogin ? 'Login' : 'Register';
  formTitle.textContent = isLogin ? 'Login' : 'Register';
  toggleText.innerHTML = isLogin
    ? `Don't have an account? <a href="#" id="toggle-link">Register</a>`
    : `Already have an account? <a href="#" id="toggle-link">Login</a>`;

  attachToggleListener(); // Reattach listener every time we rewrite the toggle link
}

function attachToggleListener() {
  const toggleLink = document.getElementById('toggle-link') as HTMLAnchorElement;
  if (toggleLink) {
    toggleLink.addEventListener('click', (e) => {
      e.preventDefault();
      isLogin = !isLogin;
      updateFormUI();
    });
  }
}

// Initial attachment
attachToggleListener();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  const url = isLogin ? '/auth/login' : '/users/register';
  const payload = isLogin ? { email, password } : { name, email, password };

  try {
    const response = await fetch(`http://localhost:3000${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    alert(result.message || 'Success');

   if (isLogin && result.access_token) {
  localStorage.setItem('token', result.access_token);

  // Decode the JWT to check role
  const payload = JSON.parse(atob(result.access_token.split('.')[1]));
  const userRole = payload.role;

  if (userRole === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'dashboard.html';
  }
}

  } catch (err) {
    alert('Something went wrong');
  }
});
