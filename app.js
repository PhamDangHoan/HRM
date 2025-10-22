// TỔNG HỢP + ROUTING + ERROR HANDLING + GLOBAL FUNCTIONS
import * as Auth from './authModule.js';                    // XÁC THỰC NGƯỜI DÙNG
import * as EmployeeDb from './employeeDbModule.js';       // DATABASE NHÂN VIỆN
import * as EmployeeManagement from './employeeManagementModule.js';  // QUẢN LÝ NHÂN VIỆN
import * as SearchEmployee from './searchEmployeeModule.js';         //  TÌM KIẾM NHÂN VIỆN
import * as Department from './departmentModule.js';       //  PHÒNG BAN
import * as Position from './positionModule.js';           // VỊ TRÍ
import * as Salary from './salaryModule.js';               //  LƯƠNG THƯỞNG
import * as Attendance from './attendanceModule.js';       //  CHẤM CÔNG
import * as Leave from './leaveModule.js';                 //  NGHỈ PHÉP
import * as Performance from './performanceModule.js';     //  ĐÁNH GIÁ HIỆU SUẤT

//  MODULE REGISTRY: DANH SÁCH TẤT CẢ MODULES (ROUTING MAP)
const modules = {
    employeeManagement: EmployeeManagement,     // ROUTE: /employee-management → Bảng danh sách NV
    searchEmployee: SearchEmployee,             // ROUTE: /search → Tìm kiếm NV
    department: Department,                     // ROUTE: /department → Quản lý phòng ban
    position: Position,                         // ROUTE: /position → Quản lý vị trí
    salary: Salary,                             // ROUTE: /salary → Quản lý lương
    attendance: Attendance,                     // ROUTE: /attendance → Chấm công
    leave: Leave,                               // ROUTE: /leave → Nghỉ phép
    performance: Performance                    // ROUTE: /performance → Đánh giá
};

//  GLOBAL ERROR HANDLER: BẮT MỌI LỖI TRONG ỨNG DỤNG
window.onerror = function (message, source, lineno, colno, error) {
    // LOG: Chi tiết lỗi cho developer
    console.error('Global error:', message);
    // ALERT: Thông báo thân thiện cho user
    alert('Đã xảy ra lỗi: ' + message);
};

//  MAIN INITIALIZATION: CHẠY KHI PAGE LOAD XONG
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎉 App starting...');
    
    // BƯỚC 1: SETUP AUTH FORMS (login/register UI)
    Auth.setupAuthForms();
    
    // BƯỚC 2: CHECK LOGIN STATUS → SHOW DASHBOARD HOẶC LOGIN FORM
    if (Auth.isLoggedIn()) {
        console.log('✅ User logged in → Show Dashboard');
        showDashboard();                             // USER ĐÃ LOGIN → DASHBOARD
    } else {
        console.log('🔐 User not logged in → Show Login');
        // SHOW: Auth container + Login form
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('login-form').style.display = 'block';
    }
});

//  SHOW DASHBOARD: HIỂN THỊ GIAO DIỆN CHÍNH SAU LOGIN
function showDashboard() {
    // HIDE: Auth screens
    document.getElementById('auth-container').style.display = 'none';
    
    // SHOW: Main dashboard
    document.getElementById('dashboard').style.display = 'flex';
    
    // SETUP: Menu navigation
    setupMenu();
    
    // SETUP: Logout button
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();                          // NGĂN: Default link behavior
        Auth.logout();                               // CALL: Clear session
        location.reload();                           // RELOAD: Back to login
    });
    
    console.log('✅ Dashboard loaded');
}

//  SETUP MENU: CLICK MENU → LOAD MODULE TƯƠNG ỨNG
function setupMenu() {
    // GET: Tất cả menu links có data-module attribute
    const links = document.querySelectorAll('#sidebar a[data-module]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();                      // NGĂN: Page jump
            
            // GET: Module name từ data attribute
            const moduleName = link.dataset.module;
            
            // UI: Active state cho menu
            document.querySelectorAll('#sidebar a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // LOAD: Module tương ứng
            loadModule(moduleName);
        });
    });
    
    console.log('✅ Menu setup complete');
}

//  LOAD MODULE: CORE ROUTING FUNCTION
function loadModule(moduleName) {
    console.log('Loading module:', moduleName);
    
    // GET: Main content area
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';                      // CLEAR: Nội dung cũ
    
    // CHECK: Module tồn tại?
    if (!modules[moduleName] || typeof modules[moduleName].init !== 'function') {
        // ERROR: Module không tồn tại
        mainContent.innerHTML = `<p>Module ${moduleName} không tồn tại!</p>`;
        console.error('❌ Module not found:', moduleName);
        return;
    }
    
    try {
        // CALL: Module.init(container) → Render UI
        modules[moduleName].init(mainContent);
        console.log('✅ Module loaded:', moduleName);
    } catch (error) {
        // ERROR HANDLING: Hiển thị lỗi user-friendly
        console.error('❌ Error loading module:', moduleName, error);
        mainContent.innerHTML = `<p>Lỗi: ${error.message}</p>`;
    }
}

//  EXPORT: REFRESH DASHBOARD - DÙNG TRONG CÁC MODULE
// FIXED: Hàm này cho phép module tự refresh khi data thay đổi
export function refreshDashboard() {
    // TÌM: Menu item đang active
    const activeLink = document.querySelector('#sidebar a.active');
    if (activeLink) {
        // RELOAD: Module hiện tại
        loadModule(activeLink.dataset.module);
        console.log('🔄 Dashboard refreshed');
    }
}

// EXPORT: DEBOUNCE - TỐI ỨU VALIDATION REAL-TIME
// TRÁNH: Gọi function quá nhiều khi user gõ nhanh
export function debounce(func, delay = 300) {
    let timeout;                                     // STORAGE: Timer ID
    return (...args) => {                            // RETURN: Wrapped function
        clearTimeout(timeout);                       // CLEAR: Timer cũ
        timeout = setTimeout(() => func(...args), delay); // SET: Timer mới
    };
}