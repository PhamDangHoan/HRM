import * as EmployeeDb from './employeeDbModule.js';

const STORAGE_KEY = 'reviews';

function getReviews() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveReviews(reviews) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function addReview(employeeId, rating, feedback) {
    if (rating < 1 || rating > 5) throw new Error('Rating 1-5');
    if (feedback.trim() === '') throw new Error('Feedback không rỗng');
    const reviews = getReviews();
    reviews.push({ employeeId, date: new Date().toISOString().split('T')[0], rating, feedback });
    saveReviews(reviews);
}

export function getAverageRating(employeeId) {
    const reviews = getReviews().filter(r => r.employeeId === employeeId);
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
}

function getTopPerformers() {
    const employees = EmployeeDb.getAllEmployees();
    return employees.map(emp => ({ ...emp, avg: getAverageRating(emp.id) }))
        .sort((a, b) => b.avg - a.avg);
}

function displayReport(container) {
    // ✅ CLEAR TRƯỚC KHI HIỂN BẢNG
    const reportDiv = document.createElement('div');
    reportDiv.innerHTML = '<h3>🏆 Top Performers</h3>';
    
    const tops = getTopPerformers();
    const table = document.createElement('table');
    table.innerHTML = `
        <thead><tr><th>ID</th><th>Tên</th><th>Điểm TB</th><th>Số Reviews</th></tr></thead>
        <tbody>${
            tops.length > 0 ? 
            tops.map(t => `
                <tr>
                    <td>${t.id}</td>
                    <td>${t.name}</td>
                    <td>${t.avg.toFixed(2)}</td>
                    <td>${getReviews().filter(r => r.employeeId === t.id).length}</td>
                </tr>
            `).join('') : 
            '<tr><td colspan="4" style="text-align:center;">Chưa có đánh giá nào</td></tr>'
        }</tbody>
    `;
    reportDiv.appendChild(table);
    container.appendChild(reportDiv);
}

export function init(container) {
    // ✅ CLEAR CONTAINER TRƯỚC
    container.innerHTML = '<h2>Đánh giá Hiệu suất</h2>';
    
    // ✅ HIỂN BẢNG TRƯỚC
    displayReport(container);
    
    // ✅ FORM THÊM SAU
    const form = document.createElement('form');
    form.innerHTML = `
        <h3>Thêm Đánh Giá</h3>
        <input type="number" id="empId" placeholder="ID Nhân viên" required>
        <input type="number" id="rating" placeholder="Điểm (1-5)" min="1" max="5" required>
        <input type="text" id="feedback" placeholder="Phản hồi" required>
        <button type="submit">Thêm Đánh giá</button>
    `;
    container.appendChild(form);
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            const id = parseInt(document.getElementById('empId').value);
            const rating = parseInt(document.getElementById('rating').value);
            const feedback = document.getElementById('feedback').value;
            addReview(id, rating, feedback);
            alert('✅ Thêm thành công!');
            form.reset();
            // ✅ REFRESH: CLEAR + RE-INIT ĐỂ KHÔNG TRÙNG
            init(container);
        } catch (e) {
            alert('❌ ' + e.message);
        }
    });
}