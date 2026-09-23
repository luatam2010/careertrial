// PocketIC backend lane for the Career Trial canister.
//
// This file drives the app's real compiled wasm through its public Candid API.
// It is the only place in the build that proves the backend is not a set of
// trapping stubs: the frontend suite mocks the actor and would pass unchanged
// against a canister whose every method is `Debug.todo()`.
//
// Shapes come from the generated agent-js declarations, not the TypeScript
// wrapper: `?T` is `[] | [T]`, `Nat` is `bigint`, and a unit reply decodes to
// `null`.

import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from. Installing the current wasm onto an empty
// canister there traps IC0503 before any test runs.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BACKEND_WASM }));
    return;
  }
  // `[baseline, current]`, the same install contract the hosted deploy uses for
  // a converted project. The upgrade replays the chain from the legacy schema.
  const installed = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BASELINE_WASM });
  await pic.upgradeCanister({ canisterId: installed.canisterId, wasm: BACKEND_WASM, arg: new Uint8Array() });
  ({ actor, canisterId } = installed);
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

it("serves the trial definition and an empty progress record on first visit", async () => {
  const trial = await actor.getTrial();
  expect(trial.title.length).toBeGreaterThan(0);
  expect(trial.tasks.length).toBeGreaterThan(0);
  expect(trial.questions.length).toBeGreaterThan(0);
  // Every task carries at least one step, which is what the note-list renders.
  for (const task of trial.tasks) {
    expect(task.steps.length).toBeGreaterThan(0);
  }
  expect(trial.progress.completedSteps).toEqual([]);
  expect(trial.progress.answers).toEqual([]);
  expect(trial.progress.reflections).toEqual([]);
  expect(trial.progress.messages).toEqual([]);
  expect(trial.progress.assessment).toEqual([]);

  const progress = await actor.getProgress();
  expect(progress.completedSteps).toEqual([]);
});

it("round-trips a ticked step through the real canister", async () => {
  const trial = await actor.getTrial();
  const firstStep = trial.tasks[0].steps[0].id;

  const afterTick = await actor.setStepCompleted(firstStep, true);
  expect(afterTick.completedSteps).toContain(firstStep);

  const readBack = await actor.getProgress();
  expect(readBack.completedSteps).toContain(firstStep);

  // Unticking removes it again.
  const afterUntick = await actor.setStepCompleted(firstStep, false);
  expect(afterUntick.completedSteps).not.toContain(firstStep);
});

it("records a quick-check answer and a reflection", async () => {
  const trial = await actor.getTrial();
  const questionId = trial.questions[0].id;

  const afterAnswer = await actor.setAnswer(questionId, 1n);
  expect(afterAnswer.answers).toContainEqual([questionId, 1n]);

  const afterReflection = await actor.setReflection(questionId, "Ghi chú thử nghiệm");
  expect(afterReflection.reflections).toContainEqual([questionId, "Ghi chú thử nghiệm"]);

  const readBack = await actor.getProgress();
  expect(readBack.answers).toContainEqual([questionId, 1n]);
  expect(readBack.reflections).toContainEqual([questionId, "Ghi chú thử nghiệm"]);
});

it("returns a mentor reply and keeps the thread", async () => {
  const reply = await actor.sendMentorMessage("Tôi nên chọn kênh truyền thông nào?");
  expect(reply.text.length).toBeGreaterThan(0);
  expect(reply.role).toEqual({ mentor: null });

  const messages = await actor.getMentorMessages();
  // The user turn and the mentor reply are both persisted.
  expect(messages.length).toBeGreaterThanOrEqual(2);
  expect(messages.some((message) => message.role && "user" in message.role)).toBe(true);
  expect(messages.some((message) => message.role && "mentor" in message.role)).toBe(true);
});

it("withholds the assessment until the trial is complete, then returns it", async () => {
  // A fresh caller has no assessment.
  const before = await actor.getAssessment();
  expect(before).toEqual([]);

  const trial = await actor.getTrial();
  for (const task of trial.tasks) {
    for (const step of task.steps) {
      await actor.setStepCompleted(step.id, true);
    }
  }
  for (const question of trial.questions) {
    await actor.setAnswer(question.id, 0n);
  }

  const after = await actor.getAssessment();
  expect(after.length).toBe(1);
  const assessment = after[0];
  expect(assessment.strengths.length).toBeGreaterThan(0);
  expect(assessment.improvements.length).toBeGreaterThan(0);
  expect(assessment.suggestions.length).toBeGreaterThan(0);
  // FitLevel is a Candid variant, decoded as a single-key object.
  const fitKeys = Object.keys(assessment.fitLevel);
  expect(fitKeys).toHaveLength(1);
  expect(["strong", "moderate", "developing"]).toContain(fitKeys[0]);
});

it("keeps one caller's progress out of another caller's view", async () => {
  const { createIdentity } = await import("@dfinity/pic");
  const alice = createIdentity("alice");
  const bob = createIdentity("bob");

  actor.setIdentity(alice);
  const trial = await actor.getTrial();
  await actor.setStepCompleted(trial.tasks[0].steps[0].id, true);
  expect((await actor.getProgress()).completedSteps.length).toBeGreaterThan(0);

  actor.setIdentity(bob);
  expect((await actor.getProgress()).completedSteps).toEqual([]);
});
