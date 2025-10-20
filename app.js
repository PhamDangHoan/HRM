import * as Auth from './authModule.js';
import * as EmployeeDb from './employeeDbModule.js';
import * as EmployeeManagement from './employeeManagementModule.js';
import * as SearchEmployee from './searchEmployeeModule.js';
import * as Department from './departmentModule.js';
import * as Position from './positionModule.js';
import * as Salary from './salaryModule.js';
import * as Attendance from './attendanceModule.js';
import * as Leave from './leaveModule.js';
import * as Performance from './performanceModule.js';

const modules = {
    employeeManagement: EmployeeManagement,
    searchEmployee: SearchEmployee,
    department: Department,
    position: Position,
    salary: Salary,
    attendance: Attendance,
    leave: Leave,
    performance: Performance
};

window.onerror = function (message, source, lineno, colno, error) {
    console.error('Global error:', message);
    alert('Đã xảy ra lỗi: ' + message);
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
            document.querySelectorAll('#sidebar a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            loadModule(moduleName);
        });
    });
}

function loadModule(moduleName) {
    console.log('Loading module:', moduleName);
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';
    if (!modules[moduleName] || typeof modules[moduleName].init !== 'function') {
        mainContent.innerHTML = `<p>Module ${moduleName} không tồn tại!</p>`;
        return;
    }
    try {
        modules[moduleName].init(mainContent);
        console.log('✅ Module loaded:', moduleName);
    } catch (error) {
        console.error('❌ Error loading module:', moduleName, error);
        mainContent.innerHTML = `<p>Lỗi: ${error.message}</p>`;
    }
}

// ✅ FIXED: EXPORT 2 HÀM NÀY CHO CÁC MODULE DÙNG
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