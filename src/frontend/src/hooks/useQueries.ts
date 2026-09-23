import { createActor } from "@/backend";
import type {
  Assessment,
  ChatMessage,
  TrialProgress,
  TrialView,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const trialKeys = {
  trial: ["trial"] as const,
  progress: ["progress"] as const,
  messages: ["mentorMessages"] as const,
  assessment: ["assessment"] as const,
};

/** The trial definition plus the caller's progress. */
export function useTrial() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TrialView>({
    queryKey: trialKeys.trial,
    queryFn: async () => {
      if (!actor) throw new Error("Backend chưa sẵn sàng");
      return actor.getTrial();
    },
    enabled: !!actor && !isFetching,
  });
}

/** The caller's persisted progress. */
export function useProgress() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TrialProgress>({
    queryKey: trialKeys.progress,
    queryFn: async () => {
      if (!actor) throw new Error("Backend chưa sẵn sàng");
      return actor.getProgress();
    },
    enabled: !!actor && !isFetching,
  });
}

/** The caller's mentor chat history, oldest first. */
export function useMentorMessages() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ChatMessage[]>({
    queryKey: trialKeys.messages,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMentorMessages();
    },
    enabled: !!actor && !isFetching,
  });
}

/** The caller's suitability assessment, or null until the trial is complete. */
export function useAssessment() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Assessment | null>({
    queryKey: trialKeys.assessment,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAssessment();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Tick or untick a step in the caller's progress. */
export function useSetStepCompleted() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      stepId,
      completed,
    }: { stepId: bigint; completed: boolean }) => {
      if (!actor) throw new Error("Backend chưa sẵn sàng");
      return actor.setStepCompleted(stepId, completed);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trialKeys.trial });
      void queryClient.invalidateQueries({ queryKey: trialKeys.progress });
    },
  });
}

/** Record the caller's selected option for a quick-check question. */
export function useSetAnswer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      questionId,
      optionIndex,
    }: {
      questionId: bigint;
      optionIndex: bigint;
    }) => {
      if (!actor) throw new Error("Backend chưa sẵn sàng");
      return actor.setAnswer(questionId, optionIndex);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trialKeys.trial });
      void queryClient.invalidateQueries({ queryKey: trialKeys.progress });
    },
  });
}

/** Record the caller's free-text reflection for a quick-check question. */
export function useSetReflection() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      questionId,
      note,
    }: { questionId: bigint; note: string }) => {
      if (!actor) throw new Error("Backend chưa sẵn sàng");
      return actor.setReflection(questionId, note);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trialKeys.trial });
      void queryClient.invalidateQueries({ queryKey: trialKeys.progress });
    },
  });
}

/** Send a message to the mentor chat and receive the mentor's reply. */
export function useSendMentorMessage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("Backend chưa sẵn sàng");
      return actor.sendMentorMessage(text);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trialKeys.messages });
    },
  });
}
