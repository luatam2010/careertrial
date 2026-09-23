import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isStepCompleted } from "@/types";
import type { Task } from "@/types";
import { Check } from "lucide-react";

interface TaskStepsDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completedSteps: bigint[];
  onToggleStep: (stepId: bigint, completed: boolean) => void;
  isSaving: boolean;
}

export function TaskStepsDialog({
  task,
  open,
  onOpenChange,
  completedSteps,
  onToggleStep,
  isSaving,
}: TaskStepsDialogProps) {
  const steps = task
    ? [...task.steps].sort((a, b) => Number(a.order - b.order))
    : [];
  const doneCount = steps.filter((step) =>
    isStepCompleted(step.id, completedSteps),
  ).length;
  const allDone = steps.length > 0 && doneCount === steps.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="task.dialog"
        className="gap-0 overflow-hidden rounded-2xl border-border bg-card p-0 shadow-modal sm:max-w-lg"
      >
        <DialogHeader className="gap-2 border-b border-border bg-gradient-mint px-6 py-5 text-left">
          <p className="eyebrow">Các bước thực hiện</p>
          <DialogTitle className="font-display text-lg font-bold leading-snug text-foreground">
            {task?.title ?? "Nhiệm vụ"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Tích vào từng bước khi bạn đã hoàn thành. Nhiệm vụ chỉ được tính là
            xong khi tất cả các bước đều đã được tích.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Tiến độ nhiệm vụ
            </span>
            <span
              data-ocid="task.dialog.counter"
              className="font-mono text-sm font-semibold text-primary"
            >
              {doneCount}/{steps.length}
            </span>
          </div>

          <ul data-ocid="task.dialog.step_list" className="space-y-2">
            {steps.map((step, index) => {
              const checked = isStepCompleted(step.id, completedSteps);
              return (
                <li key={step.id.toString()}>
                  <div
                    data-ocid={`task.dialog.step.${index + 1}`}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-smooth ${
                      checked
                        ? "border-primary/30 bg-secondary/70"
                        : "border-border bg-card hover:border-primary/30 hover:bg-secondary/40"
                    }`}
                  >
                    <Checkbox
                      data-ocid={`task.dialog.checkbox.${index + 1}`}
                      checked={checked}
                      disabled={isSaving}
                      onCheckedChange={(value) =>
                        onToggleStep(step.id, value === true)
                      }
                      className="mt-0.5 size-5 rounded-md"
                    />
                    <span
                      className={`min-w-0 flex-1 text-sm leading-relaxed ${
                        checked
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                    {checked && (
                      <Check
                        className="mt-0.5 size-4 shrink-0 animate-check-pop text-primary"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {allDone && (
            <p
              data-ocid="task.dialog.success_state"
              className="mt-4 flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground"
            >
              <Check className="size-4 text-primary" aria-hidden="true" />
              Nhiệm vụ này đã hoàn thành. Làm tốt lắm!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
