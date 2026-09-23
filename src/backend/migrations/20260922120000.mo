import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type StepId = Nat;
  type QuestionId = Nat;
  type MessageId = Nat;
  type Timestamp = Int;

  type ChatRole = { #user; #mentor };

  type ChatMessage = {
    id : MessageId;
    role : ChatRole;
    text : Text;
    createdAt : Timestamp;
  };

  type FitLevel = { #strong; #moderate; #developing };

  type Assessment = {
    fitLevel : FitLevel;
    strengths : [Text];
    improvements : [Text];
    suggestions : [Text];
    createdAt : Timestamp;
  };

  type TrialProgress = {
    completedSteps : [StepId];
    answers : [(QuestionId, Nat)];
    reflections : [(QuestionId, Text)];
    messages : [ChatMessage];
    assessment : ?Assessment;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    progress : Map.Map<Principal, TrialProgress>;
  };

  public func migration(_old : {}) : NewActor {
    {
      accessControlState = AccessControl.initState();
      progress = Map.empty();
    };
  };
};
