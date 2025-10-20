import * as Auth from './authModule.js';
import * as EmployeeDb from './employeeDbModule.js';
import * as AddEmployee from './addEmployeeModule.js';
import * as EditEmployee from './editEmployeeModule.js';
import * as DeleteEmployee from './deleteEmployeeModule.js';
import * as SearchEmployee from './searchEmployeeModule.js';
import * as Department from './departmentModule.js';
import * as Position from './positionModule.js';
import * as Salary from './salaryModule.js';
import * as Attendance from './attendanceModule.js';
import * as Leave from './leaveModule.js';
import * as Performance from './performanceModule.js';

const modules = {
    addEmployee: AddEmployee,
    editEmployee: EditEmployee,
    deleteEmployee: DeleteEmployee,
    searchEmployee: SearchEmployee,
    department: Department,
    position: Position,
    salary: Salary,
    attendance: Attendance,
    leave: Leave,
    performance: Performance
};

document.addEventListener('DOMContentLoaded', async () => {
    Auth.setupAuthForms();
    if (Auth.isLoggedIn()) {
        showDashboard();
    } else {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('login-form').style.display = 'block';
    }
});

function showDashboard() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    setupMenu();
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        location.reload();
    });
}

function setupMenu() {
    const links = document.querySelectorAll('#sidebar a[data-module]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const moduleName = link.dataset.module;
            link.classList.add('active'); // Highlight
            loadModule(moduleName);
        });
    });
}

function loadModule(moduleName) {
    console.log('Loading module:', moduleName); // ✅ DEBUG
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';
    if (!modules[moduleName] || typeof modules[moduleName].init !== 'function') {
        mainContent.innerHTML = `<p>Module ${moduleName} không tồn tại!</p>`;
        return;
    }
    try {
        modules[moduleName].init(mainContent);
        console.log('✅ Module loaded:', moduleName); // ✅ DEBUG
    } catch (error) {
        console.error('❌ Error loading module:', moduleName, error);
        mainContent.innerHTML = `<p>Lỗi: ${error.message}</p>`;
    }
}

export function refreshDashboard() {
    const activeLink = document.querySelector('#sidebar a.active');
    if (activeLink) {
        loadModule(activeLink.dataset.module);
    }
}

export function debounce(func, delay = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}