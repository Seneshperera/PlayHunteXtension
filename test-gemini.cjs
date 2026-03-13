const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './server/.env' });

async function testGemini() {
  console.log("Testing Gemini API Key...");
  console.log("Key starts with:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) : "MISSING");
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, are you working?");
    console.log("SUCCESS! Response:", result.response.text());
  } catch (error) {
    console.error("FAILED! Error:", error.message);
  }
}

testGemini();
