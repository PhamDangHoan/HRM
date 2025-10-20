import * as EmployeeDb from './employeeDbModule.js';
import * as Department from './departmentModule.js';
import { refreshDashboard } from './app.js';

export function init(container) {
    const form = document.createElement('form');
    form.innerHTML = `
        <h2>Xóa Nhân viên</h2>
        <input type="number" id="empId" placeholder="ID Nhân viên" required>
        <button type="submit">Xóa</button>
    `;
    container.appendChild(form);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(form.querySelector('#empId').value);
        try {
            const emp = EmployeeDb.getEmployeeById(id);
            const isManager = Department.getAllDepartments().some(d => d.managerId === id);
            const message = isManager ? 
                `⚠️ ${emp.name} là Manager. Xác nhận xóa?` : 
                `Xác nhận xóa ${emp.name}?`;
            
            if (confirm(message)) {
                EmployeeDb.deleteEmployee(id);
                alert('✅ Xóa thành công!');
                form.reset();
                refreshDashboard();
            }
        } catch (e) {
            alert('❌ ' + e.message);
        }
    });
}