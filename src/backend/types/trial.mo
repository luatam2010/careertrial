import Common "common";

module {
  public type TaskId = Common.TaskId;
  public type StepId = Common.StepId;
  public type QuestionId = Common.QuestionId;
  public type MessageId = Common.MessageId;
  public type Timestamp = Common.Timestamp;

  /// A single actionable step inside a task's note-list.
  public type Step = {
    id : StepId;
    title : Text;
    /// Position of the step inside its task's ordered note-list.
    order : Nat;
  };

  /// A task shown in the "Nhiệm vụ cần làm" list.
  public type Task = {
    id : TaskId;
    title : Text;
    /// Position of the task inside the trial's ordered task list.
    order : Nat;
    steps : [Step];
  };

  /// A quick-check multiple-choice question replacing the old test questions.
  public type Question = {
    id : QuestionId;
    prompt : Text;
    options : [Text];
    /// Position of the question inside the ordered quick-check list.
    order : Nat;
  };

  /// A mentor chat turn. `#user` turns come from the caller, `#mentor` turns
  /// are the advisory replies.
  public type ChatRole = {
    #user;
    #mentor;
  };

  public type ChatMessage = {
    id : MessageId;
    role : ChatRole;
    text : Text;
    createdAt : Timestamp;
  };

  /// How well the caller fits the trial's career, derived from their results.
  public type FitLevel = {
    #strong;
    #moderate;
    #developing;
  };

  /// The suitability assessment produced once the trial is complete.
  public type Assessment = {
    fitLevel : FitLevel;
    /// Strengths the caller demonstrated during the trial.
    strengths : [Text];
    /// Areas the caller should improve to pursue this career.
    improvements : [Text];
    /// Concrete suggestions drawn from the caller's own trial results.
    suggestions : [Text];
    createdAt : Timestamp;
  };

  /// The caller's persisted progress through one Career Trial.
  public type TrialProgress = {
    /// Step ids the caller has ticked off.
    completedSteps : [StepId];
    /// Question id -> index of the selected option.
    answers : [(QuestionId, Nat)];
    /// Question id -> free-text reflection note.
    reflections : [(QuestionId, Text)];
    /// The caller's mentor chat history, oldest first.
    messages : [ChatMessage];
    /// Present once the caller has completed every task and quick-check.
    assessment : ?Assessment;
  };

  /// The read-only view of the trial definition plus the caller's progress.
  public type TrialView = {
    title : Text;
    tasks : [Task];
    questions : [Question];
    progress : TrialProgress;
  };
};
