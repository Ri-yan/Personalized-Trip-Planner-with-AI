// src/utils/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Mode can be "studio" (AI Studio API key) or "vertex" (Google Cloud Vertex AI)
const MODE = import.meta.env.VITE_AI_MODE || "studio";

let studioModel = null;
let vertexModel = null;

// ---- AI Studio (default, API key based) ----
if (MODE === "studio") {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) console.error("❌ Missing VITE_GEMINI_API_KEY in .env");

  const genAI = new GoogleGenerativeAI(API_KEY);
  studioModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// ---- Vertex AI ----
if (MODE === "vertex") {
  try {
    // Lazy import to avoid bundler errors in frontend
    const { VertexAI } = await import("@google-cloud/vertexai");

    const project = import.meta.env.VITE_GCP_PROJECT_ID;
    const location = import.meta.env.VITE_GCP_LOCATION || "us-central1";

    const vertexAI = new VertexAI({ project, location });
    vertexModel = vertexAI.preview.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
  } catch (err) {
    console.error("❌ Failed to init Vertex AI:", err);
  }
}

// ---- Common wrapper ----
async function runModel(prompt) {
  try {
    if (MODE === "vertex" && vertexModel) {
      const resp = await vertexModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      return resp[0].candidates[0].content.parts[0].text;
    }

    if (MODE === "studio" && studioModel) {
      const result = await studioModel.generateContent(prompt);
      return result.response.text();
    }

    throw new Error("No model initialized");
  } catch (err) {
    console.error("❌ Model error:", err);
    return "Sorry, something went wrong.";
  }
}

// ---- Exported helpers ----

export async function askGemini(prompt) {
  return await runModel(prompt);
}

export async function aiAssistant(trip, userInput, weather) {
  const prompt = `
    You are a professional travel planner AI.
    
    The user has this trip: ${JSON.stringify(trip, null, 2)}.
    Weather details: ${JSON.stringify(weather, null, 2)}.
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
    const text = await runModel(prompt);

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
    const text = await runModel(prompt);
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

  return await runModel(prompt);
}
