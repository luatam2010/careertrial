import { LoginPage } from "@/pages/LoginPage";
import { createTestQueryClient } from "@/test/test-utils";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("@/hooks/useSession", () => ({
  useSession: () => ({
    isAuthenticated: false,
    isInitializing: false,
    principal: null,
    displayName: null,
    login: session.login,
    logout: session.logout,
  }),
}));

function renderLoginPage() {
  const rootRoute = createRootRoute();
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: LoginPage,
  });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <div>Trang chủ</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([loginRoute, homeRoute]),
    history: createMemoryHistory({ initialEntries: ["/login"] }),
  });
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    session.login.mockClear();
    session.logout.mockClear();
  });

  it("shows the sign-in form with its fields by default", async () => {
    renderLoginPage();

    expect(
      await screen.findByRole("heading", { name: "Đăng nhập học sinh" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Địa chỉ Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mật khẩu")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Student Login/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with Microsoft" }),
    ).toBeInTheDocument();
  });

  it("switches to the sign-up form and back", async () => {
    const user = userEvent.setup();
    renderLoginPage();
    await screen.findByRole("heading", { name: "Đăng nhập học sinh" });

    await user.click(screen.getByRole("tab", { name: "Đăng ký" }));

    expect(
      await screen.findByRole("heading", { name: "Tạo tài khoản học sinh" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Họ và tên")).toBeInTheDocument();
    expect(screen.getByLabelText("Khối lớp")).toBeInTheDocument();
    expect(screen.getByLabelText("Xác nhận mật khẩu")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create account/ }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Đăng nhập" }));
    expect(
      await screen.findByRole("heading", { name: "Đăng nhập học sinh" }),
    ).toBeInTheDocument();
  });

  it("validates the sign-in form before submitting", async () => {
    const user = userEvent.setup();
    renderLoginPage();
    await screen.findByRole("heading", { name: "Đăng nhập học sinh" });

    await user.click(screen.getByRole("button", { name: /Student Login/ }));

    expect(
      await screen.findByText("Vui lòng nhập địa chỉ email."),
    ).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập mật khẩu.")).toBeInTheDocument();
    expect(session.login).not.toHaveBeenCalled();
  });

  it("rejects an invalid email and a short password", async () => {
    const user = userEvent.setup();
    renderLoginPage();
    await screen.findByRole("heading", { name: "Đăng nhập học sinh" });

    await user.type(screen.getByLabelText("Địa chỉ Email"), "khong-phai-email");
    await user.type(screen.getByLabelText("Mật khẩu"), "123");
    await user.click(screen.getByRole("button", { name: /Student Login/ }));

    expect(
      await screen.findByText("Địa chỉ email không hợp lệ."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Mật khẩu cần ít nhất 6 ký tự."),
    ).toBeInTheDocument();
    expect(session.login).not.toHaveBeenCalled();
  });

  it("submits a valid sign-in and calls login", async () => {
    const user = userEvent.setup();
    renderLoginPage();
    await screen.findByRole("heading", { name: "Đăng nhập học sinh" });

    await user.type(
      screen.getByLabelText("Địa chỉ Email"),
      "ban@truonghoc.edu.vn",
    );
    await user.type(screen.getByLabelText("Mật khẩu"), "matkhau123");
    await user.click(screen.getByRole("button", { name: /Student Login/ }));

    await waitFor(() => {
      expect(session.login).toHaveBeenCalledTimes(1);
    });
  });

  it("validates the sign-up form including password confirmation", async () => {
    const user = userEvent.setup();
    renderLoginPage();
    await screen.findByRole("heading", { name: "Đăng nhập học sinh" });
    await user.click(screen.getByRole("tab", { name: "Đăng ký" }));
    await screen.findByRole("heading", { name: "Tạo tài khoản học sinh" });

    await user.type(screen.getByLabelText("Họ và tên"), "Nguyễn Minh Anh");
    await user.type(
      screen.getByLabelText("Địa chỉ Email"),
      "minhanh@truonghoc.edu.vn",
    );
    await user.type(screen.getByLabelText("Mật khẩu"), "matkhau123");
    await user.type(screen.getByLabelText("Xác nhận mật khẩu"), "khac123");
    await user.click(screen.getByRole("button", { name: /Create account/ }));

    expect(
      await screen.findByText("Vui lòng chọn khối lớp."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Mật khẩu xác nhận không khớp."),
    ).toBeInTheDocument();
    expect(session.login).not.toHaveBeenCalled();
  });

  it("shows the demo notice about local-only accounts", async () => {
    renderLoginPage();
    await screen.findByRole("heading", { name: "Đăng nhập học sinh" });
    expect(
      screen.getByText(/tài khoản chỉ được lưu trong trình duyệt này/),
    ).toBeInTheDocument();
  });
});
