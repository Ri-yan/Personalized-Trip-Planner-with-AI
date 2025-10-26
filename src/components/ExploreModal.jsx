// src/components/ExploreModal.jsx
import React from "react";

export default function ExploreModal({ show, onClose, places, onSelectPlace }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-lg overflow-auto max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Explore Nearby</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>

        <div className="p-4 space-y-3">
          {places.length === 0 && <div className="text-sm text-gray-500">No places found nearby.</div>}
          {places.map((p, i) => (
            <div key={p.id} className="p-3 border rounded flex items-start gap-3">
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">{p.address || p.types?.join(", ")}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {p.rating ? `⭐ ${p.rating} (${p.user_ratings_total || 0}) ` : ""}
                  <span className="ml-2 text-gray-400">source: {p.source}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onSelectPlace(p)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                >
                  View
                </button>
                <a
                  className="px-3 py-1 border rounded text-sm text-center"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.lat + "," + p.lng)}`}
                >
                  Open Map
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
