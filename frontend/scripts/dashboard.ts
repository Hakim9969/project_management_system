// Check token and redirect if missing
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/index.html';
}

// Get DOM elements
const welcomeMessage = document.getElementById('welcome-message') as HTMLElement;
const projectSection = document.getElementById('project-section') as HTMLElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;

// Fetch the user's assigned project
fetch('http://localhost:3000/projects/me', {
  headers: { Authorization: `Bearer ${token}` },
})
  .then(async res => {
    if (!res.ok) throw new Error('No project assigned');
    return res.json();
  })
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