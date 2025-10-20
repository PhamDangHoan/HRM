const USERS_KEY = 'users';
const SESSION_KEY = 'session';
const EXPIRY_HOURS = 1;

// Closure for hash with salt
const createHasher = () => {
    const salt = 'secretSalt'; // Simple salt
    return (password) => btoa(password + salt); // Base64 encode
};

const hashPassword = createHasher();

function validatePassword(password) {
    return password.length >= 6 && !/\s/.test(password);
}

function validateUsername(username, users) {
    return username.trim() !== '' && !users.find(u => u.username === username);
}

export function setupAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    switchToRegister.addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    });

    switchToLogin.addEventListener('click', () => {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirmPassword').value;
        const errorDiv = document.getElementById('regError');
        errorDiv.textContent = '';

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

        users.push({ username, password: hashPassword(password) });
        saveUsers(users);
        alert('Đăng ký thành công!');
        switchToLogin.click();
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = '';

        await new Promise(resolve => setTimeout(resolve, 1500)); // Delay 1.5s

        const users = getUsers();
        const user = users.find(u => u.username === username && u.password === hashPassword(password));
        if (user) {
            const expiry = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
            localStorage.setItem(SESSION_KEY, JSON.stringify({ username, expiry }));
            window.location.reload();
        } else {
            errorDiv.textContent = 'Tên đăng nhập hoặc mật khẩu sai.';
        }
    });
}

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function isLoggedIn() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return false;
    const { expiry } = JSON.parse(session);
    if (new Date(expiry) < new Date()) {
        logout();
        return false;
    }
    return true;
}

export function logout() {
    localStorage.removeItem(SESSION_KEY);
}