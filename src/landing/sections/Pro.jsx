import { Link } from "react-router";
import { DASHBOARD_PATH } from "../../config";
import { noop } from "../utils";

const GROUPS = [
  ["Secours et sécurité", ["Protection civile", "Police", "Gendarmerie nationale"]],
  ["Prévention et environnement", ["Services des forêts", "Services techniques"]],
  ["Santé et solidarité", ["Établissements de santé", "Croissant-Rouge algérien", "Bénévoles autorisés"]],
  ["Autorités locales et coordination", ["Wali et cellule de crise", "Présidents d'APC"]],
  ["Institutions", ["Ministère de l'Intérieur", "DNRM"]],
  ["Ressources et sites sensibles", ["Services logistiques", "Sites industriels sensibles"]],
];

export default function Pro() {
  return (
    <section className="pro dark" id="pro">
      <div className="wrap pgrid">
        <div>
          <p className="eyebrow" style={{ color: "#999" }}>Espace professionnel</p>
          <h2 className="rv">Un espace commun pour coordonner les interventions</h2>
          <p className="rv">
            Les agents autorisés peuvent consulter les signalements, suivre leur traitement et partager les informations nécessaires à la coordination des interventions. Chaque action est enregistrée afin de faciliter le suivi des opérations.
          </p>
          <p className="rv">Les accès professionnels sont attribués et gérés par l'administrateur de la plateforme.</p>
          <Link className="btn wh rv" to={DASHBOARD_PATH}>Accéder à l'espace professionnel</Link>
        </div>
        <div>
          <p className="eyebrow" style={{ color: "#999" }}>Services concernés</p>
          <div className="svc rv">
            {GROUPS.map(([title, links]) => (
              <div className="sg" key={title}>
                <h3>{title}</h3>
                {links.map((l) => (
                  <a key={l} href="#" onClick={noop}>{l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
