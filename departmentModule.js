import * as EmployeeDb from './employeeDbModule.js';
import { refreshDashboard } from './app.js';

const STORAGE_KEY = 'departments';

function initData() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const defaults = [
            { id: 1, name: 'IT', managerId: 1 },
            { id: 2, name: 'HR', managerId: 2 },
            { id: 3, name: 'Finance', managerId: 3 }
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

export function addDepartment(name) {
    if (name.trim() === '' || getAllDepartments().some(d => d.name === name)) {
        throw new Error('Tên phòng ban không hợp lệ hoặc đã tồn tại');
    }
    const depts = getAllDepartments();
    const id = Math.max(...depts.map(d => d.id), 0) + 1;
    depts.push({ id, name, managerId: null });
    saveDepartments(depts);
}

export function editDepartment(id, newName) {
    if (newName.trim() === '') throw new Error('Tên mới không hợp lệ');
    let depts = getAllDepartments();
    const index = depts.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Không tìm thấy phòng ban');
    depts[index].name = newName;
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
    // Tương tự trước, thêm try-catch cho actions
    // ...
}

export function init(container) {
    container.innerHTML = '<h2>Quản lý Phòng ban</h2>';
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Thêm Phòng ban';
    addBtn.addEventListener('click', () => {
        const name = prompt('Tên phòng ban:');
        try {
            addDepartment(name);
            init(container);
            refreshDashboard(); // Để update selects ở các module khác
        } catch (e) {
            alert(e.message);
        }
    });
    container.appendChild(addBtn);
    displayList(container);
}