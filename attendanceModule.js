import * as EmployeeDb from './employeeDbModule.js';

const STORAGE_KEY = 'attendance';

function getAttendance() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveAttendance(att) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(att));
}

export function checkIn(employeeId) {
    EmployeeDb.getEmployeeById(employeeId); // Validate exist
    const att = getAttendance();
    const today = new Date().toISOString().split('T')[0];
    if (att.some(a => a.employeeId === employeeId && a.date === today)) {
        throw new Error('Đã checkIn hôm nay');
    }
    att.push({ date: today, employeeId, checkIn: Date.now(), checkOut: null });
    saveAttendance(att);
}

export function checkOut(employeeId) {
    const att = getAttendance();
    const today = new Date().toISOString().split('T')[0];
    const record = att.find(a => a.employeeId === employeeId && a.date === today && !a.checkOut);
    if (!record) throw new Error('Chưa checkIn hôm nay');
    record.checkOut = Date.now();
    saveAttendance(att);
}

export function getAttendanceReport(employeeId, from, to) {
    if (new Date(from) > new Date(to)) throw new Error('From <= To');
    const att = getAttendance().filter(a => a.employeeId === employeeId && a.date >= from && a.date <= to);
    return att.map(a => {
        const hours = a.checkOut ? (a.checkOut - a.checkIn) / 3600000 : 0;
        return { ...a, hours };
    });
}

function displayFormAndReport(container) {
    const form = document.createElement('form');
    form.innerHTML = `
        <input type="number" id="empId" placeholder="ID Nhân viên" required>
        <button type="button" id="checkInBtn">Check In</button>
        <button type="button" id="checkOutBtn">Check Out</button>
        <br>
        <input type="date" id="fromDate" required>
        <input type="date" id="toDate" required>
        <button type="submit">Xem Báo cáo</button>
    `;
    container.appendChild(form);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            const id = parseInt(document.getElementById('empId').value);
            const from = document.getElementById('fromDate').value;
            const to = document.getElementById('toDate').value;
            const report = getAttendanceReport(id, from, to);
            const totalHours = report.reduce((sum, r) => sum + r.hours, 0);
            const table = document.createElement('table');
            table.innerHTML = `
                <thead><tr><th>Ngày</th><th>Check In</th><th>Check Out</th><th>Giờ</th></tr></thead>
                <tbody>${report.map(r => `<tr><td>${r.date}</td><td>${new Date(r.checkIn).toLocaleTimeString()}</td><td>${r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : 'N/A'}</td><td>${r.hours.toFixed(2)}</td></tr>`).join('')}</tbody>
                <tfoot><tr><td colspan="3">Tổng giờ</td><td>${totalHours.toFixed(2)}</td></tr></tfoot>
            `;
            container.appendChild(table);
        } catch (e) {
            alert(e.message);
        }
    });

    document.getElementById('checkInBtn').addEventListener('click', () => {
        try {
            const id = parseInt(document.getElementById('empId').value);
            checkIn(id);
            alert('Check In thành công!');
        } catch (e) {
            alert(e.message);
        }
    });

    document.getElementById('checkOutBtn').addEventListener('click', () => {
        try {
            const id = parseInt(document.getElementById('empId').value);
            checkOut(id);
            alert('Check Out thành công!');
        } catch (e) {
            alert(e.message);
        }
    });
}

export function init(container) {
    container.innerHTML = '<h2>Theo dõi Chấm công</h2>';
    displayFormAndReport(container);
}