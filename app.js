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

function initApp() {
    const loginForm = document.getElementById('loginForm');
    const registerBtn = document.getElementById('registerBtn');
    const logout = document.getElementById('logout');
    const menu = document.getElementById('menu');
    const content = document.getElementById('content');
    const loginDiv = document.getElementById('login-form');
    const dashboard = document.getElementById('dashboard');

    if (Auth.isLoggedIn()) {
        showDashboard();
    } else {
        showLogin();
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const success = await Auth.login(username, password);
        if (success) {
            showDashboard();
        } else {
            alert('Invalid credentials');
        }
    });

    registerBtn.addEventListener('click', () => {
        const username = prompt('Enter username');
        const password = prompt('Enter password');
        Auth.register(username, password);
    });

    logout.addEventListener('click', () => {
        Auth.logout();
        showLogin();
    });

    menu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.dataset.module) {
            e.preventDefault();
            const moduleName = e.target.dataset.module;
            content.innerHTML = '';
            modules[moduleName].init(content);
        }
    });

    EmployeeDb.initDefaultData();
    Department.initDefaultData();
    Position.initDefaultData();
    Attendance.initDefaultData();
    Leave.initDefaultData();
    Performance.initDefaultData();

    function showDashboard() {
        loginDiv.style.display = 'none';
        dashboard.style.display = 'block';
        modules['searchEmployee'].init(content);
    }

    function showLogin() {
        dashboard.style.display = 'none';
        loginDiv.style.display = 'block';
    }
}

initApp();