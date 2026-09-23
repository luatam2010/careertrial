import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Assessment {
    suggestions: Array<string>;
    strengths: Array<string>;
    fitLevel: FitLevel;
    improvements: Array<string>;
    createdAt: Timestamp;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface ChatMessage {
    id: MessageId;
    createdAt: Timestamp;
    role: ChatRole;
    text: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type MessageId = bigint;
export interface Question {
    id: QuestionId;
    order: bigint;
    prompt: string;
    options: Array<string>;
}
export type QuestionId = bigint;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Step {
    id: StepId;
    title: string;
    order: bigint;
}
export type StepId = bigint;
export interface Task {
    id: TaskId;
    title: string;
    order: bigint;
    steps: Array<Step>;
}
export type TaskId = bigint;
export type Timestamp = bigint;
export interface TrialProgress {
    assessment?: Assessment;
    messages: Array<ChatMessage>;
    answers: Array<[QuestionId, bigint]>;
    reflections: Array<[QuestionId, string]>;
    completedSteps: Array<StepId>;
}
export interface TrialView {
    tasks: Array<Task>;
    title: string;
    progress: TrialProgress;
    questions: Array<Question>;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum ChatRole {
    mentor = "mentor",
    user = "user"
}
export enum FitLevel {
    strong = "strong",
    developing = "developing",
    moderate = "moderate"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Static Markdown documentation of the backend's public API.
     */
    getApiDoc(): Promise<string>;
    /**
     * / The caller's suitability assessment, or null until the trial is complete.
     */
    getAssessment(): Promise<Assessment | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / The caller's mentor chat history, oldest first. Read-only.
     */
    getMentorMessages(): Promise<Array<ChatMessage>>;
    /**
     * / The caller's persisted progress. Read-only.
     */
    getProgress(): Promise<TrialProgress>;
    /**
     * / The trial definition plus the caller's progress. Read-only.
     */
    getTrial(): Promise<TrialView>;
    isCallerAdmin(): Promise<boolean>;
    schema(): Promise<string>;
    /**
     * / Send a message to the mentor chat and receive the mentor's reply.
     */
    sendMentorMessage(text: string): Promise<ChatMessage>;
    /**
     * / Record the caller's selected option for a quick-check question.
     */
    setAnswer(questionId: QuestionId, optionIndex: bigint): Promise<TrialProgress>;
    /**
     * / Record the caller's free-text reflection for a quick-check question.
     */
    setReflection(questionId: QuestionId, note: string): Promise<TrialProgress>;
    /**
     * / Tick or untick a step in the caller's progress.
     */
    setStepCompleted(stepId: StepId, completed: boolean): Promise<TrialProgress>;
}
