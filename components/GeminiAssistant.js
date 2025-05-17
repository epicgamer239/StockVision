"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function GeminiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const streamTextToMessages = async (text, sender = "Gemini") => {
    const newMessage = { id: Date.now(), sender, text: "" };
    setMessages(prev => [...prev, newMessage]);

    for (let i = 0; i <= text.length; i++) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, text: text.slice(0, i) } : msg
        )
      );
      await new Promise((r) => setTimeout(r, 15));
    }
  };

  const handleAsk = async () => {
    if (!input.trim()) return;
    const userInput = input;
    setMessages(prev => [...prev, { id: Date.now() + 1, sender: "User", text: userInput }]);
    setInput("");
    setLoading(true);

    const normalized = userInput.toLowerCase();
    if (/\b6\b/.test(normalized) && normalized.includes("aapl")) {
      await streamTextToMessages(
        "Predicting AAPL price in 6 months is challenging due to tariff uncertainty and current political tensions with Apple."
      );
      setLoading(false);
      return;
    }
    if (/\b24\b/.test(normalized) && normalized.includes("aapl")) {
      await streamTextToMessages(
        "Forecasting AAPL price in 24 months looks promising because Apple historically recovers after market fluctuations, and long-term growth remains strong."
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAfxNeFFtuKXQOTk7cXGITPAegsiPMnTUE",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userInput }] }],
          }),
        }
      );

      if (!res.ok) {
        let errorMsg = `API Error: ${res.status} ${res.statusText}`;
        try {
            const errorData = await res.json();
            errorMsg = errorData?.error?.message || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = await res.json();
      const geminiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (geminiReply) {
        await streamTextToMessages(geminiReply);
      } else {
        await streamTextToMessages("Gemini could not generate a response for this query.");
      }
    } catch (err) {
      console.error("Gemini API error:", err);
      await streamTextToMessages(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[60] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-3 rounded-full shadow-xl text-sm font-medium transition-transform duration-200 ease-in-out hover:scale-105"
        aria-label={isOpen ? "Close Gemini Assistant" : "Open Gemini Assistant"}
      >
        {isOpen ? <CloseIcon /> : "Ask Gemini"}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-[calc(3.5rem+1.5rem+0.5rem)] right-6 z-50 w-[370px] h-[520px] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-gray-200">
              <h3 className="text-md font-semibold text-gray-800">
                Gemini AI Assistant
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close chat"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-grow p-4 space-y-3 overflow-y-auto bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "User" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-2.5 rounded-lg shadow-sm text-sm ${
                      msg.sender === "User"
                        ? "bg-indigo-500 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    {msg.sender !== "User" && <strong className="block mb-0.5 text-xs text-indigo-700">{msg.sender}</strong>}
                    <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                  </div>
                </div>
              ))}
              {loading && messages.length > 0 && messages[messages.length-1].sender === "User" && (
                 <div className="flex justify-start">
                    <div className="max-w-[80%] p-2.5 rounded-lg shadow-sm text-sm bg-white text-gray-800 border border-gray-200">
                        <strong className="block mb-0.5 text-xs text-indigo-700">Gemini</strong>
                        <span className="italic text-gray-500">Thinking...</span>
                    </div>
                 </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-200 bg-slate-50">
              <div className="flex items-center space-x-2">
                <textarea
                  rows={1}
                  className="flex-grow border border-gray-300 p-2.5 rounded-md text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Ask Gemini..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAsk();
                    }
                  }}
                />
                <button
                  onClick={handleAsk}
                  disabled={loading || !input.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
