import type { ReactNode } from "react";
import { Link } from "react-router";
import { useI18n } from "../../../i18n";
import "./ops.css";

type Props = {
  eyebrow?: string;
  title: string;
  lead: string;
  chips?: ReactNode;
  actions?: ReactNode;
  backTo?: string;
};

export default function OpsHero({
  eyebrow,
  title,
  lead,
  chips,
  actions,
  backTo,
}: Props) {
  const { t } = useI18n();
  return (
    <>
      {backTo ? (
        <Link className="rc-back-link" to={backTo}>
          ← {t("common.back")}
        </Link>
      ) : null}
      <header className="ops-hero">
        {eyebrow ? <p className="ops-hero__eyebrow">{eyebrow}</p> : null}
        <h1 className="ops-hero__title">{title}</h1>
        <p className="ops-hero__lead">{lead}</p>
        <div className="ops-hero__row">
          <div className="ops-hero__chips">{chips}</div>
          <div className="ops-hero__actions">{actions}</div>
        </div>
      </header>
    </>
  );
}
