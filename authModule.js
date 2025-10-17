const hash = (str) => {
    let val = 0;
    return function() {
        for (let i = 0; i < str.length; i++) {
            val += str.charCodeAt(i);
        }
        return val;
    };
};

export function register(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const hashed = hash(password)();
    users.push({ username, password: hashed });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Đăng ký thành công');
}

export async function login(username, password) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const hashed = hash(password)();
    const user = users.find(u => u.username === username && u.password === hashed);
    if (user) {
        localStorage.setItem('session', JSON.stringify({ username }));
        return true;
    }
    return false;
}

export function logout() {
    localStorage.removeItem('session');
}

export function isLoggedIn() {
    return !!localStorage.getItem('session');
}