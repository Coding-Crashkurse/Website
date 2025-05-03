import { useEffect, useRef, useState } from "react";
import { newThread, sendMessage } from "../services/api";

interface Msg {
  role: "user" | "ai";
  text: string;
}
const MAX_WORDS = 1000;

/* helper to query backend quota */
async function fetchStatus() {
  const r = await fetch("/api/chat/status");
  if (!r.ok)
    return { allowed: true, remaining_hour: MAX_WORDS, remaining_day: MAX_WORDS };
  return (await r.json()) as {
    allowed: boolean;
    remaining_hour: number;
    remaining_day: number;
  };
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [tooLong, setTooLong] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  /* initial quota check */
  useEffect(() => {
    fetchStatus().then((s) => {
      if (!s.allowed) {
        setDisabled(true);
        setStatusMsg("Chat disabled – usage limit reached. Try later.");
      }
    });
  }, []);

  /* autoscroll */
  useEffect(
    () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages]
  );

  function handleChange(value: string) {
    setInput(value);
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    setTooLong(words > MAX_WORDS);
  }

  async function handleSend() {
    if (busy || disabled || tooLong || !input.trim()) return;

    const id = threadId ?? (await newThread());
    setThreadId(id);

    setMessages((m) => [...m, { role: "user", text: input }]);
    const userInput = input;
    setInput("");
    setBusy(true);

    try {
      const reply = await sendMessage(id, userInput);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      if (status === 429) {
        setDisabled(true);
        setStatusMsg("Chat disabled – usage limit reached. Try later.");
        setMessages((m) => [
          ...m,
          {
            role: "ai",
            text: "🚦 Chat disabled (usage limit). Please try later.",
          },
        ]);
      } else if (status === 413) {
        setTooLong(true);
      } else {
        setMessages((m) => [...m, { role: "ai", text: "❌ Error" }]);
      }
    } finally {
      setBusy(false);
    }
  }

  /* refresh quota when bubble clicked */
  async function toggleBubble() {
    if (disabled) return;
    const s = await fetchStatus();
    if (!s.allowed) {
      setDisabled(true);
      setStatusMsg("Chat disabled – usage limit reached. Try later.");
      return;
    }
    setOpen((o) => !o);
  }

  /* bubble styling */
  const bubbleCls =
    "fixed bottom-4 right-4 w-16 h-16 flex items-center justify-center " +
    "text-2xl text-white rounded-full shadow-xl transition-colors " +
    (disabled
      ? "bg-gray-500 cursor-not-allowed"
      : "bg-[#1e8aff] hover:bg-[#1261c4]");

  return (
    <>
      {/* bubble + tooltip wrapper */}
      <div className="group relative">
        <button
          aria-label="Chat"
          onClick={toggleBubble}
          className={bubbleCls}
        >
          💬
        </button>

        {/* tooltip visible on hover when disabled */}
        {disabled && (
          <span
            className="pointer-events-none absolute bottom-20 right-1/2 translate-x-1/2
                       w-max max-w-[14rem] rounded bg-gray-800 px-3 py-1 text-xs
                       text-white opacity-0 group-hover:opacity-100
                       transition-opacity duration-150"
          >
            {statusMsg}
          </span>
        )}
      </div>

      {/* chat panel */}
      {open && (
        <div
          className={`fixed bottom-24 right-4 w-80 max-h-[70vh] flex flex-col
                      bg-black/70 backdrop-blur-lg border border-white/20
                      rounded-xl shadow-2xl text-white
                      ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="p-3 font-bold bg-[#1e8aff] rounded-t-xl flex justify-between">
            Chatbot
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

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

          <div className="p-2 border-t border-white/10 flex gap-2">
            <input
              className={`flex-1 bg-transparent border rounded p-2 text-sm
                         placeholder-gray-400 ${
                           tooLong
                             ? "border-red-500 focus:outline-red-500"
                             : "border-white/20"
                         }`}
              value={input}
              disabled={busy || disabled}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                disabled
                  ? "Chat disabled (rate limit)"
                  : tooLong
                  ? "Message >1000 words"
                  : busy
                  ? "Thinking…"
                  : "Type your message…"
              }
            />
            <button
              onClick={handleSend}
              disabled={busy || disabled || tooLong}
              className={`px-3 rounded text-white ${
                busy || disabled || tooLong
                  ? "bg-gray-500"
                  : "bg-[#1e8aff] hover:bg-[#1261c4]"
              }`}
            >
              ⇪
            </button>
          </div>
        </div>
      )}
    </>
  );
}
