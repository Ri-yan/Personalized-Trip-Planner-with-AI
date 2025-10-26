// src/pages/Results.jsx
import React, { useState, useEffect } from "react";
import BookingModal from "../widgets/BookingModal";
import { db, doc, setDoc } from "../utils/firebase";
import { summarizeTrip } from "../utils/gemini";
import AISuggestionModal from "../components/AISuggestionModal";
import { fetchWeather, getWeather } from "../utils/weather";
import TripMap from "../components/TripMap";
import WeatherWidget from "../components/WeatherWidget";
import Chat2 from "../widgets/Chat2";
import { exportTripToPDF } from "../utils/pdf";
import ActivityActions from "../components/ActivityActions";
import Recommendations from "../components/Recommendations";
import { useNavigate } from "react-router-dom";

export default function Results({ trip, onBack, user, onUpdateTrip }) {
  const [summary, setSummary] = useState("");
  const [centerTarget, setCenterTarget] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(Boolean(trip?.id)); // true if already has id
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    async function loadWeather() {
      if (!trip?.location) return;
      // Assume trip has { location: { lat, lon } }
      const w = await getWeather(
        trip.location.lat,
        trip.location?.lon || trip.location.lng
      );
      setWeather(w);

      fetchWeather(trip?.location.lat, trip?.location.lng).then(setForecast);
    }
    loadWeather();
    async function loadSummary() {
      const text = await summarizeTrip(trip);
      setSummary(text);
    }
    loadSummary();
  }, [trip]);

  useEffect(() => {
    // Reset saved flag when a different trip is passed in
    setSaved(Boolean(trip?.id));
  }, [trip?.id]);

  useEffect(() => {
    async function saveItinerary() {
      if (!user || !trip || !trip.unsaved) return;

      try {
        const ref = doc(db, "users", user.uid, "itineraries", trip.id);
        await setDoc(ref, {
          ...trip,
          unsaved: false,
        });

        console.log("✅ Trip saved with ID:", trip.id);
        onUpdateTrip({ ...trip, unsaved: false });
      } catch (err) {
        console.error("❌ Error saving itinerary:", err);
      }
    }
    saveItinerary();
  }, [trip, user]);
  // useEffect(() => {

  // }, [trip]);

  function applySuggestion(update) {
    const newTrip = { ...trip };

    if (update.action === "add") {
      const dayIdx = newTrip.days.findIndex((d) => d.day === update.day);
      if (dayIdx >= 0) newTrip.days[dayIdx].items.push(...update.items);
    }

    if (update.action === "replace") {
      const dayIdx = newTrip.days.findIndex((d) => d.day === update.day);
      if (dayIdx >= 0) newTrip.days[dayIdx].items = update.items;
    }

    if (update.action === "remove") {
      const dayIdx = newTrip.days.findIndex((d) => d.day === update.day);
      if (dayIdx >= 0) {
        newTrip.days[dayIdx].items = newTrip.days[dayIdx].items.filter(
          (it) => !update.items.some((rm) => rm.title === it.title)
        );
      }
    }

    // Save to state + Firestore
    onUpdateTrip(newTrip);
    if (user) {
      const ref = doc(db, "users", user.uid, "itineraries", newTrip.id);
      setDoc(ref, newTrip);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{trip.title}</h2>
          <div className="text-sm text-gray-500">
            {trip.days.length} days • Est. ₹{trip.costEstimate}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-3 py-2 border rounded">
            Back
          </button>
          <button
            onClick={() =>
              navigator.share
                ? navigator.share({
                    title: trip.title,
                    text: "Check my trip",
                    url: location.href,
                  })
                : alert("Share your trip link (demo)")
            }
            className="px-3 py-2 bg-indigo-600 text-white rounded"
          >
            Share
          </button>
        </div>
      </div>
      {summary && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4">
          <h3 className="font-semibold text-yellow-800 mb-1">
            🌟 Trip Highlights
          </h3>
          <p className="text-yellow-700 text-sm">{summary}</p>
        </div>
      )}

      {weather && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4">
          <h3 className="font-semibold text-blue-800 mb-1">
            🌤️ Weather Updates
          </h3>
          <p className="text-blue-700 text-sm">
            {weather.list[0]?.weather[0]?.description},{" "}
            {weather.list[0]?.main?.temp}°C
          </p>
          <button
            onClick={() =>
              setAiSuggestion({
                action: "update",
                day: 1,
                items: [
                  {
                    time: "Morning",
                    title: "Indoor Museum Visit",
                    category: "Culture",
                    bestTime: "Anytime",
                    score: 90,
                  },
                ],
              })
            }
            className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded"
          >
            Adjust Plan Based on Weather
          </button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-4">
          {trip.days.map((d) => (
            <div key={d.day} className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Day {d.day}</h3>
                <div className="text-sm text-gray-500">
                  Morning • Afternoon • Evening
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {d.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-lg flex items-start gap-3"
                  >
                    <div className="w-16 text-sm text-gray-500">{it.time}</div>
                    <div className="flex-1">
                      <div className="font-medium">{it.title}</div>
                      <div className="text-sm text-gray-500">
                        {it.category} • Best: {it.bestTime}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div
                          className={
                            "px-2 py-1 rounded text-sm " +
                            (it.score > 80
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700")
                          }
                        >
                          Score: {it.score}%
                        </div>

                        {/* <button
                          onClick={() => {
                            setSelected(it);
                            setShowBooking(true);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded"
                        >
                          Book
                        </button> */}
                      </div>
                      <ActivityActions
                        item={it}
                        centerLocation={trip.location}
                        onCenterMap={(target) => setCenterTarget(target)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="col-span-8 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow">
              <WeatherWidget location={trip.location} />
            </div>
          </div>
        </div>

        <div className="col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold mb-2">Personalized Assistant</h4>
            <Chat2
              trip={trip}
              weather={forecast}
              onTripUpdate={(update) => {
                if (!update || update.action === "none") return;
                setAiSuggestion(update); // 👈 open modal instead of applying
              }}
            />
            {/* <Chat
              trip={trip}
              weather={forecast}
              onTripUpdate={(update) => {
                if (!update || update.action === "none") return;
                setAiSuggestion(update); // 👈 open modal instead of applying
              }}
            /> */}
            <AISuggestionModal
              show={!!aiSuggestion}
              suggestion={aiSuggestion}
              onReject={() => setAiSuggestion(null)}
              onAccept={(editedSuggestion) => {
                applySuggestion(editedSuggestion); // apply only when user accepts
                setAiSuggestion(null);
              }}
            />
          </div>
          <div className="bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold mb-2">Map Preview</h4>
            {/* <div className="h-64 rounded bg-gray-100 flex items-center justify-center">
              Google Maps preview (add API)
            </div> */}

            <TripMap
              location={trip.location}
              days={trip.days}
              centerTarget={centerTarget}
            />
            {/* <TripMapDirection location={trip.location} days={trip.days} /> */}
            {nearbyPlaces.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow mt-4">
                <h4 className="font-semibold mb-2">Nearby Attractions</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {nearbyPlaces.map((p, i) => (
                    <li key={i}>• {p.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3 text-sm text-gray-600">
              Route & distances provided by Maps API in full integration.
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold mb-2">Trip Summary</h4>
            <div className="text-sm text-gray-600">
              Days: {trip.days.length}
            </div>
            <div className="text-sm text-gray-600">
              Est. Cost: ₹{trip.costEstimate}
            </div>

            <div className="mt-3">
              <button
                onClick={() => exportTripToPDF(trip, user)}
                className="w-full px-3 py-2 bg-green-600 text-white rounded"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      <Recommendations
        location={trip.location}
        onAddToTrip={(place) => {
          const updatedTrip = { ...trip };
          updatedTrip.days[0].items.push(place);
          onUpdateTrip(updatedTrip);
        }}
      />
      <BookingModal
        show={showBooking}
        item={selected}
        onClose={() => setShowBooking(false)}
      />
    </div>
  );
}
