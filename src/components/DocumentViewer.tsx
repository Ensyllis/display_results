// Path: display_results/src/components/DocumentViewer.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchDocumentList, fetchDocument, addDocumentNote, deleteDocumentNote, NewNotePayload } from '../services/api';
// Remove StatementType, AspectType from types import if no longer used directly
import { DocumentData, PhraseToHighlight, DocumentListItem, OpenAiResponseCategory, Note, OpenAiResponseStatements } from '../types';
import VectorPlot from './VectorPlot';
import AbstractDisplay from './AbstractDisplay';
import FilterControls from './FilterControls';
import NotesList from './NotesList';
import NotesInput from './NotesInput';
import './DocumentViewer.css';
import './NotesList.css';

// Basic Loading Modal Component (assuming it's unchanged)
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

  const [documentNotes, setDocumentNotes] = useState<Note[]>([]);
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  const MOCK_CURRENT_USER_ID = "user123";
  const MOCK_CURRENT_USER_NAME  = "Current User";

  // New state for sliders, default to 50 for a balanced initial view
  const [sentimentFactualFocus, setSentimentFactualFocus] = useState<number>(50); // 0: Factual, 100: Sentiment
  const [marginGrowthFocus, setMarginGrowthFocus] = useState<number>(50);     // 0: Margin, 100: Growth

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
      setDocumentNotes([]);
      if (documentList.length === 0 && !isLoading) setIsLoading(false);
      return;
    }

    const loadDocumentDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const doc = await fetchDocument(selectedDocumentId);
        if (doc) {
          setSelectedDocument(doc);
          setDocumentNotes(doc.notes || []);
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
  }, [selectedDocumentId]);

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
    const allPhrases: PhraseToHighlight[] = [];
    const minOpacityThreshold = 0.05;

    // Corrected signature for processStatements:
    // It accepts a group of statements (like "Sentiment Statements" or "Factual Statements")
    // which is of type OpenAiResponseStatements.
    const processStatements = (
      statementGroup: OpenAiResponseStatements | undefined, // <<<< CORRECTED TYPE HERE
      isSentimentGroup: boolean
    ) => {
      if (!statementGroup) return;

      // Now, 'statementGroup' is an object where keys are category names (e.g., "Excited about growth")
      // and values are OpenAiResponseCategory objects.
      for (const categoryKey in statementGroup) {
        // 'categoryPhrases' will correctly be of type OpenAiResponseCategory
        const categoryPhrases: OpenAiResponseCategory = statementGroup[categoryKey]; // <<<< THIS IS NOW CORRECT

        for (const phraseText in categoryPhrases) {
          const score = categoryPhrases[phraseText];

          let opacityStatement: number;
          if (isSentimentGroup) {
            opacityStatement = sentimentFactualFocus / 100;
          } else {
            opacityStatement = (100 - sentimentFactualFocus) / 100;
          }

          const lowerCategoryKey = categoryKey.toLowerCase();
          const isGrowthCategory = lowerCategoryKey.includes("growth");
          const isMarginCategory = lowerCategoryKey.includes("margin");
          let opacityAspect = 1.0;

          if (isGrowthCategory && !isMarginCategory) {
            opacityAspect = marginGrowthFocus / 100;
          } else if (isMarginCategory && !isGrowthCategory) {
            opacityAspect = (100 - marginGrowthFocus) / 100;
          }

          const finalOpacity = opacityStatement * opacityAspect;

          if (finalOpacity < minOpacityThreshold) {
            continue;
          }

          let isWorried = false;
          if (isSentimentGroup) {
            if (score < 0) isWorried = true;
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
            opacity: finalOpacity,
          });
        }
      }
    };

    processStatements(openai_response["Sentiment Statements"], true);
    processStatements(openai_response["Factual Statements"], false);
    
    return allPhrases;
  }, [selectedDocument, sentimentFactualFocus, marginGrowthFocus]);

  const handleAddNote = useCallback(async (text: string) => {
    if (!selectedDocumentId) return;
    setIsAddingNote(true);
    const newNotePayload: NewNotePayload = {
      text,
      userId: MOCK_CURRENT_USER_ID,
      userName: MOCK_CURRENT_USER_NAME,
    };
    const addedNote = await addDocumentNote(selectedDocumentId, newNotePayload);
    if (addedNote) {
      setDocumentNotes(prevNotes => [...prevNotes, addedNote]);
      setSelectedDocument(prevDoc => {
        if (!prevDoc) return null;
        return { ...prevDoc, notes: [...(prevDoc.notes || []), addedNote] };
      });
    } else {
      alert("Failed to add note. Please try again.");
    }
    setIsAddingNote(false);
  }, [selectedDocumentId, MOCK_CURRENT_USER_ID, MOCK_CURRENT_USER_NAME]);

  const handleDeleteNote = useCallback(async (noteId: string) => {
    if (!selectedDocumentId) return;
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
          <h3 style={{paddingLeft: '0', paddingRight: '0', marginTop: '0'}}>Documents</h3>
          {documentList.length === 0 && !isLoading && !error && <p>No documents available.</p>}
          {error && !isLoading && <p style={{ color: 'red' }}>{error}</p>}
          <ul className="document-list">
            {documentList.map((doc) => (
              <li
                key={doc._id}
                onClick={() => handleDocumentSelect(doc._id)}
                style={{
                  fontWeight: selectedDocumentId === doc._id ? 'bold' : 'normal',
                }}
                className={selectedDocumentId === doc._id ? 'active-doc-item' : ''} // Use class for active
                title={doc.original_title}
              >
                {doc.original_title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="main-content">
        {isLoading && <LoadingModal />}
        {!isLoading && selectedDocument ? (
          <>
            <h2>{selectedDocument.original_title}</h2>
            <div className="filter-controls-main-container">
              <FilterControls
                  sentimentFactualFocus={sentimentFactualFocus}
                  setSentimentFactualFocus={setSentimentFactualFocus}
                  marginGrowthFocus={marginGrowthFocus}
                  setMarginGrowthFocus={setMarginGrowthFocus}
              />
            </div>
            <h3>Abstract</h3>
            <AbstractDisplay
              abstract={selectedDocument.original_abstract}
              phrasesToHighlight={phrasesToHighlight}
            />

            <div className="notes-main-section" style={{ marginTop: '2rem' }}>
              <NotesInput
                onAddNote={handleAddNote}
                isAdding={isAddingNote}
              />
              <NotesList
                notes={documentNotes}
                currentUserId={MOCK_CURRENT_USER_ID}
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