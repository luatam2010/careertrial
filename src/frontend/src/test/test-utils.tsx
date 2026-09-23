import type {
  Assessment,
  ChatMessage,
  Question,
  Step,
  Task,
  TrialProgress,
  TrialView,
} from "@/types";
import { ChatRole, FitLevel } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/**
 * A typed in-memory stand-in for the generated `Backend` actor. It implements
 * only the methods the frontend actually calls, with the same signatures, so a
 * component that calls a method the real backend does not expose fails to
 * compile here.
 */
export interface MockBackend {
  getTrial: () => Promise<TrialView>;
  getProgress: () => Promise<TrialProgress>;
  getMentorMessages: () => Promise<ChatMessage[]>;
  getAssessment: () => Promise<Assessment | null>;
  setStepCompleted: (
    stepId: bigint,
    completed: boolean,
  ) => Promise<TrialProgress>;
  setAnswer: (
    questionId: bigint,
    optionIndex: bigint,
  ) => Promise<TrialProgress>;
  setReflection: (questionId: bigint, note: string) => Promise<TrialProgress>;
  sendMentorMessage: (text: string) => Promise<ChatMessage>;
}

export function makeStep(id: number, title: string, order: number): Step {
  return { id: BigInt(id), title, order: BigInt(order) };
}

export function makeTask(
  id: number,
  title: string,
  order: number,
  steps: Step[],
): Task {
  return { id: BigInt(id), title, order: BigInt(order), steps };
}

export function makeQuestion(
  id: number,
  prompt: string,
  options: string[],
  order: number,
): Question {
  return { id: BigInt(id), prompt, options, order: BigInt(order) };
}

export function emptyProgress(): TrialProgress {
  return {
    completedSteps: [],
    answers: [],
    reflections: [],
    messages: [],
    assessment: undefined,
  };
}

export function makeTrial(overrides: Partial<TrialView> = {}): TrialView {
  return {
    title: "Chuyên viên Marketing",
    tasks: [
      makeTask(1, "Nhiệm vụ một", 1, [
        makeStep(1, "Bước 1.1", 1),
        makeStep(2, "Bước 1.2", 2),
      ]),
      makeTask(2, "Nhiệm vụ hai", 2, [makeStep(3, "Bước 2.1", 1)]),
    ],
    questions: [
      makeQuestion(1, "Câu hỏi một?", ["Đáp án A", "Đáp án B"], 1),
      makeQuestion(2, "Câu hỏi hai?", ["Đáp án C", "Đáp án D"], 2),
    ],
    progress: emptyProgress(),
    ...overrides,
  };
}

export function makeAssessment(
  overrides: Partial<Assessment> = {},
): Assessment {
  return {
    fitLevel: FitLevel.strong,
    strengths: ["Điểm mạnh một", "Điểm mạnh hai"],
    improvements: ["Cần cải thiện một"],
    suggestions: ["Gợi ý một"],
    createdAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

export function makeMessage(
  id: number,
  role: ChatRole,
  text: string,
): ChatMessage {
  return { id: BigInt(id), role, text, createdAt: 1_700_000_000_000_000_000n };
}

/**
 * A stateful mock actor: mutations update the stored progress and reads return
 * it, so a component that ticks a step and then re-reads sees the change the
 * way it would against the real canister.
 */
export function createMockBackend(initial: TrialView = makeTrial()): {
  backend: MockBackend;
  state: { trial: TrialView };
} {
  const state = { trial: initial };

  const backend: MockBackend = {
    getTrial: async () => state.trial,
    getProgress: async () => state.trial.progress,
    getMentorMessages: async () => state.trial.progress.messages,
    getAssessment: async () => state.trial.progress.assessment ?? null,
    setStepCompleted: async (stepId, completed) => {
      const current = state.trial.progress.completedSteps;
      const without = current.filter((id) => id !== stepId);
      const completedSteps = completed ? [...without, stepId] : without;
      state.trial = {
        ...state.trial,
        progress: { ...state.trial.progress, completedSteps },
      };
      return state.trial.progress;
    },
    setAnswer: async (questionId, optionIndex) => {
      const answers = state.trial.progress.answers.filter(
        ([id]) => id !== questionId,
      );
      state.trial = {
        ...state.trial,
        progress: {
          ...state.trial.progress,
          answers: [...answers, [questionId, optionIndex]],
        },
      };
      return state.trial.progress;
    },
    setReflection: async (questionId, note) => {
      const reflections = state.trial.progress.reflections.filter(
        ([id]) => id !== questionId,
      );
      state.trial = {
        ...state.trial,
        progress: {
          ...state.trial.progress,
          reflections: [...reflections, [questionId, note]],
        },
      };
      return state.trial.progress;
    },
    sendMentorMessage: async (text) => {
      const messages = state.trial.progress.messages;
      const userId = BigInt(messages.length + 1);
      const userMessage = makeMessage(Number(userId), ChatRole.user, text);
      const reply = makeMessage(
        Number(userId) + 1,
        ChatRole.mentor,
        "Đây là lời khuyên từ cố vấn.",
      );
      state.trial = {
        ...state.trial,
        progress: {
          ...state.trial.progress,
          messages: [...messages, userMessage, reply],
        },
      };
      return reply;
    },
  };

  return { backend, state };
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  queryClient: QueryClient = createTestQueryClient(),
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Object.assign(render(ui, { wrapper: Wrapper }), { queryClient });
}
