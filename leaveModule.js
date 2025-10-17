const DEFAULT_BALANCE = { annual: 20, sick: 10 };

export function initDefaultData() {
    if (!localStorage.getItem('leaves')) {
        localStorage.setItem('leaves', JSON.stringify([]));
    }
    if (!localStorage.getItem('leaveBalances')) {
        localStorage.setItem('leaveBalances', JSON.stringify([]));
    }
}

export function requestLeave(employeeId, startDate, endDate, type) {
    const leaves = getLeaves();
    const id = leaves.length + 1;
    leaves.push({ id, employeeId, startDate, endDate, type, status: 'pending' });
    saveLeaves(leaves);
}

export function approveLeave(leaveId) {
    let leaves = getLeaves();
    const leave = leaves.find(l => l.id === leaveId);
    if (leave) {
        leave.status = 'approved';
        updateBalance(leave.employeeId, leave.type, calculateDays(leave.startDate, leave.endDate));
        saveLeaves(leaves);
    }
}

function calculateDays(start, end) {
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24) + 1;
    return diff;
}

function updateBalance(employeeId, type, days) {
    let balances = getBalances();
    let bal = balances.find(b => b.employeeId === employeeId);
    if (!bal) {
        bal = { employeeId, ...DEFAULT_BALANCE };
        balances.push(bal);
    }
    bal[type] -= days;
    saveBalances(balances);
}

export function getLeaveBalance(employeeId) {
    const balances = getBalances();
    return balances.find(b => b.employeeId === employeeId) || { ...DEFAULT_BALANCE };
}

function getLeaves() {
    return JSON.parse(localStorage.getItem('leaves')) || [];
}

function saveLeaves(leaves) {
    localStorage.setItem('leaves', JSON.stringify(leaves));
}

function getBalances() {
    return JSON.parse(localStorage.getItem('leaveBalances')) || [];
}

function saveBalances(balances) {
    localStorage.setItem('leaveBalances', JSON.stringify(balances));
}

export function init(content) {
    const requestForm = document.createElement('form');
    requestForm.innerHTML = `
        <h2>Leave Management</h2>
        <input type="number" id="leaveEmpId" placeholder="Employee ID" required>
        <input type="date" id="startDate" required>
        <input type="date" id="endDate" required>
        <select id="leaveType"><option value="annual">Annual</option><option value="sick">Sick</option></select>
        <button type="submit">Request Leave</button>
    `;

    requestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const employeeId = parseInt(document.getElementById('leaveEmpId').value);
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const type = document.getElementById('leaveType').value;
        requestLeave(employeeId, startDate, endDate, type);
        alert('Leave requested');
        refreshTable();
    });

    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>ID</th><th>Employee ID</th><th>Start</th><th>End</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead><tbody></tbody>';
    const tbody = table.querySelector('tbody');
    refreshTable();

    function refreshTable() {
        tbody.innerHTML = '';
        getLeaves().forEach(l => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${l.id}</td><td>${l.employeeId}</td><td>${l.startDate}</td><td>${l.endDate}</td><td>${l.type}</td><td>${l.status}</td><td></td>`;
            if (l.status === 'pending') {
                const approveBtn = document.createElement('button');
                approveBtn.textContent = 'Approve';
                approveBtn.addEventListener('click', () => {
                    approveLeave(l.id);
                    refreshTable();
                });
                row.querySelector('td:last-child').appendChild(approveBtn);
            }
            tbody.appendChild(row);
        });
    }

    content.appendChild(requestForm);
    content.appendChild(table);
}