"use client";
import { useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg z-50"
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white shadow-2xl rounded-lg overflow-hidden z-50">
          <iframe
            src="http://127.0.0.1:8080"   // your Flask chatbot frontend
            className="w-full h-full border-0"
            title="Medical Chatbot"
          />
        </div>
      )}
    </div>
  );
}
