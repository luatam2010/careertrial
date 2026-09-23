import { Clock, Sparkles } from "lucide-react";

const SKILL_TAGS = ["Sáng tạo", "Giao tiếp", "Phân tích"];

const DELIVERABLES = [
  "Một bản kế hoạch chiến dịch marketing hoàn chỉnh cho một sản phẩm giả định.",
  "Bộ nội dung mẫu gồm bài đăng mạng xã hội và email gửi khách hàng.",
  "Bảng phân tích chỉ số hiệu quả và đề xuất cải thiện cho chiến dịch.",
];

const ESTIMATED_TIME = "5 ngày";

export function TrialBriefCard({ title }: { title: string }) {
  return (
    <section
      data-ocid="trial.brief_card"
      className="animate-fade-in-up rounded-2xl border border-border bg-card p-6 shadow-card md:p-8"
    >
      <p className="eyebrow">Trial Brief</p>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Trải nghiệm thực tế công việc của một chuyên viên marketing trong 5 ngày
        — từ nghiên cứu khách hàng đến đo lường hiệu quả chiến dịch.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span
          data-ocid="trial.meta.time"
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-sm font-medium text-secondary-foreground"
        >
          <Clock className="size-4" aria-hidden="true" />
          {ESTIMATED_TIME}
        </span>
        {SKILL_TAGS.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground"
          >
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-7 grid gap-6 border-t border-border pt-7 md:grid-cols-2 md:gap-10">
        <div>
          <h2 className="eyebrow">The Brief</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Bạn sẽ đóng vai một chuyên viên marketing tập sự tại một thương hiệu
            đồ uống đang muốn tiếp cận nhóm khách hàng trẻ. Nhiệm vụ của bạn là
            tìm hiểu nhu cầu khách hàng, xây dựng thông điệp phù hợp và đề xuất
            một chiến dịch có thể triển khai thực tế. Hãy ghi lại suy nghĩ của
            bạn sau mỗi bước để mentor theo dõi quá trình.
          </p>
        </div>
        <div>
          <h2 className="eyebrow">What You Will Deliver</h2>
          <ul className="mt-3 space-y-2.5">
            {DELIVERABLES.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-7 flex items-center gap-2 border-t border-border pt-5 text-sm text-muted-foreground">
        <Clock className="size-4 text-primary" aria-hidden="true" />
        <span>
          Thời gian ước tính:{" "}
          <span className="font-semibold text-foreground">
            {ESTIMATED_TIME}
          </span>
        </span>
      </div>
    </section>
  );
}
