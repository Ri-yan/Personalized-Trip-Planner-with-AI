import React, { useEffect, useState } from "react";
import { fetchNearbyPlaces } from "../utils/places";
import { Star } from "lucide-react"; // optional icon from lucide-react

export default function Recommendations({ location, onAddToTrip }) {
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadRecommendations() {
    setLoading(true);
    const lat = location?.lat;
    const lng = location?.lng;
    try {
      const [hotelList, restaurantList] = await Promise.all([
        fetchNearbyPlaces({ lat, lng, radius: 2000, type: "lodging" }),
        fetchNearbyPlaces({ lat, lng, radius: 2000, type: "restaurant" }),
      ]);

      setHotels(hotelList.slice(0, 6));
      setRestaurants(restaurantList.slice(0, 6));
    } catch (err) {
      console.error("❌ Failed to load recommendations:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (location) loadRecommendations();
  }, [location]);

  const renderCards = (places, category, time, bestTime) => {
    if (!places?.length) return null;
    return (
      <div>
        <h5 className="font-semibold text-base mb-2">
          {category === "Hotel" ? "🏨 Hotels Nearby" : "🍴 Restaurants Nearby"}
        </h5>
        <div className="grid sm:grid-cols-2 gap-3">
          {places.map((p, i) => (
            <div
              key={i}
              className="border rounded-xl p-3 bg-white hover:shadow-md transition"
            >
                {p.photoUrl && <img src={p.photoUrl} className="w-full h-24 object-cover rounded mb-2" />}

              <div className="flex justify-between items-start mb-2">
                <h6 className="font-medium text-sm text-gray-800 line-clamp-2">
                  {p.name}
                </h6>
                {p.rating && (
                  <div className="flex items-center gap-1 text-yellow-600 text-xs">
                    <Star size={14} fill="currentColor" />
                    {p.rating.toFixed(1)}
                  </div>
                )}
              </div>
              {p.address && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                  {p.address}
                </p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-gray-400 italic">
                  Source: {p.source}
                </span>
                <button
                  className="text-indigo-600 text-xs font-medium hover:underline"
                  onClick={() =>
                    onAddToTrip({
                      time,
                      title: p.name,
                      category,
                      bestTime,
                      score: Math.round(p.rating * 20) || 70,
                      lat: p.lat,
                      lng: p.lng,
                    })
                  }
                >
                  ➕ Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-lg">
          🏨 Hotel & 🍴 Restaurant Recommendations
        </h4>
        <button
          onClick={loadRecommendations}
          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading && (
        <div className="text-center py-6 text-gray-500 animate-pulse">
          Fetching nearby places...
        </div>
      )}

      {!loading && (
        <>
          {renderCards(hotels, "Hotel", "Evening", "Anytime")}
          {renderCards(restaurants, "Restaurant", "Lunch", "Afternoon")}
        </>
      )}

      {!loading && !hotels.length && !restaurants.length && (
        <p className="text-gray-500 text-sm italic text-center">
          No nearby places found. Try again later.
        </p>
      )}
    </div>
  );
}
