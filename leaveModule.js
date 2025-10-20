import * as EmployeeDb from './employeeDbModule.js';

const STORAGE_KEY = 'leaves';
const BALANCE_KEY = 'leaveBalances';
const DEFAULT_BALANCE = { annual: 20, sick: 10 };

function getLeaves() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveLeaves(leaves) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaves));
}

function getLeaveBalance(employeeId) {
    const balances = JSON.parse(localStorage.getItem(BALANCE_KEY)) || {};
    return balances[employeeId] || DEFAULT_BALANCE;
}

function saveBalance(employeeId, balance) {
    const balances = JSON.parse(localStorage.getItem(BALANCE_KEY)) || {};
    balances[employeeId] = balance;
    localStorage.setItem(BALANCE_KEY, JSON.stringify(balances));
}

export function requestLeave(employeeId, startDate, endDate, type) {
    EmployeeDb.getEmployeeById(employeeId);
    if (new Date(startDate) > new Date(endDate)) throw new Error('Start <= End');
    const leaves = getLeaves();
    const overlap = leaves.some(l => l.employeeId === employeeId && l.status === 'approved' &&
        !(new Date(endDate) < new Date(l.startDate) || new Date(startDate) > new Date(l.endDate)));
    if (overlap) throw new Error('Trùng lịch nghỉ');
    const id = Math.max(...leaves.map(l => l.id || 0), 0) + 1;
    leaves.push({ id, employeeId, startDate, endDate, type, status: 'pending' });
    saveLeaves(leaves);
}

export function approveLeave(leaveId) {
    let leaves = getLeaves();
    const leave = leaves.find(l => l.id === leaveId);
    if (!leave) throw new Error('Không tìm thấy');
    leave.status = 'approved';
    // ✅ TÍNH ĐÚNG SỐ NGÀY: +1 NGÀY KỂ CẢ KẾT THÚC
    const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    const balance = getLeaveBalance(leave.employeeId);
    if (balance[leave.type] < days) throw new Error(`Không đủ ngày nghỉ ${leave.type}. Còn ${balance[leave.type]} ngày, cần ${days} ngày.`);
    balance[leave.type] -= days;
    saveBalance(leave.employeeId, balance);
    saveLeaves(leaves);
}

export function addLeaveBalance(employeeId, type, days) {
    if (days <= 0) throw new Error('Số ngày phải > 0');
    const balance = getLeaveBalance(employeeId);
    balance[type] = (balance[type] || 0) + days;
    saveBalance(employeeId, balance);
    return balance[type];
}

function displayRequests(container) {
    const tableDiv = document.createElement('div');
    tableDiv.innerHTML = '<h3>Danh sách Yêu cầu Nghỉ phép</h3>';
    const leaves = getLeaves();
    
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Nhân viên ID</th>
                <th>Bắt đầu</th>
                <th>Kết thúc</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody>
            ${leaves.length > 0 ? 
                leaves.map(l => `
                    <tr>
                        <td>${l.id}</td>
                        <td>${l.employeeId}</td>
                        <td>${l.startDate}</td>
                        <td>${l.endDate}</td>
                        <td>${l.type}</td>
                        <td>${l.status}</td>
                        <td>
                            ${l.status === 'pending' ? `<button class="approve-btn" data-id="${l.id}">Duyệt</button>` : 'Đã xử lý'}
                        </td>
                    </tr>
                `).join('') : 
                '<tr><td colspan="7" style="text-align:center;">Chưa có yêu cầu nghỉ phép</td></tr>'
            }
        </tbody>
    `;
    tableDiv.appendChild(table);
    container.appendChild(tableDiv);

    table.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            try {
                approveLeave(id);
                alert('✅ Duyệt thành công!');
                init(container);
            } catch (e) {
                alert('❌ ' + e.message);
            }
        });
    });
}

export function init(container) {
    container.innerHTML = '<h2>Quản lý Nghỉ phép</h2>';
    displayRequests(container);
    
    const form = document.createElement('form');
    form.innerHTML = `
        <h3>Yêu cầu Nghỉ phép Mới</h3>
        <input type="number" id="empId" placeholder="ID Nhân viên" required>
        <input type="date" id="startDate" required>
        <input type="date" id="endDate" required>
        <select id="type">
            <option value="annual">Nghỉ thường niên</option>
            <option value="sick">Nghỉ ốm</option>
        </select>
        <button type="submit">Yêu cầu</button>
    `;
    container.appendChild(form);
    
    const balanceForm = document.createElement('form');
    balanceForm.innerHTML = `
        <h3>Nạp Ngày Nghỉ</h3>
        <input type="number" id="balanceEmpId" placeholder="ID Nhân viên" required>
        <select id="balanceType">
            <option value="annual">Nghỉ thường niên</option>
            <option value="sick">Nghỉ ốm</option>
        </select>
        <input type="number" id="balanceDays" placeholder="Số ngày" min="1" required>
        <button type="submit">Nạp</button>
    `;
    container.appendChild(balanceForm);
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            const id = parseInt(document.getElementById('empId').value);
            const start = document.getElementById('startDate').value;
            const end = document.getElementById('endDate').value;
            const type = document.getElementById('type').value;
            requestLeave(id, start, end, type);
            alert('✅ Yêu cầu thành công!');
            form.reset();
            init(container);
        } catch (e) {
            alert('❌ ' + e.message);
        }
    });
    
    balanceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            const id = parseInt(document.getElementById('balanceEmpId').value);
            const type = document.getElementById('balanceType').value;
            const days = parseInt(document.getElementById('balanceDays').value);
            const newBalance = addLeaveBalance(id, type, days);
            alert(`✅ Nạp thành công! Còn ${newBalance} ngày ${type}.`);
            balanceForm.reset();
            init(container);
        } catch (e) {
            alert('❌ ' + e.message);
        }
    });
}