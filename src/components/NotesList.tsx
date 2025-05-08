// src/components/NotesList.tsx
import React, { useState } from 'react';
import { Note } from '../types';
import './NotesList.css'; // We'll add styles for this

interface NotesListProps {
  notes: Note[];
  currentUserId: string; // To determine if delete button should be shown
  onDeleteNote: (noteId: string) => Promise<void>; // Make it async to handle button disabling
}

const NotesList: React.FC<NotesListProps> = ({ notes, currentUserId, onDeleteNote }) => {
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const handleDelete = async (noteId: string) => {
    setDeletingNoteId(noteId);
    await onDeleteNote(noteId);
    setDeletingNoteId(null); // Reset after operation
  };

  if (!notes || notes.length === 0) {
    return <p>No notes yet for this document.</p>;
  }

  return (
    <div className="notes-list-container">
      <h4>Document Notes:</h4>
      <ul className="notes-list">
        {notes.map((note) => (
          <li key={note._id} className="note-item">
            <div className="note-header">
              <span className="note-user">{note.userName || note.userId}</span>
              <span className="note-timestamp">
                {new Date(note.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="note-text">{note.text}</p>
            {note.userId === currentUserId && ( // Show delete button only for user's own notes
              <button
                onClick={() => handleDelete(note._id)}
                className="delete-note-button"
                disabled={deletingNoteId === note._id}
              >
                {deletingNoteId === note._id ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotesList;