import { useSetAnswer, useSetReflection } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { findAnswer, findReflection } from "@/types";
import type { Question, TrialProgress } from "@/types";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const REFLECTION_PLACEHOLDER =
  "Bạn học được điều gì? Phần nào thấy dễ, phần nào thấy khó, và điều gì khiến bạn bất ngờ?";

interface QuickCheckPanelProps {
  questions: Question[];
  progress: TrialProgress | undefined;
  /** True while the trial definition is still loading. */
  isLoading?: boolean;
}

/**
 * "Kiểm tra nhanh" — one multiple-choice question at a time with a
 * self-reflection note. Answers and notes persist through the shared
 * backend hooks and survive a page reload.
 */
export function QuickCheckPanel({
  questions,
  progress,
  isLoading = false,
}: QuickCheckPanelProps) {
  const ordered = useMemo(
    () => [...questions].sort((a, b) => Number(a.order - b.order)),
    [questions],
  );

  const [index, setIndex] = useState(0);
  const [note, setNote] = useState("");

  const current = ordered[index];
  const questionId = current?.id;
  const savedNote = useMemo(
    () =>
      questionId === undefined
        ? ""
        : findReflection(progress?.reflections ?? [], questionId),
    [progress, questionId],
  );

  // Load the saved note whenever the visible question changes.
  useEffect(() => {
    setNote(savedNote);
  }, [savedNote]);

  const setAnswer = useSetAnswer();
  const setReflection = useSetReflection();

  const selected = useMemo(
    () =>
      questionId === undefined
        ? undefined
        : findAnswer(progress?.answers ?? [], questionId),
    [progress, questionId],
  );

  const total = ordered.length;
  const isFirst = index === 0;
  const isLast = index >= total - 1;

  const handleSelect = (optionIndex: number) => {
    if (questionId === undefined) return;
    setAnswer.mutate({ questionId, optionIndex: BigInt(optionIndex) });
  };

  const handleSaveNote = () => {
    if (questionId === undefined) return;
    if (note === savedNote) return;
    setReflection.mutate({ questionId, note });
  };

  const goTo = (next: number) => {
    if (next < 0 || next >= total) return;
    // Persist the note before leaving the question.
    handleSaveNote();
    setIndex(next);
  };

  if (isLoading) {
    return (
      <section
        data-ocid="quick_check.panel"
        aria-busy="true"
        className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8"
      >
        <div className="h-4 w-28 animate-pulse rounded-full bg-muted" />
        <div className="mt-4 h-6 w-3/4 animate-pulse rounded-lg bg-muted" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }, (_, i) => `qc-skeleton-${i}`).map((id) => (
            <div
              key={id}
              className="h-12 w-full animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
        <div className="mt-6 h-28 w-full animate-pulse rounded-xl bg-muted" />
      </section>
    );
  }

  if (!current) {
    return (
      <section
        data-ocid="quick_check.panel"
        className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8"
      >
        <p className="eyebrow">Kiểm tra nhanh</p>
        <h2 className="mt-2 font-display text-xl font-bold text-foreground">
          Chưa có câu hỏi kiểm tra
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Các câu hỏi kiểm tra nhanh sẽ xuất hiện ở đây khi Career Trial của bạn
          bắt đầu.
        </p>
      </section>
    );
  }

  return (
    <section
      data-ocid="quick_check.panel"
      aria-labelledby="quick-check-heading"
      className="animate-fade-in-up rounded-2xl border border-border bg-card p-6 shadow-card md:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Kiểm tra nhanh</p>
        <span
          data-ocid="quick_check.counter"
          className="rounded-full bg-secondary px-3 py-1 font-mono text-xs font-medium text-secondary-foreground"
        >
          Câu {index + 1}/{total}
        </span>
      </div>

      <h2
        id="quick-check-heading"
        data-ocid="quick_check.prompt"
        className="mt-3 font-display text-lg font-bold leading-snug text-foreground md:text-xl"
      >
        {current.prompt}
      </h2>

      <fieldset className="mt-5">
        <legend className="sr-only">Chọn một đáp án</legend>
        <div className="space-y-3">
          {current.options.map((option, optionIndex) => {
            const isSelected = selected === BigInt(optionIndex);
            return (
              <label
                key={`${current.id.toString()}-${optionIndex}`}
                data-ocid={`quick_check.option.${optionIndex + 1}`}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-smooth",
                  "focus-within:ring-2 focus-within:ring-ring/40",
                  isSelected
                    ? "border-primary bg-secondary shadow-card"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/60",
                )}
              >
                <input
                  type="radio"
                  name={`quick-check-${current.id.toString()}`}
                  value={optionIndex}
                  checked={isSelected}
                  onChange={() => handleSelect(optionIndex)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-smooth",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-card",
                  )}
                >
                  {isSelected ? <Check className="size-3" /> : null}
                </span>
                <span
                  className={cn(
                    "text-sm leading-snug md:text-base",
                    isSelected
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <label
          htmlFor="quick-check-reflection"
          className="block font-display text-sm font-bold text-foreground"
        >
          Ghi chú tự suy ngẫm của bạn
        </label>
        <textarea
          id="quick-check-reflection"
          data-ocid="quick_check.textarea"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onBlur={handleSaveNote}
          rows={4}
          placeholder={REFLECTION_PLACEHOLDER}
          className="mt-2 w-full resize-y rounded-xl border border-input bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 transition-smooth focus-visible:border-primary focus-visible:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          {setReflection.isPending ? (
            <>
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              Đang lưu ghi chú…
            </>
          ) : (
            "Ghi chú được lưu tự động khi bạn rời khỏi ô này."
          )}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
        <button
          type="button"
          data-ocid="quick_check.pagination_prev"
          onClick={() => goTo(index - 1)}
          disabled={isFirst}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Câu trước
        </button>
        <button
          type="button"
          data-ocid="quick_check.pagination_next"
          onClick={() => goTo(index + 1)}
          disabled={isLast}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-card transition-smooth hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Câu tiếp theo
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
