import React, { useState } from "react";
const opts = ["Food", "Culture", "Nature", "Shopping", "Nightlife", "Adventure"];

export default function Interests({onChange}) {
  const [sel, setSel] = useState([]);

  function toggle(o) {
    setSel((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));
  }
  function toggle(o) {
    setSel((s) => {
      const updated = s.includes(o) ? s.filter((x) => x !== o) : [...s, o];
      onChange?.(updated);
      return updated;
    });
  }
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => toggle(o)}
          className={`px-3 py-1 rounded-full text-sm transition ${
            sel.includes(o)
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
