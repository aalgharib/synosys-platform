"use client";

import { ChevronDown, ChevronUp, Loader2, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
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

/**
 * Popular editing prompts — clicking fills the input (doesn't auto-send)
 * so the user can tweak before committing.
 */
const PROMPT_LIBRARY: Array<{ category: string; prompts: string[] }> = [
  {
    category: "Captions",
    prompts: [
      "Add word-by-word animated captions synced to the transcript",
      "Add captions and highlight every emotional word in amber",
      "Add bold captions but only for the first 15 seconds",
    ],
  },
  {
    category: "Trim & Cut",
    prompts: [
      "Trim the first 2 seconds and last 1 second",
      "Cut all silent pauses and dead air between sentences",
      "Keep only the strongest 30 seconds of this clip",
    ],
  },
  {
    category: "Title Cards",
    prompts: [
      "Add a bold title card with a 5-word hook at the start",
      "Add an end card asking viewers to follow for more",
    ],
  },
  {
    category: "Zoom & Pace",
    prompts: [
      "Add a subtle 1.08x zoom punch on every punch line",
      "Add ken-burns style slow zoom throughout",
    ],
  },
  {
    category: "Tone",
    prompts: [
      "Edit this like a viral Instagram reel for service business owners",
      "Edit this like a tight LinkedIn thought-leadership post",
      "Edit this like a MrBeast-style YouTube intro",
    ],
  },
];

const ALL_PROMPTS = PROMPT_LIBRARY.flatMap((g) => g.prompts);

export default function ChatPanel({
  messages,
  transcript,
  disabled,
  onSend,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showAllPrompts, setShowAllPrompts] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const insertPrompt = (text: string) => {
    setInput(text);
    // Focus + move cursor to end so the user can edit immediately
    queueMicrotask(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(text.length, text.length);
      }
    });
  };

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
    <div
      className="surface-card flex flex-col rounded-2xl border border-border"
      style={{
        // Cap chat to a fraction of viewport so the messages area scrolls
        // internally instead of pushing the whole page down.
        height: "min(75vh, 800px)",
      }}
    >
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
        className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4"
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 && !sending && (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Click a prompt to insert it — edit before sending
            </p>
            <div className="flex flex-col gap-3">
              {PROMPT_LIBRARY.map((group) => (
                <div key={group.category}>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-primary/80">
                    {group.category}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {group.prompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={disabled}
                        onClick={() => insertPrompt(prompt)}
                        className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-left text-sm text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
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

      {/* Always-visible mini prompt library above the input (after first message) */}
      {messages.length > 0 && (
        <div className="border-t border-border bg-muted/20 px-3 py-2">
          <button
            type="button"
            onClick={() => setShowAllPrompts((v) => !v)}
            className="flex w-full items-center justify-between text-[11px] font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            <span>{showAllPrompts ? "Hide prompt library" : "Quick prompts"}</span>
            {showAllPrompts ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showAllPrompts && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ALL_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={disabled || sending}
                  onClick={() => insertPrompt(prompt)}
                  title={prompt}
                  className="max-w-full truncate rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                >
                  {prompt.length > 40 ? prompt.slice(0, 40) + "…" : prompt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          ref={inputRef}
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

const COLLAPSE_THRESHOLD = 400; // chars — collapse anything longer by default

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isLong = message.content.length > COLLAPSE_THRESHOLD;
  // Collapse long messages by default (especially user briefs), expand short ones
  const [expanded, setExpanded] = useState<boolean>(!isLong);

  const bodyText = expanded
    ? message.content
    : message.content.slice(0, COLLAPSE_THRESHOLD).trimEnd() + "…";

  const bubbleTone = isUser
    ? "max-w-[85%] bg-primary text-primary-foreground"
    : "max-w-full bg-muted text-foreground";

  const collapseButtonTone = isUser
    ? "bg-white/15 text-white hover:bg-white/25"
    : "bg-foreground/10 text-foreground hover:bg-foreground/20";

  let body: ReactNode;
  if (isUser) {
    body = <p className="whitespace-pre-wrap">{bodyText}</p>;
  } else if (expanded) {
    body = (
      <div className="chat-markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
      </div>
    );
  } else {
    // Assistant — collapsed preview as plain text
    body = <p className="whitespace-pre-wrap">{bodyText}</p>;
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`rounded-2xl px-4 py-3 text-sm ${bubbleTone}`}>
        {body}
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={`mt-2 flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${collapseButtonTone}`}
          >
            {expanded ? (
              <>
                <ChevronUp size={12} /> Collapse
              </>
            ) : (
              <>
                <ChevronDown size={12} /> Show full{" "}
                {isUser ? "prompt" : "response"} ({message.content.length} chars)
              </>
            )}
          </button>
        )}
        {message.composition && (
          <p className="mt-2 text-xs opacity-70">
            ✓ Composition updated ({message.composition.operations.length} op
            {message.composition.operations.length === 1 ? "" : "s"})
          </p>
        )}
      </div>
    </div>
  );
}
