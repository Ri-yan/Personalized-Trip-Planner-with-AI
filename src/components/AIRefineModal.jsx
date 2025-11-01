import React from "react";

export default function AIRefineModal({ show, refinedTrip, onClose, onConfirm }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6">
        <h3 className="text-lg font-semibold mb-4">AI Refined Itinerary</h3>

        {!refinedTrip ? (
          <div className="text-center text-gray-500">Analyzing trip...</div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {refinedTrip.days.map((d) => (
              <div key={d.day} className="p-3 border rounded-lg">
                <h4 className="font-semibold mb-2">Day {d.day}</h4>
                {d.items.map((it, i) => (
                  <div key={i} className="border-b py-1 text-sm text-gray-700">
                    <b>{it.time}</b> — {it.title} ({it.category}) • Best: {it.bestTime} • Score: {it.score}%
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(refinedTrip)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Apply Refinement
          </button>
        </div>
      </div>
    </div>
  );
}
