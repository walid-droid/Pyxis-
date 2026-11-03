import { useI18n } from "../../../i18n";
import type { ModuleStatusRow } from "../../../services/orsec";
import { moduleStatusLabelKey } from "../../../services/orsec";
import { formatDateTime } from "../v3/helpers";

const STATUS_TONE: Record<string, string> = {
  operationnel: "green",
  sature: "red",
  hors_service: "red",
  non_mobilise: "amber",
};

type ModuleStatusGridProps = {
  rows: ModuleStatusRow[];
  highlightModuleId?: string;
  compact?: boolean;
};

/** Grille des 13 modules ORSEC : statut, effectif engagé et dernier rapport. */
export default function ModuleStatusGrid({
  rows,
  highlightModuleId,
  compact = false,
}: ModuleStatusGridProps) {
  const { lang, t } = useI18n();

  return (
    <div className={`v3-module-grid${compact ? " v3-module-grid--compact" : ""}`}>
      {rows.map((row) => (
        <article
          key={row.module.id}
          className={`v3-module-card${
            row.module.id === highlightModuleId ? " is-highlighted" : ""
          }`}
        >
          <header className="v3-module-card__head">
            <span className="v3-module-card__no">{row.module.no}</span>
            <h3 className="v3-module-card__title">{row.module.nom[lang]}</h3>
          </header>
          <span className={`v3-badge v3-badge--${STATUS_TONE[row.status] ?? "amber"}`}>
            {t(moduleStatusLabelKey(row.status))}
          </span>
          {!compact ? (
            <>
              <div className="v3-module-card__meta">
                <span>
                  {t("orsec.modules.staff")} : {row.snapshot?.effectifEngage ?? 0}
                </span>
                <span>
                  {t("orsec.modules.dispo")} : {row.snapshot?.effectifDisponible ?? 0}
                </span>
              </div>
              <p className="v3-module-card__report">
                {t("orsec.modules.lastReport")} :{" "}
                {row.snapshot?.dernierRapportLe
                  ? formatDateTime(row.snapshot.dernierRapportLe, lang)
                  : t("orsec.modules.noReport")}
              </p>
            </>
          ) : null}
        </article>
      ))}
    </div>
  );
}
