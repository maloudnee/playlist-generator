const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Requests from frontend
app.use(express.json()); // Parse JSON bodies 
app.use(express.static('public')); // Serve static files

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// API Endpoint
app.post('/generate-playlist', async (req, res) => {
    const { userInput } = req.body;

    if (!userInput) {
        return res.status(400).json({error: 'User input is required.' });
    }

    // Prompt Engineering
    const prompt = `
        You are an expert music curator. A user wants a playlist based on the following
     request: "${userInput}".
     
        Your task is to generate a playlist with a creative name that includes one or
    two relevant emojis, short description, and a list of 17 songs.
        
        Please provide the output ONLY in a valid JSON format, with no other text or 
    explanation before or after the JSON block.

        The JSON structure should be:
        {
            "playlistName": "Creative Playlist Name 🎨",
            "description": "A short, engaging description of thet playlist's vibe.",
            "songs": [
                { "title": "Song Title 1", "artist": "Artist Name 1" },
                { "title": "Song Title 2". "artist": "Artist Name 2" },
                ...and so on
            ]
        }
        
        `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean response 
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const playlistJson = JSON.parse(cleanedText);

        res.json(playlistJson);
    } catch (error) {
        console.error('Error calling Gemini App:', error);
        res.status(500).json({ error: 'Failed to generate playlist. Please try again. '});
    }
});

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
