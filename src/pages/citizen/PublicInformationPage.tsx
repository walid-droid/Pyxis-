import { useState } from "react";
import { useI18n } from "../../i18n";
import { useOrsecOps } from "../../lib/orsecOps";
import { useOrsecPlans } from "../shared/plan/PlanContext";
import "../shared/ops/ops.css";

const EMERGENCY = [
  { label: { fr: "Protection civile", ar: "الحماية المدنية" }, number: "14" },
  { label: { fr: "Police", ar: "الشرطة" }, number: "17" },
  { label: { fr: "Gendarmerie", ar: "الدرك" }, number: "1055" },
  { label: { fr: "SAMU", ar: "الإسعاف الطبي" }, number: "115" },
];

const CONSIGNES = [
  {
    fr: "Écoutez la radio et suivez les consignes officielles.",
    ar: "استمعوا إلى الإذاعة واتبعوا الإرشادات الرسمية.",
  },
  {
    fr: "Ne traversez jamais une route inondée, même en véhicule.",
    ar: "لا تعبروا أبداً طريقاً مغموراً بالمياه، حتى بالسيارة.",
  },
  {
    fr: "Rejoignez le centre d'accueil le plus proche si votre logement est menacé.",
    ar: "توجهوا إلى أقرب مركز استقبال إذا كان مسكنكم مهدداً.",
  },
  {
    fr: "N'encombrez pas les lignes d'urgence : un seul appel suffit.",
    ar: "لا تشغلوا خطوط الطوارئ: مكالمة واحدة تكفي.",
  },
];

export default function PublicInformationPage() {
  const { lang, t } = useI18n();
  const { messages, shelters, victims } = useOrsecOps();
  const { plans } = useOrsecPlans();
  const [showAlert, setShowAlert] = useState(true);
  const published = messages.filter((message) => message.status === "published");
  const situation = plans.wilaya.situation;
  const alerting = situation === "B" || situation === "C" || situation === "D";

  const tx = (value: { fr: string; ar: string }) => value[lang];

  return (
    <main className="ops-public">
      {alerting && showAlert ? (
        <div className="ops-public__alert" role="alert">
          <span>
            {lang === "ar" ? "الوضعية" : "Situation"} {situation} —{" "}
            {t("ops.public.alertBanner")}
          </span>
          <button
            type="button"
            className="ops-banner__action"
            onClick={() => setShowAlert(false)}
          >
            {lang === "ar" ? "إخفاء" : "Masquer"}
          </button>
        </div>
      ) : null}

      <header className="ops-public__hero">
        <p className="ops-hero__eyebrow">ORSEC · Wilaya de Béjaïa</p>
        <h1 className="ops-hero__title">
          {lang === "ar" ? "إعلام الجمهور" : "Information du public"}
        </h1>
        <p className="ops-hero__lead">
          {lang === "ar"
            ? "الإرشادات الرسمية والتنبيهات ومراكز الاستقبال بولاية بجاية."
            : "Consignes officielles, alertes et lieux d'accueil de la wilaya de Béjaïa."}
        </p>
        <p className="ops-hero__lead">
          {lang === "ar"
            ? "متوفر بالفرنسية والعربية · المصدر: خلية إعلام ORSEC"
            : "Disponible en français et en arabe · Source : cellule d'information ORSEC"}
        </p>
      </header>

      <section className="ops-grid">
        <div className="ops-public__msg">
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
            {lang === "ar" ? "الحصيلة" : "Point de situation"}
          </h2>
          <div className="ops-kpis">
            <div className="ops-kpi ops-kpi--danger">
              <span className="ops-kpi__value">{shelters.open}</span>
              <span className="ops-kpi__label">
                {lang === "ar" ? "مراكز مفتوحة" : "Centres ouverts"}
              </span>
            </div>
            <div className="ops-kpi ops-kpi--ok">
              <span className="ops-kpi__value">
                {shelters.capacity - shelters.occupied}
              </span>
              <span className="ops-kpi__label">
                {lang === "ar" ? "أماكن متاحة" : "Places disponibles"}
              </span>
            </div>
            <div className="ops-kpi ops-kpi--warn">
              <span className="ops-kpi__value">{victims.injured}</span>
              <span className="ops-kpi__label">
                {lang === "ar" ? "جرحى" : "Blessés"}
              </span>
            </div>
            <div className="ops-kpi">
              <span className="ops-kpi__value">{situation}</span>
              <span className="ops-kpi__label">
                {lang === "ar" ? "الوضعية" : "Situation"}
              </span>
            </div>
          </div>
        </div>

        <div className="ops-public__msg">
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
            {lang === "ar" ? "أرقام الطوارئ" : "Numéros d'urgence"}
          </h2>
          <div className="ops-public__contacts">
            {EMERGENCY.map((item) => (
              <a
                key={item.number}
                className="ops-public__contact"
                href={`tel:${item.number}`}
              >
                <span>{tx(item.label)}</span>
                <strong>{item.number}</strong>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 10 }}>
          {lang === "ar" ? "الرسائل الرسمية" : "Messages officiels"}
        </h2>
        {published.length === 0 ? (
          <p className="ops-empty">
            {lang === "ar"
              ? "لا توجد رسائل منشورة حالياً."
              : "Aucun message publié pour le moment."}
          </p>
        ) : (
          <div className="ops-grid">
            {published.map((message) => (
              <article key={message.id} className="ops-public__msg">
                <h3>{tx(message.title)}</h3>
                <p>{tx(message.body)}</p>
                <div className="ops-public__meta">
                  <span>
                    {lang === "ar" ? "المنطقة" : "Zone"} · {tx(message.zone)}
                  </span>
                  {message.publishedAt ? (
                    <span>
                      {lang === "ar" ? "نُشر في" : "Publié le"} ·{" "}
                      {message.publishedAt}
                    </span>
                  ) : null}
                  <span className="ops-badge ops-badge--ok">
                    {t(`ops.comm.channel.${message.channel}`)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 10 }}>
          {lang === "ar" ? "إرشادات السلامة" : "Consignes de sécurité"}
        </h2>
        <ul className="ops-list">
          {CONSIGNES.map((item, index) => (
            <li key={index} className="ops-list__item">
              <p className="ops-list__body">{tx(item)}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
