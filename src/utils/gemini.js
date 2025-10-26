// src/utils/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchNearbyPlaces } from "./places";

const MODE = import.meta.env.VITE_AI_MODE || "studio";

let studioModel = null;
let vertexModel = null;

/* -------------------------------------------------------------------------- */
/* 🎯 Initialize Studio (Gemini API)                                          */
/* -------------------------------------------------------------------------- */
if (MODE === "studio") {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) console.error("❌ Missing VITE_GEMINI_API_KEY in .env");

  const genAI = new GoogleGenerativeAI(API_KEY);
  studioModel = genAI.getGenerativeModel({
    model: import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash",
  });
}

/* -------------------------------------------------------------------------- */
/* ☁️ Lazy-load Vertex (Google Cloud Vertex AI)                               */
/* -------------------------------------------------------------------------- */
async function initVertexModel() {
  if (vertexModel) return vertexModel;

  try {
    const { VertexAI } = await import("@google-cloud/vertexai");
    const project = import.meta.env.VITE_GCP_PROJECT_ID;
    const location = import.meta.env.VITE_GCP_LOCATION || "us-central1";

    const vertexAI = new VertexAI({ project, location });
    vertexModel = vertexAI.preview.getGenerativeModel({
      model: import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-pro",
    });

    console.log("✅ Vertex AI model initialized");
    return vertexModel;
  } catch (err) {
    console.error("❌ Failed to init Vertex AI:", err);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* 🧠 Unified Model Runner                                                    */
/* -------------------------------------------------------------------------- */
async function runModel(prompt) {
  try {
    // Prefer Vertex if MODE is set
    if (MODE === "vertex") {
      const model = await initVertexModel();
      if (model) {
        const resp = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        const text = resp.response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    }

    // Fallback to Gemini Studio
    if (MODE === "studio" && studioModel) {
      const result = await studioModel.generateContent(prompt);
      return result.response.text();
    }

    throw new Error("No valid AI model initialized.");
  } catch (err) {
    console.error("❌ Model execution failed:", err);
    return "Sorry, something went wrong while generating your itinerary.";
  }
}

/* -------------------------------------------------------------------------- */
/* 💬 Public Exports (unchanged signatures)                                   */
/* -------------------------------------------------------------------------- */

export async function askGemini(prompt) {
  return await runModel(prompt);
}

export async function aiAssistant(trip, userInput, weather) {
  const prompt = `
    You are a professional travel planner AI.
    
    The user has this trip: ${JSON.stringify(trip, null, 2)}.
    Weather details: ${JSON.stringify(weather, null, 2)}.
    The user request is: "${userInput}".

    If the request is about CHANGING the itinerary, respond ONLY in JSON format:
    {
      "mode": "update",
      "action": "add" | "remove" | "replace",
      "day": <day number>,
      "items": [
        { "time": "Morning", "title": "Activity", "category": "type", "bestTime": "string", "score": 90 }
      ]
    }

    If the request is conversational (like "hello" or "tell me about the trip"),
    respond ONLY in JSON format:
    {
      "mode": "chat",
      "message": "Write a friendly, descriptive reply."
    }
  `;

  try {
    const text = await runModel(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { mode: "chat", message: text };
  } catch (err) {
    console.error("❌ aiAssistant error:", err);
    return { mode: "chat", message: "Sorry, something went wrong." };
  }
}

export async function refineTripWithGemini(trip, userInput) {
  const prompt = `
    You are a trip planner AI.
    The user has this trip: ${JSON.stringify(trip, null, 2)}.
    The user request is: "${userInput}".

    Return ONLY JSON:
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
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { action: "none" };
  } catch (err) {
    console.error("❌ refineTripWithGemini error:", err);
    return { action: "none" };
  }
}

export async function summarizeTrip(trip) {
  const prompt = `
    You are a travel planner AI.
    Summarize this trip in 3–5 sentences, highlighting culture, activities, and best times.

    ${JSON.stringify(trip, null, 2)}

    Return ONLY plain text.
  `;
  return await runModel(prompt);
}

export function summarizeWeather(weather) {
  if (!weather?.list?.length) return "Weather data unavailable.";
  const temps = weather.list.map((i) => i.main.temp);
  const avg = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
  const conditions = weather.list[0]?.weather[0]?.description;
  return `Average ${avg}°C, mostly ${conditions}.`;
}

export async function runAI(prompt, contextMemory = []) {
  const systemPrompt = `
    You are "TravelMate", an AI travel planner.
    You remember past user queries and trip details.
  `;
  const fullPrompt = `
    ${systemPrompt}
    Memory: ${JSON.stringify(contextMemory, null, 2)}
    ---
    User: ${prompt}
  `;
  return await runModel(fullPrompt);
}

export async function aiPlannerAgent(trip, userInput, weather, memory = []) {
  const prompt = `
    Trip Data: ${JSON.stringify(trip, null, 2)}
    Weather Summary: ${JSON.stringify(weather, null, 2)}
    Memory: ${JSON.stringify(memory, null, 2)}
    User said: "${userInput}"

    Identify intent:
    - If user modifies trip: {"mode":"update","action":"add|remove|replace","day":2,"items":[{...}]}
    - If it's conversation: {"mode":"chat","message":"..."}
    - If weather-sensitive: {"mode":"update","reason":"weather","suggestion":"..."}
  `;
  try {
    const text = await runModel(prompt);
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { mode: "chat", message: text };
  } catch (e) {
    console.error("❌ aiPlannerAgent error", e);
    return { mode: "chat", message: "AI could not respond." };
  }
}

export async function getNearByRecommendation(trip, intent) {
  let aiReply = "Let me fetch some nearby options for you...";
  const type = intent.toLowerCase().includes("hotel") ? "lodging" : "restaurant";

  const places = await fetchNearbyPlaces({
    lat: trip.location?.lat,
    lng: trip.location?.lng,
    radius: 2000,
    type,
  });

  if (!places.length) return "No nearby places found.";

  aiReply += `\nHere are top 3 options:\n${places
    .slice(0, 3)
    .map((p) => `• ${p.name} (${p.rating || "N/A"}⭐)`)
    .join("\n")}`;
  return aiReply;
}
