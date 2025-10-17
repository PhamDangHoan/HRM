import * as EmployeeDb from './employeeDbModule.js';
import * as Department from './departmentModule.js';
import * as Position from './positionModule.js';

export function init(content) {
    const form = document.createElement('form');
    form.innerHTML = `
        <h2>Search Employees</h2>
        <input type="text" id="searchName" placeholder="Name (regex)">
        <select id="searchDepartment">
            <option value="">All Departments</option>
            ${Department.getAllDepartments().map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
        </select>
        <input type="number" id="minSalary" placeholder="Min Salary">
        <input type="number" id="maxSalary" placeholder="Max Salary">
        <button type="submit">Search</button>
    `;
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Position</th><th>Salary</th><th>Hire Date</th></tr></thead><tbody></tbody>';

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameRegex = new RegExp(document.getElementById('searchName').value.trim(), 'i');
        const deptId = document.getElementById('searchDepartment').value;
        const minSalary = parseFloat(document.getElementById('minSalary').value) || 0;
        const maxSalary = parseFloat(document.getElementById('maxSalary').value) || Infinity;

        const filterFn = emp => 
            nameRegex.test(emp.name) &&
            (!deptId || emp.departmentId == deptId) &&
            emp.salary >= minSalary &&
            emp.salary <= maxSalary;

        let results = EmployeeDb.getAllEmployees().filter(filterFn);
        results = EmployeeDb.sortEmployeesBySalary(results); // Example sort

        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        results.forEach(emp => {
            const dept = Department.getDepartmentById(emp.departmentId);
            const pos = Position.getPositionById(emp.positionId);
            const row = `<tr><td>${emp.id}</td><td>${emp.name}</td><td>${dept ? dept.name : ''}</td><td>${pos ? pos.title : ''}</td><td>${emp.salary}</td><td>${emp.hireDate}</td></tr>`;
            tbody.innerHTML += row;
        });
    });

    content.appendChild(form);
    content.appendChild(table);
}