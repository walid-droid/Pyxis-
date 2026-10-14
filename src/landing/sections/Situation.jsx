import { useRef, useState } from "react";
import { noop } from "../utils";

const TABS = ["Avant", "Pendant", "Après"];

const PANELS = [
  {
    title: "Se préparer",
    text: "Connaître les risques de sa commune, préparer un kit d'urgence, repérer les itinéraires et les lieux de mise à l'abri.",
    items: [
      "Consulter les zones à risque de ma commune",
      "Voir le plan d'évacuation de mon quartier",
      "Consulter les consignes de sécurité",
      "Signaler une personne vulnérable à protéger",
      "Créer un compte pour recevoir les alertes",
    ],
  },
  {
    title: "Se protéger et signaler",
    text: "Suivre les consignes des autorités, éviter les zones dangereuses et appeler les secours en cas d'urgence.",
    items: [
      "Signaler un incident avec une photo, ma position et une description",
      "Trouver l'abri ou l'établissement de santé le plus proche",
      "Consulter les alertes et communiqués officiels",
      "Suivre l'état de mon signalement",
    ],
  },
  {
    title: "Agir avec prudence",
    text: "Éviter les zones sinistrées, signaler les dangers persistants et suivre les consignes avant de rentrer chez soi.",
    items: [
      "Déclarer les dégâts de mon logement",
      "Signaler une personne disparue ou rechercher un proche",
      "Trouver un hébergement d'urgence",
      "Devenir bénévole et consulter les missions disponibles",
      "Faire un don",
    ],
  },
];

export default function Situation() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef([]);

  const onKeyDown = (e, i) => {
    const n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!n) return;
    e.preventDefault();
    const j = (i + n + TABS.length) % TABS.length;
    tabRefs.current[j]?.focus();
    setActive(j);
  };

  return (
    <section className="sit" id="sit">
      <div className="wrap">
        <div className="head">
          <p className="eyebrow rv">Les bons gestes</p>
          <h2 className="rv">Avant, pendant et après une catastrophe</h2>
          <p className="rv">
            Découvrez les gestes à adopter à chaque étape pour mieux vous protéger et protéger vos proches.
          </p>
        </div>
        <div className="tabs rv" data-a={active} role="tablist" aria-label="Avant, pendant, après">
          {TABS.map((label, i) => (
            <button
              key={label}
              ref={(el) => (tabRefs.current[i] = el)}
              role="tab"
              id={`t${i}`}
              type="button"
              aria-selected={active === i}
              aria-controls={`p${i}`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <small>{`0${i + 1}`}</small>
              {label}
            </button>
          ))}
          <i className="ind" />
        </div>
        {PANELS.map((p, i) => (
          <div
            key={p.title}
            className={"tp" + (active === i ? " on" : "")}
            role="tabpanel"
            id={`p${i}`}
            aria-labelledby={`t${i}`}
            hidden={active !== i}
          >
            <div className="tl2">
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
            <ul>
              {p.items.map((item, k) => (
                <li key={item} style={{ "--k": k }}>
                  <a href="#" onClick={noop}>{item}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
