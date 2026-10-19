import { useI18n } from "../../i18n";
import "./ContactsPage.css";

type PhoneNumber = {
  tel: string; // digits only, used in the tel: link
  display: string; // how the number is shown on screen
};

type Contact = {
  name: string;
  role: string;
  numbers: PhoneNumber[];
  note?: string;
};

type Group = {
  id: string;
  title: string;
  intro: string;
  urgent?: boolean;
  contacts: Contact[];
};

// Update this date each time you re-check the numbers.
const GROUPS: Group[] = [
  {
    id: "urgences",
    title: "Urgences vitales",
    intro: "En cas de danger immédiat pour une personne, appelez sans attendre.",
    urgent: true,
    contacts: [
      {
        name: "Protection civile",
        role: "Pompiers et secours : incendies, accidents de la route, inondations, fuites de gaz.",
        numbers: [
          { tel: "14", display: "14" },
          { tel: "1021", display: "10 21" },
        ],
        note: "Numéros gratuits.",
      },
      {
        name: "Police secours",
        role: "Appel d'urgence pour joindre les services opérationnels de la police.",
        numbers: [{ tel: "17", display: "17" }],
        note: "Ouvert 24 h/24, 7 j/7.",
      },
      {
        name: "Sûreté nationale",
        role: "Numéro vert de la DGSN pour signaler une infraction ou un accident de la route, et demander de l'aide.",
        numbers: [{ tel: "1548", display: "15 48" }],
        note: "Joignable jour et nuit.",
      },
      {
        name: "Gendarmerie nationale",
        role: "Numéro vert pour signaler un crime, un vol ou un accident de la route, ou demander une assistance sur la route.",
        numbers: [{ tel: "1055", display: "10 55" }],
        note: "Disponible en permanence.",
      },
      // TODO: add the medical emergency / SAMU line here once you have confirmed
      // the official number with the Ministère de la Santé.
    ],
  },
  {
    id: "autres",
    title: "Autres lignes utiles",
    intro: "Pour des situations précises.",
    contacts: [
      {
        name: "Feux de forêt",
        role: "Numéro vert de la Direction générale des forêts pour signaler un départ de feu ou un danger.",
        numbers: [{ tel: "1070", display: "10 70" }],
      },
      {
        name: "Sonelgaz",
        role: "Centre d'appel national : coupure d'électricité, câble tombé, panne.",
        numbers: [{ tel: "3303", display: "33 03" }],
      },
      {
        name: "Enfance en danger",
        role: "Numéro vert national pour signaler un enfant en danger. Le signalement est aussi possible avec l'application Allô Tofola.",
        numbers: [{ tel: "1111", display: "11 11" }],
      },
      {
        name: "Violences faites aux femmes",
        role: "Numéro vert du ministère de la Solidarité nationale, de la Famille et de la Condition de la femme.",
        numbers: [{ tel: "1026", display: "10 26" }],
      },
    ],
  },
];

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path
        d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ContactsPage() {
  const { t, tc } = useI18n();

  return (
    <main className="contacts-page">
      <div className="ct-wrap">
        <header className="ct-hero">
          <div className="ct-hero-text">
            <p className="ct-eyebrow">{t("contacts.eyebrow")}</p>
            <h1 className="ct-title">{t("contacts.title")}</h1>
            <p className="ct-lead">{t("contacts.lead")}</p>
          </div>

          <a className="ct-hero-call" href="tel:14">
            <PhoneIcon />
            <span>
              <small>{t("contacts.emergency")}</small>
              14
            </span>
          </a>
        </header>

        {GROUPS.map((group) => (
          <section key={group.id} className="ct-group" aria-labelledby={`ct-${group.id}`}>
            <div className="ct-group-head">
              <h2 id={`ct-${group.id}`}>{tc(group.title)}</h2>
              {group.urgent && (
                <span className="ct-badge">
                  <span className="ct-badge-dot" /> {t("contacts.priority")}
                </span>
              )}
            </div>
            <p className="ct-group-intro">{tc(group.intro)}</p>

            <ul className="ct-grid">
              {group.contacts.map((c) => (
                <li key={c.name} className={"ct-card" + (group.urgent ? " ct-card--urgent" : "")}>
                  <div className="ct-card-head">
                    <span className="ct-card-icon" aria-hidden="true">
                      {tc(c.name).charAt(0)}
                    </span>
                    <h3>{tc(c.name)}</h3>
                  </div>

                  <p className="ct-role">{tc(c.role)}</p>

                  <div className="ct-numbers">
                    {c.numbers.map((n) => (
                      <a
                        key={n.tel}
                        className="ct-call"
                        href={`tel:${n.tel}`}
                        aria-label={t("contacts.callAria", {
                          number: n.display,
                          name: tc(c.name),
                        })}
                      >
                        <PhoneIcon />
                        {n.display}
                      </a>
                    ))}
                  </div>

                  {c.note && <p className="ct-note">{tc(c.note)}</p>}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="ct-foot">
          {t("contacts.foot", { date: t("contacts.lastChecked") })}
        </p>
      </div>
    </main>
  );
}
