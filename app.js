document.addEventListener('DOMContentLoaded', function() {
    const addNoteBtn = document.getElementById('addNoteBtn');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteTextInput = document.getElementById('noteText');
    const notesList = document.getElementById('notesList');
    const emptyState = document.getElementById('emptyState');
    const searchEmptyState = document.getElementById('searchEmptyState');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const totalNotesEl = document.getElementById('totalNotes');
    const completedNotesEl = document.getElementById('completedNotes');
    const activeNotesEl = document.getElementById('activeNotes');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const addFirstNoteBtn = document.getElementById('addFirstNoteBtn');
    const searchInput = document.getElementById('searchInput');
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeText = document.querySelector('.theme-text');
    const currentThemeSpan = document.getElementById('currentTheme');
    
    let currentFilter = 'all';
    let currentSearch = '';
    
    function init() {
        loadTheme();
        loadNotes();
        setupEventListeners();
        updateStats();
    }
    
    function loadTheme() {
        const savedTheme = Storage.getTheme();
        applyTheme(savedTheme);
        updateThemeButton(savedTheme);
    }
    
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        Storage.saveTheme(theme);
        updateThemeButton(theme);
    }
    
    function updateThemeButton(theme) {
        const isDark = theme === 'dark';
        themeToggleBtn.innerHTML = isDark 
            ? '<i class="fas fa-moon"></i> <span class="theme-text">Темная</span>'
            : '<i class="fas fa-sun"></i> <span class="theme-text">Светлая</span>';
        themeText.textContent = isDark ? 'Темная' : 'Светлая';
        currentThemeSpan.textContent = isDark ? 'Темная' : 'Светлая';
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    }
    
    function loadNotes() {
        const notes = Storage.getNotes();
        renderNotes(notes);
        toggleEmptyState(notes.length === 0 && currentSearch === '');
    }
    
    function renderNotes(notes) {
        let filteredNotes = filterNotes(notes);
        
        if (currentSearch) {
            const searchTerm = currentSearch.toLowerCase();
            filteredNotes = filteredNotes.filter(note => 
                note.title.toLowerCase().includes(searchTerm) || 
                note.content.toLowerCase().includes(searchTerm)
            );
        }
        
        notesList.innerHTML = '';
        
        filteredNotes.forEach(note => {
            const noteElement = createNoteElement(note);
            notesList.appendChild(noteElement);
        });
        
        const showSearchEmpty = currentSearch && filteredNotes.length === 0;
        const showRegularEmpty = !currentSearch && filteredNotes.length === 0;
        
        searchEmptyState.classList.toggle('active', showSearchEmpty);
        emptyState.classList.toggle('active', showRegularEmpty);
        notesList.style.display = filteredNotes.length === 0 ? 'none' : 'grid';
    }
    
    function filterNotes(notes) {
        switch(currentFilter) {
            case 'active':
                return notes.filter(note => !note.completed);
            case 'completed':
                return notes.filter(note => note.completed);
            default:
                return notes;
        }
    }
    
    function createNoteElement(note) {
        const noteElement = document.createElement('div');
        noteElement.className = `note ${note.completed ? 'completed' : ''}`;
        noteElement.dataset.id = note.id;
        
        const formattedDate = new Date(note.createdAt).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        noteElement.innerHTML = `
            <div class="note-header">
                <div>
                    <div class="note-title">${escapeHtml(note.title)}</div>
                    <div class="note-date">${formattedDate}</div>
                </div>
            </div>
            <div class="note-content">${escapeHtml(note.content)}</div>
            <div class="note-actions">
                <button class="btn ${note.completed ? 'btn-warning' : 'btn-success'} toggle-btn">
                    <i class="fas ${note.completed ? 'fa-undo' : 'fa-check'}"></i> ${note.completed ? 'Вернуть' : 'Завершить'}
                </button>
                <button class="btn btn-danger delete-btn">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        `;
        
        const toggleBtn = noteElement.querySelector('.toggle-btn');
        const deleteBtn = noteElement.querySelector('.delete-btn');
        
        toggleBtn.addEventListener('click', () => toggleNoteCompletion(note.id));
        deleteBtn.addEventListener('click', () => deleteNote(note.id));
        
        return noteElement;
    }
    
    function addNewNote() {
        const title = noteTitleInput.value.trim();
        const content = noteTextInput.value.trim();
        
        if (!title && !content) {
            alert('Пожалуйста, введите заголовок или текст заметки');
            return;
        }
        
        const newNote = {
            id: Date.now().toString(),
            title: title || 'Без заголовка',
            content: content || 'Пустая заметка',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        Storage.addNote(newNote);
        
        noteTitleInput.value = '';
        noteTextInput.value = '';
        
        loadNotes();
        updateStats();
        
        noteTitleInput.focus();
    }
    
    function toggleNoteCompletion(id) {
        const note = Storage.getNoteById(id);
        
        if (!note) return;
        
        note.completed = !note.completed;
        note.updatedAt = new Date().toISOString();
        
        Storage.updateNote(id, note);
        
        loadNotes();
        updateStats();
    }

    function deleteNote(id) {
        if (!confirm('Вы уверены, что хотите удалить эту заметку?')) {
            return;
        }
        
        Storage.deleteNote(id);
        
        loadNotes();
        updateStats();
    }
    
    function clearAllNotes() {
        const notes = Storage.getNotes();
        if (notes.length === 0) {
            alert('Нет заметок для удаления');
            return;
        }
        
        if (!confirm(`Вы уверены, что хотите удалить все заметки (${notes.length} шт.)?`)) {
            return;
        }
        
        Storage.clearAllNotes();
        
        loadNotes();
        updateStats();
    }
    
    function updateStats() {
        const notes = Storage.getNotes();
        const total = notes.length;
        const completed = notes.filter(note => note.completed).length;
        const active = total - completed;
        
        totalNotesEl.textContent = total;
        completedNotesEl.textContent = completed;
        activeNotesEl.textContent = active;
    }
    
    function toggleEmptyState(isEmpty) {
        emptyState.classList.toggle('active', isEmpty && !currentSearch);
        searchEmptyState.classList.toggle('active', isEmpty && currentSearch);
        notesList.style.display = isEmpty ? 'none' : 'grid';
    }
    
    function searchNotes() {
        currentSearch = searchInput.value.trim().toLowerCase();
        loadNotes();
    }

    function setupEventListeners() {
        addNoteBtn.addEventListener('click', addNewNote);
        addFirstNoteBtn.addEventListener('click', addNewNote);
        noteTitleInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                addNewNote();
            }
        });
        
        clearAllBtn.addEventListener('click', clearAllNotes);

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                
                loadNotes();
            });
        });
    
        searchInput.addEventListener('input', searchNotes);
        
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    init();
});