import { AssessmentPanel } from "@/components/AssessmentPanel";
import { QuickCheckPanel } from "@/components/QuickCheckPanel";
import { TaskList } from "@/components/TaskList";
import { TaskStepsDialog } from "@/components/TaskStepsDialog";
import { TrialBriefCard } from "@/components/TrialBriefCard";
import { useSetStepCompleted, useTrial } from "@/hooks/useQueries";
import { isStepCompleted, summarizeProgress } from "@/types";
import type { Task } from "@/types";
import { AlertCircle, CheckCircle2, ListChecks } from "lucide-react";
import { useState } from "react";

function TrialSkeleton() {
  const ids = Array.from({ length: 4 }, (_, i) => `trial-skeleton-${i}`);
  return (
    <div
      data-ocid="trial.loading_state"
      className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14"
    >
      <div className="space-y-6">
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-card/70" />
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-card/70" />
      </div>
      <span className="sr-only">Đang tải nội dung Career Trial…</span>
      <ul className="hidden">
        {ids.map((id) => (
          <li key={id} />
        ))}
      </ul>
    </div>
  );
}

export function CareerTrialPage() {
  const { data: trial, isLoading, isError, refetch } = useTrial();
  const setStepCompleted = useSetStepCompleted();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return <TrialSkeleton />;
  }

  if (isError || !trial) {
    return (
      <div
        data-ocid="trial.error_state"
        className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6"
      >
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <AlertCircle
            className="mx-auto size-8 text-destructive"
            aria-hidden="true"
          />
          <h1 className="mt-4 font-display text-xl font-bold text-foreground">
            Không tải được Career Trial
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Đã có lỗi khi kết nối với hệ thống. Vui lòng thử lại.
          </p>
          <button
            type="button"
            data-ocid="trial.retry_button"
            onClick={() => void refetch()}
            className="mt-5 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition-smooth hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const tasks = trial.tasks;
  const completedSteps = trial.progress.completedSteps;
  const summary = summarizeProgress(tasks, completedSteps);
  const completedTasks = tasks.filter(
    (task) =>
      task.steps.length > 0 &&
      task.steps.every((step) => isStepCompleted(step.id, completedSteps)),
  ).length;

  const handleOpenTask = (task: Task) => {
    setActiveTask(task);
    setDialogOpen(true);
  };

  const handleToggleStep = (stepId: bigint, completed: boolean) => {
    setStepCompleted.mutate({ stepId, completed });
  };

  return (
    <div
      data-ocid="trial.page"
      className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14"
    >
      <div className="space-y-6">
        <TrialBriefCard title={trial.title} />

        <section
          data-ocid="trial.tasks_card"
          className="animate-fade-in-up rounded-2xl border border-border bg-card p-6 shadow-card md:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow">Nhiệm vụ cần làm</p>
              <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
                Nhiệm vụ của bạn
              </h2>
            </div>
            <span
              data-ocid="trial.progress_counter"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground"
            >
              <ListChecks className="size-4 text-primary" aria-hidden="true" />
              {completedTasks}/{tasks.length} nhiệm vụ
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-muted-foreground">
                Tiến độ tổng thể
              </span>
              <span
                data-ocid="trial.progress_percent"
                className="font-mono font-semibold text-primary"
              >
                {summary.percent}%
              </span>
            </div>
            <div
              role="progressbar"
              tabIndex={0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={summary.percent}
              aria-label="Tiến độ hoàn thành Career Trial"
              className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-gradient-primary transition-[width] duration-500 ease-out"
                style={{ width: `${summary.percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {summary.completed}/{summary.total} bước đã hoàn thành
            </p>
          </div>

          <div className="mt-6">
            {tasks.length === 0 ? (
              <div
                data-ocid="trial.empty_state"
                className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center"
              >
                <CheckCircle2
                  className="mx-auto size-7 text-primary"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-medium text-foreground">
                  Chưa có nhiệm vụ nào
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Danh sách nhiệm vụ sẽ xuất hiện khi Career Trial được cập
                  nhật.
                </p>
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                completedSteps={completedSteps}
                onOpenTask={handleOpenTask}
              />
            )}
          </div>
        </section>

        <QuickCheckPanel
          questions={trial.questions}
          progress={trial.progress}
        />

        <AssessmentPanel />
      </div>

      <TaskStepsDialog
        task={activeTask}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        completedSteps={completedSteps}
        onToggleStep={handleToggleStep}
        isSaving={setStepCompleted.isPending}
      />
    </div>
  );
}
