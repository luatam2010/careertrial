module {
  /// A stable identifier for a task within a Career Trial.
  public type TaskId = Nat;

  /// A stable identifier for a step within a task.
  public type StepId = Nat;

  /// A stable identifier for a quick-check question.
  public type QuestionId = Nat;

  /// A stable identifier for a mentor chat message.
  public type MessageId = Nat;

  /// Nanoseconds since the epoch, as returned by `Time.now()`.
  public type Timestamp = Int;
};
