import * as EmployeeDb from './employeeDbModule.js';
import * as Department from './departmentModule.js';
import * as Position from './positionModule.js';

let currentEditId = null; 

export function init(content) {
    const searchForm = document.createElement('form');
    searchForm.innerHTML = `
        <h2>Edit Employee</h2>
        <input type="number" id="editId" placeholder="Employee ID" required>
        <button type="submit">Load</button>
    `;
    const editForm = document.createElement('form');
    editForm.style.display = 'none';
    editForm.innerHTML = `
        <input type="text" id="editName" placeholder="Name" required>
        <select id="editDepartmentId"></select>
        <select id="editPositionId"></select>
        <input type="number" id="editSalary" placeholder="Salary" required min="0">
        <input type="date" id="editHireDate" required>
        <button type="submit">Update</button>
    `;

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('editId').value);
        const emp = EmployeeDb.getEmployeeById(id);
        if (emp) {
            currentEditId = id;
            document.getElementById('editName').value = emp.name;
            document.getElementById('editDepartmentId').innerHTML = Department.getAllDepartments().map(d => `<option value="${d.id}" ${d.id === emp.departmentId ? 'selected' : ''}>${d.name}</option>`).join('');
            document.getElementById('editPositionId').innerHTML = Position.getAllPositions().map(p => `<option value="${p.id}" ${p.id === emp.positionId ? 'selected' : ''}>${p.title}</option>`).join('');
            document.getElementById('editSalary').value = emp.salary;
            document.getElementById('editHireDate').value = emp.hireDate;
            editForm.style.display = 'block';
        } else {
            alert('Employee not found');
        }
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('editName').value.trim();
        const departmentId = parseInt(document.getElementById('editDepartmentId').value);
        const positionId = parseInt(document.getElementById('editPositionId').value);
        const salary = parseFloat(document.getElementById('editSalary').value);
        const hireDate = document.getElementById('editHireDate').value;

        if (!name || salary <= 0 || !hireDate) {
            alert('Invalid input');
            return;
        }

        const updated = { id: currentEditId, name, departmentId, positionId, salary, hireDate, bonus: 0, deduction: 0 };
        EmployeeDb.updateEmployee(updated);
        alert('Employee updated');
        editForm.style.display = 'none';
        searchForm.reset();
    });

    content.appendChild(searchForm);
    content.appendChild(editForm);
}