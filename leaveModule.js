import * as EmployeeDb from './employeeDbModule.js';

const STORAGE_KEY = 'leaves';
const DEFAULT_BALANCE = { annual: 20, sick: 10 };

function getLeaves() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveLeaves(leaves) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaves));
}

export function requestLeave(employeeId, startDate, endDate, type) {
    EmployeeDb.getEmployeeById(employeeId);
    if (new Date(startDate) > new Date(endDate)) throw new Error('Start <= End');
    const leaves = getLeaves();
    const overlap = leaves.some(l => l.employeeId === employeeId && l.status === 'approved' &&
        !(new Date(endDate) < new Date(l.startDate) || new Date(startDate) > new Date(l.endDate)));
    if (overlap) throw new Error('Trùng lịch nghỉ');
    const id = leaves.length + 1;
    leaves.push({ id, employeeId, startDate, endDate, type, status: 'pending' });
    saveLeaves(leaves);
}

export function approveLeave(leaveId) {
    let leaves = getLeaves();
    const leave = leaves.find(l => l.id === leaveId);
    if (!leave) throw new Error('Không tìm thấy');
    leave.status = 'approved';
    const days = (new Date(leave.endDate) - new Date(leave.startDate)) / (86400000) + 1;
    // Update balance (lưu trong employee cho đơn giản)
    let emp = EmployeeDb.getEmployeeById(leave.employeeId);
    emp.leaveBalance = emp.leaveBalance || DEFAULT_BALANCE;
    emp.leaveBalance[leave.type] -= days;
    if (emp.leaveBalance[leave.type] < 0) throw new Error('Không đủ ngày nghỉ');
    EmployeeDb.updateEmployee(emp);
    saveLeaves(leaves);
}

export function getLeaveBalance(employeeId) {
    const emp = EmployeeDb.getEmployeeById(employeeId);
    return emp.leaveBalance || DEFAULT_BALANCE;
}

function displayRequests(container) {
    // Tương tự, thêm approve button
}

export function init(container) {
    container.innerHTML = '<h2>Quản lý Nghỉ phép</h2>';
    displayRequests(container);

    const form = document.createElement('form');
    form.innerHTML = `
        <input type="number" id="empId" placeholder="ID Nhân viên" required>
        <input type="date" id="startDate" required>
        <input type="date" id="endDate" required>
        <select id="type"><option value="annual">Nghỉ thường niên</option><option value="sick">Nghỉ ốm</option></select>
        <button type="submit">Yêu cầu</button>
    `;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            const id = parseInt(document.getElementById('empId').value);
            const start = document.getElementById('startDate').value;
            const end = document.getElementById('endDate').value;
            const type = document.getElementById('type').value;
            requestLeave(id, start, end, type);
            alert('Yêu cầu thành công!');
            init(container);
        } catch (e) {
            alert(e.message);
        }
    });
    container.appendChild(form);
}