"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const form = document.getElementById('auth-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const toggleText = document.getElementById('toggle-text');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
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
    const toggleLink = document.getElementById('toggle-link');
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
form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const url = isLogin ? '/auth/login' : '/users/register';
    const payload = isLogin ? { email, password } : { name, email, password };
    try {
        const response = yield fetch(`http://localhost:3000${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = yield response.json();
        alert(result.message || 'Success');
        if (isLogin && result.access_token) {
            localStorage.setItem('token', result.access_token);
            // Decode the JWT to check role
            const payload = JSON.parse(atob(result.access_token.split('.')[1]));
            const userRole = payload.role;
            if (userRole === 'admin') {
                window.location.href = 'admin.html';
            }
            else {
                window.location.href = 'dashboard.html';
            }
        }
    }
    catch (err) {
        alert('Something went wrong');
    }
}));
