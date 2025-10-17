import * as EmployeeDb from './employeeDbModule.js';

export function calculateNetSalary(employee) {
    return employee.salary + employee.bonus - employee.deduction;
}

export function generatePayrollReport() {
    const employees = EmployeeDb.getAllEmployees();
    return employees.map(emp => ({
        ...emp,
        netSalary: calculateNetSalary(emp)
    }));
}

export function init(content) {
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>ID</th><th>Name</th><th>Salary</th><th>Bonus</th><th>Deduction</th><th>Net Salary</th><th>Actions</th></tr></thead><tbody></tbody>';
    const tbody = table.querySelector('tbody');
    refreshTable();

    function refreshTable() {
        tbody.innerHTML = '';
        const report = generatePayrollReport();
        report.forEach(emp => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${emp.id}</td><td>${emp.name}</td><td>${emp.salary}</td><td>${emp.bonus}</td><td>${emp.deduction}</td><td>${emp.netSalary}</td><td></td>`;
            const actions = row.querySelector('td:last-child');

            const updateBtn = document.createElement('button');
            updateBtn.textContent = 'Update Bonus/Deduction';
            updateBtn.addEventListener('click', () => {
                const bonus = parseFloat(prompt('New bonus', emp.bonus));
                const deduction = parseFloat(prompt('New deduction', emp.deduction));
                if (!isNaN(bonus) && !isNaN(deduction)) {
                    const updated = { ...emp, bonus, deduction };
                    EmployeeDb.updateEmployee(updated);
                    refreshTable();
                }
            });

            actions.appendChild(updateBtn);
            tbody.appendChild(row);
        });
    }

    content.appendChild(table);
}