export function initDefaultData() {
    if (!localStorage.getItem('attendance')) {
        localStorage.setItem('attendance', JSON.stringify([]));
    }
}

export function checkIn(employeeId) {
    const attendance = getAttendance();
    const today = new Date().toISOString().split('T')[0];
    attendance.push({ date: today, employeeId, checkIn: new Date().toISOString(), checkOut: null });
    saveAttendance(attendance);
}

export function checkOut(employeeId) {
    const attendance = getAttendance();
    const today = new Date().toISOString().split('T')[0];
    const record = attendance.findLast(r => r.date === today && r.employeeId === employeeId && !r.checkOut);
    if (record) {
        record.checkOut = new Date().toISOString();
        saveAttendance(attendance);
    }
}

export function getAttendanceReport(employeeId, fromDate, toDate) {
    const attendance = getAttendance().filter(r => r.employeeId === employeeId && r.date >= fromDate && r.date <= toDate);
    return attendance.map(r => {
        if (r.checkOut) {
            const hours = (new Date(r.checkOut) - new Date(r.checkIn)) / (1000 * 60 * 60);
            return { ...r, hours };
        }
        return r;
    });
}

function getAttendance() {
    return JSON.parse(localStorage.getItem('attendance')) || [];
}

function saveAttendance(attendance) {
    localStorage.setItem('attendance', JSON.stringify(attendance));
}

export function init(content) {
    const form = document.createElement('form');
    form.innerHTML = `
        <h2>Attendance</h2>
        <input type="number" id="attEmpId" placeholder="Employee ID" required>
        <button type="button" id="checkInBtn">Check In</button>
        <button type="button" id="checkOutBtn">Check Out</button>
        <input type="date" id="fromDate">
        <input type="date" id="toDate">
        <button type="submit">Get Report</button>
    `;
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th></tr></thead><tbody></tbody>';

    document.getElementById('checkInBtn').addEventListener('click', () => {
        const id = parseInt(document.getElementById('attEmpId').value);
        checkIn(id);
        alert('Checked in');
    });

    document.getElementById('checkOutBtn').addEventListener('click', () => {
        const id = parseInt(document.getElementById('attEmpId').value);
        checkOut(id);
        alert('Checked out');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('attEmpId').value);
        const fromDate = document.getElementById('fromDate').value || '1900-01-01';
        const toDate = document.getElementById('toDate').value || new Date().toISOString().split('T')[0];
        const report = getAttendanceReport(id, fromDate, toDate);
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        report.forEach(r => {
            const row = `<tr><td>${r.date}</td><td>${r.checkIn}</td><td>${r.checkOut || 'N/A'}</td><td>${r.hours || 'N/A'}</td></tr>`;
            tbody.innerHTML += row;
        });
    });

    content.appendChild(form);
    content.appendChild(table);
}