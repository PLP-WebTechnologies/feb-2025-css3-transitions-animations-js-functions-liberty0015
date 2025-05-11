// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadTheme();
    updateProgress();
});

// Add a new task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        showFeedback('Please enter a task!', 'red');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    saveTask(task);
    addTaskToList(task);
    taskInput.value = '';
    showFeedback('Task added!', '#28a745');
    updateProgress();
}

// Save task to localStorage
function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks(filter = 'all') {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    if (filter === 'active') {
        tasks = tasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
        tasks = tasks.filter(task => task.completed);
    }
    
    tasks.forEach(task => addTaskToList(task));
}

// Add task to the UI
function addTaskToList(task) {
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
    li.setAttribute('data-id', task.id);
    li.setAttribute('role', 'listitem');
    if (task.completed) li.classList.add('completed');
    
    li.innerHTML = `
        <span onclick="toggleTask(${task.id})" role="button" tabindex="0" onkeydown="if(event.key === 'Enter') toggleTask(${task.id})">${task.text}</span>
        <div>
            <button class="edit" onclick="editTask(${task.id})" aria-label="Edit task">Edit</button>
            <button onclick="deleteTask(${task.id})" aria-label="Delete task">Delete</button>
        </div>
    `;
    
    taskList.appendChild(li);
}

// Toggle task completion
function toggleTask(id) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = !task.completed;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks(document.querySelector('.filter-section button.active').textContent.toLowerCase());
    showFeedback('Task updated!', '#28a745');
    updateProgress();
}

// Edit task
function editTask(id) {
    const li = document.querySelector(`li[data-id="${id}"]`);
    const taskText = li.querySelector('span').textContent;
    
    li.innerHTML = `
        <input type="text" class="edit-input" value="${taskText}" aria-label="Edit task input">
        <div>
            <button onclick="saveEdit(${id})">Save</button>
            <button onclick="loadTasks()">Cancel</button>
        </div>
    `;
    
    li.querySelector('.edit-input').focus();
}

// Save edited task
function saveEdit(id) {
    const li = document.querySelector(`li[data-id="${id}"]`);
    const newText = li.querySelector('.edit-input').value.trim();
    
    if (newText === '') {
        showFeedback('Task cannot be empty!', 'red');
        return;
    }
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.text = newText;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    showFeedback('Task edited!', '#28a745');
}

// Delete task with undo option
function deleteTask(id) {
    const li = document.querySelector(`li[data-id="${id}"]`);
    li.style.animation = 'slideOut 0.5s ease forwards';
    
    const deletedTask = JSON.parse(localStorage.getItem('tasks')).find(task => task.id === id);
    
    li.addEventListener('animationend', () => {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => task.id !== id);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
        showFeedback('Task deleted! <button onclick="undoDelete(' + JSON.stringify(deletedTask) + ')">Undo</button>', '#28a745');
        updateProgress();
    }, { once: true });
}

// Undo delete
function undoDelete(task) {
    saveTask(task);
    loadTasks();
    showFeedback('Task restored!', '#28a745');
    updateProgress();
}

// Filter tasks
function filterTasks(filter) {
    document.querySelectorAll('.filter-section button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.filter-section button[onclick="filterTasks('${filter}')"]`).classList.add('active');
    loadTasks(filter);
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    showFeedback(`Switched to ${isDark ? 'dark' : 'light'} mode!`, '#28a745');
}

// Load theme
function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark');
    }
}

// Update progress bar
function updateProgress() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    document.getElementById('progressFill').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `${percentage}% Complete`;
}

// Show feedback message
function showFeedback(message, color) {
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = message;
    feedback.style.color = color;
    feedback.classList.add('show');
    
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 3000);
}