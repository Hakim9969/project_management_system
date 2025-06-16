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

      adminTableBody.innerHTML = projects.map((project: any) => {
        const assignedUser = project.user?.name || '—';
        let statusText = 'Unassigned';
        let statusClass = 'status-unassigned';

        if (project.user && project.isCompleted) {
          statusText = 'Completed';
          statusClass = 'status-complete';
        } else if (project.user) {
          statusText = 'Assigned';
          statusClass = 'status-assigned';
        }

        return `
          <tr>
            <td>${project.name}</td>
            <td>${project.description || ''}</td>
            <td>${assignedUser}</td>
            <td>${project.endDate?.slice(0, 10)}</td>
            <td class="${statusClass}">${statusText}</td>
            <td>
              ${project.user ? `<button onclick="unassignProject(${project.user.id})">Unassign</button>` : ''}
              <button onclick="deleteProject(${project.id})">Delete</button>
            </td>
          </tr>`;
      }).join('');
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
      assignStatus.innerText = '✅ Project created successfully.';
      projectForm.reset();
      fetchProjects();
    } catch (err) {
      assignStatus.innerText = '❌ Failed to create project.';
    }
  });

  assignForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = parseInt(userSelect.value, 10);
    const projectId = parseInt(projectSelect.value, 10);

    try {
      const res = await fetch('http://localhost:3000/projects/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId, projectId }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Assign failed');
      }

      assignStatus.innerText = '✅ Project assigned successfully.';
      fetchProjects();
    } catch (err) {
      assignStatus.innerText = `❌ ${(err as Error).message}`;
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
        <p><strong>${data.name}</strong></p>
        <p>${data.description}</p>
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

  async function showAdminDashboard() {
    showSection(adminDashboard);
    await fetchUsers();
    await fetchProjects();
  }

  // Initial check
  if (token && role === 'admin') showAdminDashboard();
  else if (token && role === 'user') showUserDashboard();
  else showSection(authSection);
});

