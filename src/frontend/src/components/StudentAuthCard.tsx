import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/hooks/useSession";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { SiGoogle } from "react-icons/si";

function MicrosoftMark() {
  return (
    <svg
      viewBox="0 0 23 23"
      className="size-4"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

type Mode = "login" | "signup";

const GRADES = [
  "Lớp 6",
  "Lớp 7",
  "Lớp 8",
  "Lớp 9",
  "Lớp 10",
  "Lớp 11",
  "Lớp 12",
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

interface LoginErrors {
  email?: string;
  password?: string;
}

interface SignupErrors {
  fullName?: string;
  email?: string;
  grade?: string;
  password?: string;
  confirmPassword?: string;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  invalid,
  describedBy,
  marker,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  invalid: boolean;
  describedBy?: string;
  marker: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id={id}
        data-ocid={marker}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className="h-11 rounded-xl pl-10 pr-11"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

function SocialButton({
  icon,
  label,
  marker,
}: {
  icon: React.ReactNode;
  label: string;
  marker: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      data-ocid={marker}
      className="h-11 w-full rounded-full border-border bg-card text-sm font-semibold text-foreground shadow-none transition-smooth hover:border-primary/40 hover:bg-secondary/60 hover:text-primary"
    >
      {icon}
      {label}
    </Button>
  );
}

export function StudentAuthCard() {
  const navigate = useNavigate();
  const { login } = useSession();
  const [mode, setMode] = useState<Mode>("login");
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});

  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupErrors, setSignupErrors] = useState<SignupErrors>({});

  const baseId = useId();
  const loginEmailId = `${baseId}-login-email`;
  const loginPasswordId = `${baseId}-login-password`;
  const fullNameId = `${baseId}-full-name`;
  const signupEmailId = `${baseId}-signup-email`;
  const gradeId = `${baseId}-grade`;
  const signupPasswordId = `${baseId}-signup-password`;
  const confirmPasswordId = `${baseId}-confirm-password`;

  function switchMode(next: Mode) {
    setMode(next);
    setLoginErrors({});
    setSignupErrors({});
  }

  function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: LoginErrors = {};
    if (!loginEmail.trim()) {
      nextErrors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!EMAIL_PATTERN.test(loginEmail.trim())) {
      nextErrors.email = "Địa chỉ email không hợp lệ.";
    }
    if (!loginPassword) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (loginPassword.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
    }
    setLoginErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    login();
    void navigate({ to: "/" });
  }

  function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: SignupErrors = {};
    if (!fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ và tên.";
    }
    if (!signupEmail.trim()) {
      nextErrors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!EMAIL_PATTERN.test(signupEmail.trim())) {
      nextErrors.email = "Địa chỉ email không hợp lệ.";
    }
    if (!grade) {
      nextErrors.grade = "Vui lòng chọn khối lớp.";
    }
    if (!signupPassword) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (signupPassword.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (confirmPassword !== signupPassword) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }
    setSignupErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    login();
    void navigate({ to: "/" });
  }

  return (
    <div
      data-ocid="auth.card"
      className="animate-fade-in-up w-full rounded-3xl border border-border bg-card p-6 shadow-elevated sm:p-8 md:p-10"
    >
      <div className="flex flex-col items-center text-center">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-card"
        >
          <ShieldCheck className="size-6" strokeWidth={2.2} />
        </span>
        <p className="eyebrow mt-4">
          {mode === "login" ? "Student Login" : "Create Your Account"}
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {mode === "login" ? "Đăng nhập học sinh" : "Tạo tài khoản học sinh"}
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {mode === "login"
            ? "Tiếp tục hành trình Career Trial và lưu lại tiến độ khám phá nghề nghiệp của bạn."
            : "Chỉ mất một phút để bắt đầu thử sức với nghề nghiệp bạn tò mò nhất."}
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Chọn hình thức tài khoản"
        className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-border bg-muted/60 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          data-ocid="auth.login.tab"
          onClick={() => switchMode("login")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
            mode === "login"
              ? "bg-card text-primary shadow-card"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          data-ocid="auth.signup.tab"
          onClick={() => switchMode("signup")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
            mode === "signup"
              ? "bg-card text-primary shadow-card"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Đăng ký
        </button>
      </div>

      {mode === "login" ? (
        <form
          noValidate
          onSubmit={handleLoginSubmit}
          className="mt-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor={loginEmailId}>Địa chỉ Email</Label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id={loginEmailId}
                data-ocid="auth.email.input"
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="ban@truonghoc.edu.vn"
                autoComplete="email"
                aria-invalid={Boolean(loginErrors.email)}
                aria-describedby={
                  loginErrors.email ? `${loginEmailId}-error` : undefined
                }
                className="h-11 rounded-xl pl-10"
              />
            </div>
            <FieldError
              id={`${loginEmailId}-error`}
              message={loginErrors.email}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={loginPasswordId}>Mật khẩu</Label>
            <PasswordInput
              id={loginPasswordId}
              marker="auth.password.input"
              value={loginPassword}
              onChange={setLoginPassword}
              placeholder="Nhập mật khẩu của bạn"
              autoComplete="current-password"
              invalid={Boolean(loginErrors.password)}
              describedBy={
                loginErrors.password ? `${loginPasswordId}-error` : undefined
              }
            />
            <FieldError
              id={`${loginPasswordId}-error`}
              message={loginErrors.password}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`${baseId}-keep-signed-in`}
                data-ocid="auth.keep_signed_in.checkbox"
                checked={keepSignedIn}
                onCheckedChange={(checked) => setKeepSignedIn(checked === true)}
              />
              <Label
                htmlFor={`${baseId}-keep-signed-in`}
                className="cursor-pointer text-sm font-normal text-muted-foreground"
              >
                Keep me signed in
              </Label>
            </div>
            <button
              type="button"
              data-ocid="auth.forgot_password.link"
              className="rounded-md text-sm font-semibold text-primary transition-smooth hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            data-ocid="auth.login.submit_button"
            className="h-11 w-full rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-card transition-smooth hover:shadow-elevated"
          >
            Student Login
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              or continue with
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SocialButton
              marker="auth.google.button"
              icon={<SiGoogle className="size-4" aria-hidden="true" />}
              label="Continue with Google"
            />
            <SocialButton
              marker="auth.microsoft.button"
              icon={<MicrosoftMark />}
              label="Continue with Microsoft"
            />
          </div>
        </form>
      ) : (
        <form
          noValidate
          onSubmit={handleSignupSubmit}
          className="mt-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor={fullNameId}>Họ và tên</Label>
            <div className="relative">
              <User
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id={fullNameId}
                data-ocid="auth.full_name.input"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nguyễn Minh Anh"
                autoComplete="name"
                aria-invalid={Boolean(signupErrors.fullName)}
                aria-describedby={
                  signupErrors.fullName ? `${fullNameId}-error` : undefined
                }
                className="h-11 rounded-xl pl-10"
              />
            </div>
            <FieldError
              id={`${fullNameId}-error`}
              message={signupErrors.fullName}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={signupEmailId}>Địa chỉ Email</Label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id={signupEmailId}
                data-ocid="auth.signup_email.input"
                type="email"
                value={signupEmail}
                onChange={(event) => setSignupEmail(event.target.value)}
                placeholder="ban@truonghoc.edu.vn"
                autoComplete="email"
                aria-invalid={Boolean(signupErrors.email)}
                aria-describedby={
                  signupErrors.email ? `${signupEmailId}-error` : undefined
                }
                className="h-11 rounded-xl pl-10"
              />
            </div>
            <FieldError
              id={`${signupEmailId}-error`}
              message={signupErrors.email}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={gradeId}>Khối lớp</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger
                id={gradeId}
                data-ocid="auth.grade.select"
                aria-invalid={Boolean(signupErrors.grade)}
                aria-describedby={
                  signupErrors.grade ? `${gradeId}-error` : undefined
                }
                className="h-11 w-full rounded-xl"
              >
                <SelectValue placeholder="Chọn khối lớp của bạn" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id={`${gradeId}-error`} message={signupErrors.grade} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={signupPasswordId}>Mật khẩu</Label>
            <PasswordInput
              id={signupPasswordId}
              marker="auth.signup_password.input"
              value={signupPassword}
              onChange={setSignupPassword}
              placeholder={`Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`}
              autoComplete="new-password"
              invalid={Boolean(signupErrors.password)}
              describedBy={
                signupErrors.password ? `${signupPasswordId}-error` : undefined
              }
            />
            <FieldError
              id={`${signupPasswordId}-error`}
              message={signupErrors.password}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={confirmPasswordId}>Xác nhận mật khẩu</Label>
            <PasswordInput
              id={confirmPasswordId}
              marker="auth.confirm_password.input"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              invalid={Boolean(signupErrors.confirmPassword)}
              describedBy={
                signupErrors.confirmPassword
                  ? `${confirmPasswordId}-error`
                  : undefined
              }
            />
            <FieldError
              id={`${confirmPasswordId}-error`}
              message={signupErrors.confirmPassword}
            />
          </div>

          <Button
            type="submit"
            data-ocid="auth.signup.submit_button"
            className="h-11 w-full rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-card transition-smooth hover:shadow-elevated"
          >
            Create account
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </form>
      )}

      <p className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-secondary/50 px-3.5 py-3 text-xs leading-relaxed text-secondary-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          Đây là bản demo: tài khoản chỉ được lưu trong trình duyệt này và không
          gửi dữ liệu lên máy chủ.
        </span>
      </p>
    </div>
  );
}
