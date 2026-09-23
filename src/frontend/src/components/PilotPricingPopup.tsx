import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

const SESSION_KEY = "career-trial:pricing-popup-dismissed";

type Plan = {
  index: string;
  name: string;
  price: string;
  priceNote?: string;
  features: string[];
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    index: "01",
    name: "Career Trial Intro",
    price: "MIỄN PHÍ",
    features: [
      "1 thử thách nghề nghiệp ngắn",
      "Tự suy ngẫm cơ bản",
      "Không có phản hồi từ mentor",
    ],
  },
  {
    index: "02",
    name: "1 Career Trial",
    price: "39.000 – 69.000đ",
    priceNote: "mỗi Career Trial",
    features: [
      "1 Career Trial đầy đủ",
      "Thẻ Bằng chứng Nghề nghiệp",
      "Đánh giá cơ bản",
    ],
  },
  {
    index: "03",
    name: "Career Trial + Phản hồi Mentor",
    price: "99.000 – 149.000đ",
    priceNote: "mỗi Career Trial",
    featured: true,
    features: [
      "1 Career Trial đầy đủ",
      "Phản hồi từ mentor",
      "Thẻ Bằng chứng Nghề nghiệp",
    ],
  },
  {
    index: "04",
    name: "Gói 3 Career Trial",
    price: "149.000 – 199.000đ",
    priceNote: "cho 3 Career Trial",
    features: ["3 Career Trial", "3 Thẻ Bằng chứng", "Suy ngẫm đa nghề nghiệp"],
  },
];

/**
 * App-level mount point for the pilot pricing popup.
 * The popup body is owned by the pricing page task; this shell guarantees it is
 * reachable from every screen and dismissed at most once per session.
 */
export function PilotPricingPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      // sessionStorage unavailable — still show once for this mount.
    }
    setOpen(true);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Ignore storage failures; the popup stays closed for this mount.
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-ocid="pricing.modal"
        className="max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-5xl overflow-y-auto rounded-2xl border-border bg-card p-0 shadow-modal"
      >
        <DialogTitle className="sr-only">Gói pilot Career Trial</DialogTitle>

        <div data-ocid="pricing.body" className="relative">
          <button
            type="button"
            data-ocid="pricing.close_button"
            aria-label="Đóng bảng giá"
            onClick={() => handleOpenChange(false)}
            className="absolute right-4 top-4 z-10 inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-smooth hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <X className="size-4" aria-hidden="true" />
          </button>

          <div className="bg-gradient-mint px-6 pb-6 pt-8 md:px-10 md:pb-8 md:pt-10">
            <p className="eyebrow">Bắt đầu khám phá ngay hôm nay</p>
            <h2 className="mt-3 max-w-2xl font-display text-2xl font-bold leading-tight text-foreground md:text-3xl">
              Chọn gói để bắt đầu hành trình nghề nghiệp của bạn
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Tất cả các gói trả phí đều bao gồm 7 ngày dùng thử miễn phí — bạn
              chưa cần thanh toán bất cứ khoản nào hôm nay.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 px-6 py-6 md:grid-cols-2 md:px-10 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <article
                key={plan.index}
                data-ocid={`pricing.card.${plan.index}`}
                className={`flex flex-col rounded-2xl border bg-card p-5 transition-smooth ${
                  plan.featured
                    ? "border-primary/50 shadow-elevated"
                    : "border-border shadow-card"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-9 items-center justify-center rounded-lg bg-secondary font-mono text-xs font-semibold text-primary"
                >
                  {plan.index}
                </span>

                <h3 className="mt-4 font-display text-base font-bold leading-snug text-foreground">
                  {plan.name}
                </h3>

                <p className="mt-3 font-display text-xl font-bold text-primary">
                  {plan.price}
                </p>
                {plan.priceNote ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.priceNote}
                  </p>
                ) : null}

                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        strokeWidth={2.6}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  data-ocid={`pricing.start_trial_button.${plan.index}`}
                  onClick={() => handleOpenChange(false)}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
                    plan.featured
                      ? "bg-primary text-primary-foreground shadow-card hover:bg-accent"
                      : plan.index === "01"
                        ? "border border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"
                        : "bg-primary text-primary-foreground shadow-card hover:bg-accent"
                  }`}
                >
                  Bắt đầu dùng thử miễn phí
                </button>
              </article>
            ))}
          </div>

          <p className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground md:px-10">
            Không cần thanh toán ngay. Bạn có thể hủy bất cứ lúc nào.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
