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
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    // Sections
    const authSection = document.getElementById('auth-section');
    const adminDashboard = document.getElementById('admin-dashboard');
    const userDashboard = document.getElementById('user-dashboard');
    // Shared elements
    const logoutBtnAdmin = document.getElementById('logout-btn-admin');
    const logoutBtnUser = document.getElementById('logout-btn-user');
    // Show relevant section
    function showSection(section) {
        authSection.classList.add('hidden');
        adminDashboard.classList.add('hidden');
        userDashboard.classList.add('hidden');
        section.classList.remove('hidden');
    }
    // ========= AUTH SECTION ========= //
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
        attachToggleListener();
    }
    function attachToggleListener() {
        const toggleLink = document.getElementById('toggle-link');
        toggleLink === null || toggleLink === void 0 ? void 0 : toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            isLogin = !isLogin;
            updateFormUI();
        });
    }
    attachToggleListener();
    form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const url = isLogin ? '/auth/login' : '/users/register';
        const payload = isLogin ? { email, password } : { name, email, password };
        try {
            const res = yield fetch(`http://localhost:3000${url}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = yield res.json();
            if (isLogin && result.access_token) {
                localStorage.setItem('token', result.access_token);
                const payload = JSON.parse(atob(result.access_token.split('.')[1]));
                localStorage.setItem('role', payload.role);
                payload.role === 'admin' ? showAdminDashboard() : showUserDashboard();
            }
            else {
                alert(result.message || 'Registered successfully');
            }
        }
        catch (_a) {
            alert('Something went wrong');
        }
    }));
    // ========= ADMIN DASHBOARD ========= //
    const userSelect = document.getElementById('user-select');
    const projectSelect = document.getElementById('project-select');
    const projectForm = document.getElementById('project-form');
    const assignForm = document.getElementById('assign-form');
    const assignStatus = document.getElementById('assign-status');
    const adminTableBody = document.getElementById('admin-table-body');
    function fetchUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield fetch('http://localhost:3000/users', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const users = yield res.json();
                userSelect.innerHTML = users.map((u) => `<option value="${u.id}">${u.name}</option>`).join('');
            }
            catch (err) {
                console.error('❌ Failed to fetch users:', err);
            }
        });
    }
    function fetchProjects() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield fetch('http://localhost:3000/projects', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const projects = yield res.json();
                projectSelect.innerHTML = projects
                    .filter((p) => !p.user)
                    .map((p) => `<option value="${p.id}">${p.name}</option>`)
                    .join('');
                adminTableBody.innerHTML = projects.map((project) => {
                    var _a, _b;
                    const assignedUser = ((_a = project.user) === null || _a === void 0 ? void 0 : _a.name) || '—';
                    let statusText = 'Unassigned';
                    let statusClass = 'status-unassigned';
                    if (project.user && project.isCompleted) {
                        statusText = 'Completed';
                        statusClass = 'status-complete';
                    }
                    else if (project.user) {
                        statusText = 'Assigned';
                        statusClass = 'status-assigned';
                    }
                    return `
          <tr>
            <td>${project.name}</td>
            <td>${project.description || ''}</td>
            <td>${assignedUser}</td>
            <td>${(_b = project.endDate) === null || _b === void 0 ? void 0 : _b.slice(0, 10)}</td>
            <td class="${statusClass}">${statusText}</td>
            <td>
              ${project.user ? `<button onclick="unassignProject(${project.user.id})">Unassign</button>` : ''}
              <button onclick="deleteProject(${project.id})">Delete</button>
            </td>
          </tr>`;
                }).join('');
            }
            catch (err) {
                console.error('❌ Failed to fetch projects:', err);
            }
        });
    }
    projectForm === null || projectForm === void 0 ? void 0 : projectForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const name = document.getElementById('project-name').value;
        const description = document.getElementById('project-desc').value;
        const endDate = document.getElementById('project-end').value;
        try {
            const res = yield fetch('http://localhost:3000/projects/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ name, description, endDate }),
            });
            if (!res.ok)
                throw new Error('Failed to create project');
            assignStatus.innerText = '✅ Project created successfully.';
            projectForm.reset();
            fetchProjects();
        }
        catch (err) {
            assignStatus.innerText = '❌ Failed to create project.';
        }
    }));
    assignForm === null || assignForm === void 0 ? void 0 : assignForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const userId = parseInt(userSelect.value, 10);
        const projectId = parseInt(projectSelect.value, 10);
        try {
            const res = yield fetch('http://localhost:3000/projects/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ userId, projectId }),
            });
            if (!res.ok) {
                const msg = yield res.text();
                throw new Error(msg || 'Assign failed');
            }
            assignStatus.innerText = '✅ Project assigned successfully.';
            fetchProjects();
        }
        catch (err) {
            assignStatus.innerText = `❌ ${err.message}`;
        }
    }));
    window.deleteProject = (id) => __awaiter(void 0, void 0, void 0, function* () {
        if (!confirm('Delete this project?'))
            return;
        yield fetch(`http://localhost:3000/projects/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchProjects();
    });
    window.unassignProject = (userId) => __awaiter(void 0, void 0, void 0, function* () {
        if (!confirm('Unassign this project?'))
            return;
        yield fetch('http://localhost:3000/projects/unassign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ userId }),
        });
        fetchProjects();
    });
    logoutBtnAdmin === null || logoutBtnAdmin === void 0 ? void 0 : logoutBtnAdmin.addEventListener('click', () => {
        localStorage.clear();
        window.location.reload();
    });
    // ========= USER DASHBOARD ========= //
    const welcomeMessage = document.getElementById('welcome-message');
    const projectSection = document.getElementById('project-section');
    const completeBtn = document.getElementById('complete-btn');
    function showUserDashboard() {
        return __awaiter(this, void 0, void 0, function* () {
            showSection(userDashboard);
            try {
                const res = yield fetch('http://localhost:3000/projects/me', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (!res.ok)
                    throw new Error();
                const data = yield res.json();
                welcomeMessage.textContent = 'Welcome to your Dashboard';
                projectSection.innerHTML = `
        <h2>Your Assigned Project:</h2>
        <p><strong>${data.name}</strong></p>
        <p>${data.description}</p>
        <p>End Date: ${new Date(data.endDate).toDateString()}</p>
        <p>Status: <span id="status-text">${data.isCompleted ? '✅ Completed' : '🕒 Ongoing'}</span></p>
      `;
                if (!data.isCompleted)
                    completeBtn.classList.remove('hidden');
            }
            catch (_a) {
                projectSection.innerHTML = `<p>No project assigned yet.</p>`;
            }
        });
    }
    completeBtn === null || completeBtn === void 0 ? void 0 : completeBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        if (!confirm('Mark project as completed?'))
            return;
        const res = yield fetch('http://localhost:3000/projects/complete', {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) {
            alert('✅ Project marked as completed.');
            completeBtn.classList.add('hidden');
            showUserDashboard();
        }
        else {
            alert('❌ Failed to mark project as completed.');
        }
    }));
    logoutBtnUser === null || logoutBtnUser === void 0 ? void 0 : logoutBtnUser.addEventListener('click', () => {
        localStorage.clear();
        window.location.reload();
    });
    function showAdminDashboard() {
        return __awaiter(this, void 0, void 0, function* () {
            showSection(adminDashboard);
            yield fetchUsers();
            yield fetchProjects();
        });
    }
    // Initial check
    if (token && role === 'admin')
        showAdminDashboard();
    else if (token && role === 'user')
        showUserDashboard();
    else
        showSection(authSection);
});
