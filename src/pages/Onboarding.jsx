import React, { useState } from "react";
import Interests from "../widgets/Interests";
import SampleData from "../utils/sample-data";
import { v4 as uuidv4 } from "uuid"

export default function Onboarding({ onGenerate, user }) {
  const [destination, setDestination] = useState("Jaipur");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(12000);
  const [persona, setPersona] = useState("Heritage Lover");
  const [loading, setLoading] = useState(false);

  async function gen() {
    setLoading(true);
    // Simulate backend + Gemini + Maps processing with local mock
    await new Promise((r) => setTimeout(r, 900));
    // Filter sample places by persona heuristics (simple scoring)
    const tripId = uuidv4()

    const trip = {
      id: tripId,
      unsaved: true,
      ...SampleData.generateTrip({ destination, days, budget, persona }),
    };
    onGenerate(trip);

    onGenerate(trip);

    onGenerate(trip);
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-7">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-2">
            Plan your perfect trip
          </h2>
          <p className="text-gray-500 mb-4">
            Tell us a few details and we’ll craft a personalized itinerary
            powered by AI.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Destination</label>
              <input
                className="mt-1 w-full border rounded p-2"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Days</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full border rounded p-2"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">
                Budget (INR)
              </label>
              <input
                type="number"
                className="mt-1 w-full border rounded p-2"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Persona</label>
              <select
                className="mt-1 w-full border rounded p-2"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
              >
                <option>Heritage Lover</option>
                <option>Foodie Explorer</option>
                <option>Adventure Seeker</option>
                <option>Relaxed Traveler</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-600">Interests</label>
            <Interests />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={gen}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow"
            >
              {loading ? "Crafting itinerary..." : "Generate Itinerary"}
            </button>
            <button
              onClick={() => onGenerate(SampleData.quickSample())}
              className="px-4 py-2 border rounded-lg"
            >
              Use Sample
            </button>
            <div className="text-sm text-gray-500">
              Demo will use mock AI & POI data.
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-2">Why this works</h3>
            <ul className="text-sm text-gray-600 list-disc pl-5">
              <li>Persona-driven selection of places</li>
              <li>Best-time suggestions and cost estimates</li>
              <li>Real-time adaptation planned via webhooks</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="col-span-5">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 shadow">
          <h3 className="font-semibold mb-2">Preview: Top picks</h3>
          <div className="space-y-3">
            {SampleData.topPicks().map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-3 flex items-start gap-3"
              >
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl font-bold">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">
                    {p.category} • Best: {p.bestTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl p-4 shadow">
          <h4 className="font-semibold mb-2">Quick Tips</h4>
          <div className="text-sm text-gray-600">
            Try selecting 'Foodie Explorer' or 'Heritage Lover' to see different
            styles of itineraries.
          </div>
        </div>
      </div>
    </div>
  );
}
