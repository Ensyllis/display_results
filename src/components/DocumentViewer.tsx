// src/components/DocumentViewer.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchDocumentList, fetchDocument, addDocumentNote, deleteDocumentNote, NewNotePayload } from '../services/api';
import { DocumentData, PhraseToHighlight, DocumentListItem, StatementType, AspectType, OpenAiResponseCategory, Note } from '../types';
import VectorPlot from './VectorPlot';
import AbstractDisplay from './AbstractDisplay';
import FilterControls from './FilterControls';
import NotesList from './NotesList';
import NotesInput from './NotesInput';
import './DocumentViewer.css';
import './NotesList.css';

// Basic Loading Modal Component
const LoadingModal: React.FC = () => (
  <div style={{
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '20px', borderRadius: '8px', zIndex: 1000
  }}>
    <p>Loading data...</p>
  </div>
);

const DocumentViewer: React.FC = () => {
  const [documentList, setDocumentList] = useState<DocumentListItem[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const [documentNotes, setDocumentNotes] = useState<Note[]>([]); // NEW state for array of notes
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  const MOCK_CURRENT_USER_ID = "user123";
  const MOCK_CURRENT_USER_NAME  = "Current User";

  const [statementType, setStatementType] = useState<StatementType>("Sentiment");
  const [aspectType, setAspectType] = useState<AspectType>("Growth");

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const list = await fetchDocumentList();
        setDocumentList(list);
        if (list.length > 0) {
          setSelectedDocumentId(list[0]._id);
        } else {
          setError("No documents found.");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load document list:", err);
        setError("Failed to load document list. Please check console.");
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedDocumentId) {
      setSelectedDocument(null);
      setDocumentNotes([]); // Clear notes when no document is selected
      if (documentList.length === 0 && !isLoading) setIsLoading(false); // from previous logic
      return;
    }


    const loadDocumentDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const doc = await fetchDocument(selectedDocumentId); // fetchDocument now ensures notes is an array
        if (doc) {
          setSelectedDocument(doc);
          setDocumentNotes(doc.notes || []); // doc.notes should be an array from api.ts modification
        } else {
          setError(`Document with ID ${selectedDocumentId} not found or failed to load.`);
          setSelectedDocument(null);
          setDocumentNotes([]);
        }
      } catch (err) {
        console.error(`Failed to load document ${selectedDocumentId}:`, err);
        setError(`Failed to load document. Please check console.`);
        setSelectedDocument(null);
        setDocumentNotes([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadDocumentDetails();
  }, [selectedDocumentId]); // removed documentList.length

  const handleDocumentSelect = (id: string) => {
    if (id !== selectedDocumentId) {
      setSelectedDocumentId(id);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const phrasesToHighlight = useMemo((): PhraseToHighlight[] => {
    if (!selectedDocument?.openai_response) {
      return [];
    }
    const { openai_response } = selectedDocument;
    const statementKey = statementType === "Sentiment" ? "Sentiment Statements" : "Factual Statements";
    const statementsForType = openai_response[statementKey];
    if (!statementsForType) return [];
    const allPhrases: PhraseToHighlight[] = [];
    for (const categoryKey in statementsForType) {
      if (aspectType && !categoryKey.toLowerCase().includes(aspectType.toLowerCase())) {
        continue;
      }
      const categoryPhrases: OpenAiResponseCategory = statementsForType[categoryKey];
      for (const phraseText in categoryPhrases) {
        const score = categoryPhrases[phraseText];
        let isWorried = false;
        if (statementType === "Sentiment") {
          if (score < 0) isWorried = true;
          const lowerCategoryKey = categoryKey.toLowerCase();
          if (lowerCategoryKey.includes("concern") || lowerCategoryKey.includes("risk") || lowerCategoryKey.includes("worried") || lowerCategoryKey.includes("negative")) {
            isWorried = true;
          }
          if (lowerCategoryKey.includes("positive") || lowerCategoryKey.includes("excited") || lowerCategoryKey.includes("opportunity")) {
            isWorried = false;
          }
        }
        allPhrases.push({
          text: phraseText,
          score: score,
          isWorried: isWorried,
          categoryKey: categoryKey,
        });
      }
    }
    return allPhrases;
  }, [selectedDocument, statementType, aspectType]);

  const handleAddNote = useCallback(async (text: string) => {
    if (!selectedDocumentId) return;
    setIsAddingNote(true);
    const newNotePayload: NewNotePayload = {
      text,
      userId: MOCK_CURRENT_USER_ID, // Replace with actual user ID from auth
      userName: MOCK_CURRENT_USER_NAME, // Replace with actual user name
    };
    const addedNote = await addDocumentNote(selectedDocumentId, newNotePayload);
    if (addedNote) {
      setDocumentNotes(prevNotes => [...prevNotes, addedNote]);
      // Also update the selectedDocument state if it holds the notes directly
      setSelectedDocument(prevDoc => {
        if (!prevDoc) return null;
        return { ...prevDoc, notes: [...(prevDoc.notes || []), addedNote] };
      });
    } else {
      // You could set an error message to display to the user
      alert("Failed to add note. Please try again.");
    }
    setIsAddingNote(false);
  }, [selectedDocumentId, MOCK_CURRENT_USER_ID, MOCK_CURRENT_USER_NAME]);

  const handleDeleteNote = useCallback(async (noteId: string) => {
    if (!selectedDocumentId) return;
    // Optional: Add a confirmation dialog
    // if (!window.confirm("Are you sure you want to delete this note?")) return;

    const success = await deleteDocumentNote(selectedDocumentId, noteId);
    if (success) {
      setDocumentNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
      setSelectedDocument(prevDoc => {
        if (!prevDoc) return null;
        return { ...prevDoc, notes: (prevDoc.notes || []).filter(note => note._id !== noteId) };
      });
    } else {
      alert("Failed to delete note. Please try again.");
    }
  }, [selectedDocumentId]);

  return (
    <div className={`document-viewer-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* ... (isLoading modal, sidebar div with its content: toggle, plot, doc list) ... */}
      <div className="sidebar">
        <div className="sidebar-content">
          <button onClick={toggleSidebar} className="sidebar-toggle-button" title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}>
            {isSidebarOpen ? "\u2190" : "\u2192"}
          </button>
          {selectedDocument && selectedDocument.scores && (
            <div className="sticky-vector-plot-container">
              <h4>Scores Vector Plot</h4>
              <VectorPlot
                sentimentScore={selectedDocument.scores.Sentiment_Score}
                factualScore={selectedDocument.scores.Factual_Score}
              />
            </div>
          )}
          <h3 style={{paddingLeft: '0', paddingRight: '0', marginTop: '0'}}>Documents</h3> {/* Adjusted padding if sidebar-content has it */}
          {documentList.length === 0 && !isLoading && !error && <p>No documents available.</p>}
          {error && !isLoading && <p style={{ color: 'red' }}>{error}</p>}
          <ul className="document-list">
            {documentList.map((doc) => (
              <li
                key={doc._id}
                onClick={() => handleDocumentSelect(doc._id)}
                style={{
                  cursor: 'pointer',
                  fontWeight: selectedDocumentId === doc._id ? 'bold' : 'normal',
                  // Using classes for these would be cleaner eventually
                  // padding: '8px 10px',
                  // backgroundColor: selectedDocumentId === doc._id ? '#e0e0e0' : 'transparent',
                  // whiteSpace: 'nowrap',
                  // overflow: 'hidden',
                  // textOverflow: 'ellipsis',
                  // borderBottom: '1px solid #eee'
                }}
                title={doc.original_title}
              >
                {doc.original_title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="main-content">
        {selectedDocument ? (
          <>
            <h2>{selectedDocument.original_title}</h2>
            <div className="filter-controls-main-container">
              <FilterControls
                  statementType={statementType}
                  setStatementType={setStatementType}
                  aspectType={aspectType}
                  setAspectType={setAspectType}
              />
            </div>
            <h3>Abstract</h3>
            <AbstractDisplay
              abstract={selectedDocument.original_abstract}
              phrasesToHighlight={phrasesToHighlight}
            />

            {/* Notes Section - Input at top, List at bottom as requested */}
            <div className="notes-main-section" style={{ marginTop: '2rem' }}>
              <NotesInput
                onAddNote={handleAddNote}
                isAdding={isAddingNote}
              />
              <NotesList
                notes={documentNotes}
                currentUserId={MOCK_CURRENT_USER_ID} // Pass mock or real user ID
                onDeleteNote={handleDeleteNote}
              />
            </div>
          </>
        ) : (
          !isLoading && <p>{error ? error : "Select a document from the list to view its details."}</p>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;