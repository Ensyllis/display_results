// src/services/api.ts
import { DocumentData, DocumentListItem, Note } from '../types'; //

const API_BASE_URL = 'http://192.34.61.136:3001/api'; // Your backend URL

// Define a type for the document list items (ID and title)

export const fetchDocumentList = async (): Promise<DocumentListItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents`);
    if (!response.ok) {
      console.error(`Error fetching document list: ${response.statusText}`);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Network error fetching document list:', error);
    return [];
  }
};

export const fetchDocument = async (id: string): Promise<DocumentData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/document/${id}`);
    if (!response.ok) {
      console.error(`Error fetching document: ${response.statusText} for ID: ${id}`);
      // If 404, the backend sends a message, otherwise it might be a server error
      if (response.status === 404) {
        const errorData = await response.json();
        console.error('Document not found:', errorData.message);
      }
      return null;
    }
    const document: DocumentData = await response.json()
    return {...document, notes: document.notes || []}
  } catch (error) {
    console.error('Network error fetching document:', error);
    return null;
  }
};

export interface NewNotePayload {
  text: string;
  userId: string;
  userName?: string;
}

export const addDocumentNote = async (documentId: string, noteData: NewNotePayload): Promise<Note | null> => {
  try {
    // Assuming backend endpoint is POST /api/document/:documentId/notes
    const response = await fetch(`${API_BASE_URL}/document/${documentId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    if (!response.ok) {
      console.error(`Error adding note: ${response.statusText}`);
      return null;
    }
    return await response.json() as Note; // Expect backend to return the newly created note with _id and timestamp
  } catch (error) {
    console.error('Network error adding note:', error);
    return null;
  }
};

// NEW: For deleting a note
export const deleteDocumentNote = async (documentId: string, noteId: string): Promise<boolean> => {
  try {
    // Assuming backend endpoint is DELETE /api/document/:documentId/notes/:noteId
    const response = await fetch(`${API_BASE_URL}/document/${documentId}/notes/${noteId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Network error deleting note:', error);
    return false;
  }
};
