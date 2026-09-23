import { useMentorMessages, useSendMentorMessage } from "@/hooks/useQueries";
import { ChatRole } from "@/types";
import type { ChatMessage } from "@/types";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Cross-component signal used by the assessment popup to open the mentor chat
 * without coupling the two components through props or shared context.
 */
const OPEN_MENTOR_EVENT = "career-trial:open-mentor";

export function openMentorChat() {
  window.dispatchEvent(new Event(OPEN_MENTOR_EVENT));
}

function formatTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isMentor = message.role === ChatRole.mentor;
  return (
    <li
      className={`flex ${isMentor ? "justify-start" : "justify-end"}`}
      data-ocid={`mentor.message.${isMentor ? "mentor" : "user"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-card ${
          isMentor
            ? "rounded-tl-sm border border-border bg-card text-foreground"
            : "rounded-tr-sm bg-gradient-primary text-primary-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <p
          className={`mt-1 text-[0.65rem] ${
            isMentor ? "text-muted-foreground" : "text-primary-foreground/70"
          }`}
        >
          {isMentor ? "Cố vấn" : "Bạn"}
          {formatTime(message.createdAt)
            ? ` · ${formatTime(message.createdAt)}`
            : ""}
        </p>
      </div>
    </li>
  );
}

function ChatBody() {
  const { data: messages, isLoading } = useMentorMessages();
  const sendMessage = useSendMentorMessage();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const thread = messages ?? [];
  const isSending = sendMessage.isPending;

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-scroll when the thread grows or a reply is pending
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [thread.length, isSending]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sendMessage.isPending) return;
    setDraft("");
    sendMessage.mutate(text, {
      onError: () => setDraft((current) => (current === "" ? text : current)),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        data-ocid="mentor.message_list"
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {isLoading ? (
          <div data-ocid="mentor.loading_state" className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => `mentor-skeleton-${i}`).map(
              (id) => (
                <div
                  key={id}
                  className="h-12 w-3/4 animate-pulse rounded-2xl bg-muted"
                />
              ),
            )}
          </div>
        ) : thread.length === 0 ? (
          <div
            data-ocid="mentor.empty_state"
            className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center"
          >
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
            >
              <Sparkles className="size-5" />
            </span>
            <p className="font-display text-sm font-semibold text-foreground">
              Hỏi cố vấn bất cứ điều gì
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Cố vấn sẽ trả lời dựa trên kết quả Career Trial của bạn.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {thread.map((message) => (
              <MessageBubble key={message.id.toString()} message={message} />
            ))}
          </ul>
        )}

        {sendMessage.isPending ? (
          <div
            data-ocid="mentor.typing_state"
            className="flex justify-start"
            aria-live="polite"
          >
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-card px-3.5 py-3 shadow-card">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
              <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
              <span className="sr-only">Cố vấn đang trả lời</span>
            </div>
          </div>
        ) : null}
      </div>

      {sendMessage.isError ? (
        <p
          data-ocid="mentor.error_state"
          className="px-4 pb-1 text-xs text-destructive"
        >
          Không gửi được tin nhắn. Vui lòng thử lại.
        </p>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-border bg-card px-3 py-3"
      >
        <label htmlFor="mentor-composer" className="sr-only">
          Tin nhắn gửi cố vấn
        </label>
        <textarea
          id="mentor-composer"
          data-ocid="mentor.input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          rows={1}
          placeholder="Nhập câu hỏi của bạn…"
          className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        <button
          type="submit"
          data-ocid="mentor.send_button"
          disabled={draft.trim() === "" || sendMessage.isPending}
          aria-label="Gửi tin nhắn"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-card transition-smooth hover:scale-105 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        >
          <Send className="size-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

/**
 * App-level mount point for the fixed mentor chat widget.
 * Docked in the page corner on every screen; its open state and thread survive
 * route changes because the widget lives in the shared layout.
 */
export function MentorChatWidget() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener(OPEN_MENTOR_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_MENTOR_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open ? (
        <section
          data-ocid="mentor.panel"
          aria-label="Cố vấn nghề nghiệp"
          className="pointer-events-auto flex h-[min(30rem,calc(100dvh-7rem))] w-[min(22rem,calc(100vw-2.5rem))] animate-scale-in flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-modal"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border bg-gradient-mint px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground"
              >
                <MessageCircle className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate font-display text-sm font-bold text-foreground">
                  Cố vấn nghề nghiệp
                </span>
                <span className="truncate text-[0.7rem] text-muted-foreground">
                  Tư vấn dựa trên kết quả của bạn
                </span>
              </span>
            </div>
            <button
              type="button"
              data-ocid="mentor.close_button"
              onClick={() => setOpen(false)}
              aria-label="Đóng cửa sổ cố vấn"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div data-ocid="mentor.body" className="flex min-h-0 flex-1 flex-col">
            <ChatBody />
          </div>
        </section>
      ) : null}

      <button
        type="button"
        data-ocid="mentor.open_button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Đóng cửa sổ cố vấn" : "Mở cửa sổ cố vấn"}
        aria-expanded={open}
        className="pointer-events-auto inline-flex size-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-elevated transition-smooth hover:scale-105 hover:shadow-modal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {open ? (
          <X className="size-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="size-6" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
