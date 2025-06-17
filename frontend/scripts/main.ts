document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Sections
  const authSection = document.getElementById('auth-section') as HTMLElement;
  const adminDashboard = document.getElementById('admin-dashboard') as HTMLElement;
  const userDashboard = document.getElementById('user-dashboard') as HTMLElement;

  // Shared elements
  const logoutBtnAdmin = document.getElementById('logout-btn-admin') as HTMLButtonElement;
  const logoutBtnUser = document.getElementById('logout-btn-user') as HTMLButtonElement;

  // Show relevant section
  function showSection(section: HTMLElement) {
    authSection.classList.add('hidden');
    adminDashboard.classList.add('hidden');
    userDashboard.classList.add('hidden');
    section.classList.remove('hidden');
  }

  // ========= AUTH SECTION ========= //
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
    attachToggleListener();
  }

  function attachToggleListener() {
    const toggleLink = document.getElementById('toggle-link') as HTMLAnchorElement;
    toggleLink?.addEventListener('click', (e) => {
      e.preventDefault();
      isLogin = !isLogin;
      updateFormUI();
    });
  }

  attachToggleListener();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const url = isLogin ? '/auth/login' : '/users/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`http://localhost:3000${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (isLogin && result.access_token) {
        localStorage.setItem('token', result.access_token);

        const payload = JSON.parse(atob(result.access_token.split('.')[1]));
        localStorage.setItem('role', payload.role);

        payload.role === 'admin' ? showAdminDashboard() : showUserDashboard();
      } else {
        alert(result.message || 'Registered successfully');
      }
    } catch {
      alert('Something went wrong');
    }
  });

  // ========= ADMIN DASHBOARD ========= //
  const userSelect = document.getElementById('user-select') as HTMLSelectElement;
  const projectSelect = document.getElementById('project-select') as HTMLSelectElement;
  const projectForm = document.getElementById('project-form') as HTMLFormElement;
  const assignForm = document.getElementById('assign-form') as HTMLFormElement;
  const assignStatus = document.getElementById('assign-status') as HTMLElement;
  const adminTableBody = document.getElementById('admin-table-body') as HTMLTableSectionElement;
  const createStatus = document.getElementById('create-status') as HTMLElement;

  async function fetchUsers() {
    try {
      const res = await fetch('http://localhost:3000/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const users = await res.json();
      userSelect.innerHTML = users.map((u: any) => `<option value="${u.id}">${u.name}</option>`).join('');
    } catch (err) {
      console.error('❌ Failed to fetch users:', err);
    }
  }

  async function fetchProjects() {
    try {
      const res = await fetch('http://localhost:3000/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const projects = await res.json();

      projectSelect.innerHTML = projects
        .filter((p: any) => !p.user)
        .map((p: any) => `<option value="${p.id}">${p.name}</option>`)
        .join('');

      adminTableBody.innerHTML = projects.map((project: any) => `
        <tr>
          <td>${project.name}</td>
          <td>${project.description}</td>
          <td>${project.user ? project.user.name : '<span class="status-unassigned">Unassigned</span>'}</td>
          <td>${project.endDate ? new Date(project.endDate).toLocaleDateString() : ''}</td>
          <td>
            ${project.isCompleted 
              ? '<span class="status-complete">Complete</span>' 
              : (project.user 
                  ? '<span class="status-assigned">Assigned</span>' 
                  : '<span class="status-unassigned">Unassigned</span>')}
          </td>
          <td>
            ${project.user 
              ? `<button onclick="unassignProject(${project.user.id})">Unassign</button>` 
              : ''}
            <button onclick="deleteProject(${project.id})">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('❌ Failed to fetch projects:', err);
    }
  }

  projectForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (document.getElementById('project-name') as HTMLInputElement).value;
    const description = (document.getElementById('project-desc') as HTMLTextAreaElement).value;
    const endDate = (document.getElementById('project-end') as HTMLInputElement).value;

    try {
      const res = await fetch('http://localhost:3000/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name, description, endDate }),
      });

      if (!res.ok) throw new Error('Failed to create project');
      createStatus.innerText = '✅ Project created successfully.';
      projectForm.reset();
      fetchProjects();
    } catch (err) {
      createStatus.innerText = '❌ Failed to create project.';
    }
  });

  assignForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userId = parseInt(userSelect.value, 10);
  const projectId = parseInt(projectSelect.value, 10);

  // Clear and show the status element
  assignStatus.textContent = 'Processing assignment...';
  assignStatus.className = 'status-message';
  assignStatus.style.display = 'block';

  try {
    const res = await fetch('http://localhost:3000/projects/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId, projectId }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Handle specific error cases from backend
      if (data.message.includes('User already has a project assigned')) {
        throw new Error('This user already has a project assigned');
      } else if (data.message.includes('already assigned to another user')) {
        throw new Error('This project is already assigned to another user');
      } else {
        throw new Error( data.message || 'Failed to assign project');
      }
    } 

    // Success case
    assignStatus.innerHTML = '<strong>Project assigned successfully!</strong>';
    assignStatus.className = 'status-message status-success';
    
    // Clear form selections
    userSelect.value = '';
    projectSelect.value = '';

    // Refresh projects
    await fetchProjects();

    // Auto-hide after 5 seconds
    setTimeout(() => {
      assignStatus.textContent = '';
      assignStatus.className = 'status-message';
    }, 5000);

  } catch (err) {
    // Error case - show specific error message
    const errorMessage = (err as Error).message;
    assignStatus.innerHTML = `<strong> ${errorMessage}</strong>`;
    assignStatus.className = 'status-message status-error';
    
    // Keep error visible longer
    setTimeout(() => {
      assignStatus.textContent = '';
      assignStatus.className = 'status-message';
    }, 8000);
  }
});

  (window as any).deleteProject = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    await fetch(`http://localhost:3000/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchProjects();
  };

  (window as any).unassignProject = async (userId: number) => {
    if (!confirm('Unassign this project?')) return;
    await fetch('http://localhost:3000/projects/unassign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId }),
    });
    fetchProjects();
  };

  logoutBtnAdmin?.addEventListener('click', () => {
    localStorage.clear();
    window.location.reload();
  });

  // ========= USER DASHBOARD ========= //
  const welcomeMessage = document.getElementById('welcome-message') as HTMLElement;
  const projectSection = document.getElementById('project-section') as HTMLElement;
  const completeBtn = document.getElementById('complete-btn') as HTMLButtonElement;

  async function showUserDashboard() {
    showSection(userDashboard);
    try {
      const res = await fetch('http://localhost:3000/projects/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      welcomeMessage.textContent = 'Welcome to your Dashboard';
      projectSection.innerHTML = `
        <h2>Your Assigned Project:</h2>
        <p><strong>Project name: ${data.name}</strong></p>
        <p>Project description: ${data.description}</p>
        <p>End Date: ${new Date(data.endDate).toDateString()}</p>
        <p>Status: <span id="status-text">${data.isCompleted ? '✅ Completed' : '🕒 Ongoing'}</span></p>
      `;
      if (!data.isCompleted) completeBtn.classList.remove('hidden');
    } catch {
      projectSection.innerHTML = `<p>No project assigned yet.</p>`;
    }
  }

  completeBtn?.addEventListener('click', async () => {
    if (!confirm('Mark project as completed?')) return;
    const res = await fetch('http://localhost:3000/projects/complete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (res.ok) {
      alert('✅ Project marked as completed.');
      completeBtn.classList.add('hidden');
      showUserDashboard();
    } else {
      alert('❌ Failed to mark project as completed.');
    }
  });
  

  logoutBtnUser?.addEventListener('click', () => {
    localStorage.clear();
    window.location.reload();
  });

  // Admin navigation logic
const navCreate = document.getElementById('nav-create') as HTMLButtonElement;
const navAssign = document.getElementById('nav-assign') as HTMLButtonElement;
const navProjects = document.getElementById('nav-projects') as HTMLButtonElement;

const adminCreateSection = document.getElementById('admin-create-section') as HTMLElement;
const adminAssignSection = document.getElementById('admin-assign-section') as HTMLElement;
const adminProjectsSection = document.getElementById('admin-projects-section') as HTMLElement;

function showAdminSection(section: HTMLElement, navBtn: HTMLButtonElement) {
  [adminCreateSection, adminAssignSection, adminProjectsSection].forEach(s => s.classList.remove('active'));
  [navCreate, navAssign, navProjects].forEach(b => b.classList.remove('active'));
  section.classList.add('active');
  navBtn.classList.add('active');
}

// Default to show create project
navCreate?.addEventListener('click', () => showAdminSection(adminCreateSection, navCreate));
navAssign?.addEventListener('click', () => showAdminSection(adminAssignSection, navAssign));
navProjects?.addEventListener('click', () => showAdminSection(adminProjectsSection, navProjects));

// Show create project by default when admin dashboard loads
function showAdminDashboard() {
  showSection(adminDashboard);
  fetchUsers();
  fetchProjects();
  showAdminSection(adminCreateSection, navCreate);
}

// Initial check
if (token && role === 'admin') showAdminDashboard();
else if (token && role === 'user') showUserDashboard();
else showSection(authSection);
});

