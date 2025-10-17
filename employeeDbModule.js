export function initDefaultData() {
    if (!localStorage.getItem('employees')) {
        const defaultEmployees = [
            { id: 1, name: 'John Doe', departmentId: 1, positionId: 1, salary: 50000, hireDate: '2023-01-01', bonus: 0, deduction: 0 },
            { id: 2, name: 'Jane Smith', departmentId: 2, positionId: 2, salary: 60000, hireDate: '2023-02-01', bonus: 0, deduction: 0 },
            { id: 3, name: 'Alice Johnson', departmentId: 1, positionId: 3, salary: 55000, hireDate: '2023-03-01', bonus: 0, deduction: 0 },
            { id: 4, name: 'Bob Brown', departmentId: 2, positionId: 1, salary: 52000, hireDate: '2023-04-01', bonus: 0, deduction: 0 },
            { id: 5, name: 'Charlie Davis', departmentId: 1, positionId: 2, salary: 58000, hireDate: '2023-05-01', bonus: 0, deduction: 0 }
        ];
        localStorage.setItem('employees', JSON.stringify(defaultEmployees));
    }
}

export function getAllEmployees() {
    return JSON.parse(localStorage.getItem('employees')) || [];
}

export function getEmployeeById(id) {
    const employees = getAllEmployees();
    return employees.find(emp => emp.id === id);
}

export function saveEmployees(employees) {
    localStorage.setItem('employees', JSON.stringify(employees));
}

export function addEmployee(employee) {
    const employees = getAllEmployees();
    employee.id = Math.max(...employees.map(e => e.id), 0) + 1;
    employees.push(employee);
    saveEmployees(employees);
}

export function updateEmployee(updatedEmp) {
    let employees = getAllEmployees();
    employees = employees.map(emp => emp.id === updatedEmp.id ? updatedEmp : emp);
    saveEmployees(employees);
}

export function deleteEmployee(id) {
    let employees = getAllEmployees();
    employees = employees.filter(emp => emp.id !== id);
    saveEmployees(employees);
}

export const filterEmployees = (predicate) => (employees) => employees.filter(predicate);

export function sortEmployeesBySalary(employees, asc = true) {
    return [...employees].sort((a, b) => asc ? a.salary - b.salary : b.salary - a.salary);
}