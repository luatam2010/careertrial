import { CareerTrialPage } from "@/pages/CareerTrialPage";
import {
  createMockBackend,
  makeAssessment,
  makeTrial,
  renderWithProviders,
} from "@/test/test-utils";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockBackend = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@caffeineai/core-infrastructure", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@caffeineai/core-infrastructure")>();
  return {
    ...actual,
    useActor: () => ({ actor: mockBackend.current, isFetching: false }),
  };
});

function setBackend(backend: unknown) {
  mockBackend.current = backend;
}

describe("CareerTrialPage", () => {
  beforeEach(() => {
    setBackend(undefined);
  });

  it("renders the task list and overall progress", async () => {
    const { backend } = createMockBackend(makeTrial());
    setBackend(backend);

    renderWithProviders(<CareerTrialPage />);

    expect(await screen.findByText("Nhiệm vụ một")).toBeInTheDocument();
    expect(screen.getByText("Nhiệm vụ hai")).toBeInTheDocument();
    expect(screen.getByText("Nhiệm vụ cần làm")).toBeInTheDocument();
    // 0 of 2 tasks complete, 0 of 3 steps done.
    expect(screen.getByText("0/2 nhiệm vụ")).toBeInTheDocument();
    expect(screen.getByText("0/3 bước đã hoàn thành")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("opens a task's step note-list from its arrow and ticks a step", async () => {
    const user = userEvent.setup();
    const { backend, state } = createMockBackend(makeTrial());
    setBackend(backend);

    renderWithProviders(<CareerTrialPage />);
    await screen.findByText("Nhiệm vụ một");

    await user.click(
      screen.getByRole("button", {
        name: "Mở các bước của nhiệm vụ: Nhiệm vụ một",
      }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Bước 1.1")).toBeInTheDocument();
    expect(within(dialog).getByText("Bước 1.2")).toBeInTheDocument();

    const checkboxes = within(dialog).getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(state.trial.progress.completedSteps).toContain(1n);
    });
    // The dialog counter reflects the tick.
    expect(within(dialog).getByText("1/2")).toBeInTheDocument();
  });

  it("marks a task complete once every step is ticked and updates progress", async () => {
    const user = userEvent.setup();
    const { backend, state } = createMockBackend(makeTrial());
    setBackend(backend);

    renderWithProviders(<CareerTrialPage />);
    await screen.findByText("Nhiệm vụ một");

    await user.click(
      screen.getByRole("button", {
        name: "Mở các bước của nhiệm vụ: Nhiệm vụ một",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    const checkboxes = within(dialog).getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await waitFor(() => {
      expect(state.trial.progress.completedSteps).toEqual(
        expect.arrayContaining([1n, 2n]),
      );
    });

    // The task row now shows the completed state.
    await waitFor(() => {
      expect(screen.getByText("Đã hoàn thành")).toBeInTheDocument();
    });
    expect(screen.getByText("1/2 nhiệm vụ")).toBeInTheDocument();
    expect(screen.getByText("2/3 bước đã hoàn thành")).toBeInTheDocument();
    // The percentage appears in both the trial header and the assessment card.
    expect(screen.getAllByText("67%").length).toBeGreaterThan(0);
  });

  it("shows the quick-check question with radio options and a reflection box", async () => {
    const { backend } = createMockBackend(makeTrial());
    setBackend(backend);

    renderWithProviders(<CareerTrialPage />);

    expect(await screen.findByText("Câu hỏi một?")).toBeInTheDocument();
    expect(screen.getByText("Kiểm tra nhanh")).toBeInTheDocument();
    expect(screen.getByText("Câu 1/2")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Đáp án A" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Đáp án B" })).toBeInTheDocument();
    expect(
      screen.getByLabelText("Ghi chú tự suy ngẫm của bạn"),
    ).toBeInTheDocument();
  });

  it("selects a radio option and keeps it when navigating away and back", async () => {
    const user = userEvent.setup();
    const { backend, state } = createMockBackend(makeTrial());
    setBackend(backend);

    renderWithProviders(<CareerTrialPage />);
    await screen.findByText("Câu hỏi một?");

    const optionA = screen.getByRole("radio", { name: "Đáp án A" });
    await user.click(optionA);
    await waitFor(() => {
      expect(state.trial.progress.answers).toContainEqual([1n, 0n]);
    });

    await user.click(screen.getByRole("button", { name: /Câu tiếp theo/ }));
    expect(await screen.findByText("Câu hỏi hai?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Câu trước/ }));
    expect(await screen.findByText("Câu hỏi một?")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Đáp án A" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Đáp án B" })).not.toBeChecked();
  });

  it("shows the assessment verdict once every task and question is done", async () => {
    const trial = makeTrial({
      progress: {
        completedSteps: [1n, 2n, 3n],
        answers: [
          [1n, 0n],
          [2n, 1n],
        ],
        reflections: [],
        messages: [],
        assessment: makeAssessment(),
      },
    });
    const { backend } = createMockBackend(trial);
    setBackend(backend);

    renderWithProviders(<CareerTrialPage />);

    // The verdict appears both in the assessment card and in the completion
    // popup, so both are asserted.
    expect((await screen.findAllByText("Rất phù hợp")).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("Điểm mạnh").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cần cải thiện").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Điểm mạnh một").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cần cải thiện một").length).toBeGreaterThan(0);
  });

  it("shows a progress prompt instead of the verdict before completion", async () => {
    const { backend } = createMockBackend(makeTrial());
    setBackend(backend);

    renderWithProviders(<CareerTrialPage />);

    expect(
      await screen.findByText("Chưa đủ dữ liệu để nhận xét"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Rất phù hợp")).not.toBeInTheDocument();
  });

  it("shows the error state when the trial cannot be loaded", async () => {
    const { backend } = createMockBackend(makeTrial());
    backend.getTrial = async () => {
      throw new Error("boom");
    };
    setBackend(backend);

    renderWithProviders(<CareerTrialPage />);

    expect(
      await screen.findByText("Không tải được Career Trial"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeInTheDocument();
  });
});
