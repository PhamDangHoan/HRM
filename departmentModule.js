import * as EmployeeDb from './employeeDbModule.js';
import { refreshDashboard } from './app.js';

const STORAGE_KEY = 'departments';

function initData() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const defaults = [
            { id: 1, name: 'IT', managerId: 1, level: 1.5 },
            { id: 2, name: 'HR', managerId: 2, level: 1.2 },
            { id: 3, name: 'Finance', managerId: 3, level: 1.7 }
        ];
        saveDepartments(defaults);
    }
}

initData();

function getAllDepartments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveDepartments(depts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(depts));
}

export { getAllDepartments };

export function addDepartment(name, level = 1) {
    if (name.trim() === '' || getAllDepartments().some(d => d.name === name)) {
        throw new Error('Tên phòng ban không hợp lệ hoặc đã tồn tại');
    }
    const depts = getAllDepartments();
    const id = Math.max(...depts.map(d => d.id), 0) + 1;
    depts.push({ id, name, managerId: null, level: parseFloat(level) || 1 });
    saveDepartments(depts);
}

export function editDepartment(id, newName, newLevel) {
    if (newName.trim() === '') throw new Error('Tên mới không hợp lệ');
    let depts = getAllDepartments();
    const index = depts.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Không tìm thấy phòng ban');
    depts[index].name = newName;
    depts[index].level = parseFloat(newLevel) || depts[index].level || 1; // ✅ Default 1 nếu undefined
    saveDepartments(depts);
}

export function deleteDepartment(id) {
    const employees = EmployeeDb.getAllEmployees().filter(e => e.departmentId === id);
    if (employees.length > 0) throw new Error('Không thể xóa vì có nhân viên liên kết');
    let depts = getAllDepartments();
    depts = depts.filter(d => d.id !== id);
    saveDepartments(depts);
}

function displayList(container) {
    const depts = getAllDepartments();
    const table = document.createElement('table');
    table.innerHTML = `
        <h3>Danh sách Phòng ban (${depts.length})</h3>
        <thead><tr><th>ID</th><th>Tên</th><th>Level (Hệ số)</th><th>Actions</th></tr></thead>
        <tbody>${depts.map(d => `
            <tr>
                <td>${d.id}</td>
                <td>${d.name}</td>
                <td>${(d.level || 1).toFixed(1)}x</td> <!-- ✅ SAFE: Default 1 nếu undefined -->
                <td>
                    <button onclick="editDept(${d.id})">Sửa</button>
                    <button onclick="deleteDept(${d.id})">Xóa</button>
                </td>
            </tr>
        `).join('')}</tbody>
    `;
    container.appendChild(table);
}

let editingDeptId = null;

function createForm(container) {
    const form = document.createElement('form');
    const dept = editingDeptId ? getAllDepartments().find(d => d.id === editingDeptId) : null;
    form.innerHTML = `
        <h3>${editingDeptId ? 'Sửa Phòng ban' : 'Thêm Phòng ban'}</h3>
        <input type="text" id="deptName" placeholder="Tên phòng ban" required value="${dept?.name || ''}">
        <input type="number" id="deptLevel" placeholder="Hệ số lương (1.0-2.0)" step="0.1" min="1" max="2" value="${dept?.level || 1}">
        <button type="submit">${editingDeptId ? 'Cập nhật' : 'Thêm'}</button>
        <button type="button" id="cancel">Hủy</button>
    `;
    container.appendChild(form);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.querySelector('#deptName').value;
        const level = parseFloat(form.querySelector('#deptLevel').value);
        try {
            if (editingDeptId) {
                editDepartment(editingDeptId, name, level);
                alert('Cập nhật thành công!');
            } else {
                addDepartment(name, level);
                alert('Thêm thành công!');
            }
            editingDeptId = null;
            init(container);
        } catch (e) {
            alert('Lỗi: ' + e.message);
        }
    });

    form.querySelector('#cancel').addEventListener('click', () => {
        editingDeptId = null;
        init(container);
    });
}

window.editDept = (id) => { editingDeptId = id; createForm(document.getElementById('main-content')); };
window.deleteDept = (id) => {
    if (confirm('Xác nhận xóa?')) {
        try {
            deleteDepartment(id);
            alert('Xóa thành công!');
            init(document.getElementById('main-content'));
        } catch (e) {
            alert('Lỗi: ' + e.message);
        }
    }
};

export function init(container) {
    container.innerHTML = '<h2>Quản lý Phòng ban</h2>';
    const addBtn = document.createElement('button');
    addBtn.textContent = '➕ Thêm Phòng ban';
    addBtn.addEventListener('click', () => createForm(container));
    container.appendChild(addBtn);
    displayList(container);
}