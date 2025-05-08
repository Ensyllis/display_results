// backend/server.js
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config(); // For backend .env file

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.BACKEND_PORT || 3001; // Use a different port from React dev server
const MONGODB_URI = process.env.MONGODB_URI; // This comes from backend's .env

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in backend .env file.");
  process.exit(1);
}

let db;

MongoClient.connect(MONGODB_URI)
  .then(client => {
    console.log('Connected to MongoDB via backend');
    db = client.db("total_research"); // Specify your database name
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Backend failed to connect to MongoDB:', err);
    process.exit(1);
  });

// --- API Endpoints ---

// NEW: Fetch all document titles and IDs
app.get('/api/documents', async (req, res) => {
  try {
    const collection = db.collection('view_data_v1'); // Specify your collection
    // Fetch only _id and original_title to keep the payload small
    const documents = await collection.find({}, { projection: { original_title: 1 } }).toArray();
    res.json(documents);
  } catch (e) {
    console.error("Error fetching document list:", e);
    res.status(500).json({ message: 'Error fetching document list' });
  }
});

// Fetch a single document by ID
app.get('/api/document/:id', async (req, res) => {
  try {
    const docId = req.params.id;
    const collection = db.collection('view_data_v1');
    const document = await collection.findOne({ _id: docId });

    if (document) {
      // Ensure notes field exists and is an array, defaulting to empty if not.
      const responseDocument = {
        ...document,
        notes: Array.isArray(document.notes) ? document.notes : []
      };
      res.json(responseDocument);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (e) {
    console.error("Error fetching document:", e);
    res.status(500).json({ message: 'Error fetching document' });
  }
});


// NEW: Add a note to a document
app.post('/api/document/:documentId/notes', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { text, userId, userName } = req.body; // Get note data from request body

    if (!text || !userId) {
      return res.status(400).json({ message: 'Note text and userId are required.' });
    }

    // It's good practice to validate documentId if they are ObjectIds in the DB
    // if (!ObjectId.isValid(documentId)) {
    //   return res.status(400).json({ message: 'Invalid document ID format' });
    // }

    const newNote = {
      _id: new ObjectId(), // Generate a new unique ID for this note
      text,
      userId,
      userName: userName || 'Anonymous', // Default userName if not provided
      timestamp: new Date() // Add a server-side timestamp
    };

    const collection = db.collection('view_data_v1');
    const result = await collection.updateOne(
      { _id: documentId }, // Match document by its string ID
      { $push: { notes: newNote } } // Push the new note object into the 'notes' array
    );

    if (result.matchedCount > 0) {
      // If you want to return the full document, you'd need another findOne.
      // For simplicity and as requested by frontend (expecting the new note), return the newNote.
      res.status(201).json(newNote); // 201 Created, return the added note
    } else {
      res.status(404).json({ message: 'Document not found, cannot add note.' });
    }
  } catch (e) {
    console.error("Error adding note:", e);
    res.status(500).json({ message: 'Error adding note' });
  }
});

// NEW: Delete a note from a document
app.delete('/api/document/:documentId/notes/:noteId', async (req, res) => {
  try {
    const { documentId, noteId } = req.params;

    // Validate IDs
    // if (!ObjectId.isValid(documentId)) {
    //   return res.status(400).json({ message: 'Invalid document ID format' });
    // }
    if (!ObjectId.isValid(noteId)) { // Note IDs are generated as ObjectIds
      return res.status(400).json({ message: 'Invalid note ID format' });
    }

    // In a real app, add authorization here:
    // Check if the authenticated user is allowed to delete this note (e.g., they own it or are an admin)
    // const currentUserId = req.user.id; // Assuming you have user info in req from auth middleware
    // const noteToDelete = await db.collection('view_data_v1').findOne(
    //   { _id: documentId, "notes._id": new ObjectId(noteId) },
    //   { projection: { "notes.$": 1 } }
    // );
    // if (!noteToDelete || !noteToDelete.notes || noteToDelete.notes[0].userId !== currentUserId) {
    //   return res.status(403).json({ message: 'Forbidden: You cannot delete this note.' });
    // }


    const collection = db.collection('view_data_v1');
    const result = await collection.updateOne(
      { _id: documentId }, // Match document by its string ID
      { $pull: { notes: { _id: new ObjectId(noteId) } } } // Pull the note with the specific _id from the array
    );

    if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Document not found.' });
    }
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Note deleted successfully' });
    } else {
      // Document was found, but note with that ID wasn't in its array (or no change made)
      res.status(404).json({ message: 'Note not found in document or no change made.' });
    }
  } catch (e) {
    console.error("Error deleting note:", e);
    res.status(500).json({ message: 'Error deleting note' });
  }
});