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
    const id = req.params.id;
    const collection = db.collection('view_data_v1'); // Specify your collection
    const document = await collection.findOne({ _id: id });
    if (document) {
      res.json(document);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (e) {
    console.error("Error fetching document:", e);
    res.status(500).json({ message: 'Error fetching document' });
  }
});

// Update notes for a document
app.put('/api/document/:id/notes', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid document ID format for notes update' });
    }
    const { notes } = req.body;
    const collection = db.collection('view_data_v1');
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { notes: notes } }
    );
    if (result.matchedCount > 0) {
      res.json({ message: 'Notes updated successfully' });
    } else {
      res.status(404).json({ message: 'Document not found for notes update' });
    }
  } catch (e) {
    console.error("Error updating notes:", e);
    res.status(500).json({ message: 'Error updating notes' });
  }
});