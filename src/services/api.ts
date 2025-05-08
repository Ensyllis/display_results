// src/services/api.ts
import { DocumentData } from '../types'; //

const API_BASE_URL = 'http://localhost:3001/api'; // Your backend URL

// Define a type for the document list items (ID and title)
export interface DocumentListItem {
  _id: string;
  original_title: string;
}

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
    return await response.json();
  } catch (error) {
    console.error('Network error fetching document:', error);
    return null;
  }
};

export const updateDocumentNotes = async (id: string, notes: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/document/${id}/notes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });
    return response.ok;
  } catch (error) {
    console.error('Network error updating notes:', error);
    return false;
  }
};