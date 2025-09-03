let lists = {};
let currentListId = null;
let editingTaskId = null;

// Initialize the app
function init() {
  loadFromMemory();
  renderLists();
  updateListSelect();
}

// Load data (placeholder for localStorage)
function loadFromMemory() {
  if (Object.keys(lists).length === 0) {
    lists = {};
  }
}

// Save data (placeholder for localStorage)
function saveToMemory() {
  // localStorage.setItem('todoLists', JSON.stringify(lists));
}

// Create a new list
function createList() {
  const listName = document.getElementById('listNameInput').value.trim();
  if (!listName) {
    alert('Please enter a list name');
    return;
  }

  const listId = 'list_' + Date.now();
  lists[listId] = { id: listId, name: listName, tasks: [] };

  document.getElementById('listNameInput').value = '';
  currentListId = listId;
  
  saveToMemory();
  renderLists();
  updateListSelect();
}

// Delete a list
function deleteList(listId) {
  if (confirm('Are you sure you want to delete this list? All tasks will be lost.')) {
    delete lists[listId];
    if (currentListId === listId) currentListId = null;
    saveToMemory();
    renderLists();
    updateListSelect();
  }
}

// Update dropdown
function updateListSelect() {
  const select = document.getElementById('listSelect');
  select.innerHTML = '<option value="">Select a list...</option>';
  
  Object.values(lists).forEach(list => {
    const option = document.createElement('option');
    option.value = list.id;
    option.textContent = list.name;
    if (list.id === currentListId) option.selected = true;
    select.appendChild(option);
  });
}

// Change list
function updateSelectedList() {
  const select = document.getElementById('listSelect');
  currentListId = select.value || null;
  renderLists();
}

// Add task
function addTask() {
  const taskText = document.getElementById('taskInput').value.trim();
  const taskDateTime = document.getElementById('taskDateTime').value;

  if (!taskText) {
    alert('Please enter a task');
    return;
  }

  if (!currentListId) {
    alert('Please select or create a list first');
    return;
  }

  const task = {
    id: 'task_' + Date.now(),
    text: taskText,
    completed: false,
    datetime: taskDateTime,
    createdAt: new Date()
  };

  lists[currentListId].tasks.push(task);
  
  document.getElementById('taskInput').value = '';
  document.getElementById('taskDateTime').value = '';
  
  saveToMemory();
  renderLists();
}

// Toggle task
function toggleTask(listId, taskId) {
  const task = lists[listId].tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveToMemory();
    renderLists();
  }
}

// Delete task
function deleteTask(listId, taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    lists[listId].tasks = lists[listId].tasks.filter(t => t.id !== taskId);
    saveToMemory();
    renderLists();
  }
}

// Edit task
function editTask(listId, taskId) {
  editingTaskId = taskId;
  renderLists();
}

// Save edited task
function saveEditedTask(listId, taskId) {
  const textInput = document.querySelector(`#edit-text-${taskId}`);
  const datetimeInput = document.querySelector(`#edit-datetime-${taskId}`);
  
  const task = lists[listId].tasks.find(t => t.id === taskId);
  if (task && textInput.value.trim()) {
    task.text = textInput.value.trim();
    task.datetime = datetimeInput.value;
    editingTaskId = null;
    saveToMemory();
    renderLists();
  }
}

// Cancel edit
function cancelEdit() {
  editingTaskId = null;
  renderLists();
}

// Format datetime
function formatDateTime(datetime) {
  if (!datetime) return '';
  const date = new Date(datetime);
  return date.toLocaleString();
}

// Render lists
function renderLists() {
  const container = document.getElementById('listsContainer');
  
  if (Object.keys(lists).length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No lists created yet</h3>
        <p>Create your first list to get started!</p>
      </div>
    `;
    return;
  }

  let html = '';
  
  const listsToShow = currentListId ? [lists[currentListId]] : Object.values(lists);
  
  listsToShow.forEach(list => {
    html += `
      <div class="list-section">
        <div class="list-header">
          <h2 class="list-title">${list.name}</h2>
          <button class="delete-list-btn" onclick="deleteList('${list.id}')">Delete List</button>
        </div>
        <div class="tasks">
          ${renderTasks(list)}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Render tasks
function renderTasks(list) {
  if (list.tasks.length === 0) {
    return '<div class="empty-state"><p>No tasks yet. Add your first task above!</p></div>';
  }

  let html = '';
  list.tasks.forEach(task => {
    if (editingTaskId === task.id) {
      html += `
        <div class="task-item">
          <div class="edit-form">
            <input type="text" id="edit-text-${task.id}" class="edit-text-input" value="${task.text}">
            <input type="datetime-local" id="edit-datetime-${task.id}" value="${task.datetime || ''}">
            <button class="save-btn" onclick="saveEditedTask('${list.id}', '${task.id}')">Save</button>
            <button class="cancel-btn" onclick="cancelEdit()">Cancel</button>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="task-item ${task.completed ? 'completed' : ''}">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                 onchange="toggleTask('${list.id}', '${task.id}')">
          <div class="task-content">
            <div class="task-text">${task.text}</div>
            ${task.datetime ? `<div class="task-datetime">📅 ${formatDateTime(task.datetime)}</div>` : ''}
          </div>
          <div class="task-actions">
            <button class="edit-btn" onclick="editTask('${list.id}', '${task.id}')">Edit</button>
            <button class="delete-btn" onclick="deleteTask('${list.id}', '${task.id}')">Delete</button>
          </div>
        </div>
      `;
    }
  });

  return html;
}

// Event listeners
document.getElementById('taskInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') addTask();
});

document.getElementById('listNameInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') createList();
});

// Start
init();
