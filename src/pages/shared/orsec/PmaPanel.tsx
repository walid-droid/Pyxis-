import { useI18n } from "../../../i18n";
import type { ModuleSnapshot } from "../../../services/model";
import { METRIC_KEYS, moduleMetric, pmaTriage } from "../../../services/orsec";

type PmaPanelProps = {
  snapshot?: ModuleSnapshot;
};

/**
 * Tableau de bord PMA / triage du module Santé (module 3) :
 * catégories couleur, lits de réanimation, réserve de sang et transferts.
 */
export default function PmaPanel({ snapshot }: PmaPanelProps) {
  const { lang, t } = useI18n();

  if (!snapshot) {
    return <p className="v3-empty">{t("orsec.pma.empty")}</p>;
  }

  const triage = pmaTriage(snapshot);
  const icu = moduleMetric(snapshot, METRIC_KEYS.icuBeds);
  const totalBeds = moduleMetric(snapshot, METRIC_KEYS.totalBeds);
  const blood = moduleMetric(snapshot, METRIC_KEYS.bloodBags);
  const transfers = moduleMetric(snapshot, METRIC_KEYS.transfers);

  const cells: Array<{ key: string; tone: string; value: number }> = [
    { key: "orsec.pma.red", tone: "red", value: triage.red },
    { key: "orsec.pma.yellow", tone: "amber", value: triage.yellow },
    { key: "orsec.pma.green", tone: "green", value: triage.green },
    { key: "orsec.pma.black", tone: "black", value: triage.black },
  ];

  return (
    <div className="v3-pma">
      <div className="v3-pma__grid">
        {cells.map((cell) => (
          <div key={cell.key} className={`v3-pma__cell v3-pma__cell--${cell.tone}`}>
            <span className="v3-pma__value">{cell.value}</span>
            <span className="v3-pma__label">{t(cell.key)}</span>
          </div>
        ))}
      </div>

      <div className="v3-cockpit__metrics">
        <div className="v3-metric">
          <span className="v3-metric__label">{t("orsec.pma.icu")}</span>
          <span className="v3-metric__value">
            {icu}
            <span className="v3-metric__unit">/ {totalBeds}</span>
          </span>
        </div>
        <div className="v3-metric">
          <span className="v3-metric__label">{t("orsec.pma.blood")}</span>
          <span className="v3-metric__value">{blood}</span>
        </div>
        <div className="v3-metric">
          <span className="v3-metric__label">{t("orsec.pma.transfers")}</span>
          <span className="v3-metric__value">{transfers}</span>
        </div>
        <div className="v3-metric">
          <span className="v3-metric__label">{t("orsec.pma.total")}</span>
          <span className="v3-metric__value">{triage.total}</span>
        </div>
      </div>

      {snapshot.note ? <p className="v3-note">{snapshot.note[lang]}</p> : null}
    </div>
  );
}
