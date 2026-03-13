const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Datastore = require('nedb');
const mongoose = require('mongoose');
const envPath = path.isAbsolute(process.env.DOTENV_PATH || '') ? process.env.DOTENV_PATH : path.join(__dirname, '.env');
require('dotenv').config({ path: envPath });
console.log('Environment Path:', envPath);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); 

// Initialize Cloud Database if URI provided, else fallback to free local NeDB
let db;
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Cloud Free Tier!'))
    .catch(err => console.error('MongoDB connection error:', err));
  
  const userSchema = new mongoose.Schema({ userId: String, queryCount: Number });
  db = mongoose.model('User', userSchema);
} else {
  console.log('⚠️ No MONGODB_URI found. Utilizing free local NeDB fallback.');
  db = new Datastore({ filename: path.join(__dirname, 'users.db'), autoload: true });
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes
app.get('/', (req, res) => res.send('Playhunt Backend API Running'));

// Debug endpoint to reset limits (must be before :title routes)
app.get('/api/reset-limits', (req, res) => {
  if (process.env.MONGODB_URI) {
    db.updateOne({ userId: 'local_user_1' }, { queryCount: 0 }).then(() => {
      res.send('Reset success for local_user_1');
    }).catch(e => res.status(500).send(e.message));
  } else {
    db.update({ userId: 'local_user_1' }, { $set: { queryCount: 0 } }, {}, (err) => {
      if (err) return res.status(500).send(err.message);
      res.send('Reset success for local_user_1');
    });
  }
});

// 0. Image Analysis via Gemini Vision
app.post('/api/analyze-frame', async (req, res) => {
  try {
    const { image, hint } = req.body;
    let cleanTitle = "Not Found";

    const base64Data = image.split(',')[1] || image;

    try {
       const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
       let prompt = "Identify the movie, TV show, anime, or video game present in this image frame. Reply ONLY with the exact title of the media. Do not add quotes, explanation, or punctuation. If you are entirely unsure, reply with 'None'.";
       
       if (hint && hint.trim().length > 0) {
         prompt += ` The user provided this hint/keyword context to help you: "${hint}".`;
       }
       
       const imageParts = [
         {
           inlineData: {
             data: base64Data,
             mimeType: "image/jpeg"
           }
         }
       ];

       const result = await model.generateContent([prompt, ...imageParts]);
       const text = result.response.text().trim();
       if (text && text.toLowerCase() !== 'none') {
         cleanTitle = text;
       } else if (hint) {
         cleanTitle = hint; // Fallback to their hint if Gemini is completely lost
       }
    } catch (e) {
       console.error("Gemini Vision Error:", e.message);
       if (hint) cleanTitle = hint;
    }

    // Now search TMDB multi with the identified title
    const response = await axios.get(`https://api.themoviedb.org/3/search/multi`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query: cleanTitle,
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      let media = response.data.results[0];
      if (media.media_type === 'person' && response.data.results.length > 1) {
         media = response.data.results.find(m => m.media_type !== 'person') || media;
      }

      let cast = ["Cast unavailable"];
      try {
        const creditsResponse = await axios.get(`https://api.themoviedb.org/3/${media.media_type || 'movie'}/${media.id}/credits`, {
          params: { api_key: process.env.TMDB_API_KEY }
        });
        cast = creditsResponse.data.cast.slice(0, 5).map(c => c.name);
      } catch (e) { }
      
      return res.json({
        title: media.title || media.name,
        year: (media.release_date || media.first_air_date || '').split('-')[0] || 'Unknown',
        genres: ['Action', 'Sci-Fi'],
        description: media.overview || "No description available.",
        cast: cast.length > 0 ? cast : ["Cast unavailable"],
        rating: media.vote_average,
        poster: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null
      });
    }
    return res.status(404).json({ error: "Movie not found" });

  } catch (error) {
    console.error("Image Analysis Error:", error.message);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

// 1. TMDB: Get Movie Info Intelligently
app.get('/api/movie/:title', async (req, res) => {
  try {
    const rawTitle = req.params.title;
    let cleanTitle = rawTitle;

    // Use Gemini to extract the actual movie/show title from a messy YouTube/Webpage title
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `Extract the exact name of the movie, TV show, or anime from this webpage title: "${rawTitle}". If it doesn't contain a clear movie or show, reply with "None". Reply ONLY with the title. Do not add quotes or explanation.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text && text.toLowerCase() !== 'none') cleanTitle = text;
    } catch (e) {
      console.error("Gemini Title Extraction Error", e.message);
    }

    const response = await axios.get(`https://api.themoviedb.org/3/search/multi`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query: cleanTitle,
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      let media = response.data.results[0];
      // Sometimes people search multi and get a "person". Let's try to get a movie/tv
      if (media.media_type === 'person' && response.data.results.length > 1) {
         media = response.data.results.find(m => m.media_type !== 'person') || media;
      }

      // Get Cast (Credits)
      let cast = ["Cast unavailable"];
      try {
        const creditsResponse = await axios.get(`https://api.themoviedb.org/3/${media.media_type || 'movie'}/${media.id}/credits`, {
          params: { api_key: process.env.TMDB_API_KEY }
        });
        cast = creditsResponse.data.cast.slice(0, 5).map(c => c.name);
      } catch (e) { }
      
      return res.json({
        title: media.title || media.name,
        year: (media.release_date || media.first_air_date || '').split('-')[0] || 'Unknown',
        genres: ['Trending'], // We'd map genre IDs normally
        description: media.overview || "No description available.",
        cast: cast.length > 0 ? cast : ["Cast unavailable"],
        rating: media.vote_average,
        poster: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null
      });
    }
    return res.status(404).json({ error: "Movie not found" });
    
  } catch (error) {
    console.error("TMDB Error:", error.message);
    res.status(500).json({ error: "Failed to fetch from TMDB" });
  }
});

// 2. Gemini: AI Scene Analysis & Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message, isPro } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    // Check Database for Free Tier Limits
    if (!isPro) {
      if (process.env.MONGODB_URI) {
        let user = await db.findOne({ userId: userId });
        console.log(`[Chat] DB User ${userId} count: ${user ? user.queryCount : 0}`);
        if (false && user && user.queryCount >= 50) { 
           return res.status(403).json({ error: "Daily limit reached for FREE plan (Ver 2.1)" });
        }
        if (user) {
          user.queryCount += 1;
          await user.save();
        } else {
          await db.create({ userId: userId, queryCount: 1 });
        }
      } else {
        const getNeDBUser = (id) => new Promise((resolve, reject) => {
          db.findOne({ userId: id }, (err, doc) => err ? reject(err) : resolve(doc));
        });
        const updateNeDBUser = (id, data) => new Promise((resolve, reject) => {
          db.update({ userId: id }, data, {}, (err, num) => err ? reject(err) : resolve(num));
        });
        const insertNeDBUser = (data) => new Promise((resolve, reject) => {
          db.insert(data, (err, doc) => err ? reject(err) : resolve(doc));
        });

        let user = await getNeDBUser(userId);
        console.log(`[Chat] NeDB User ${userId} count: ${user ? user.queryCount : 0}`);
        
        if (false && user && user.queryCount >= 50) { 
          return res.status(403).json({ error: "Daily limit reached for FREE plan (Ver 2.1)" });
        }

        if (user) {
          await updateNeDBUser(userId, { $inc: { queryCount: 1 } });
        } else {
          await insertNeDBUser({ userId: userId, queryCount: 1 });
        }
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `You are the Playhunt AI assistant (tagline: Hunt Media Anywhere). Answer the user's question about a movie, TV show, or video clip dynamically. 
    User Question: ${message}`;
    
    const result = await model.generateContent(prompt);
    
    // Safety check for candidates
    if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
      throw new Error("AI returned no candidates. This usually means the content was blocked by safety filters.");
    }

    const text = result.response.text();
    res.json({ response: text });
  } catch (error) {
    console.error("DEBUG - Gemini Chat Error Structure:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({ error: "AI processing failed: " + (error.message || "Unknown error") });
  }
});

// 3. AudioDB / Reverse Search Placeholders
app.get('/api/audio', async (req, res) => {
  // We will build this integration out in Phase 3
  res.json({
    songName: "Mockingbird",
    artist: "Eminem",
    album: "Curtain Call"
  });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started dynamically on http://localhost:${PORT}`);
});
