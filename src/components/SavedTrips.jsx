import React from "react";
import { useNavigate } from "react-router-dom";

function SavedTrips({user, pastTrips, toggleFavorite, setTripToDelete}) {
    const navigate = useNavigate();

  return (
    <>
      {" "}
      {/* Saved Trips List */}
      {user && pastTrips.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Your Saved Trips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastTrips.map((t) => (
              <div
                key={t.id}
                className="p-4 bg-white shadow rounded-lg relative"
              >
                <button
                  onClick={() => toggleFavorite(user.uid, t.id, t.favorite)}
                  className="absolute top-2 right-2 text-yellow-500"
                  title={t.favorite ? "Unfavorite" : "Mark as Favorite"}
                >
                  {t.favorite ? "⭐" : "☆"}
                </button>

                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-gray-500">
                  {t.days?.length || 0} days • Est. ₹{t.costEstimate}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => navigate("/results", { state: { trip: t } })}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setTripToDelete(t)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default SavedTrips;
