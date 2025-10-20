import * as EmployeeDb from './employeeDbModule.js';
import * as Department from './departmentModule.js';
import * as Position from './positionModule.js';
import { refreshDashboard, debounce } from './app.js';

export function init(container) {
    // ✅ BƯỚC 1: TẠO FORM
    const form = document.createElement('form');
    form.innerHTML = `
        <h2>Thêm Nhân viên</h2>
        <input type="text" id="name" placeholder="Tên" required>
        <span id="nameError" class="error"></span>
        <select id="departmentId" required>
            <option value="">Chọn phòng ban</option>
            ${Department.getAllDepartments().map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
        </select>
        <span id="deptError" class="error"></span>
        <select id="positionId" required>
            <option value="">Chọn vị trí</option>
            ${Position.getAllPositions().map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
        </select>
        <span id="posError" class="error"></span>
        <input type="number" id="salary" placeholder="Lương" required min="1">
        <span id="salaryError" class="error"></span>
        <input type="date" id="hireDate" required>
        <span id="dateError" class="error"></span>
        <button type="submit">Thêm</button>
    `;
    
    // ✅ BƯỚC 2: APPEND FORM VÀO CONTAINER
    container.appendChild(form);
    
    // ✅ BƯỚC 3: BÂY GIỜ MỚI GET ELEMENTS & ADD EVENT LISTENERS
    const errors = {
        name: form.querySelector('#nameError'),
        dept: form.querySelector('#deptError'),
        pos: form.querySelector('#posError'),
        salary: form.querySelector('#salaryError'),
        date: form.querySelector('#dateError')
    };

    // Real-time validation
    const nameInput = form.querySelector('#name');
    nameInput.addEventListener('input', debounce(() => {
        errors.name.textContent = nameInput.value.trim() === '' ? 'Tên không được rỗng' : '';
    }));

    const salaryInput = form.querySelector('#salary');
    salaryInput.addEventListener('input', debounce(() => {
        const val = parseFloat(salaryInput.value);
        errors.salary.textContent = isNaN(val) || val <= 0 ? 'Lương phải > 0' : '';
    }));

    // Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            name: nameInput.value,
            departmentId: parseInt(form.querySelector('#departmentId').value),
            positionId: parseInt(form.querySelector('#positionId').value),
            salary: parseFloat(salaryInput.value),
            hireDate: form.querySelector('#hireDate').value,
            bonus: 0,
            deduction: 0
        };

        // Clear errors
        Object.values(errors).forEach(err => err.textContent = '');

        let valid = true;
        if (data.name.trim() === '') { errors.name.textContent = 'Tên không được rỗng'; valid = false; }
        if (!data.departmentId) { errors.dept.textContent = 'Chọn phòng ban'; valid = false; }
        if (!data.positionId) { errors.pos.textContent = 'Chọn vị trí'; valid = false; }
        if (data.salary <= 0 || isNaN(data.salary)) { errors.salary.textContent = 'Lương phải > 0'; valid = false; }
        if (!data.hireDate || isNaN(Date.parse(data.hireDate))) { errors.date.textContent = 'Ngày không hợp lệ'; valid = false; }

        if (valid) {
            try {
                EmployeeDb.addEmployee(data);
                alert('✅ Thêm thành công!');
                form.reset();
                refreshDashboard();
            } catch (e) {
                alert('❌ Lỗi: ' + e.message);
            }
        }
    });
}