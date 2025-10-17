export function initDefaultData() {
    if (!localStorage.getItem('reviews')) {
        localStorage.setItem('reviews', JSON.stringify([]));
    }
}

export function addReview(employeeId, rating, feedback) {
    const reviews = getReviews();
    reviews.push({ employeeId, date: new Date().toISOString().split('T')[0], rating, feedback });
    saveReviews(reviews);
}

export function getAverageRating(employeeId) {
    const reviews = getReviews().filter(r => r.employeeId === employeeId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
}

function getReviews() {
    return JSON.parse(localStorage.getItem('reviews')) || [];
}

function saveReviews(reviews) {
    localStorage.setItem('reviews', JSON.stringify(reviews));
}

export function init(content) {
    const addForm = document.createElement('form');
    addForm.innerHTML = `
        <h2>Performance Reviews</h2>
        <input type="number" id="revEmpId" placeholder="Employee ID" required>
        <input type="number" id="rating" placeholder="Rating (1-5)" min="1" max="5" required>
        <input type="text" id="feedback" placeholder="Feedback" required>
        <button type="submit">Add Review</button>
    `;

    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const employeeId = parseInt(document.getElementById('revEmpId').value);
        const rating = parseInt(document.getElementById('rating').value);
        const feedback = document.getElementById('feedback').value.trim();
        if (rating >= 1 && rating <= 5 && feedback) {
            addReview(employeeId, rating, feedback);
            alert('Review added');
            refreshReport();
            addForm.reset();
        }
    });

    const reportDiv = document.createElement('div');
    refreshReport();

    function refreshReport() {
        reportDiv.innerHTML = '<h3>Performance Report</h3>';
        const table = document.createElement('table');
        table.innerHTML = '<thead><tr><th>Employee ID</th><th>Average Rating</th></tr></thead><tbody></tbody>';
        const tbody = table.querySelector('tbody');

        const uniqueEmps = [...new Set(getReviews().map(r => r.employeeId))];
        let averages = uniqueEmps.map(id => ({ id, avg: getAverageRating(id) }));
        averages = averages.sort((a, b) => b.avg - a.avg);

        averages.forEach(a => {
            tbody.innerHTML += `<tr><td>${a.id}</td><td>${a.avg.toFixed(2)}</td></tr>`;
        });

        reportDiv.appendChild(table);
    }

    content.appendChild(addForm);
    content.appendChild(reportDiv);
}