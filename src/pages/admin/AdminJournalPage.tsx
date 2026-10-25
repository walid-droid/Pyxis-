import "./admin.css";
import { useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import { useAdmin } from "./adminStore";
import {
  ACTIVITY_CATEGORIES,
  formatDateTime,
  type ActivityCategory,
  type ActivityEntry,
  type ActivityTone,
} from "./adminData";
import {
  AdminBadge,
  AdminEmpty,
  AdminHero,
  AdminIcon,
  AdminSearch,
  AdminSortHeader,
  AdminToast,
  type IconName,
  type SortDirection,
} from "./AdminUI";

type SortKey = "at" | "author" | "category";

const PAGE_SIZE = 12;

const TONE_BADGE: Record<ActivityTone, "green" | "amber" | "red" | "blue" | "violet" | "slate"> = {
  green: "green",
  amber: "amber",
  red: "red",
  blue: "blue",
  violet: "violet",
  slate: "slate",
};

function activityIcon(tone: ActivityTone): IconName {
  if (tone === "red") return "alert";
  if (tone === "amber") return "settings";
  if (tone === "violet") return "layers";
  if (tone === "blue") return "document";
  return "check";
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function downloadCsv(name: string, rows: (string | number)[][]) {
  const content = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob(["\uFEFF", content], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Journal complet des actions d'administration. */
function AdminJournalPage() {
  const { t, lang } = useI18n();
  const { state } = useAdmin();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ActivityCategory | "all">("all");
  const [author, setAuthor] = useState("all");
  const [now] = useState(() => Date.now());
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDirection }>({
    key: "at",
    dir: "desc",
  });
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);

  const authors = useMemo(
    () =>
      Array.from(new Set(state.activity.map((entry) => entry.author))).sort(
        (a, b) => a.localeCompare(b, lang),
      ),
    [state.activity, lang],
  );

  const normalizedQuery = normalize(query.trim());

  const filtered = useMemo(
    () =>
      state.activity.filter((entry) => {
        if (category !== "all" && entry.category !== category) return false;
        if (author !== "all" && entry.author !== author) return false;
        if (!normalizedQuery) return true;
        const haystack = normalize(
          [
            t(entry.actionKey, {
              target: entry.target.startsWith("admin.")
                ? t(entry.target)
                : entry.target,
            }),
            entry.target,
            entry.author,
            entry.detail ?? "",
            t(`admin.journal.category.${entry.category}`),
          ].join(" "),
        );
        return haystack.includes(normalizedQuery);
      }),
    [state.activity, category, author, normalizedQuery, t],
  );

  const sorted = useMemo(() => {
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.key === "author") {
        return a.author.localeCompare(b.author, lang) * factor;
      }
      if (sort.key === "category") {
        return (
          a.category.localeCompare(b.category, lang) * factor ||
          b.at - a.at
        );
      }
      return (a.at - b.at) * factor;
    });
  }, [filtered, sort, lang]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const todayCount = state.activity.filter(
    (entry) => now - entry.at < 24 * 60 * 60 * 1000,
  ).length;
  const sensitiveCount = state.activity.filter(
    (entry) => entry.category === "security" || entry.tone === "red",
  ).length;

  function targetLabel(entry: ActivityEntry): string {
    return entry.target.startsWith("admin.") ? t(entry.target) : entry.target;
  }

  function actionLabel(entry: ActivityEntry): string {
    return t(entry.actionKey, {
      target: targetLabel(entry),
    });
  }

  function updateSort(key: SortKey) {
    setPage(1);
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "at" ? "desc" : "asc" },
    );
  }

  function exportCsv() {
    downloadCsv("cadm-journal.csv", [
      [
        "horodatage",
        "action",
        "cible",
        "auteur",
        "categorie",
        "motif",
      ],
      ...sorted.map((entry) => [
        formatDateTime(entry.at, lang),
        actionLabel(entry),
        targetLabel(entry),
        entry.author,
        t(`admin.journal.category.${entry.category}`),
        entry.detail ?? "",
      ]),
    ]);
    setNotice(t("admin.journal.exportDone"));
  }

  return (
    <main className="ad-page">
      <AdminHero
        eyebrow={t("admin.journal.eyebrow")}
        title={t("admin.journal.title")}
        lead={t("admin.journal.lead")}
        chips={
          <>
            <span className="ad-chip">
              <AdminIcon name="activity" />
              {t("admin.journal.chip.entries", {
                count: state.activity.length,
              })}
            </span>
            <span className="ad-chip ad-chip--ok">
              <AdminIcon name="clock" />
              {t("admin.journal.chip.today", { count: todayCount })}
            </span>
            <span className="ad-chip ad-chip--warn">
              <AdminIcon name="shield" />
              {t("admin.journal.chip.sensitive", { count: sensitiveCount })}
            </span>
          </>
        }
        actions={
          <button
            type="button"
            className="ad-btn ad-btn--green"
            onClick={exportCsv}
          >
            <AdminIcon name="download" />
            {t("admin.journal.export")}
          </button>
        }
      />

      {notice && <AdminToast message={notice} />}

      <p className="ad-inline-note">
        <AdminIcon name="lock" />
        {t("admin.journal.retention")}
      </p>

      <section className="ad-card">
        <div className="ad-toolbar">
          <AdminSearch
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder={t("admin.journal.searchPlaceholder")}
            label={t("admin.journal.filtersAria")}
          />

          <label className="ad-filter">
            <span>{t("admin.journal.filterCategory")}</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as ActivityCategory | "all");
                setPage(1);
              }}
            >
              <option value="all">{t("admin.journal.allCategories")}</option>
              {ACTIVITY_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {t(`admin.journal.category.${item}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="ad-filter">
            <span>{t("admin.journal.filterAuthor")}</span>
            <select
              value={author}
              onChange={(event) => {
                setAuthor(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">{t("admin.journal.allAuthors")}</option>
              {authors.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <span className="ad-toolbar__spacer" />
          <span className="ad-toolbar__count">
            {filtered.length === 1
              ? t("admin.journal.countOne")
              : t("admin.journal.count", { count: filtered.length })}
          </span>
        </div>

        {filtered.length === 0 ? (
          <AdminEmpty
            title={t("admin.journal.empty")}
            text={t("admin.journal.emptyText")}
            action={
              <button
                type="button"
                className="ad-btn ad-btn--soft ad-btn--small"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setAuthor("all");
                }}
              >
                <AdminIcon name="refresh" />
                {t("admin.journal.reset")}
              </button>
            }
          />
        ) : (
          <>
            <div className="ad-table-wrap">
              <table className="ad-table ad-table--journal">
                <thead>
                  <tr>
                    <AdminSortHeader
                      label={t("admin.journal.colWhen")}
                      active={sort.key === "at"}
                      direction={sort.dir}
                      onClick={() => updateSort("at")}
                    />
                    <th>{t("admin.journal.colAction")}</th>
                    <AdminSortHeader
                      label={t("admin.journal.colAuthor")}
                      active={sort.key === "author"}
                      direction={sort.dir}
                      onClick={() => updateSort("author")}
                    />
                    <AdminSortHeader
                      label={t("admin.journal.colCategory")}
                      active={sort.key === "category"}
                      direction={sort.dir}
                      onClick={() => updateSort("category")}
                    />
                    <th>{t("admin.journal.colDetail")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((entry) => (
                    <tr key={entry.id}>
                      <td className="ad-table__num">
                        <span className="ad-journal__when">
                          {formatDateTime(entry.at, lang)}
                        </span>
                      </td>
                      <td>
                        <span className="ad-journal__action">
                          <span
                            className={`ad-activity__icon ad-activity__icon--${entry.tone}`}
                          >
                            <AdminIcon name={activityIcon(entry.tone)} />
                          </span>
                          <span>
                            <strong>{actionLabel(entry)}</strong>
                            <span>{targetLabel(entry)}</span>
                          </span>
                        </span>
                      </td>
                      <td>{entry.author}</td>
                      <td>
                        <AdminBadge tone={TONE_BADGE[entry.tone]}>
                          {t(`admin.journal.category.${entry.category}`)}
                        </AdminBadge>
                      </td>
                      <td>
                        {entry.detail ? (
                          <span className="ad-journal__detail">
                            {entry.detail}
                          </span>
                        ) : (
                          <span className="ad-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pageCount > 1 && (
              <div className="ad-pagination">
                <span className="ad-toolbar__count">
                  {t("admin.journal.page", {
                    page: safePage,
                    total: pageCount,
                  })}
                </span>
                <span className="ad-pagination__pages">
                  <button
                    type="button"
                    className="ad-page-btn"
                    disabled={safePage === 1}
                    onClick={() => setPage(safePage - 1)}
                  >
                    <AdminIcon name="arrow" />
                  </button>
                  {Array.from(
                    { length: pageCount },
                    (_, index) => index + 1,
                  ).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`ad-page-btn${
                        value === safePage ? " is-active" : ""
                      }`}
                      aria-current={value === safePage ? "page" : undefined}
                      onClick={() => setPage(value)}
                    >
                      {value}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="ad-page-btn"
                    disabled={safePage === pageCount}
                    onClick={() => setPage(safePage + 1)}
                  >
                    <AdminIcon name="arrow" />
                  </button>
                </span>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default AdminJournalPage;
