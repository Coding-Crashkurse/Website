import { useEffect, useRef, useState } from "react";
import { newThread, sendMessage } from "../services/api";

interface Msg {
  role: "user" | "ai";
  text: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages]
  );

  async function handleSend() {
    if (!input.trim()) return;
    const id = threadId ?? (await newThread());
    setThreadId(id);

    setMessages((m) => [...m, { role: "user", text: input }]);
    const userInput = input;
    setInput("");

    try {
      const reply = await sendMessage(id, userInput);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "❌ Error" }]);
    }
  }

  return (
    <>
      {/* floating bubble --------------------------------------------------- */}
      <button
        aria-label="Chat"
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 w-16 h-16 flex items-center justify-center
                   text-2xl text-white rounded-full shadow-xl
                   bg-[#1e8aff] hover:bg-[#1261c4] transition-colors"
      >
        💬
      </button>

      {/* panel ------------------------------------------------------------- */}
      {open && (
        <div
          className="fixed bottom-24 right-4 w-80 max-h-[70vh] flex flex-col
                        bg-black/70 backdrop-blur-lg border border-white/20
                        rounded-xl shadow-2xl text-white"
        >
          {/* header */}
          <div className="p-3 font-bold bg-[#1e8aff] rounded-t-xl flex justify-between">
            Chatbot
            <button onClick={() => setOpen(false)} className="font-normal">
              ✕
            </button>
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded text-sm ${
                  m.role === "user" ? "self-end bg-[#1e8aff]" : "bg-white/10"
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <div className="p-2 border-t border-white/10 flex gap-2">
            <input
              className="flex-1 bg-transparent border border-white/20 rounded p-2 text-sm
                         placeholder-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message…"
            />
            <button
              onClick={handleSend}
              className="bg-[#1e8aff] hover:bg-[#1261c4] text-white px-3 rounded"
            >
              ⇪
            </button>
          </div>
        </div>
      )}
    </>
  );
}
