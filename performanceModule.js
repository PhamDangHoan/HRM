import * as EmployeeDb from './employeeDbModule.js';  // ✅ THÊM DÒNG NÀY

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
    const employees = EmployeeDb.getAllEmployees();  // ✅ BÂY GIỜ ĐÚNG!
    return employees.map(emp => ({ ...emp, avg: getAverageRating(emp.id) }))
        .sort((a, b) => b.avg - a.avg);
}

function displayReport(container) {
    const tops = getTopPerformers();
    const table = document.createElement('table');
    table.innerHTML = `
        <h3>🏆 Top Performers</h3>
        <thead><tr><th>ID</th><th>Tên</th><th>Điểm TB</th><th>Reviews</th></tr></thead>
        <tbody>${
            tops.map(t => `<tr>
                <td>${t.id}</td>
                <td>${t.name}</td>
                <td><strong>${t.avg.toFixed(2)}</strong></td>
                <td>${getReviews().filter(r => r.employeeId === t.id).length}</td>
            </tr>`).join('')
        }</tbody>
    `;
    container.appendChild(table);
}

export function init(container) {
    // ✅ BƯỚC 1: TẠO FORM
    const form = document.createElement('form');
    form.innerHTML = `
        <h2>Đánh giá Hiệu suất</h2>
        <input type="number" id="empId" placeholder="ID Nhân viên" required>
        <input type="number" id="rating" placeholder="Điểm (1-5)" min="1" max="5" required>
        <input type="text" id="feedback" placeholder="Phản hồi" required>
        <button type="submit">Thêm Đánh giá</button>
    `;
    
    // ✅ BƯỚC 2: APPEND FORM
    container.appendChild(form);
    
    // ✅ BƯỚC 3: DISPLAY REPORT TRƯỚC
    displayReport(container);
    
    // ✅ BƯỚC 4: EVENT LISTENER
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            const id = parseInt(form.querySelector('#empId').value);
            const rating = parseInt(form.querySelector('#rating').value);
            const feedback = form.querySelector('#feedback').value;
            
            addReview(id, rating, feedback);
            alert('✅ Thêm thành công!');
            form.reset();
            displayReport(container); // Refresh table
        } catch (e) {
            alert('❌ ' + e.message);
        }
    });
}