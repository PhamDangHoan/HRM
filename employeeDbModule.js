const STORAGE_KEY = 'employees';

export function initData() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const defaultEmployees = [
            { id: 1, name: 'Nguyễn Văn A', departmentId: 1, positionId: 1, salary: 1000, hireDate: '2023-01-01', bonus: 0, deduction: 0 },
            { id: 2, name: 'Trần Thị B', departmentId: 1, positionId: 2, salary: 1200, hireDate: '2023-02-01', bonus: 0, deduction: 0 },
            { id: 3, name: 'Lê Văn C', departmentId: 2, positionId: 1, salary: 1100, hireDate: '2023-03-01', bonus: 0, deduction: 0 },
            { id: 4, name: 'Phạm Thị D', departmentId: 2, positionId: 3, salary: 1300, hireDate: '2023-04-01', bonus: 0, deduction: 0 },
            { id: 5, name: 'Hoàng Văn E', departmentId: 3, positionId: 2, salary: 1400, hireDate: '2023-05-01', bonus: 0, deduction: 0 }
        ];
        saveEmployees(defaultEmployees);
    }
}

initData();

export function getAllEmployees() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        console.error('Parse error:', e);
        return [];
    }
}

export function getEmployeeById(id) {
    const emp = getAllEmployees().find(e => e.id === id);
    if (!emp) throw new Error(`Employee with id ${id} not found`);
    return emp;
}

export function saveEmployees(employees) {
    try {
        // Check size (approx)
        const data = JSON.stringify(employees);
        if (data.length > 5 * 1024 * 1024) throw new Error('LocalStorage full');
        localStorage.setItem(STORAGE_KEY, data);
    } catch (e) {
        console.error('Save error:', e);
        alert('Lỗi lưu dữ liệu: ' + e.message);
    }
}

export function addEmployee(employee) {
    const employees = getAllEmployees();
    employee.id = Math.max(...employees.map(e => e.id || 0), 0) + 1;
    employees.push(employee);
    saveEmployees(employees);
}

export function updateEmployee(updated) {
    let employees = getAllEmployees();
    const index = employees.findIndex(e => e.id === updated.id);
    if (index === -1) throw new Error('Employee not found');
    employees[index] = updated;
    saveEmployees(employees);
}

export function deleteEmployee(id) {
    let employees = getAllEmployees();
    employees = employees.filter(e => e.id !== id);
    saveEmployees(employees);
}

export const filterEmployees = (predicate) => {
    if (typeof predicate !== 'function') throw new Error('Predicate must be function');
    return (employees) => employees.filter(predicate);
};

export const sortEmployees = (comparator) => {
    if (typeof comparator !== 'function') throw new Error('Comparator must be function');
    return (employees) => [...employees].sort(comparator);
};