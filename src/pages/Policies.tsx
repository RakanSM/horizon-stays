import { Link } from "react-router-dom";
import { useLang } from "../lib/i18n";

const WHATSAPP = "https://wa.me/966920035843";

export default function Policies() {
  const { lang } = useLang();
  const isArabic = lang === "ar";
  const copy = isArabic
    ? {
        eyebrow: "HORIZON / معلومات الحجز",
        title: "السياسات وشروط الحجز",
        intro: "يرجى قراءة هذه المعلومات قبل متابعة طلب الحجز أو أي دفع مرتبط بالإقامة. موافقتك قبل المتابعة تعني أنك اطلعت عليها وفهمتها.",
        sections: [
          ["التوفر وتأكيد الإقامة", "اختيار التواريخ يعرض التوفر والسعر المرتبطين بها، لكنه لا يعني وحده تأكيداً نهائياً للإقامة. يظهر مسار المتابعة المناسب من صفحة الوحدة."],
          ["الأسعار والدفع", "يتغير السعر بحسب التواريخ المختارة وعدد الليالي. راجع السعر والإجمالي قبل المتابعة، ولا تتابع إلى أي رابط دفع إلا بعد قبولك للمبلغ والسياسات المعروضة."],
          ["تعديل أو إلغاء الطلب", "إذا احتجت إلى تعديل طلبك أو إلغائه، تواصل مع Horizon Stays قبل موعد الوصول. ستُوضح لك الشروط أو الرسوم التي تنطبق على طلبك قبل إتمام أي دفع."],
          ["التزامات الضيف", "يلتزم الضيف بتقديم معلومات حجز صحيحة، واحترام أنظمة المبنى والهدوء، والمحافظة على الوحدة وتجهيزاتها أثناء الإقامة."],
          ["الخصوصية والتواصل", "نستخدم بيانات التواصل اللازمة فقط للرد على طلبك، تنسيق الإقامة، وخدمة الضيف. للاستفسارات أو التحديثات المتعلقة بالحجز، تواصل معنا من القنوات المعروضة في الموقع."],
        ],
        contact: "استفسر عن السياسات أو حجزك",
        back: "العودة إلى الإقامات",
      }
    : {
        eyebrow: "HORIZON / BOOKING INFORMATION",
        title: "Policies & booking terms",
        intro: "Please read this information before continuing a booking request or any payment connected to a stay. By agreeing before you continue, you confirm that you have read and understood it.",
        sections: [
          ["Availability and stay confirmation", "Selecting dates shows their availability and price, but does not by itself create a final stay confirmation. The appropriate next step is presented from the residence page."],
          ["Pricing and payment", "Pricing changes with the selected dates and number of nights. Review the price and total before continuing, and do not continue to a payment link until you accept the amount and displayed policies."],
          ["Changing or cancelling a request", "If you need to change or cancel a request, contact Horizon Stays before your check-in date. Any terms or fees that apply to your request will be clarified before payment is completed."],
          ["Guest responsibilities", "Guests must provide accurate booking information, respect building and quiet-hour rules, and take reasonable care of the residence and its amenities during the stay."],
          ["Privacy and communication", "We use the contact details needed to respond to your request, arrange the stay, and support the guest experience. Use the contact channels shown on the site for booking questions or updates."],
        ],
        contact: "Ask about a policy or booking",
        back: "Back to stays",
      };

  return (
    <div className="container section horizon-info-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="horizon-info-hero">
        <span>{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </section>
      <section className="horizon-policy-list" aria-label={copy.title}>
        {copy.sections.map(([title, text], index) => (
          <article key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><h2>{title}</h2><p>{text}</p></div>
          </article>
        ))}
      </section>
      <section className="horizon-info-cta">
        <p>{isArabic ? "لديك سؤال قبل المتابعة؟ تواصل معنا قبل إتمام طلبك." : "Have a question before continuing? Contact us before you complete your request."}</p>
        <div>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="horizon-primary-btn">{copy.contact} <span aria-hidden>↗</span></a>
          <Link to="/" className="horizon-secondary-link">{copy.back} <span aria-hidden>→</span></Link>
        </div>
      </section>
    </div>
  );
}
