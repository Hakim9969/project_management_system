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
Object.defineProperty(exports, "__esModule", { value: true });
const token = localStorage.getItem('token');
if (!token)
    window.location.href = '/index.html';
const userSelect = document.getElementById('user-select');
const projectSelect = document.getElementById('project-select');
const projectForm = document.getElementById('project-form');
const assignForm = document.getElementById('assign-form');
const logoutBtn = document.getElementById('logout-btn');
function fetchUsers() {
    fetch('http://localhost:3000/users', {
        headers: { Authorization: `Bearer ${token}` },
    })
        .then(res => res.json())
        .then(users => {
        userSelect.innerHTML = users.map((u) => `<option value="${u.id}">${u.name}</option>`).join('');
    });
}
function fetchProjects() {
    fetch('http://localhost:3000/projects', {
        headers: { Authorization: `Bearer ${token}` },
    })
        .then(res => res.json())
        .then(projects => {
        projectSelect.innerHTML = projects
            .filter((p) => !p.user) // unassigned only
            .map((p) => `<option value="${p.id}">${p.name}</option>`)
            .join('');
    });
}
projectForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const name = document.getElementById('project-name').value;
    const description = document.getElementById('project-desc').value;
    const endDate = document.getElementById('project-end').value;
    yield fetch('http://localhost:3000/projects/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, endDate }),
    });
    fetchProjects(); // reload projects
}));
assignForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const userId = userSelect.value;
    const projectId = projectSelect.value;
    yield fetch('http://localhost:3000/projects/assign', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: +userId, projectId: +projectId }),
    });
    fetchProjects(); // reload available projects
}));
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/index.html';
});
fetchUsers();
fetchProjects();
