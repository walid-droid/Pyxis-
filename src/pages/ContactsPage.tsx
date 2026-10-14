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
const LAST_CHECKED = "octobre 2026";

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

export default function ContactsPage() {
  return (
    <main className="contacts-page">
      <div className="ct-wrap">
        <p className="ct-eyebrow">Contacts</p>
        <h1 className="ct-title">Numéros d'urgence en Algérie</h1>
        <p className="ct-lead">
          En cas de danger immédiat, appelez d'abord les secours. Touchez un numéro pour lancer l'appel depuis votre
          téléphone.
        </p>

        {GROUPS.map((group) => (
          <section key={group.id} className="ct-group" aria-labelledby={`ct-${group.id}`}>
            <h2 id={`ct-${group.id}`}>{group.title}</h2>
            <p className="ct-group-intro">{group.intro}</p>
            <ul className="ct-grid">
              {group.contacts.map((c) => (
                <li key={c.name} className={"ct-card" + (group.urgent ? " ct-card--urgent" : "")}>
                  <h3>{c.name}</h3>
                  <p>{c.role}</p>
                  <div className="ct-numbers">
                    {c.numbers.map((n) => (
                      <a
                        key={n.tel}
                        className="ct-call"
                        href={`tel:${n.tel}`}
                        aria-label={`Appeler le ${n.display} (${c.name})`}
                      >
                        {n.display}
                      </a>
                    ))}
                  </div>
                  {c.note && <p className="ct-note">{c.note}</p>}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="ct-foot">
          Liste vérifiée en {LAST_CHECKED} à partir de sources de presse algériennes. Les numéros peuvent changer : en
          cas de doute, appelez le 14 ou le 17. Cette page ne remplace pas l'appel aux secours.
        </p>
      </div>
    </main>
  );
}
