import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const faqs = [
  {
    question: "كيف أعرف سعر صندوقي قبل الاشتراك؟",
    answer:
      "أثناء بناء الصندوق يظهر لك تفصيل السعر لحظياً: قيمة المنتجات، رسوم التوصيل حسب مدينتك، وضريبة القيمة المضافة. لا يوجد أي مبلغ يُخصم قبل تأكيدك.",
  },
  {
    question: "هل أقدر أغيّر محتويات الصندوق بعد الاشتراك؟",
    answer:
      "نعم. تعدّل الأصناف والكميات والتكرار من لوحة تحكمك في أي وقت. التعديل يُطبَّق على التوصيلة القادمة، إلا إذا كانت داخل مهلة الإغلاق فيُطبَّق على التي تليها.",
  },
  {
    question: "ماذا لو سافرت أو ما احتجت الصندوق هذا الأسبوع؟",
    answer:
      "أوقف اشتراكك مؤقتاً وحدّد تاريخ الاستئناف، أو ألغِه نهائياً. لا توجد رسوم إيقاف ولا إلغاء.",
  },
  {
    question: "ما هي طرق الدفع المتاحة؟",
    answer:
      "مدى، Apple Pay، وبطاقات فيزا وماستركارد عبر بوابة Moyasar. تُحفظ بطاقتك بشكل مُرمَّز لتجديد الاشتراك تلقائياً، ويمكنك استبدالها من الإعدادات.",
  },
  {
    question: "ماذا لو وصل صنف غير مطابق للجودة؟",
    answer:
      "تواصل معنا خلال ٢٤ ساعة من الاستلام ونستبدل الصنف في التوصيلة القادمة أو نرجّع قيمته — أنت تختار.",
  },
  {
    question: "هل التوصيل متاح في مدينتي؟",
    answer:
      "نغطي حالياً الرياض وجدة والدمام، ونضيف مدناً جديدة تباعاً. المدن المتاحة تظهر لك عند إضافة عنوانك.",
  },
];

// Native <details> rather than a JS accordion: it's keyboard-accessible and
// searchable in-page by default, and costs zero client bundle on a page whose
// whole job is to load fast for ad traffic.
export function Faq() {
  return (
    <section className="border-t border-outline-variant bg-surface-container-low py-stack-2xl">
      <Container>
        <Reveal className="max-w-xl">
          <p className="text-overline uppercase text-primary">الأسئلة الشائعة</p>
          <h2 className="mt-2 text-h1 text-on-background">كل ما تحتاج معرفته</h2>
        </Reveal>

        <div className="mt-stack-xl grid grid-cols-1 gap-stack-sm lg:grid-cols-2">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={Math.min(index, 3) * 70}>
              <details className="group rounded-organic border border-outline-variant bg-surface p-5 transition-[border-color,box-shadow] duration-slow ease-out-expo hover:border-primary-container open:border-primary-container open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-h3 text-on-surface transition-colors duration-fast marker:content-[''] group-hover:text-primary">
                  {faq.question}
                  <ChevronDown
                    className="size-5 shrink-0 text-primary transition-transform duration-slow ease-out-expo group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                {/* The panel fades in on open. Deliberately opacity-only —
                    animating height here would make every expand a layout
                    shift on a page inside the CLS budget. */}
                <p className="mt-stack-sm animate-fade-in text-small leading-relaxed text-on-surface-variant">
                  {faq.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
