"use client";

import { useEffect, useState, useTransition } from "react";

type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  username: string;
};

export default function ChatRoom({ roomSlug }: { roomSlug: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    const fetchMessages = async () => {
      const res = await fetch(`/api/chat?room=${roomSlug}`);
      if (!res.ok) return;
      const data = await res.json();
      if (active) {
        setMessages(data.messages);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [roomSlug]);

  const sendMessage = () => {
    if (!draft.trim()) return;
    const payload = draft;
    setDraft("");
    startTransition(async () => {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: roomSlug, body: payload }),
      });
      const res = await fetch(`/api/chat?room=${roomSlug}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl">Community Room</h3>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)]">
          Live feed
        </span>
      </div>
      <div className="mt-4 max-h-64 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
        {messages.length === 0 ? (
          <p className="text-[var(--muted)]">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span className="uppercase tracking-wide">{msg.username}</span>
                <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
              </div>
              <p>{msg.body}</p>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message"
          className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
        />
        <button
          onClick={sendMessage}
          disabled={isPending}
          className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black"
        >
          Send
        </button>
      </div>
    </div>
  );
}
