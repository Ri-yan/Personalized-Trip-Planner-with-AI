import React, { useState } from "react";
import Interests from "../widgets/Interests";
import { v4 as uuidv4 } from "uuid";
import { fetchLatLng } from "../utils/geodecoding";
import { sampleTrip } from "../data/sampleTrip";
import { useNavigate } from "react-router-dom";
import SavedTrips from "../components/SavedTrips";
import { generateTripPlan } from "../utils/tripPlanner";

export default function Onboarding({ onGenerate, user,pastTrips,toggleFavorite, setTripToDelete }) {
  const [destination, setDestination] = useState("Jaipur");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(12000);
  const [persona, setPersona] = useState("Heritage Lover");
  const [loading, setLoading] = useState(false);
  const [interests, setInterests] = useState([])

  const navigate = useNavigate();

  async function gen() {
    setLoading(true);
    const location = await fetchLatLng(destination);

    await new Promise((r) => setTimeout(r, 900));

    const tripId = uuidv4();
    const trip = {
      id: tripId,
      unsaved: true,
      location,
      title: destination,
      costEstimate: budget,
      interests:interests,
      days: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        items: [],
      })),
      persona,
    };
    onGenerate(trip);
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* LEFT: FORM */}
      <div className="col-span-7">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-2">
            Plan your perfect trip
          </h2>
          <p className="text-gray-500 mb-4">
            Tell us a few details and we’ll craft a personalized itinerary powered by AI.
          </p>

          {/* Form */}
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
              <label className="block text-sm text-gray-600">Budget (INR)</label>
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
            <Interests onChange={(vals) => setInterests(vals)} />

          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={gen}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow"
            >
              {loading ? "Crafting itinerary..." : "Generate Itinerary"}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: TOP PICKS */}
      <div className="col-span-5">
        <SavedTrips user={user} pastTrips={pastTrips} toggleFavorite={toggleFavorite} setTripToDelete={setTripToDelete} />
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 shadow">
          <h3 className="font-semibold mb-3">🌆 Preview: Top Picks in Jaipur</h3>
          <div className="space-y-3">
            {sampleTrip.days.flatMap((d) => d.items).map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition flex items-start gap-3"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-semibold">
                  {p.title.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-gray-500">
                    {p.category} • Best: {p.bestTime}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Score: {p.score}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/results", { state: { trip: sampleTrip } })}
            className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
          >
            View This Trip
          </button>
        </div>

        <div className="mt-4 bg-white rounded-2xl p-4 shadow">
          <h4 className="font-semibold mb-2">💡 Quick Tip</h4>
          <div className="text-sm text-gray-600">
            Try selecting <b>“Foodie Explorer”</b> or <b>“Adventure Seeker”</b> for unique itineraries.
          </div>
        </div>
      </div>
    </div>
  );
}
