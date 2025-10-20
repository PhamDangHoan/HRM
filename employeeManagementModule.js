import * as EmployeeDb from './employeeDbModule.js';
import * as Department from './departmentModule.js';
import * as Position from './positionModule.js';
import { refreshDashboard, debounce } from './app.js';

let editingId = null;

function displayEmployeeList(container) {
    const employees = EmployeeDb.getAllEmployees();
    const table = document.createElement('table');
    table.innerHTML = `
        <h3>Danh sách Nhân viên (${employees.length})</h3>
        <thead><tr><th>ID</th><th>Tên</th><th>Phòng ban</th><th>Vị trí</th><th>Lương</th><th>Ngày vào</th><th>Actions</th></tr></thead>
        <tbody>${employees.map(emp => {
            const pos = Position.getAllPositions().find(p => p.id === emp.positionId);
            const dept = Department.getAllDepartments().find(d => d.id === emp.departmentId);
            const baseSalary = pos ? pos.salaryBase : 0;
            const deptFactor = dept?.level || 1;
            const salary = baseSalary * deptFactor;
            return `
                <tr>
                    <td>${emp.id}</td>
                    <td>${emp.name}</td>
                    <td>${dept?.name || 'N/A'}</td>
                    <td>${pos?.title || 'N/A'}</td>
                    <td>${salary.toLocaleString()}</td>
                    <td>${emp.hireDate}</td>
                    <td>
                        <button class="edit-btn" data-id="${emp.id}">Sửa</button>
                        <button class="delete-btn" data-id="${emp.id}">Xóa</button>
                    </td>
                </tr>
            `;
        }).join('')}</tbody>
    `;
    container.appendChild(table);

    table.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            editingId = parseInt(btn.dataset.id);
            showForm(container, editingId);
        });
    });

    table.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const emp = EmployeeDb.getEmployeeById(id);
            if (confirm(`Xác nhận xóa ${emp.name}?`)) {
                EmployeeDb.deleteEmployee(id);
                alert('Xóa thành công!');
                init(container);
            }
        });
    });
}

function showForm(container, id = null) {
    container.innerHTML = '';
    const currentDate = new Date().toISOString().split('T')[0]; // ✅ DYNAMIC: Lấy ngày hiện tại của thiết bị (20/10/2025)

    const emp = id ? EmployeeDb.getEmployeeById(id) : null;
    const title = id ? 'Sửa Nhân viên' : 'Thêm Nhân viên';

    const form = document.createElement('form');
    form.innerHTML = `
        <h2>${title}</h2>
        <input type="text" id="name" placeholder="Tên" required value="${emp?.name || ''}">
        <span id="nameError" class="error"></span>
        <select id="departmentId" required>
            <option value="">Chọn phòng ban</option>
            ${Department.getAllDepartments().map(d => `<option value="${d.id}" ${emp && d.id === emp.departmentId ? 'selected' : ''}>${d.name} (Level ${d.level || 1}x)</option>`).join('')}
        </select>
        <span id="deptError" class="error"></span>
        <select id="positionId" required>
            <option value="">Chọn vị trí</option>
            ${Position.getAllPositions().map(p => `<option value="${p.id}" ${emp && p.id === emp.positionId ? 'selected' : ''}>${p.title} (${p.salaryBase.toLocaleString()})</option>`).join('')}
        </select>
        <span id="posError" class="error"></span>
        <input type="number" id="salary" placeholder="Lương" readonly value="${emp?.salary || ''}">
        <span id="salaryError" class="error"></span>
        <input type="date" id="hireDate" required max="${currentDate}" value="${emp?.hireDate || ''}">
        <span id="dateError" class="error"></span>
        <button type="submit">${id ? 'Cập nhật' : 'Thêm'}</button>
        <button type="button" id="cancel">Hủy</button>
    `;
    container.appendChild(form);

    const deptSelect = form.querySelector('#departmentId');
    const posSelect = form.querySelector('#positionId');
    const salaryInput = form.querySelector('#salary');

    function updateSalary() {
        const deptId = parseInt(deptSelect.value);
        const posId = parseInt(posSelect.value);
        const pos = Position.getAllPositions().find(p => p.id === posId);
        const dept = Department.getAllDepartments().find(d => d.id === deptId);
        const baseSalary = pos ? pos.salaryBase : 0;
        const deptFactor = dept?.level || 1;
        salaryInput.value = baseSalary * deptFactor || '';
    }

    deptSelect.addEventListener('change', updateSalary);
    posSelect.addEventListener('change', updateSalary);

    if (emp) {
        deptSelect.dispatchEvent(new Event('change'));
        posSelect.dispatchEvent(new Event('change'));
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            name: form.querySelector('#name').value,
            departmentId: parseInt(form.querySelector('#departmentId').value),
            positionId: parseInt(form.querySelector('#positionId').value),
            salary: parseFloat(salaryInput.value),
            hireDate: form.querySelector('#hireDate').value,
            bonus: emp?.bonus || 0,
            deduction: emp?.deduction || 0
        };

        if (id) data.id = id;

        let valid = true;
        if (data.name.trim() === '') { form.querySelector('#nameError').textContent = 'Tên không được rỗng'; valid = false; }
        if (!data.departmentId) { form.querySelector('#deptError').textContent = 'Chọn phòng ban'; valid = false; }
        if (!data.positionId) { form.querySelector('#posError').textContent = 'Chọn vị trí'; valid = false; }
        if (isNaN(data.salary) || data.salary <= 0) { form.querySelector('#salaryError').textContent = 'Lương không hợp lệ'; valid = false; }
        if (!data.hireDate || isNaN(Date.parse(data.hireDate))) { form.querySelector('#dateError').textContent = 'Ngày không hợp lệ'; valid = false; }

        if (valid) {
            try {
                if (id) {
                    EmployeeDb.updateEmployee(data);
                    alert('Cập nhật thành công!');
                } else {
                    EmployeeDb.addEmployee(data);
                    alert('Thêm thành công!');
                }
                init(container);
            } catch (e) {
                alert('Lỗi: ' + e.message);
            }
        }
    });

    form.querySelector('#cancel').addEventListener('click', () => init(container));
}

export function init(container) {
    container.innerHTML = '';
    const addBtn = document.createElement('button');
    addBtn.textContent = '➕ Thêm Nhân viên';
    addBtn.addEventListener('click', () => showForm(container));
    container.appendChild(addBtn);
    displayEmployeeList(container);
}