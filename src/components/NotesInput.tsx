// src/components/NotesInput.tsx
import React, { useState } from 'react';
// Note: addDocumentNote and NewNotePayload will be passed as props or imported if this component handles the API call directly.
// For this example, DocumentViewer will handle the API call.

interface NotesInputProps {
  onAddNote: (text: string) => void; // Simplified: text is enough, DocumentViewer adds userId etc.
  isAdding: boolean; // To disable button while processing
}

const NotesInput: React.FC<NotesInputProps> = ({ onAddNote, isAdding }) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [message, setMessage] = useState(''); // For user feedback

  const handleSubmitNote = async () => {
    if (!newNoteText.trim()) {
      setMessage('Note cannot be empty.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setMessage(''); // Clear previous messages
    // onAddNote will handle the actual API call and success/failure
    onAddNote(newNoteText);
    // Clear input only if add is successful (or let parent handle it)
    // For now, clear optimistically or based on parent logic
    setNewNoteText('');
    // setMessage('Note submitted!'); // Parent can provide more specific feedback
    // setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="notes-input-container"> {/* Keep existing styling for the container */}
      <h4>Add a New Note:</h4>
      <textarea
        value={newNoteText}
        onChange={(e) => setNewNoteText(e.target.value)}
        rows={4} // Slightly shorter for adding a new note
        style={{ width: '100%', marginBottom: '10px', resize: 'vertical' }}
        placeholder="Type your new note here..."
      />
      <button onClick={handleSubmitNote} disabled={isAdding || !newNoteText.trim()}>
        {isAdding ? 'Adding Note...' : 'Add Note'}
      </button>
      {message && <p style={{fontSize: '0.9em', marginTop: '5px'}}>{message}</p>}
    </div>
  );
};

export default NotesInput;