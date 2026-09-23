import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/trial";
import TrialLib "../lib/trial";

mixin (progress : Map.Map<Principal, Types.TrialProgress>) {
  /// The trial definition plus the caller's progress. Read-only.
  public query ({ caller }) func getTrial() : async Types.TrialView {
    { TrialLib.getTrial() with progress = TrialLib.getProgress(progress, caller) };
  };

  /// The caller's persisted progress. Read-only.
  public query ({ caller }) func getProgress() : async Types.TrialProgress {
    TrialLib.getProgress(progress, caller);
  };

  /// Tick or untick a step in the caller's progress.
  public shared ({ caller }) func setStepCompleted(stepId : Types.StepId, completed : Bool) : async Types.TrialProgress {
    TrialLib.setStepCompleted(progress, caller, stepId, completed);
  };

  /// Record the caller's selected option for a quick-check question.
  public shared ({ caller }) func setAnswer(questionId : Types.QuestionId, optionIndex : Nat) : async Types.TrialProgress {
    TrialLib.setAnswer(progress, caller, questionId, optionIndex);
  };

  /// Record the caller's free-text reflection for a quick-check question.
  public shared ({ caller }) func setReflection(questionId : Types.QuestionId, note : Text) : async Types.TrialProgress {
    TrialLib.setReflection(progress, caller, questionId, note);
  };

  /// Send a message to the mentor chat and receive the mentor's reply.
  public shared ({ caller }) func sendMentorMessage(text : Text) : async Types.ChatMessage {
    TrialLib.sendMentorMessage(progress, caller, text);
  };

  /// The caller's mentor chat history, oldest first. Read-only.
  public query ({ caller }) func getMentorMessages() : async [Types.ChatMessage] {
    TrialLib.getMentorMessages(progress, caller);
  };

  /// The caller's suitability assessment, or null until the trial is complete.
  public query ({ caller }) func getAssessment() : async ?Types.Assessment {
    TrialLib.getAssessment(progress, caller);
  };
};
