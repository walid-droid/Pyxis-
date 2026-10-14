import { noop } from "../utils";

const RISKS = [
  "Séisme",
  "Inondation",
  "Incendie de forêt",
  "Glissement de terrain",
  "Canicule",
  "Vents violents et tempêtes de sable",
  "Vague de froid",
  "Accident industriel",
];

export default function Risks() {
  return (
    <section className="risks" id="risques">
      <div className="wrap">
        <p className="eyebrow rv">Consignes de sécurité</p>
        <h2 className="rv">Que faire en cas de catastrophe ?</h2>
        <p className="allp rv">
          Séisme, inondation, incendie… Consultez les consignes à suivre pour savoir comment vous protéger et protéger vos proches.
        </p>
        <div className="ridx" id="rl">
          {RISKS.map((name, i) => (
            <a key={name} href="#" onClick={noop}>
              <i>{String(i + 1).padStart(2, "0")}</i>
              <span>{name}</span>
            </a>
          ))}
          <a href="#" className="all" onClick={noop}>
            <i>Tous</i>
            <span>Voir tous les risques et les consignes de sécurité</span>
          </a>
        </div>
      </div>
    </section>
  );
}
