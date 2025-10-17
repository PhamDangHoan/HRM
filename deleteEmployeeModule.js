import * as EmployeeDb from './employeeDbModule.js';

export function init(content) {
    const form = document.createElement('form');
    form.innerHTML = `
        <h2>Delete Employee</h2>
        <input type="number" id="deleteId" placeholder="Employee ID" required>
        <button type="submit">Delete</button>
    `;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('deleteId').value);
        const emp = EmployeeDb.getEmployeeById(id);
        if (emp && confirm(`Delete ${emp.name}?`)) {
            EmployeeDb.deleteEmployee(id);
            alert('Employee deleted');
            form.reset();
        } else {
            alert('Employee not found or cancellation');
        }
    });

    content.appendChild(form);
}