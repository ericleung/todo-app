const input = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const countEl = document.getElementById('count');
const clearCompletedBtn = document.getElementById('clearCompleted');

let todos = [];
let currentFilter = 'all';

function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function load() {
  const raw = localStorage.getItem('todos');
  if (raw) {
    todos = JSON.parse(raw);
  }
}

function render() {
  const filtered = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.done;
    if (currentFilter === 'completed') return todo.done;
    return true;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<li class="empty-tip">暂无任务</li>';
  } else {
    list.innerHTML = filtered
      .map(
        (todo, i) => `
          <li class="${todo.done ? 'completed' : ''}">
            <input type="checkbox" ${todo.done ? 'checked' : ''} data-id="${todo.id}">
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" data-delete="${todo.id}">&#x2715;</button>
          </li>`
      )
      .join('');
  }

  const activeCount = todos.filter(t => !t.done).length;
  countEl.textContent = `${activeCount} 个未完成`;

  const hasCompleted = todos.some(t => t.done);
  clearCompletedBtn.style.display = hasCompleted ? 'inline-block' : 'none';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function addTodo(text) {
  todos.push({ id: Date.now(), text, done: false });
  save();
  render();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.done = !todo.done;
    save();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

function clearCompleted() {
  todos = todos.filter(t => !t.done);
  save();
  render();
}

addBtn.addEventListener('click', () => {
  const text = input.value.trim();
  if (text) {
    addTodo(text);
    input.value = '';
    input.focus();
  }
});

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addBtn.click();
  }
});

list.addEventListener('click', e => {
  const checkbox = e.target.closest('[data-id]');
  if (checkbox) {
    toggleTodo(Number(checkbox.dataset.id));
    return;
  }

  const deleteBtn = e.target.closest('[data-delete]');
  if (deleteBtn) {
    deleteTodo(Number(deleteBtn.dataset.id));
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

load();
render();
