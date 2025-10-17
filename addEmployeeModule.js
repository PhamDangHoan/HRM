import * as EmployeeDb from './employeeDbModule.js';
import * as Department from './departmentModule.js';
import * as Position from './positionModule.js';

export function init(content) {
    const form = document.createElement('form');
    form.innerHTML = `
        <h2>Add Employee</h2>
        <input type="text" id="name" placeholder="Name" required>
        <select id="departmentId">
            ${Department.getAllDepartments().map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
        </select>
        <select id="positionId">
            ${Position.getAllPositions().map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
        </select>
        <input type="number" id="salary" placeholder="Salary" required min="0">
        <input type="date" id="hireDate" required>
        <button type="submit">Add</button>
    `;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const departmentId = parseInt(document.getElementById('departmentId').value);
        const positionId = parseInt(document.getElementById('positionId').value);
        const salary = parseFloat(document.getElementById('salary').value);
        const hireDate = document.getElementById('hireDate').value;

        if (!name || salary <= 0 || !hireDate) {
            alert('Invalid input');
            return;
        }

        const employee = { name, departmentId, positionId, salary, hireDate, bonus: 0, deduction: 0 };
        EmployeeDb.addEmployee(employee);
        alert('Employee added');
        form.reset();
    });

    content.appendChild(form);
}