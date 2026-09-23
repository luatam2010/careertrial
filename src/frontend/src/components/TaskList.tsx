import { isStepCompleted } from "@/types";
import type { Task } from "@/types";
import { Check, ChevronRight } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  completedSteps: bigint[];
  onOpenTask: (task: Task) => void;
}

export function TaskList({ tasks, completedSteps, onOpenTask }: TaskListProps) {
  const ordered = [...tasks].sort((a, b) => Number(a.order - b.order));

  return (
    <ul data-ocid="task.list" className="space-y-2.5">
      {ordered.map((task, index) => {
        const steps = task.steps;
        const doneCount = steps.filter((step) =>
          isStepCompleted(step.id, completedSteps),
        ).length;
        const complete = steps.length > 0 && doneCount === steps.length;

        return (
          <li key={task.id.toString()}>
            <div
              data-ocid={`task.item.${index + 1}`}
              className={`group flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-smooth ${
                complete
                  ? "border-primary/30 bg-secondary/70"
                  : "border-border bg-card hover:border-primary/30 hover:bg-secondary/40"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                  complete
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card text-transparent"
                }`}
              >
                <Check
                  className={`size-3.5 ${complete ? "animate-check-pop" : ""}`}
                  strokeWidth={3}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-sm leading-snug ${
                    complete
                      ? "font-bold text-foreground"
                      : "font-normal text-foreground"
                  }`}
                >
                  {task.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {complete
                    ? "Đã hoàn thành"
                    : `${doneCount}/${steps.length} bước đã xong`}
                </span>
              </span>

              <button
                type="button"
                data-ocid={`task.open_button.${index + 1}`}
                onClick={() => onOpenTask(task)}
                aria-label={`Mở các bước của nhiệm vụ: ${task.title}`}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-smooth hover:border-primary/40 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
