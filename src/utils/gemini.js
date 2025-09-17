// src/utils/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use API key from Google AI Studio
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ Missing VITE_GEMINI_API_KEY in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Choose model (Gemini 1.5 recommended)
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function askGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("❌ Gemini error:", err);
    return "Sorry, something went wrong with Gemini.";
  }
}
export async function aiAssistant(trip, userInput) {
  const prompt = `
    You are a professional travel planner AI.
    
    The user has this trip: ${JSON.stringify(trip, null, 2)}.
    The user request is: "${userInput}".
    
    If the request is about CHANGING the itinerary (add/remove/update items),
    respond ONLY in JSON format:
    {
      "mode": "update",
      "action": "add" | "remove" | "replace",
      "day": <day number>,
      "items": [
        { "time": "Morning", "title": "Activity", "category": "type", "bestTime": "string", "score": 90 }
      ]
    }
    
    If the request is conversational (like "hello", "tell me about this trip", 
    "give me a summary", "what's the best time"), respond ONLY in JSON format:
    {
      "mode": "chat",
      "message": "Write a friendly, brochure-style answer. 
      Make it engaging and descriptive (e.g. highlight the activities, 
      local culture, weather, and best times)."
    }
    `;
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { mode: "chat", message: text };

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("❌ AI error:", err);
    return { mode: "chat", message: "Sorry, something went wrong." };
  }
}

export async function refineTripWithGemini(trip, userInput) {
  const prompt = `
  You are a trip planner AI. 
  The user has this trip: ${JSON.stringify(trip, null, 2)}.
  The user request is: "${userInput}".
  
  Return ONLY JSON in this format:
  {
    "action": "update" | "add" | "remove" | "replace",
    "day": <day number>,
    "items": [
      { "time": "Morning", "title": "Activity name", "category": "type", "bestTime": "when", "score": 90 }
    ]
  }
  If no update, return {"action":"none"}.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Try parsing JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { action: "none" };

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("❌ Error refining trip:", err);
    return { action: "none" };
  }
}
export async function summarizeTrip(trip) {
  const prompt = `
  You are a travel planner AI.
  Summarize this trip in a friendly, brochure-style paragraph
  (3-5 sentences, highlight culture, activities, best times):
  
  ${JSON.stringify(trip, null, 2)}
  
  Return ONLY plain text.
    `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("❌ Error summarizing trip:", err);
    return "Couldn't generate a summary right now.";
  }
}
