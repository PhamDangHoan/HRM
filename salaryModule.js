import * as EmployeeDb from './employeeDbModule.js';

export function calculateNetSalary(employee) {
    if (employee.bonus < 0 || employee.deduction < 0) throw new Error('Bonus/deduction >= 0');
    return employee.salary + employee.bonus - employee.deduction;
}

export function generatePayrollReport() {
    const employees = EmployeeDb.getAllEmployees();
    const report = employees.map(emp => ({
        ...emp,
        netSalary: calculateNetSalary(emp)
    }));
    const total = report.reduce((sum, r) => sum + r.netSalary, 0);
    return { report, total };
}

function displayReport(container) {
    const { report, total } = generatePayrollReport();
    const table = document.createElement('table');
    table.innerHTML = `
        <thead><tr><th>ID</th><th>Tên</th><th>Lương Gốc</th><th>Thưởng</th><th>Khấu trừ</th><th>Lương Ròng</th></tr></thead>
        <tbody>${report.map(r => `<tr><td>${r.id}</td><td>${r.name}</td><td>${r.salary}</td><td>${r.bonus}</td><td>${r.deduction}</td><td>${r.netSalary}</td></tr>`).join('')}</tbody>
        <tfoot><tr><td colspan="5">Tổng</td><td>${total}</td></tr></tfoot>
    `;
    container.appendChild(table);
}

export function init(container) {
    container.innerHTML = '<h2>Quản lý Lương</h2>';
    displayReport(container);

    const form = document.createElement('form');
    form.innerHTML = `
        <input type="number" id="empId" placeholder="ID Nhân viên" required>
        <input type="number" id="bonus" placeholder="Thưởng" min="0">
        <input type="number" id="deduction" placeholder="Khấu trừ" min="0">
        <button type="submit">Cập nhật</button>
    `;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('empId').value);
        const bonus = parseFloat(document.getElementById('bonus').value) || 0;
        const deduction = parseFloat(document.getElementById('deduction').value) || 0;
        try {
            let emp = EmployeeDb.getEmployeeById(id);
            emp = { ...emp, bonus, deduction };
            EmployeeDb.updateEmployee(emp);
            init(container);
        } catch (e) {
            alert(e.message);
        }
    });
    container.appendChild(form);
}