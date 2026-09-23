import { StudentAuthCard } from "@/components/StudentAuthCard";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function LoginPage() {
  return (
    <div
      data-ocid="login.page"
      className="mx-auto flex w-full max-w-lg flex-col px-4 py-10 md:py-16"
    >
      <Link
        to="/"
        data-ocid="login.back_link"
        className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground shadow-card transition-smooth hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Quay lại Career Trial
      </Link>

      <StudentAuthCard />
    </div>
  );
}
