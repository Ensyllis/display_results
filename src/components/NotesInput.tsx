import React, { useState } from 'react';
import { updateDocumentNotes } from '../services/api';

interface NotesInputProps {
  documentId: string;
  initialNotes: string;
  setParentNotes: (notes: string) => void; // To update notes in DocumentViewer optimistically
}

const NotesInput: React.FC<NotesInputProps> = ({ documentId, initialNotes, setParentNotes }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    const success = await updateDocumentNotes(documentId, notes);
    if (success) {
      setParentNotes(notes); // Update parent state
      setMessage('Notes saved successfully!');
    } else {
      setMessage('Failed to save notes.');
    }
    setIsSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="notes-input-container">
      <h4>User Notes:</h4>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
        style={{ width: '95%', marginBottom: '10px' }}
        placeholder="Add your notes here..."
      />
      <button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Notes'}
      </button>
      {message && <p style={{fontSize: '0.9em', marginTop: '5px'}}>{message}</p>}
    </div>
  );
};
export default NotesInput;