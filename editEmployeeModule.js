import * as EmployeeDb from './employeeDbModule.js';
import * as Department from './departmentModule.js';
import * as Position from './positionModule.js';
import { refreshDashboard } from './app.js';

export function init(container) {
    const searchForm = document.createElement('form');
    searchForm.innerHTML = `
        <h2>Tìm Nhân viên để Sửa</h2>
        <input type="number" id="empId" placeholder="ID Nhân viên" required>
        <button type="submit">Tìm</button>
    `;
    container.appendChild(searchForm);

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(searchForm.querySelector('#empId').value);
        try {
            const emp = EmployeeDb.getEmployeeById(id);
            container.innerHTML = ''; // Clear
            const editForm = createEditForm(emp);
            container.appendChild(editForm);

            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const updated = {
                    id: emp.id,
                    name: editForm.querySelector('#name').value,
                    departmentId: parseInt(editForm.querySelector('#departmentId').value),
                    positionId: parseInt(editForm.querySelector('#positionId').value),
                    salary: parseFloat(editForm.querySelector('#salary').value),
                    hireDate: editForm.querySelector('#hireDate').value,
                    bonus: emp.bonus,
                    deduction: emp.deduction
                };

                if (confirm('Xác nhận cập nhật?')) {
                    EmployeeDb.updateEmployee(updated);
                    alert('✅ Cập nhật thành công!');
                    refreshDashboard();
                }
            });
        } catch (e) {
            alert('❌ ' + e.message);
        }
    });
}

function createEditForm(emp) {
    const form = document.createElement('form');
    form.innerHTML = `
        <h2>Sửa: ${emp.name}</h2>
        <input type="text" id="name" value="${emp.name}" required>
        <select id="departmentId">
            ${Department.getAllDepartments().map(d => `<option value="${d.id}" ${d.id === emp.departmentId ? 'selected' : ''}>${d.name}</option>`).join('')}
        </select>
        <select id="positionId">
            ${Position.getAllPositions().map(p => `<option value="${p.id}" ${p.id === emp.positionId ? 'selected' : ''}>${p.title}</option>`).join('')}
        </select>
        <input type="number" id="salary" value="${emp.salary}" min="1" required>
        <input type="date" id="hireDate" value="${emp.hireDate}" required>
        <button type="submit">Cập nhật</button>
    `;
    return form;
}