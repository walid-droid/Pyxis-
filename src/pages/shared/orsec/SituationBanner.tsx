import { useI18n } from "../../../i18n";
import type { SessionScope } from "../../../services/model";
import { currentSituation } from "../../../services/situation";
import { useDb } from "../../../services/useDb";
import { useSessionScope } from "../../../services/useSessionScope";
import { formatDateTime, territoryLabel } from "../v3/helpers";

/** Bandeau de situation A–E, visible dans les espaces de commandement. */
export default function SituationBanner({ scope }: { scope?: SessionScope | null }) {
  const { lang, t } = useI18n();
  const db = useDb();
  const sessionScope = useSessionScope();
  const activeScope = scope ?? sessionScope;

  if (!activeScope) return null;
  const { code, plan, since, transition } = currentSituation(db, activeScope);

  return (
    <div className={`v3-situation v3-situation--${code.toLowerCase()}`} role="status">
      <span className="v3-situation__code" aria-hidden="true">
        {code}
      </span>
      <div className="v3-situation__body">
        <p className="v3-situation__title">
          {t("situation.current")} · {t(`situation.${code}.label`)}
        </p>
        <p className="v3-situation__meta">
          {plan
            ? [
                t(`authority.plans.level.${plan.niveau}`),
                territoryLabel(db, plan.territoireId, lang),
                since ? `${t("situation.since")} ${formatDateTime(since, lang)}` : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : t("situation.none")}
        </p>
      </div>
      {transition ? (
        <span className="v3-situation__proof">
          {t("situation.sealed")} #{transition.signatureHash.slice(0, 8)}
        </span>
      ) : null}
    </div>
  );
}
