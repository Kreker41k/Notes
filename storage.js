const Storage = (function() {
    const STORAGE_KEYS = {
        NOTES: 'notebook_notes',
        THEME: 'notebook_theme'
    };
    
    function getNotes() {
        const notesJSON = localStorage.getItem(STORAGE_KEYS.NOTES);
        return notesJSON ? JSON.parse(notesJSON) : [];
    }
    
    function saveNotes(notes) {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
    
    function addNote(note) {
        const notes = getNotes();
        notes.push(note);
        saveNotes(notes);
    }
    
    function updateNote(id, updatedNote) {
        const notes = getNotes();
        const index = notes.findIndex(note => note.id === id);
        
        if (index !== -1) {
            notes[index] = updatedNote;
            saveNotes(notes);
            return true;
        }
        
        return false;
    }
    
    function deleteNote(id) {
        const notes = getNotes();
        const filteredNotes = notes.filter(note => note.id !== id);
        saveNotes(filteredNotes);
    }
    
    function getNoteById(id) {
        const notes = getNotes();
        return notes.find(note => note.id === id);
    }
    
    function clearAllNotes() {
        localStorage.removeItem(STORAGE_KEYS.NOTES);
    }
    
    function getTheme() {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    }
    
    function saveTheme(theme) {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
    
    return {
        getNotes,
        saveNotes,
        addNote,
        updateNote,
        deleteNote,
        getNoteById,
        clearAllNotes,
        getTheme,
        saveTheme
    };
})();