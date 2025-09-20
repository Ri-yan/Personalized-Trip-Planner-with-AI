import React, { useState } from "react";
import { aiAssistant, askGemini, refineTripWithGemini } from "../utils/gemini";

export default function Chat({ trip, weather, onTripUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    const aiResponse = await aiAssistant(trip, input, weather);

    if (aiResponse.mode === "chat") {
      setMessages((m) => [...m, { sender: "ai", text: aiResponse.message }]);
    } else if (aiResponse.mode === "update" && aiResponse.action !== "none") {
      onTripUpdate(aiResponse);
      setMessages((m) => [
        ...m,
        { sender: "ai", text: "🤖 I have a suggestion for your trip!" },
      ]);
    }

    setLoading(false);
  }
  return (
    <div className="flex flex-col space-y-2">
      <div className="h-64 overflow-y-auto p-3 border rounded bg-gray-50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-2 my-1 rounded ${
              m.sender === "user"
                ? "bg-blue-100 text-blue-800 self-end"
                : "bg-gray-200 text-gray-800 self-start"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">Thinking...</div>}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI about your trip..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
}
