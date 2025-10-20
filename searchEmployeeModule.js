import * as EmployeeDb from './employeeDbModule.js';
import * as Department from './departmentModule.js';
import { sortEmployees } from './employeeDbModule.js';

export function init(container) {
    // ✅ BƯỚC 1: TẠO FORM
    const form = document.createElement('form');
    form.innerHTML = `
        <h2>Tìm kiếm Nhân viên</h2>
        <input type="text" id="name" placeholder="Tên">
        <select id="departmentId">
            <option value="">Tất cả</option>
            ${Department.getAllDepartments().map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
        </select>
        <input type="number" id="minSalary" placeholder="Lương tối thiểu">
        <input type="number" id="maxSalary" placeholder="Lương tối đa">
        <span id="salaryError" class="error"></span>
        <button type="submit">Tìm</button>
        <br><br>
        <button type="button" id="sortAsc">↑ Lương Tăng</button>
        <button type="button" id="sortDesc">↓ Lương Giảm</button>
    `;
    
    // ✅ BƯỚC 2: APPEND FORM
    container.appendChild(form);
    
    // ✅ BƯỚC 3: EVENT LISTENERS
    const error = form.querySelector('#salaryError');
    const resultsDiv = document.createElement('div');
    container.appendChild(resultsDiv);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            const nameInput = form.querySelector('#name').value;
            const nameRegex = new RegExp(nameInput || '.*', 'i');
            const deptId = parseInt(form.querySelector('#departmentId').value) || null;
            const minSal = parseFloat(form.querySelector('#minSalary').value) || 0;
            const maxSal = parseFloat(form.querySelector('#maxSalary').value) || Infinity;

            if (minSal > maxSal) {
                error.textContent = 'Min <= Max';
                return;
            }
            error.textContent = '';

            const predicate = emp => 
                nameRegex.test(emp.name) &&
                (!deptId || emp.departmentId === deptId) &&
                emp.salary >= minSal && emp.salary <= maxSal;

            let results = EmployeeDb.getAllEmployees().filter(predicate);
            displayResults(results, resultsDiv);
        } catch (e) {
            alert('Regex lỗi: ' + e.message);
        }
    });

    // Sort buttons
    form.querySelector('#sortAsc').addEventListener('click', () => {
        let results = EmployeeDb.getAllEmployees().sort((a, b) => a.salary - b.salary);
        displayResults(results, resultsDiv);
    });

    form.querySelector('#sortDesc').addEventListener('click', () => {
        let results = EmployeeDb.getAllEmployees().sort((a, b) => b.salary - a.salary);
        displayResults(results, resultsDiv);
    });
}

function displayResults(results, container) {
    container.innerHTML = results.length ? `
        <h3>Kết quả (${results.length})</h3>
        <table>
            <thead><tr><th>ID</th><th>Tên</th><th>Phòng ban</th><th>Lương</th></tr></thead>
            <tbody>${results.map(emp => `<tr><td>${emp.id}</td><td>${emp.name}</td><td>${emp.departmentId}</td><td>${emp.salary}</td></tr>`).join('')}</tbody>
        </table>
    ` : '<p>Không có kết quả</p>';
}