"use client";

import { Send, Loader2, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type {
  ChatMessage,
  Transcript,
  VideoComposition,
} from "../../types/videoEditor";

interface ChatPanelProps {
  messages: ChatMessage[];
  transcript: Transcript | null;
  /** Currently unused in UI but passed for future inline previews of ops */
  composition: VideoComposition | null;
  disabled: boolean;
  onSend: (message: string) => Promise<void>;
}

const SUGGESTIONS = [
  "Add captions synced to every word",
  "Trim the first 2 seconds and last 1 second",
  "Add a title card with 'My Best Tip'",
  "Highlight the word 'never' whenever I say it",
];

export default function ChatPanel({
  messages,
  transcript,
  disabled,
  onSend,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);
    setInput("");
    try {
      await onSend(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="surface-card flex h-full flex-col rounded-2xl border border-border">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles size={16} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Edit with Claude</p>
          <p className="text-xs text-muted-foreground">
            Describe what you want. Claude updates the composition.
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto p-4"
        style={{ minHeight: 300 }}
      >
        {messages.length === 0 && !sending && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Try one of these
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSend(s)}
                  className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-left text-sm text-foreground transition hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "max-w-[85%] bg-primary text-primary-foreground"
                  : "max-w-full bg-muted text-foreground"
              }`}
            >
              {m.role === "user" ? (
                <p className="whitespace-pre-wrap">{m.content}</p>
              ) : (
                <div className="chat-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </div>
              )}
              {m.composition && (
                <p className="mt-2 text-xs opacity-70">
                  ✓ Composition updated ({m.composition.operations.length} op
                  {m.composition.operations.length === 1 ? "" : "s"})
                </p>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            disabled
              ? "Upload a video first..."
              : transcript
                ? "e.g. Add captions, zoom in at 0:05, trim the end..."
                : "Transcribing... you can still type"
          }
          disabled={disabled || sending}
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || sending || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:brightness-110 disabled:opacity-40"
        >
          {sending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
    </div>
  );
}
