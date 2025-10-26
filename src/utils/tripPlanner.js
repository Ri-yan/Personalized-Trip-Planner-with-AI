// src/utils/tripPlanner.js
import { fetchWeather } from "./weather";
import { fetchNearbyPlaces } from "./places";
import { aiPlannerAgent, askGemini } from "./gemini";
import { fetchLatLng } from "./geodecoding";
import { db, doc, setDoc } from "./firebase";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a complete AI-powered trip plan
 * @param {*} formData { title, days, budget, persona, ... }
 * @param {*} user current firebase user
 * @param {*} navigate react-router navigate()
 */
export function formatResult(result) {
  try {
    let text = result;

    // 🧹 Clean up typical markdown wrappers and junk
    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/^\s*Here.*?:/i, "")
      .trim();

    // 🧠 Try extracting JSON using regex
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const json = match[0];
      try {
        return JSON.parse(json);
      } catch {
        console.warn("⚠️ JSON parse failed, returning raw text");
        return text;
      }
    }

    // If no JSON found, just return raw text
    return text;
  } catch (err) {
    console.error("❌ Gemini error:", err);
    return { error: "AI failed to generate valid response." };
  }
}
export async function generateTripPlan(formData, user, navigate) {
  try {
    // 1️⃣ Validate destination
    const coords = await fetchLatLng(formData.title);
    if (!coords?.lat || !coords?.lng) {
      alert("Please enter a valid destination.");
      return;
    }

    // 2️⃣ Get weather data
    const weather = await fetchWeather(coords.lat, coords.lng);

    // 3️⃣ Fetch nearby points (Google + Overpass fallback)
    const [hotels, restaurants, monuments] = await Promise.all([
      fetchNearbyPlaces({ lat: coords.lat, lng: coords.lng, type: "lodging" }),
      fetchNearbyPlaces({
        lat: coords.lat,
        lng: coords.lng,
        type: "restaurant",
      }),
      fetchNearbyPlaces({
        lat: coords.lat,
        lng: coords.lng,
        type: "tourist_attraction",
      }),
    ]);

    // 4️⃣ Construct a data bundle for AI context
    const context = {
      destination: formData.title,
      days: formData.days,
      budget: formData.costEstimate,
      persona: formData.persona,
      nearby: {
        hotels: (hotels || []).slice(0, 10),
        restaurants: (restaurants || []).slice(0, 10),
        monuments: (monuments || []).slice(0, 10),
      },
        weather: {
        avgTemp:
          weather?.list?.length > 0
            ? (
                weather.list
                  .map((w) => w.main.temp)
                  .reduce((a, b) => a + b, 0) / weather.list.length
              ).toFixed(1)
            : "N/A",
        condition: weather?.list?.[0]?.weather?.[0]?.description || "clear",
      },
    };

    // 5️⃣ Use Gemini/Vertex AI to plan trip days dynamically
    const prompt = `
    You are a strict JSON-only generator.
    Do not include markdown, comments, or explanations.
    Return ONLY valid JSON, no backticks, no code fences.

    Generate a trip plan. Based on this context:

      ${JSON.stringify(context, null, 2)}

      Create a detailed trip plan JSON in this exact format:
      {
        "title": "<destination> Getaway",
        "location": { "name": "<destination>", "lat": <lat>, "lng": <lng> },
        "costEstimate": <budget>,
        "days": [
          {
            "day": 1,
            "items": [
              {
                "time": "Morning",
                "title": "<activity name>",
                "category": "<category>",
                "bestTime": "<Morning|Afternoon|Evening>",
                "score": <0-100>,
                "lat": <lat>,
                "lng": <lng>
              }
            ]
          }
        ]
      }

      Rules:
      - Use 2–3 activities per day.
      - Pick real nearby places (use provided hotels, restaurants, monuments).
      - Align activities with persona (${formData.persona}).
      - If weather suggests rain, include indoor places (like museums or cafes).
      - Return ONLY JSON, no explanations.
    `;
    debugger;
    let res = await askGemini(prompt);
    const aiResponse = formatResult(res);

    let itinerary = null;
    try {
      // Try to parse structured JSON directly
      itinerary = aiResponse;
    } catch {
      console.warn(
        "⚠️ AI returned unstructured response, fallback to sample style."
      );
      itinerary = {
        title: `${formData.title} Trip`,
        location: coords,
        costEstimate: formData.costEstimate,
        days: [
          {
            day: 1,
            items: [
              {
                time: "Morning",
                title: monuments[0]?.name || "Local Exploration",
                category: "Sightseeing",
                bestTime: "Morning",
                score: 90,
                lat: monuments[0]?.lat,
                lng: monuments[0]?.lng,
              },
              {
                time: "Evening",
                title: restaurants[0]?.name || "Dinner by Sunset",
                category: "Food",
                bestTime: "Evening",
                score: 85,
                lat: restaurants[0]?.lat,
                lng: restaurants[0]?.lng,
              },
            ],
          },
        ],
      };
    }

    // 6️⃣ Merge all pieces into a final trip object
    const tripId = uuidv4();
    const tripData = {
      id: tripId,
      title: itinerary.title || `${formData.title} Trip`,
      location: itinerary.location || coords,
      costEstimate: formData.costEstimate,
      days: itinerary.days || [],
      weather,
      nearby: { hotels, restaurants, monuments },
      createdAt: new Date().toISOString(),
      unsaved: false,
    };

    // 7️⃣ Save to Firestore (under user)
    if (user?.uid) {
      const ref = doc(db, "users", user.uid, "itineraries", tripId);
      await setDoc(ref, tripData);
      console.log("✅ Trip saved to Firestore:", tripId);
    }

    // 8️⃣ Navigate to results
    navigate("/results", { state: { trip: tripData } });
  } catch (error) {
    console.error("❌ Trip generation failed:", error);
    alert("Something went wrong while planning your trip. Please try again.");
  }
}
