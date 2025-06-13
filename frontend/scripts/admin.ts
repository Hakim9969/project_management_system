const token = localStorage.getItem('token');
if (!token) window.location.href = '/index.html';

const userSelect = document.getElementById('user-select') as HTMLSelectElement;
const projectSelect = document.getElementById('project-select') as HTMLSelectElement;
const projectForm = document.getElementById('project-form') as HTMLFormElement;
const assignForm = document.getElementById('assign-form') as HTMLFormElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;

function fetchUsers() {
  fetch('http://localhost:3000/users', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(users => {
      userSelect.innerHTML = users.map((u: any) => `<option value="${u.id}">${u.name}</option>`).join('');
    });
}

function fetchProjects() {
  fetch('http://localhost:3000/projects', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(projects => {
      projectSelect.innerHTML = projects
        .filter((p: any) => !p.user) // unassigned only
        .map((p: any) => `<option value="${p.id}">${p.name}</option>`)
        .join('');
    });
}

projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = (document.getElementById('project-name') as HTMLInputElement).value;
  const description = (document.getElementById('project-desc') as HTMLTextAreaElement).value;
  const endDate = (document.getElementById('project-end') as HTMLInputElement).value;

  await fetch('http://localhost:3000/projects/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description, endDate }),
  });

  fetchProjects(); // reload projects
});

assignForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userId = userSelect.value;
  const projectId = projectSelect.value;

  await fetch('http://localhost:3000/projects/assign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId: +userId, projectId: +projectId }),
  });

  fetchProjects(); // reload available projects
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/index.html';
});
export {};

fetchUsers();
fetchProjects();
