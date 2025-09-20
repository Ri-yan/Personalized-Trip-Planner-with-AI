import React, { useState } from "react";
import { aiAssistant } from "../utils/gemini";

export default function Chat2({ trip, weather, onTripUpdate }) {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "👋 Hi! I’m your travel assistant. Ask me anything about your trip." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const aiResponse = await aiAssistant(trip, input, weather);

      if (aiResponse.mode === "chat") {
        setMessages((m) => [...m, { sender: "ai", text: aiResponse.message }]);
      } else if (aiResponse.mode === "update" && aiResponse.action !== "none") {
        // Show suggestion, don't apply automatically
        setMessages((m) => [
          ...m,
          {
            sender: "ai",
            text: `✨ Suggestion: ${aiResponse.action} activities on Day ${aiResponse.day}.`,
            update: aiResponse
          }
        ]);
      }
    } catch (err) {
      console.error("❌ Chat error:", err);
      setMessages((m) => [...m, { sender: "ai", text: "❌ Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  function acceptUpdate(update, idx) {
    if (onTripUpdate) onTripUpdate(update);
    setMessages((prev) =>
      prev.map((msg, i) => (i === idx ? { ...msg, update: null, text: msg.text + " ✅ Applied" } : msg))
    );
  }

  function dismissUpdate(idx) {
    setMessages((prev) =>
      prev.map((msg, i) => (i === idx ? { ...msg, update: null, text: msg.text + " ❌ Dismissed" } : msg))
    );
  }

  return (
    <div className="flex flex-col h-80 border rounded-lg overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-lg max-w-xs text-sm ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border shadow"
              }`}
            >
              {m.text}
              {m.update && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => acceptUpdate(m.update, idx)}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => dismissUpdate(idx)}
                    className="px-2 py-1 text-xs bg-gray-300 rounded"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 bg-white border rounded-lg text-sm shadow">
              ⏳ Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-2 border-t flex gap-2">
        <textarea
          rows={1}
          className="flex-1 resize-none border rounded px-3 py-2 text-sm"
          placeholder="Ask about your trip..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}
