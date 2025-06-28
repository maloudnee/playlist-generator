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
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

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
     
        Your task is to generate a playlist with a relevant name, short description,
    and a list of 17 songs.
        
        For each song, format the output like this:
        
        **Playlist Title With A Relevant Name:** (make this bold)
        
        Description: (short description describing the playlist)
        
        Then list the songs as numbered items, where each song title is **bolded**, and the 
        artist name is **italicized** below the song title, like this 
        
        1. **Song Title**
           *Artist Name*
           
        Make sure the playlist title and description come first, then the list.
        
        `;
    try {
        const result = await model.generateContent(prompt);
        const respone = await result.response;
        const text = response.text();

        res.json({ playlist: text });
    } catch (error) {
        console.error('Error calling Gemini App:', error);
        res.status(500).json({ error: 'Failed to generate playlist. Please try again. '});
    }
});

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
