// Connected to Node.js Backend API

const BASE_URL = 'http://localhost:5000/api';

export const TMDBService = {
  // Fetches live movie info via Backend -> TMDB API
  getMovieInfo: async (query) => {
    try {
      const response = await fetch(`${BASE_URL}/movie/${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("API Error");
      return await response.json();
    } catch {
      throw new Error("Failed to fetch movie info");
    }
  }
};

export const AudioRecognitionService = {
  identifyAudio: async (audioBuffer) => {
    // Hits our backend which connects to TheAudioDB eventually
    try {
      const response = await fetch(`${BASE_URL}/audio`);
      return await response.json();
    } catch (e) {
      return {
         songName: "Cornfield Chase",
         artist: "Hans Zimmer",
         album: "Interstellar Soundtrack"
      };
    }
  }
};

export const AISceneService = {
  analyzeScene: async (videoFrameBase64) => {
    return {
      sceneDescription: "The docking sequence where Cooper docks the Endurance.",
      confidence: 0.98,
      timestampMatch: "1:24:34"
    };
  },
  
  // Connects securely to the Google Gemini Backend
  chat: async (message, userId = "local_user_1", isPro = false) => {
    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, userId, isPro })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat API failed");
      return data;
      
    } catch (error) {
      console.error(error);
      return { response: `Error: ${error.message}` };
    }
  }
};

export const ReverseSearchService = {
  findLinks: async (videoContext) => {
    return [
      { platform: "YouTube", type: "Clips", count: 12 },
      { platform: "TikTok", type: "Edits", count: 45 },
    ];
  }
};
