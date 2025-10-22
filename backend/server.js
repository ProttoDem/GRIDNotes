const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');

const uri = "mongodb+srv://ia03nelepindmitriy_db_user:QRQVcqXo7L97W2jX@gridnotes.8qulvdy.mongodb.net/?retryWrites=true&w=majority&appName=GRIDNotes";
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	}
});

const app = express();
app.use(bodyParser.json());

	app.use(cors({ origin: ['https://grid-lab1-frontend-7mmt.vercel.app', 'http://localhost:3000'] }));

let notesCollection;

async function startServer() {
	try {
		await client.connect();
		await client.db("admin").command({ ping: 1 });
		console.log("Pinged your deployment. You successfully connected to MongoDB!");
		notesCollection = client.db("notesapp").collection("notes");

		// Create
		app.post('/notes', async (req, res) => {
			try {
				const { Title, Text } = req.body;
				const note = {
					Title,
					Text,
					CreatedAt: new Date()
				};
				const result = await notesCollection.insertOne(note);
				res.status(201).json({ id: result.insertedId, ...note });
			} catch (err) {
				res.status(400).json({ error: err.message });
			}
		});

        app.post('/test', async (req, res) => {
			try {				
				res.json("test");
			} catch (err) {
				res.status(400).json({ error: err.message });
			}
		});

		// Read all
		app.get('/notes', async (req, res) => {
			try {
				const notes = await notesCollection.find().sort({ CreatedAt: -1 }).toArray();
				res.json(notes);
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		// Read one
		app.get('/notes/:id', async (req, res) => {
			try {
				const note = await notesCollection.findOne({ _id: new ObjectId(req.params.id) });
				if (!note) return res.status(404).json({ error: 'Note not found' });
				res.json(note);
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		// Update
		app.put('/notes/:id', async (req, res) => {
			try {
				const { Title, Text } = req.body;
				const result = await notesCollection.findOneAndUpdate(
					{ _id: new ObjectId(req.params.id) },
					{ $set: { Title, Text } },
					{ returnDocument: 'after' }
				);
				if (!result.value) return res.status(404).json({ error: 'Note not found' });
				res.json(result.value);
			} catch (err) {
				res.status(400).json({ error: err.message });
			}
		});

		// Delete
		app.delete('/notes/:id', async (req, res) => {
			try {
				const result = await notesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
				if (result.deletedCount === 0) return res.status(404).json({ error: 'Note not found' });
				res.json({ message: 'Note deleted' });
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

        const port = process.env.PORT || 8080;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

startServer();
