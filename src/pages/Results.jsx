// src/pages/Results.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import BookingModal from "../widgets/BookingModal";
import { db, doc, onSnapshot, setDoc } from "../utils/firebase";
import {
  refineTripWithGemini,
  summarizeTrip,
  summarizeWeather,
} from "../utils/gemini";
import Swal from "sweetalert2";
import AISuggestionModal from "../components/AISuggestionModal";
import { fetchWeather, getWeather } from "../utils/weather";
import TripMap from "../components/TripMap";
import WeatherWidget from "../components/WeatherWidget";
import Chat2 from "../widgets/Chat2";
import { exportTripToPDF } from "../utils/pdf";
import ActivityActions from "../components/ActivityActions";
import Recommendations from "../components/Recommendations";
import { useParams } from "react-router-dom";
import TripInsightsPanel from "../components/TripInsightPanel";
import { MapPin, Sparkles } from "lucide-react";
import { Trash2 } from "lucide-react";
import crypto from "../helper/crypto";
import { useDispatch, useSelector } from "react-redux";
import { setActiveTrip } from "../store/slices/tripSlice";
import { ShareButton } from "../components/ShareModal";
import { sampleTrip } from "../data/sampleTrip";

export default function Results({ onBack, user, onUpdateTrip }) {
  const [summary, setSummary] = useState("");
  const [centerTarget, setCenterTarget] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [selected, setSelected] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);

  const [tripSummary, setTripSummary] = useState("");
  const [weatherSummary, setTripWeatherSummary] = useState("");
  const [tripInsights, setTripInsights] = useState({});
  let trip = useSelector((s) => s.trip.activeTrip);
  //const [trip, setTrip] = useState(activeTrip);

  const param = useParams();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef(null); // 🔹 persist unsubscribe

  useEffect(() => {
    if (!param?.id) {
      setError("Invalid or missing trip ID in URL");
      return;
    }

    // ✅ Cleanup any previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      const data = crypto.decryptFromUrl(param.id);
      const { userId, tripId } = data;
      if (userId === "guest") {
        onUpdateTrip(sampleTrip);
        // setTrip(structuredClone(ac
        dispatch(setActiveTrip(sampleTrip));
        setLoading(false);
        return;
      }
      if (!userId || !tripId) {
        setError("Decryption failed or missing IDs");
        return;
      }

      const tripRef = doc(db, "users", userId, "itineraries", tripId);

      const unsubscribe = onSnapshot(
        tripRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const tripData = { id: tripId, ...snapshot.data() };
            dispatch(setActiveTrip(tripData));
            // setTrip(structuredClone(tripData)); // update Redux once per change
            setLoading(false);
          } else {
            setError("Trip not found or deleted");
            setLoading(false);
          }
        },
        (err) => {
          console.error("❌ Firestore listener error:", err);
          setError("Failed to load trip data.");
          setLoading(false);
        }
      );

      // 🔹 Keep reference for cleanup
      unsubscribeRef.current = unsubscribe;
    } catch (e) {
      console.error("❌ Decryption or Firestore error:", e);
      setError("Unable to access this trip.");
      setLoading(false);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        dispatch(setActiveTrip(null));
        // setTrip(null);
      }
    };
  }, [param?.id]);

  const [saved, setSaved] = useState(Boolean(trip?.id)); // true if already has id
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
      //onUpdateTrip({ ...trip, summary: text });
      setSummary(text);
      setTripSummary(text);
    }
    loadSummary();
  }, [trip]);

  useEffect(() => {
    // Reset saved flag when a different trip is passed in
    setSaved(Boolean(trip?.id));
  }, [trip?.id]);

  function applySuggestion(update) {
    const newTrip = structuredClone(trip);

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

  if (loading) {
    return <div>Loading trip...</div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{trip.title}</h2>
          <div className="text-sm text-gray-500">
            {trip.days.length} days • Budget. ₹{trip.budget} • Est. ₹
            {trip.costEstimate}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-3 py-2 border rounded">
            Back
          </button>
          <ShareButton
            trip={trip}
            createShareUrl={(trip) => {
              return `${window.location.origin}/results/${param.id}`;
            }}
          />
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
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-4 ">
          <div
            className="rounded-2xl shadow-md  space-y-6 scrollable-container "
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            {trip.days.map((d) => (
              <div key={d.day} className="bg-white rounded-2xl shadow p-2 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Day {d.day}</h3>
                  <div className="text-sm text-gray-500">
                    Morning • Afternoon • Evening
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {d.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="relative p-3 border rounded-lg flex items-start gap-3 group hover:shadow-md transition"
                    >
                      {/* <button
                        onClick={() => {
                          const updatedTrip = structuredClone(trip);
                          const dayIndex = updatedTrip.days.findIndex(
                            (day) => day.day === d.day
                          );
                          updatedTrip.days[dayIndex].items = updatedTrip.days[
                            dayIndex
                          ].items.filter((_, i) => i !== idx);
                          onUpdateTrip(updatedTrip);
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                        title="Remove activity"
                      >
                        <Trash2 size={16} />
                      </button> */}
                      <button
                        onClick={async () => {
                          const confirm = await Swal.fire({
                            title: "Delete activity?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Delete",
                            confirmButtonColor: "#EF4444",
                            cancelButtonColor: "#6B7280",
                          });

                          if (confirm.isConfirmed) {
                            const updatedTrip = structuredClone(trip);
                            const dayIndex = updatedTrip.days.findIndex(
                              (day) => day.day === d.day
                            );
                            updatedTrip.days[dayIndex].items = updatedTrip.days[
                              dayIndex
                            ].items.filter((_, i) => i !== idx);
                            onUpdateTrip(updatedTrip);
                          }
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                        title="Remove activity"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="w-16 text-sm text-gray-500">
                        {it.time}
                      </div>
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
                          {it.category === "Hotel" ? (
                            <button
                              onClick={() => {
                                setSelected(it);
                                setShowBooking(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded"
                            >
                              Book
                            </button>
                          ) : (
                            ""
                          )}
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
          </div>

          <div className="col-span-8 space-y-4">
            <WeatherWidget location={trip.location} />
            {weather && (
              <button
                onClick={async () => {
                  const weatherSummary = summarizeWeather(weather);
                  onUpdateTrip({ ...trip, weatherSummary: weatherSummary });
                  setTripWeatherSummary(weatherSummary);
                  // Ask Gemini how to adjust itinerary given weather
                  const aiUpdate = await refineTripWithGemini(
                    {
                      ...trip,
                      nearby: trip?.nearby, // contains hotels/restaurants/monuments
                    },
                    `Adjust this itinerary for weather: ${weatherSummary}. Prefer indoor attractions or restaurants if it's raining.`
                  );

                  if (aiUpdate.action === "none") {
                    alert("No weather-based updates suggested.");
                    return;
                  }

                  // Show the suggestion modal (editable)
                  setAiSuggestion(aiUpdate);
                }}
                className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded"
              >
                Adjust Plan Based on Weather
              </button>
            )}
          </div>
        </div>

        <div className="col-span-4 space-y-4  rounded-2xl  py-4">
          <h4 className="font-semibold mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mx-2">
                <Sparkles className="w-5 h-5 text-white " />
              </div>{" "}
              AI Trip Assistant
            </div>
          </h4>
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
          <div className="bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mx-2">
                  <MapPin className="w-5 h-5 text-white inline-block" />
                </div>
                Map Preview
              </div>
            </h4>
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
              Est. Cost: ₹{tripInsights?.totalCostEstimate?.toLocaleString()}
            </div>

            <div className="mt-3">
              <button
                onClick={() =>
                  exportTripToPDF(
                    {
                      ...trip,
                      tripInsights: tripInsights,
                      tripSummary: tripSummary,
                      weatherSummary: weatherSummary,
                    },
                    user
                  )
                }
                className="w-full px-3 py-2 bg-green-600 text-white rounded"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      <Recommendations
        trip={trip}
        location={trip.location}
        onAddToTrip={(place, dayNumber, time) => {
          const updatedTrip = structuredClone(trip);

          const dayIndex = updatedTrip.days.findIndex(
            (d) => d.day === dayNumber
          );
          if (place) place.time = time;

          if (dayIndex >= 0) {
            updatedTrip.days[dayIndex].items.push(place);
          } else {
            updatedTrip.days.push({ day: dayNumber, items: [place] });
          }

          onUpdateTrip(updatedTrip);
        }}
      />
      <TripInsightsPanel trip={trip} setTripInsights={setTripInsights} />
      <BookingModal
        show={showBooking}
        item={selected}
        onClose={() => setShowBooking(false)}
      />
    </div>
  );
}
