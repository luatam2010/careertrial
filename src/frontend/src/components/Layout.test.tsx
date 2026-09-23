import { MentorChatWidget } from "@/components/MentorChatWidget";
import { PilotPricingPopup } from "@/components/PilotPricingPopup";
import {
  createMockBackend,
  makeMessage,
  makeTrial,
  renderWithProviders,
} from "@/test/test-utils";
import { ChatRole } from "@/types";
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

describe("PilotPricingPopup", () => {
  beforeEach(() => {
    setBackend(undefined);
  });

  it("shows four plans and dismisses the popup", async () => {
    const user = userEvent.setup();
    const { backend } = createMockBackend(makeTrial());
    setBackend(backend);

    renderWithProviders(<PilotPricingPopup />);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Career Trial Intro")).toBeInTheDocument();
    expect(within(dialog).getByText("1 Career Trial")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Career Trial + Phản hồi Mentor"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Gói 3 Career Trial")).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole("button", { name: "Đóng bảng giá" }),
    );
    await waitFor(() => {
      expect(screen.queryByText("Career Trial Intro")).not.toBeInTheDocument();
    });
  });

  it("does not reopen after it was dismissed in the same session", async () => {
    window.sessionStorage.setItem("career-trial:pricing-popup-dismissed", "1");
    const { backend } = createMockBackend(makeTrial());
    setBackend(backend);

    renderWithProviders(<PilotPricingPopup />);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

describe("MentorChatWidget", () => {
  beforeEach(() => {
    setBackend(undefined);
  });

  it("opens the chat, sends a message, and shows the reply", async () => {
    const user = userEvent.setup();
    const { backend, state } = createMockBackend(
      makeTrial({
        progress: {
          completedSteps: [],
          answers: [],
          reflections: [],
          messages: [makeMessage(1, ChatRole.mentor, "Xin chào!")],
          assessment: undefined,
        },
      }),
    );
    setBackend(backend);

    renderWithProviders(<MentorChatWidget />);

    await user.click(screen.getByRole("button", { name: "Mở cửa sổ cố vấn" }));

    const panel = await screen.findByRole("region", {
      name: "Cố vấn nghề nghiệp",
    });
    expect(within(panel).getByText("Xin chào!")).toBeInTheDocument();

    await user.type(
      within(panel).getByPlaceholderText("Nhập câu hỏi của bạn…"),
      "Tôi nên bắt đầu từ đâu?",
    );
    await user.click(
      within(panel).getByRole("button", { name: "Gửi tin nhắn" }),
    );

    await waitFor(() => {
      expect(state.trial.progress.messages.length).toBeGreaterThanOrEqual(3);
    });
    expect(
      await within(panel).findByText("Đây là lời khuyên từ cố vấn."),
    ).toBeInTheDocument();
  });

  it("closes the chat with its close button", async () => {
    const user = userEvent.setup();
    const { backend } = createMockBackend(makeTrial());
    setBackend(backend);

    renderWithProviders(<MentorChatWidget />);

    await user.click(screen.getByRole("button", { name: "Mở cửa sổ cố vấn" }));
    const panel = await screen.findByRole("region", {
      name: "Cố vấn nghề nghiệp",
    });
    await user.click(
      within(panel).getByRole("button", { name: "Đóng cửa sổ cố vấn" }),
    );
    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: "Cố vấn nghề nghiệp" }),
      ).not.toBeInTheDocument();
    });
  });
});
