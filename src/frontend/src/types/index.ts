import type {
  Assessment,
  ChatMessage,
  Question,
  Step,
  Task,
  TrialProgress,
  TrialView,
} from "@/backend";

export type {
  Assessment,
  ChatMessage,
  Question,
  Step,
  Task,
  TrialProgress,
  TrialView,
};

export { FitLevel, ChatRole, UserRole } from "@/backend";

/** A single task row in the "Nhiệm vụ cần làm" list. */
export interface TaskRow {
  id: bigint;
  title: string;
  order: bigint;
  steps: Step[];
}

/** Derived progress summary for the trial header. */
export interface ProgressSummary {
  completed: number;
  total: number;
  percent: number;
}

export function summarizeProgress(
  tasks: Task[],
  completedSteps: bigint[],
): ProgressSummary {
  const done = new Set(completedSteps.map((id) => id.toString()));
  const allSteps = tasks.flatMap((task) => task.steps);
  const total = allSteps.length;
  const completed = allSteps.filter((step) =>
    done.has(step.id.toString()),
  ).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}

export function isStepCompleted(
  stepId: bigint,
  completedSteps: bigint[],
): boolean {
  const target = stepId.toString();
  return completedSteps.some((id) => id.toString() === target);
}

export function findAnswer(
  answers: Array<[bigint, bigint]>,
  questionId: bigint,
): bigint | undefined {
  const target = questionId.toString();
  const entry = answers.find(([id]) => id.toString() === target);
  return entry?.[1];
}

export function findReflection(
  reflections: Array<[bigint, string]>,
  questionId: bigint,
): string {
  const target = questionId.toString();
  const entry = reflections.find(([id]) => id.toString() === target);
  return entry?.[1] ?? "";
}
