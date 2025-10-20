import * as EmployeeDb from './employeeDbModule.js';

const STORAGE_KEY = 'positions';

function initData() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const defaults = [
            { id: 1, title: 'Developer', description: 'Phát triển phần mềm', salaryBase: 1000 },
            { id: 2, title: 'Manager', description: 'Quản lý đội nhóm', salaryBase: 1500 },
            { id: 3, title: 'Analyst', description: 'Phân tích nghiệp vụ', salaryBase: 1200 },
            { id: 4, title: 'Tester', description: 'Kiểm thử phần mềm', salaryBase: 900 },
            { id: 5, title: 'Designer', description: 'Thiết kế giao diện', salaryBase: 1100 }
        ];
        savePositions(defaults);
    }
}

initData();

function getAllPositions() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        console.error('Parse positions error:', e);
        return [];
    }
}

async function savePositions(positions) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Fake async delay
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch (e) {
        console.error('Save positions error:', e);
        throw new Error('Lưu vị trí thất bại');
    }
}

export { getAllPositions };

export async function addPosition(title, description, salaryBase) {
    if (!title.trim()) throw new Error('Tiêu đề không được rỗng');
    if (salaryBase <= 0) throw new Error('Lương cơ bản phải > 0');
    
    const positions = getAllPositions();
    const existing = positions.find(p => p.title === title);
    if (existing) throw new Error('Vị trí đã tồn tại');
    
    const id = Math.max(...positions.map(p => p.id), 0) + 1;
    const newPos = { id, title, description, salaryBase };
    positions.push(newPos);
    await savePositions(positions);
}

export async function editPosition(id, updates) {
    if (!updates.title?.trim()) throw new Error('Tiêu đề không được rỗng');
    if (updates.salaryBase && updates.salaryBase <= 0) throw new Error('Lương cơ bản phải > 0');
    
    let positions = getAllPositions();
    const index = positions.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Không tìm thấy vị trí');
    
    positions[index] = { ...positions[index], ...updates };
    await savePositions(positions);
}

export async function deletePosition(id) {
    const employees = EmployeeDb.getAllEmployees().filter(e => e.positionId === id);
    if (employees.length > 0) {
        throw new Error(`Không thể xóa! Có ${employees.length} nhân viên đang giữ vị trí này`);
    }
    
    let positions = getAllPositions();
    positions = positions.filter(p => p.id !== id);
    await savePositions(positions);
}

function displayTable(container) {
    const positions = getAllPositions();
    const table = document.createElement('table');
    table.innerHTML = `
        <h3>Danh sách Vị trí (${positions.length})</h3>
        <thead>
            <tr><th>ID</th><th>Tiêu đề</th><th>Mô tả</th><th>Lương cơ bản</th><th>Actions</th></tr>
        </thead>
        <tbody>
            ${positions.map(p => `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.title}</td>
                    <td>${p.description}</td>
                    <td>${p.salaryBase.toLocaleString()}</td>
                    <td>
                        <button onclick="editPos(${p.id})">Sửa</button>
                        <button onclick="deletePos(${p.id})">Xóa</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    container.appendChild(table);
}

let editingId = null;

function createAddForm(container) {
    const form = document.createElement('form');
    form.innerHTML = `
        <h3>${editingId ? 'Sửa Vị trí' : 'Thêm Vị trí'}</h3>
        <input type="text" id="title" placeholder="Tiêu đề" required>
        <input type="text" id="description" placeholder="Mô tả" required>
        <input type="number" id="salaryBase" placeholder="Lương cơ bản" min="1" required>
        <button type="submit">${editingId ? 'Cập nhật' : 'Thêm'}</button>
        <button type="button" id="cancel">Hủy</button>
    `;
    container.appendChild(form);
    
    const pos = editingId ? getAllPositions().find(p => p.id === editingId) : null;
    if (pos) {
        form.querySelector('#title').value = pos.title;
        form.querySelector('#description').value = pos.description;
        form.querySelector('#salaryBase').value = pos.salaryBase;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const title = form.querySelector('#title').value;
            const description = form.querySelector('#description').value;
            const salaryBase = parseFloat(form.querySelector('#salaryBase').value);
            
            if (editingId) {
                await editPosition(editingId, { title, description, salaryBase });
                alert('✅ Cập nhật thành công!');
            } else {
                await addPosition(title, description, salaryBase);
                alert('✅ Thêm thành công!');
            }
            
            editingId = null;
            init(container);
        } catch (e) {
            alert('❌ ' + e.message);
        }
    });
    
    form.querySelector('#cancel').addEventListener('click', () => {
        editingId = null;
        init(container);
    });
}

window.editPos = (id) => {
    editingId = id;
    const container = document.getElementById('main-content');
    createAddForm(container);
};

window.deletePos = async (id) => {
    if (confirm('Xác nhận xóa vị trí?')) {
        try {
            await deletePosition(id);
            alert('✅ Xóa thành công!');
            const container = document.getElementById('main-content');
            init(container);
        } catch (e) {
            alert('❌ ' + e.message);
        }
    }
};

export function init(container) {
    container.innerHTML = '<h2>Quản lý Vị trí</h2>';
    
    const addBtn = document.createElement('button');
    addBtn.textContent = '➕ Thêm Vị trí';
    addBtn.style.marginBottom = '10px';
    addBtn.addEventListener('click', () => createAddForm(container));
    container.appendChild(addBtn);
    
    displayTable(container);
}