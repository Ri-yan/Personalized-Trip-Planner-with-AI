import React, { useState, useEffect } from "react";

export default function AISuggestionModal({
  show,
  suggestion,
  onAccept,
  onReject,
}) {
  const [editable, setEditable] = useState([]);

  useEffect(() => {
    if (suggestion?.items) {
      setEditable(suggestion.items.map((it) => ({ ...it })));
    }
  }, [suggestion]);

  if (!show || !suggestion) return null;

  function updateField(idx, field, value) {
    const newItems = [...editable];
    newItems[idx][field] = value;
    setEditable(newItems);
  }

  function removeItem(idx) {
    const newItems = editable.filter((_, i) => i !== idx);
    setEditable(newItems);
  }

  function addItem() {
    setEditable([
      ...editable,
      { time: "", title: "", category: "", bestTime: "", score: 0 },
    ]);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <h3 className="text-lg font-semibold mb-3">AI Suggestion</h3>

        {suggestion.action !== "none" ? (
          <div className="scrollable-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              The AI suggests to <b>{suggestion.action}</b> items on Day{" "}
              {suggestion.day}.
            </p>

            {editable.map((it, idx) => (
              <div key={idx} className="p-3 border rounded space-y-2">
                <input
                  type="text"
                  value={it.title}
                  onChange={(e) => updateField(idx, "title", e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Activity title"
                />
                <input
                  type="text"
                  value={it.time}
                  onChange={(e) => updateField(idx, "time", e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Time (Morning, Afternoon, Evening)"
                />
                <input
                  type="text"
                  value={it.category}
                  onChange={(e) => updateField(idx, "category", e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Category (Adventure, Heritage, etc.)"
                />
                <input
                  type="text"
                  value={it.bestTime}
                  onChange={(e) => updateField(idx, "bestTime", e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Best time to do this"
                />
                <input
                  type="number"
                  value={it.score}
                  onChange={(e) =>
                    updateField(idx, "score", Number(e.target.value))
                  }
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Score (0-100)"
                />

                <button
                  onClick={() => removeItem(idx)}
                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm"
                >
                  🗑 Remove
                </button>
              </div>
            ))}

            <button
              onClick={addItem}
              className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm"
            >
              + Add Activity
            </button>
          </div></div>
        ) : (
          <p className="text-gray-600">No actionable updates suggested.</p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onReject}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Reject
          </button>
          {suggestion.action !== "none" && (
            <button
              onClick={() => onAccept({ ...suggestion, items: editable })}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Accept
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
