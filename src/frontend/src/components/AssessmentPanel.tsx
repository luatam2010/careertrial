import { openMentorChat } from "@/components/MentorChatWidget";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAssessment, useProgress, useTrial } from "@/hooks/useQueries";
import { FitLevel, summarizeProgress } from "@/types";
import type { Assessment } from "@/types";
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const FIT_META: Record<
  FitLevel,
  { label: string; verdict: string; badge: string; ring: string }
> = {
  [FitLevel.strong]: {
    label: "Rất phù hợp",
    verdict: "Bạn thể hiện mức độ phù hợp cao với nghề này.",
    badge: "bg-primary text-primary-foreground",
    ring: "border-primary/30 bg-secondary/60",
  },
  [FitLevel.moderate]: {
    label: "Khá phù hợp",
    verdict: "Bạn có nền tảng tốt để theo nghề này nếu tiếp tục rèn luyện.",
    badge: "bg-accent text-accent-foreground",
    ring: "border-accent/30 bg-secondary/50",
  },
  [FitLevel.developing]: {
    label: "Cần phát triển thêm",
    verdict: "Nghề này còn khá mới với bạn — hãy thử thêm để rõ hơn.",
    badge: "bg-muted text-foreground",
    ring: "border-border bg-muted/60",
  },
};

function FitBadge({ level }: { level: FitLevel }) {
  const meta = FIT_META[level];
  return (
    <span
      data-ocid="assessment.fit_badge"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-xs font-bold uppercase tracking-wider ${meta.badge}`}
    >
      <Sparkles className="size-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function BulletList({
  title,
  items,
  icon,
  tone,
  ocid,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  tone: string;
  ocid: string;
}) {
  if (items.length === 0) return null;
  return (
    <div data-ocid={ocid} className="min-w-0">
      <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
        <span
          aria-hidden="true"
          className={`flex size-6 shrink-0 items-center justify-center rounded-lg ${tone}`}
        >
          {icon}
        </span>
        {title}
      </h3>
      <ul className="mt-2.5 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60"
            />
            <span className="min-w-0 break-words">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AssessmentContent({ assessment }: { assessment: Assessment }) {
  const meta = FIT_META[assessment.fitLevel];
  return (
    <div className="space-y-5">
      <div
        className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${meta.ring}`}
      >
        <div className="min-w-0">
          <FitBadge level={assessment.fitLevel} />
          <p className="mt-2.5 font-display text-base font-bold leading-snug text-foreground">
            {meta.verdict}
          </p>
        </div>
        <button
          type="button"
          data-ocid="assessment.open_mentor_button"
          onClick={openMentorChat}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition-smooth hover:scale-[1.02] hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Hỏi cố vấn
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <BulletList
          ocid="assessment.strengths"
          title="Điểm mạnh"
          items={assessment.strengths}
          icon={<TrendingUp className="size-3.5" />}
          tone="bg-secondary text-secondary-foreground"
        />
        <BulletList
          ocid="assessment.improvements"
          title="Cần cải thiện"
          items={assessment.improvements}
          icon={<Target className="size-3.5" />}
          tone="bg-muted text-foreground"
        />
      </div>

      <BulletList
        ocid="assessment.suggestions"
        title="Gợi ý"
        items={assessment.suggestions}
        icon={<Lightbulb className="size-3.5" />}
        tone="bg-accent/20 text-accent-foreground"
      />
    </div>
  );
}

function ProgressPrompt({
  completed,
  total,
  percent,
}: {
  completed: number;
  total: number;
  percent: number;
}) {
  const remaining = Math.max(total - completed, 0);
  return (
    <div data-ocid="assessment.progress_prompt" className="space-y-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
        >
          <Target className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-base font-bold text-foreground">
            Chưa đủ dữ liệu để nhận xét
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {total === 0
              ? "Hãy bắt đầu nhiệm vụ đầu tiên để hệ thống hiểu bạn hơn."
              : `Bạn còn ${remaining} bước nữa để hoàn thành toàn bộ Career Trial. Hoàn thành hết để nhận nhận xét mức độ phù hợp.`}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Tiến độ của bạn</span>
          <span data-ocid="assessment.progress_value" className="font-mono">
            {percent}%
          </span>
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          tabIndex={0}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tiến độ Career Trial"
        >
          <div
            className="h-full rounded-full bg-gradient-primary transition-smooth"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Suitability assessment card. Shows the full verdict once every task step is
 * done and every quick-check question is answered; before that it shows a
 * gentle progress prompt. Surfaces the verdict as a popup on full completion.
 */
export function AssessmentPanel() {
  const { data: trial, isLoading: trialLoading } = useTrial();
  const { data: progress, isLoading: progressLoading } = useProgress();
  const { data: assessment, isLoading: assessmentLoading } = useAssessment();
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupShown, setPopupShown] = useState(false);

  const summary = useMemo(
    () => summarizeProgress(trial?.tasks ?? [], progress?.completedSteps ?? []),
    [trial?.tasks, progress?.completedSteps],
  );

  const questions = trial?.questions ?? [];
  const answeredCount = questions.filter((question) =>
    (progress?.answers ?? []).some(
      ([id]) => id.toString() === question.id.toString(),
    ),
  ).length;
  const allAnswered =
    questions.length > 0 && answeredCount === questions.length;
  const allStepsDone = summary.total > 0 && summary.completed === summary.total;
  const isComplete = allStepsDone && allAnswered;

  useEffect(() => {
    if (isComplete && assessment && !popupShown) {
      setPopupOpen(true);
      setPopupShown(true);
    }
  }, [isComplete, assessment, popupShown]);

  const isLoading = trialLoading || progressLoading || assessmentLoading;

  return (
    <>
      <section
        data-ocid="assessment.card"
        className="animate-fade-in-up rounded-2xl border border-border bg-card p-6 shadow-card md:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">Nhận xét mức độ phù hợp</p>
            <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Bạn có phù hợp với nghề này?
            </h2>
          </div>
          {isComplete && assessment ? (
            <FitBadge level={assessment.fitLevel} />
          ) : null}
        </div>

        <div className="mt-5">
          {isLoading ? (
            <div data-ocid="assessment.loading_state" className="space-y-3">
              <div className="h-20 animate-pulse rounded-2xl bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-muted" />
            </div>
          ) : isComplete && assessment ? (
            <AssessmentContent assessment={assessment} />
          ) : (
            <ProgressPrompt
              completed={summary.completed}
              total={summary.total}
              percent={summary.percent}
            />
          )}
        </div>
      </section>

      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent
          data-ocid="assessment.modal"
          className="max-h-[85dvh] max-w-2xl overflow-y-auto rounded-2xl border-border bg-card p-6 shadow-modal md:p-8"
        >
          <DialogTitle className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-foreground">
            <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
            Bạn đã hoàn thành Career Trial
          </DialogTitle>
          {assessment ? (
            <div className="mt-5">
              <AssessmentContent assessment={assessment} />
            </div>
          ) : null}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              data-ocid="assessment.modal_close_button"
              onClick={() => setPopupOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-smooth hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              Đóng
            </button>
            <button
              type="button"
              data-ocid="assessment.modal_mentor_button"
              onClick={() => {
                setPopupOpen(false);
                openMentorChat();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition-smooth hover:scale-[1.02] hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Trò chuyện với cố vấn
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
