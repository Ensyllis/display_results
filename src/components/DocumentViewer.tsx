// src/components/DocumentViewer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchDocumentList, fetchDocument, DocumentListItem } from '../services/api';
import { DocumentData } from '../types';
import VectorPlot from './VectorPlot';
import './DocumentViewer.css'; // Make sure this is imported

// Basic Loading Modal Component (assuming it's defined as before)
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
  const [notes, setNotes] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true); // New state for sidebar

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
          setIsLoading(false); // Stop loading if no documents
        }
      } catch (err) {
        console.error("Failed to load document list:", err);
        setError("Failed to load document list. Please check console.");
        setIsLoading(false);
      }
      // setIsLoading(false) will be handled by the document details load
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedDocumentId) {
      setSelectedDocument(null);
      if (documentList.length === 0) setIsLoading(false); // Ensure loading stops if no ID and no list
      return;
    }

    const loadDocumentDetails = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedDocument(null);
      try {
        // Use the corrected backend logic (string ID)
        const doc = await fetchDocument(selectedDocumentId);
        if (doc) {
          setSelectedDocument(doc);
          setNotes(doc.notes || '');
        } else {
          setError(`Document with ID ${selectedDocumentId} not found or failed to load.`);
        }
      } catch (err) {
        console.error(`Failed to load document ${selectedDocumentId}:`, err);
        setError(`Failed to load document. Please check console.`);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocumentDetails();
  }, [selectedDocumentId, documentList.length]); // Added documentList.length to dependencies for initial load edge case

  const handleDocumentSelect = (id: string) => {
    if (id !== selectedDocumentId) {
      setSelectedDocumentId(id);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`document-viewer-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {isLoading && <LoadingModal />}
      <div className="sidebar">
        <div className="sidebar-content">
          <button onClick={toggleSidebar} className="sidebar-toggle-button" title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}>
            {isSidebarOpen ? "\u2190" : "\u2192"}
          </button>
          {selectedDocument && selectedDocument.scores && (
            <div className="sticky-vector-plot-container"> {/* Added a class for styling */}
              <h4>Scores Vector Plot</h4>
              <VectorPlot
                sentimentScore={selectedDocument.scores.Sentiment_Score}
                factualScore={selectedDocument.scores.Factual_Score}
              />
            </div>
          )}

          <h3>Documents</h3>
          {documentList.length === 0 && !isLoading && !error && <p>No documents available.</p>}
          {error && !isLoading && <p style={{ color: 'red' }}>{error}</p>}
          <ul className="document-list"> {/* Added a class for the list for potential future styling */}
            {documentList.map((doc) => (
              <li
                key={doc._id}
                onClick={() => handleDocumentSelect(doc._id)}
                style={{ // You might want to move these to CSS if they become complex
                  cursor: 'pointer',
                  fontWeight: selectedDocumentId === doc._id ? 'bold' : 'normal',
                  padding: '8px 10px',
                  backgroundColor: selectedDocumentId === doc._id ? '#e0e0e0' : 'transparent',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  borderBottom: '1px solid #eee'
                }}
                title={doc.original_title}
              >
                {doc.original_title}
              </li>
            ))}
          </ul>
          {/* Vector plot was here, now moved to the top */}
        </div>
      </div>

      <div className="main-content">
        {/* ... (main content JSX remains the same) ... */}
        {selectedDocument ? (
          <>
            <h2>{selectedDocument.original_title}</h2>
            <h3>Abstract</h3>
            <p className="abstract-display">{selectedDocument.original_abstract}</p>
          </>
        ) : (
          !isLoading && !error && <p>Select a document from the list to view its details.</p>
        )}
        {selectedDocument && error && <p style={{ color: 'red' }}>Could not load selected document details.</p>}
      </div>
    </div>
  );
};

export default DocumentViewer;