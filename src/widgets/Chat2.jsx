import React, { useState, useEffect, useRef } from "react";
import { aiAssistant, aiPlannerAgent } from "../utils/gemini";
import { Sparkles, UserCircle, Loader2 } from "lucide-react";

export  function GenerativeChat({ trip, weather, onTripUpdate }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hi! I’m your travel assistant. Ask me anything about your trip.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  
  // Auto-scroll only inside chat area
  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);
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
        setMessages((m) => [
          ...m,
          {
            sender: "ai",
            text: `✨ Suggestion: ${aiResponse.action} activities on Day ${aiResponse.day}.`,
            update: aiResponse,
          },
        ]);
      }
    } catch (err) {
      console.error("❌ Chat error:", err);
      setMessages((m) => [
        ...m,
        { sender: "ai", text: "❌ Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function acceptUpdate(update, idx) {
    if (onTripUpdate) onTripUpdate(update);
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === idx
          ? { ...msg, update: null, text: msg.text + " ✅ Applied" }
          : msg
      )
    );
  }

  function dismissUpdate(idx) {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === idx
          ? { ...msg, update: null, text: msg.text + " ❌ Dismissed" }
          : msg
      )
    );
  }

  return (
    <div   className="flex flex-col h-[24rem] border rounded-xl overflow-hidden shadow-md bg-white">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white" ref={chatContainerRef}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${
              m.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.sender === "ai" && (
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            )}

            <div
              className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm leading-relaxed shadow-sm transition-all ${
                m.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-900 rounded-bl-none"
              }`}
            >
              {m.text}

              {m.update && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => acceptUpdate(m.update, idx)}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => dismissUpdate(idx)}
                    className="px-2 py-1 text-xs bg-gray-300 rounded hover:bg-gray-400 transition"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            {m.sender === "user" && (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-gray-700" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-spin-slow" />
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t flex items-end gap-2 bg-white"
      >
        <textarea
        maxrows={4}
        minrows={1}
          className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ask about your trip..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function AgenticChat({ trip, weather, onTripUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [memory, setMemory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMemory, setShowMemory] = useState(false); // 👈 toggle memory view

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { sender: "user", text: input };
    setMessages((m) => [...m, newMsg]);
    setMemory((m) => [...m, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    const aiRes = await aiPlannerAgent(trip, input, weather, memory);

    if (aiRes.mode === "chat") {
      setMessages((m) => [...m, { sender: "ai", text: aiRes.message }]);
      setMemory((m) => [...m, { role: "ai", content: aiRes.message }]);
    } else if (aiRes.mode === "update") {
      onTripUpdate(aiRes);
      setMessages((m) => [
        ...m,
        { sender: "ai", text: "✅ I’ve updated your itinerary accordingly." },
      ]);
      setMemory((m) => [
        ...m,
        { role: "ai", content: "Updated itinerary based on user request." },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* Memory Toggle */}
      <button
        onClick={() => setShowMemory(!showMemory)}
        className="text-xs text-indigo-600 underline self-end"
      >
        {showMemory ? "Hide AI Memory" : "Show AI Memory"}
      </button>

      {/* 🧠 Memory Panel */}
      {showMemory && (
        <div className="border rounded-lg p-3 bg-gray-50 text-xs text-gray-700 max-h-32 overflow-y-auto">
          <div className="font-semibold text-gray-800 mb-1">🧠 AI Memory:</div>
          {memory.length === 0 ? (
            <p>No memory yet. Start chatting!</p>
          ) : (
            memory.map((m, i) => (
              <div key={i} className="mb-1">
                <span className="font-medium">{m.role}:</span> {m.content}
              </div>
            ))
          )}
        </div>
      )}

      {/* 💬 Chat Window */}
      <div className="h-64 overflow-y-auto p-3 border rounded bg-gray-50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 my-1 rounded ${
              m.sender === "user"
                ? "bg-blue-100 text-blue-800 self-end"
                : "bg-gray-200 text-gray-800 self-start"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">Analyzing...</div>}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI planner..."
          className="flex-1 px-3 py-2 border rounded"
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
const Chat2 =
  import.meta.env.VITE_AI_MODE === "studio" ? GenerativeChat : AgenticChat;

export default Chat2;
