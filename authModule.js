//  AUTH MODULE - HỆ THỐNG ĐĂNG NHẬP/ĐĂNG KÝ HOÀN CHỈNH
// LocalStorage + Hashing + Session + Validation + UI Toggle

const USERS_KEY = 'users';                               //  KEY: Lưu danh sách users
const SESSION_KEY = 'session';                           //  KEY: Lưu session hiện tại
const EXPIRY_HOURS = 1;                                  // SESSION hết hạn: 1 giờ

//  PASSWORD HASHER: CLOSURE + SALT + BASE64 (SIMPLE SECURITY)
const createHasher = () => {
    const salt = 'secretSalt';                           //  SALT: Bí mật (hardcode cho demo)
    return (password) => btoa(password + salt);          //  HASH: password + salt → Base64
};

const hashPassword = createHasher();                     //  FACTORY: Tạo hasher instance

//  VALIDATION FUNCTIONS: KIỂM TRA INPUT
// VALIDATE PASSWORD: ≥6 ký tự, KHÔNG khoảng trắng
function validatePassword(password) {
    return password.length >= 6 && !/\s/.test(password); // REGEX: \s = whitespace
}

// VALIDATE USERNAME: Không rỗng + Chưa tồn tại
function validateUsername(username, users) {
    return username.trim() !== '' && !users.find(u => u.username === username);
}

//  SETUP AUTH FORMS: BIND EVENTS CHO LOGIN/REGISTER
// GỌI TỪ: app.js → DOMContentLoaded
export function setupAuthForms() {
    // ═══ GET ELEMENTS ═══
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    // ═══ EVENT: SWITCH LOGIN ↔ REGISTER ═══
    switchToRegister.addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';     // HIDE: Login
        document.getElementById('register-form').style.display = 'block'; // SHOW: Register
    });

    switchToLogin.addEventListener('click', () => {
        document.getElementById('register-form').style.display = 'none';  // HIDE: Register
        document.getElementById('login-form').style.display = 'block';    // SHOW: Login
    });

    // ═══ EVENT: REGISTER FORM SUBMIT ═══
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();                              // NGĂN: Reload page
        
        // ═══ GET INPUT VALUES ═══
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirmPassword').value;
        const errorDiv = document.getElementById('regError');
        errorDiv.textContent = '';                       // CLEAR: Lỗi cũ

        // ═══ VALIDATE ═══
        const users = getUsers();
        if (!validateUsername(username, users)) {
            errorDiv.textContent = 'Tên đăng nhập không hợp lệ hoặc đã tồn tại.';
            return;
        }
        if (!validatePassword(password)) {
            errorDiv.textContent = 'Mật khẩu phải ít nhất 6 ký tự, không chứa khoảng trắng.';
            return;
        }
        if (password !== confirm) {
            errorDiv.textContent = 'Mật khẩu xác nhận không khớp.';
            return;
        }

        // ═══ SAVE NEW USER ═══
        users.push({ username, password: hashPassword(password) }); // HASH: Mã hóa
        saveUsers(users);
        alert('Đăng ký thành công!');
        switchToLogin.click();                           // AUTO: Chuyển sang Login
    });

    // ═══ EVENT: LOGIN FORM SUBMIT ═══
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // ═══ GET INPUT VALUES ═══
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = '';

        //  FAKE DELAY: 1.5s (mô phỏng API call)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // ═══ AUTHENTICATE ═══
        const users = getUsers();
        const user = users.find(u => 
            u.username === username && 
            u.password === hashPassword(password)        // SO SÁNH HASH
        );
        
        if (user) {
            // ═══ CREATE SESSION ═══
            const expiry = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
            localStorage.setItem(SESSION_KEY, JSON.stringify({ username, expiry }));
            window.location.reload();                    // RELOAD: → Dashboard
        } else {
            errorDiv.textContent = 'Tên đăng nhập hoặc mật khẩu sai.';
        }
    });
}

//  USERS CRUD: LOCALSTORAGE HELPER FUNCTIONS
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []; // DEFAULT: []
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

//  CHECK LOGIN STATUS: KIỂM TRA SESSION CÒN HỢP LỆ?
// GỌI TỪ: app.js → DOMContentLoaded
export function isLoggedIn() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return false;                          // KHÔNG có session
    
    const { expiry } = JSON.parse(session);
    if (new Date(expiry) < new Date()) {                 // HẾT HẠN
        logout();                                        // AUTO: Clear
        return false;
    }
    return true;                                         // VALID SESSION
}

//  LOGOUT: XÓA SESSION
// GỌI TỪ: app.js → Logout button
export function logout() {
    localStorage.removeItem(SESSION_KEY);                // XÓA: Session
    console.log('👋 User logged out');
}