import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

type Testimonial = {
    name: string;
    role: string;
    quote: string;
};

const TESTIMONIALS: Testimonial[] = [
    {
        name: "Nguyễn Khánh Linh",
        role: "Talent Acquisition Lead · FintechX",
        quote:
            "TalentFlow giúp đội tuyển dụng của chúng tôi rút ngắn 30% thời gian phản hồi ứng viên và luôn giữ pipeline minh bạch với ban lãnh đạo.",
    },
    {
        name: "Trần Duy Minh",
        role: "Senior Developer · Ứng viên",
        quote:
            "Tôi luôn biết trạng thái hồ sơ của mình đang ở đâu và nhận email cập nhật ngay lập tức. Trải nghiệm ứng tuyển rõ ràng hơn rất nhiều.",
    },
    {
        name: "Lê Thảo Vy",
        role: "HR Director · Nova Retail",
        quote:
            "Bộ báo cáo tức thì và nhắc việc tự động giúp đội ngũ quản lý dễ dàng theo dõi KPI tuyển dụng mà không cần bảng tính thủ công.",
    },
];

export function Testimonials() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-pink-50 to-purple-50 py-16">
            <Container className="space-y-8">
                <div className="mx-auto max-w-2xl text-center space-y-3">
                    <p className="text-xs uppercase tracking-wider text-pink-600 font-bold">
                        Khách hàng nói gì?
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Tiếng nói từ đội tuyển dụng</h2>
                    <p className="text-base text-slate-600">
                        TalentFlow giúp họ phản hồi nhanh, phối hợp dễ dàng và minh bạch với ứng viên
                    </p>
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                    {TESTIMONIALS.map((item) => (
                        <Card
                            key={item.name}
                            className="flex h-full flex-col gap-5 rounded-2xl bg-white border-2 border-pink-100 hover:border-pink-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                        >
                            <div className="flex items-center justify-between">
                <span className="text-4xl leading-none text-purple-400" aria-hidden="true">
                  "
                </span>
                                <div className="flex items-center gap-0.5 text-base text-amber-400" aria-hidden="true">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <span key={index}>★</span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{item.quote}</p>
                            <div className="flex items-center gap-3 mt-auto">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-base font-bold text-purple-700">
                  {getInitials(item.name)}
                </span>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                    <p className="text-xs text-slate-600">{item.role}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </Container>
        </section>
    );
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}
