import { Link } from "react-router";
import { useLandingCopy } from "../landingCopy";

export default function Risks() {
  const copy = useLandingCopy();
  const risks = copy.risks;

  return (
    <section className="risks" id="risques">
      <div className="wrap">
        <p className="eyebrow rv">{risks.eyebrow}</p>
        <h2 className="rv">{risks.title}</h2>
        <p className="allp rv">{risks.lead}</p>
        <div className="ridx" id="rl">
          {risks.items.map((name, i) => (
            <Link key={name} to="/consignes">
              <i>{String(i + 1).padStart(2, "0")}</i>
              <span>{name}</span>
            </Link>
          ))}
          <Link to="/consignes" className="all">
            <i>{risks.allLabel}</i>
            <span>{risks.allText}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
