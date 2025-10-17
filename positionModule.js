export function initDefaultData() {
    if (!localStorage.getItem('positions')) {
        const defaults = [
            { id: 1, title: 'Developer', description: 'Software dev', salaryBase: 50000 },
            { id: 2, title: 'Manager', description: 'Team manager', salaryBase: 60000 },
            { id: 3, title: 'Analyst', description: 'Data analyst', salaryBase: 55000 }
        ];
        localStorage.setItem('positions', JSON.stringify(defaults));
    }
}

export function getAllPositions() {
    return JSON.parse(localStorage.getItem('positions')) || [];
}

export function getPositionById(id) {
    return getAllPositions().find(p => p.id === id);
}

export async function addPosition(title, desc) {
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const positions = getAllPositions();
    const id = Math.max(...positions.map(p => p.id), 0) + 1;
    positions.push({ id, title, description: desc, salaryBase: 0 });
    savePositions(positions);
}

export async function editPosition(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 500));
    let positions = getAllPositions();
    positions = positions.map(p => p.id === id ? { ...p, ...updates } : p);
    savePositions(positions);
}

export async function deletePosition(id) {
    await new Promise(resolve => setTimeout(resolve, 500));
    let positions = getAllPositions();
    positions = positions.filter(p => p.id !== id);
    savePositions(positions);
}

function savePositions(positions) {
    localStorage.setItem('positions', JSON.stringify(positions));
}

export function init(content) {
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>ID</th><th>Title</th><th>Description</th><th>Actions</th></tr></thead><tbody></tbody>';
    const tbody = table.querySelector('tbody');
    refreshTable();

    const addForm = document.createElement('form');
    addForm.innerHTML = `
        <h2>Manage Positions</h2>
        <input type="text" id="posTitle" placeholder="Title" required>
        <input type="text" id="posDesc" placeholder="Description" required>
        <button type="submit">Add</button>
    `;

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('posTitle').value.trim();
        const desc = document.getElementById('posDesc').value.trim();
        if (title && desc) {
            await addPosition(title, desc);
            refreshTable();
            addForm.reset();
        }
    });

    function refreshTable() {
        tbody.innerHTML = '';
        getAllPositions().forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${p.id}</td><td>${p.title}</td><td>${p.description}</td><td></td>`;
            const actions = row.querySelector('td:last-child');

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', async () => {
                const newTitle = prompt('New title', p.title);
                const newDesc = prompt('New desc', p.description);
                if (newTitle && newDesc) {
                    await editPosition(p.id, { title: newTitle, description: newDesc });
                    refreshTable();
                }
            });

            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.addEventListener('click', async () => {
                if (confirm('Delete position?')) {
                    await deletePosition(p.id);
                    refreshTable();
                }
            });

            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            tbody.appendChild(row);
        });
    }

    content.appendChild(addForm);
    content.appendChild(table);
}