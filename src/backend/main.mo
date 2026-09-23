import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import OQL "mo:caffeineai-oql";
import Entity "mo:caffeineai-oql/Entity";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import NatValue "mo:caffeineai-oql/NatValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import TrialTypes "types/trial";
import TrialApi "mixins/trial-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  // Per-caller trial progress, keyed by caller principal.
  let progress : Map.Map<Principal, TrialTypes.TrialProgress>;

  include TrialApi(progress);

  include ApiDocMixin();

  include Expose({
    entities = [
      OQL.Entity.manual<(Principal, TrialTypes.TrialProgress)>(
        "progress",
        func () = progress.entries(),
        "TrialProgress",
        "owner",
      )
        .sample((Principal.fromText("aaaaa-aa"), {
          completedSteps = [];
          answers = [];
          reflections = [];
          messages = [];
          assessment = null;
        }))
        .payload("owner", func ((owner, _)) = owner)
        .payload("completedSteps", func ((_, p)) = p.completedSteps.size())
        .payload("answers", func ((_, p)) = p.answers.size())
        .payload("reflections", func ((_, p)) = p.reflections.size())
        .payload("messages", func ((_, p)) = p.messages.size())
        .payload("hasAssessment", func ((_, p)) = p.assessment != null)
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
    ];
  });
};
