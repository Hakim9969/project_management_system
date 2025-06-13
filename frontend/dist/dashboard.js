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
// Check token and redirect if missing
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/index.html';
}
// Get DOM elements
const welcomeMessage = document.getElementById('welcome-message');
const projectSection = document.getElementById('project-section');
const logoutBtn = document.getElementById('logout-btn');
// Fetch the user's assigned project
fetch('http://localhost:3000/projects/me', {
    headers: { Authorization: `Bearer ${token}` },
})
    .then((res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.ok)
        throw new Error('No project assigned');
    return res.json();
}))
    .then(data => {
    welcomeMessage.textContent = `Welcome to your Dashboard`;
    projectSection.innerHTML = `
      <h2>Your Assigned Project:</h2>
      <p><strong>${data.name}</strong></p>
      <p>${data.description}</p>
      <p>End Date: ${new Date(data.endDate).toDateString()}</p>
      <p>Status: ${data.isCompleted ? '✅ Completed' : '🕒 Ongoing'}</p>
    `;
})
    .catch(() => {
    projectSection.innerHTML = `<p>No project assigned yet.</p>`;
});
// Logout button
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});
// export {};
