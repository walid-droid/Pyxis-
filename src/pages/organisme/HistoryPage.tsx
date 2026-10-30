import "../command/resp-crise.css";
import "./organisme.css";
import { useState } from "react";
import { useI18n } from "../../i18n";
import OrgHero from "./OrgHero";
import { loc, type Localized } from "./organismeData";

type EntryType = "decision" | "operation" | "report" | "simulation";

type JournalEntry = {
  id: string;
  at: string;
  type: EntryType;
  action: Localized;
  actor: string;
};

const JOURNAL: JournalEntry[] = [
  {
    id: "j1",
    at: "30/10/2026 · 09:42",
    type: "decision",
    action: {
      fr: "Passage en phase d'évaluation validé par le directeur du PCF.",
      ar: "تمت المصادقة على الانتقال إلى مرحلة التقييم من مدير مركز القيادة.",
    },
    actor: "Général M. Larbi",
  },
  {
    id: "j2",
    at: "30/10/2026 · 09:10",
    type: "operation",
    action: {
      fr: "Renfort de Tizi Ouzou accepté et confié au Capitaine S. Haddad.",
      ar: "تم قبول تعزيز تيزي وزو وإسناده إلى النقيب س. حداد.",
    },
    actor: "PCF · Béjaïa",
  },
  {
    id: "j3",
    at: "30/10/2026 · 08:55",
    type: "operation",
    action: {
      fr: "Alerte de crue proposée à l'autorité pour l'oued Soummam.",
      ar: "اقتُرح إنذار فيضان على السلطة لوادي سومام.",
    },
    actor: "Cellule de veille",
  },
  {
    id: "j4",
    at: "30/10/2026 · 08:20",
    type: "decision",
    action: {
      fr: "Déclenchement du plan de wilaya pour une crue majeure.",
      ar: "إطلاق خطة الولاية بسبب فيضان كبير.",
    },
    actor: "Wali de Béjaïa",
  },
  {
    id: "j5",
    at: "29/10/2026 · 16:00",
    type: "simulation",
    action: {
      fr: "Simulation annuelle Protection civile / wilaya réalisée.",
      ar: "أُنجز التمرين السنوي للحماية المدنية والولاية.",
    },
    actor: "Commission ORSEC",
  },
  {
    id: "j6",
    at: "29/10/2026 · 11:30",
    type: "report",
    action: {
      fr: "Rapport détaillé adressé au ministre de l'Intérieur.",
      ar: "أُحيل التقرير المفصل إلى وزير الداخلية.",
    },
    actor: "Wali de Béjaïa",
  },
];

type Retex = {
  id: string;
  title: Localized;
  date: string;
  status: "draft" | "validated";
  lessons: Localized;
  recommendations: Localized;
};

const RETEX: Retex[] = [
  {
    id: "rx1",
    title: {
      fr: "RETEX — Crue de la Soummam, octobre 2026",
      ar: "العودة التجريبية — فيضان سومام، أكتوبر 2026",
    },
    date: "30/10/2026",
    status: "draft",
    lessons: {
      fr: "Coordination PCF/PCO efficace ; délai de transmission des renforts perfectible.",
      ar: "تنسيق فعال بين مركز القيادة والمركز العملياتي؛ مدة إحالة التعزيزات قابلة للتحسين.",
    },
    recommendations: {
      fr: "Réduire à 10 minutes le délai d'affectation d'un renfort à une unité.",
      ar: "تقليص مدة إسناد التعزيز إلى وحدة إلى 10 دقائق.",
    },
  },
  {
    id: "rx2",
    title: {
      fr: "RETEX — Simulation annuelle 2025",
      ar: "العودة التجريبية — التمرين السنوي 2025",
    },
    date: "15/12/2025",
    status: "validated",
    lessons: {
      fr: "Bonne couverture des modules secours et santé ; modules travaux et eau à renforcer.",
      ar: "تغطية جيدة لوحدتي الإنقاذ والصحة؛ يلزم تعزيز وحدتي الأشغال والمياه.",
    },
    recommendations: {
      fr: "Programmer deux exercices ciblés sur les modules travaux et eau.",
      ar: "برمجة تمرينين موجهين لوحدتي الأشغال والمياه.",
    },
  },
];

const TYPES: (EntryType | "all")[] = [
  "all",
  "decision",
  "operation",
  "report",
  "simulation",
];

/** Écran transversal : journal chronologique et retours d'expérience (BF14, BF22). */
export default function HistoryPage() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<EntryType | "all">("all");
  const [toast, setToast] = useState<string | null>(null);

  const entries = JOURNAL.filter(
    (entry) => filter === "all" || entry.type === filter,
  );

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("org.history.eyebrow")}
        title={t("org.history.title")}
        lead={t("org.history.lead")}
        chips={
          <>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--medium" />
              {JOURNAL.length} {t("org.history.journal").toLowerCase()}
            </span>
            <span className="rc-chip">
              {RETEX.length} {t("org.history.retex").toLowerCase()}
            </span>
          </>
        }
        aside={
          <button
            type="button"
            className="rc-btn rc-btn--soft"
            onClick={() => setToast(t("org.history.exported"))}
          >
            {t("org.history.export")}
          </button>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("org.history.journal")}</h2>
          <div className="rc-tabs" role="group" aria-label={t("org.history.filter")}>
            {TYPES.map((value) => (
              <button
                key={value}
                type="button"
                className={`rc-tab${filter === value ? " is-active" : ""}`}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {value === "all"
                  ? t("org.history.all")
                  : t(`org.history.type.${value}`)}
              </button>
            ))}
          </div>
        </div>
        <p className="rc-card__lead">{t("org.history.journalLead")}</p>

        {entries.length === 0 ? (
          <p className="rc-empty">{t("org.history.empty")}</p>
        ) : (
          <ul className="rc-timeline">
            {entries.map((entry) => (
              <li className="rc-timeline__item" key={entry.id}>
                <span className="rc-timeline__icon" aria-hidden="true">
                  •
                </span>
                <div className="rc-timeline__body">
                  <p className="rc-timeline__reason">
                    {loc(lang, entry.action)}
                  </p>
                  <p className="rc-timeline__meta">
                    {entry.at} · {t(`org.history.type.${entry.type}`)} ·{" "}
                    {entry.actor}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("org.history.retex")}</h2>
          <span className="rc-card__hint">{t("org.history.retexLead")}</span>
        </div>

        <ul className="org-signal-list">
          {RETEX.map((item) => (
            <li key={item.id} className="org-signal">
              <div className="org-signal__head">
                <strong>{loc(lang, item.title)}</strong>
                <span
                  className={`rc-badge rc-badge--${
                    item.status === "validated" ? "low" : "medium"
                  }`}
                >
                  {t(`org.history.status.${item.status}`)}
                </span>
              </div>
              <p className="org-signal__meta">
                <span>{item.date}</span>
              </p>
              <dl className="orsec-facts">
                <div>
                  <dt>{t("org.history.lessons")}</dt>
                  <dd>{loc(lang, item.lessons)}</dd>
                </div>
                <div>
                  <dt>{t("org.history.recommendations")}</dt>
                  <dd>{loc(lang, item.recommendations)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </article>
    </main>
  );
}
