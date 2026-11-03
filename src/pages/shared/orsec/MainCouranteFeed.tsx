import { roleName } from "../../../auth/roles";
import { useI18n } from "../../../i18n";
import type { MainCouranteEntry } from "../../../services/model";
import { useDb } from "../../../services/useDb";
import { formatDateTime, moduleLabel, userName } from "../v3/helpers";

const CATEGORY_TONE: Record<string, string> = {
  alerte: "red",
  operation: "blue",
  victime: "amber",
  moyen: "brand",
  decision: "green",
  communication: "blue",
  rehabilitation: "green",
};

type MainCouranteFeedProps = {
  entries: MainCouranteEntry[];
  limit?: number;
  emptyKey?: string;
};

/**
 * Fil append-only de la main courante ORSEC : chaque entrée affiche son
 * auteur, son périmètre, son statut de synchronisation et l'empreinte de
 * chaînage qui la rend auditables.
 */
export default function MainCouranteFeed({
  entries,
  limit,
  emptyKey = "orsec.mc.empty",
}: MainCouranteFeedProps) {
  const { lang, t } = useI18n();
  const db = useDb();
  const rows = limit ? entries.slice(0, limit) : entries;

  if (rows.length === 0) {
    return <p className="v3-empty">{t(emptyKey)}</p>;
  }

  return (
    <ol className="v3-timeline">
      {rows.map((entry) => (
        <li key={entry.id} className="v3-timeline__item">
          <span
            className={`v3-timeline__marker v3-timeline__marker--${
              CATEGORY_TONE[entry.category] ?? "brand"
            }`}
            aria-hidden="true"
          />
          <div className="v3-timeline__body">
            <div className="v3-timeline__head">
              <span className={`v3-badge v3-badge--${CATEGORY_TONE[entry.category] ?? "brand"}`}>
                {t(`orsec.mc.category.${entry.category}`)}
              </span>
              <span className="v3-badge">{t(`orsec.mc.scope.${entry.scope}`)}</span>
              {entry.moduleId ? (
                <span className="v3-badge">{moduleLabel(db, entry.moduleId, lang)}</span>
              ) : null}
              <span
                className={`v3-badge ${
                  entry.syncStatus === "synced" ? "v3-badge--green" : "v3-badge--amber"
                }`}
              >
                {t(`orsec.mc.sync.${entry.syncStatus}`)}
              </span>
            </div>
            <p className="v3-timeline__message">{entry.message[lang]}</p>
            <p className="v3-timeline__meta">
              {userName(db, entry.authorId, lang)} · {roleName(entry.role, lang)} ·{" "}
              {formatDateTime(entry.at, lang)}
            </p>
            <p className="v3-timeline__hash" title={entry.hash}>
              {t("orsec.mc.chain", { hash: entry.hash.slice(0, 8) })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
