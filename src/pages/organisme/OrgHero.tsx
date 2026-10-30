import type { ReactNode } from "react";
import { Link } from "react-router";
import { ORG_DASHBOARD_PATH } from "../../config";
import { useI18n } from "../../i18n";

type OrgHeroProps = {
  eyebrow: string;
  title: string;
  lead: string;
  chips?: ReactNode;
  aside?: ReactNode;
  backTo?: string;
};

/** En-tête commun aux pages de l'espace organisme. */
export default function OrgHero({
  eyebrow,
  title,
  lead,
  chips,
  aside,
  backTo = ORG_DASHBOARD_PATH,
}: OrgHeroProps) {
  const { t } = useI18n();

  return (
    <>
      <Link className="rc-back-link" to={backTo}>
        ← {t("common.back")}
      </Link>

      <section className="rc-hero rc-hero--compact">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="rc-hero__lead">{lead}</p>
          {chips ? <div className="rc-hero__meta">{chips}</div> : null}
        </div>
        {aside ? <div className="rc-hero__aside">{aside}</div> : null}
      </section>
    </>
  );
}
