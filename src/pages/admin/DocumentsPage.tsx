import "./admin.css";
import { useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import { useAdmin } from "./adminStore";
import {
  formatFileSize,
  type AiDocument,
  type DocumentAudience,
  type DocumentCategory,
  type DocumentLanguage,
  type DocumentStatus,
} from "./adminData";
import {
  AdminActionMenu,
  AdminBadge,
  AdminEmpty,
  AdminField,
  AdminHero,
  AdminIcon,
  AdminModal,
  AdminModalActions,
  AdminProgress,
  AdminSearch,
  AdminToast,
  AdminToggle,
} from "./AdminUI";

const CATEGORIES: DocumentCategory[] = [
  "procedure",
  "plan",
  "consignes",
  "retour",
  "referentiel",
  "fiche",
];

const LANGUAGES: DocumentLanguage[] = ["fr", "ar", "en"];
const AUDIENCES: DocumentAudience[] = ["public", "agents", "admin"];

const STATUS_TONE: Record<DocumentStatus, "green" | "amber" | "slate"> = {
  indexed: "green",
  processing: "amber",
  draft: "slate",
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* ------------------------------------------------------------------ */
/* Aperçu                                                              */
/* ------------------------------------------------------------------ */

function DocumentPreviewModal({
  document: doc,
  onClose,
}: {
  document: AiDocument;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();

  return (
    <AdminModal title={t("admin.doc.previewTitle")} onClose={onClose}>
      <p className="ad-card__lead">{t("admin.doc.previewLead")}</p>

      <div className="ad-doc-preview__meta">
        <AdminBadge tone={STATUS_TONE[doc.status]}>
          {t(`admin.doc.status.${doc.status}`)}
        </AdminBadge>
        <AdminBadge tone={doc.published ? "green" : "slate"}>
          {t(
            doc.published
              ? "admin.doc.published"
              : "admin.doc.notPublished",
          )}
        </AdminBadge>
        <AdminBadge tone="blue">
          {t(`admin.doc.category.${doc.category}`)}
        </AdminBadge>
        <AdminBadge tone="slate">
          {t(`admin.doc.language.${doc.language}`)}
        </AdminBadge>
        <AdminBadge tone="violet">
          {t(`admin.doc.audience.${doc.audience}`)}
        </AdminBadge>
      </div>

      <h3>{doc.title}</h3>
      <p className="ad-muted">
        {t("admin.doc.owner")} · {doc.owner} —{" "}
        {t("admin.doc.uploaded")} {doc.updatedAt}
      </p>

      <p className="ad-section-title">{t("admin.doc.excerpt")}</p>
      <p className="ad-doc-preview__excerpt">{doc.excerpt}</p>

      <p className="ad-section-title">{t("admin.doc.tags")}</p>
      <div className="ad-role-card__perms">
        {doc.tags.length === 0 ? (
          <span className="ad-muted">{t("admin.doc.noTags")}</span>
        ) : (
          doc.tags.map((tag) => (
            <span key={tag} className="ad-tag">
              {tag}
            </span>
          ))
        )}
      </div>

      <div className="ad-detail-facts">
        <span className="ad-fact">
          <span>{t("admin.doc.version")}</span>
          <strong>{doc.version}</strong>
        </span>
        <span className="ad-fact">
          <span>{t("admin.doc.colSize")}</span>
          <strong>{formatFileSize(doc.sizeMb, lang)}</strong>
        </span>
        <span className="ad-fact">
          <span>{t("admin.doc.colChunks")}</span>
          <strong>{doc.chunks}</strong>
        </span>
        <span className="ad-fact">
          <span>{t("admin.doc.colLanguage")}</span>
          <strong>{t(`admin.doc.language.${doc.language}`)}</strong>
        </span>
      </div>
    </AdminModal>
  );
}

/* ------------------------------------------------------------------ */
/* Dépôt de document                                                   */
/* ------------------------------------------------------------------ */

function UploadModal({
  owners,
  onSave,
  onClose,
}: {
  owners: string[];
  onSave: (doc: Omit<AiDocument, "id" | "updatedAt">) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();

  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("procedure");
  const [language, setLanguage] = useState<DocumentLanguage>("fr");
  const [audience, setAudience] = useState<DocumentAudience>("agents");
  const [version, setVersion] = useState("v1.0");
  const [owner, setOwner] = useState(owners[0] ?? "");
  const [tags, setTags] = useState("");
  const [publishNow, setPublishNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (!fileName || !title.trim()) {
      setError(t("admin.doc.required"));
      return;
    }
    onSave({
      title: title.trim(),
      category,
      language,
      audience,
      version: version.trim() || "v1.0",
      sizeMb: 1.4,
      chunks: 0,
      status: "processing",
      published: publishNow,
      owner,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      excerpt:
        language === "ar"
          ? "وثيقة قيد الفهرسة من قبل المساعد الذكي."
          : "Document en cours d'indexation par l'assistant IA.",
    });
  }

  return (
    <AdminModal
      title={t("admin.doc.uploadTitle")}
      onClose={onClose}
      className="ad-modal--wide"
    >
      <p className="ad-card__lead">{t("admin.doc.uploadLead")}</p>

      <div className="ad-modal__form">
        <label
          className={`ad-upload-zone${dragOver ? " is-over" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            const file = event.dataTransfer.files?.[0];
            if (file) {
              setFileName(file.name);
              if (!title) {
                setTitle(file.name.replace(/\.[^.]+$/, ""));
              }
            }
          }}
        >
          <AdminIcon name="upload" />
          <strong>
            {fileName || t("admin.doc.dropTitle")}
          </strong>
          <span>{t("admin.doc.dropHint")}</span>
          <span className="ad-btn ad-btn--soft ad-btn--small">
            {t("admin.doc.browse")}
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setFileName(file.name);
                if (!title) {
                  setTitle(file.name.replace(/\.[^.]+$/, ""));
                }
              }
            }}
          />
        </label>

        <div className="ad-form-grid">
          <AdminField
            label={t("admin.doc.titleField")}
            htmlFor="doc-title"
            hint={fileName ? `${t("admin.doc.fileLabel")} · ${fileName}` : undefined}
          >
            <input
              id="doc-title"
              value={title}
              placeholder={t("admin.doc.titlePlaceholder")}
              onChange={(event) => setTitle(event.target.value)}
            />
          </AdminField>

          <AdminField
            label={t("admin.doc.categoryLabel")}
            htmlFor="doc-category"
          >
            <select
              id="doc-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as DocumentCategory)
              }
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {t(`admin.doc.category.${item}`)}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField
            label={t("admin.doc.languageLabel")}
            htmlFor="doc-language"
          >
            <select
              id="doc-language"
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as DocumentLanguage)
              }
            >
              {LANGUAGES.map((item) => (
                <option key={item} value={item}>
                  {t(`admin.doc.language.${item}`)}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField
            label={t("admin.doc.audienceLabel")}
            htmlFor="doc-audience"
          >
            <select
              id="doc-audience"
              value={audience}
              onChange={(event) =>
                setAudience(event.target.value as DocumentAudience)
              }
            >
              {AUDIENCES.map((item) => (
                <option key={item} value={item}>
                  {t(`admin.doc.audience.${item}`)}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField
            label={t("admin.doc.versionLabel")}
            hint={t("admin.doc.versionHint")}
            htmlFor="doc-version"
          >
            <input
              id="doc-version"
              value={version}
              placeholder="v1.0"
              onChange={(event) => setVersion(event.target.value)}
            />
          </AdminField>

          <AdminField label={t("admin.doc.owner")} htmlFor="doc-owner">
            <select
              id="doc-owner"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
            >
              {owners.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField
            label={t("admin.doc.tagsLabel")}
            htmlFor="doc-tags"
          >
            <input
              id="doc-tags"
              value={tags}
              placeholder={t("admin.doc.tagsPlaceholder")}
              onChange={(event) => setTags(event.target.value)}
            />
          </AdminField>
        </div>

        <AdminToggle
          checked={publishNow}
          onChange={setPublishNow}
          label={t("admin.doc.publishNow")}
        />

        {error && <p className="ad-modal__warning">{error}</p>}

        <AdminModalActions
          onClose={onClose}
          submitLabel={t("admin.doc.save")}
          submitType="button"
          onConfirm={handleSave}
        />
      </div>
    </AdminModal>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function DocumentsPage() {
  const { t, lang } = useI18n();
  const {
    state,
    addDocument,
    updateDocument,
    removeDocument,
    reindexDocument,
    reindexAll,
  } = useAdmin();

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [uploadModal, setUploadModal] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const indexed = state.documents.filter((doc) => doc.status === "indexed");
  const processing = state.documents.filter(
    (doc) => doc.status === "processing",
  );
  const drafts = state.documents.filter((doc) => doc.status === "draft");
  const published = state.documents.filter((doc) => doc.published);
  const tokens = state.documents.reduce(
    (total, doc) => total + doc.chunks * 120,
    0,
  );
  const coverage =
    state.documents.length === 0
      ? 0
      : Math.round((indexed.length / state.documents.length) * 100);
  const decree = state.documents.find((doc) =>
    doc.title.includes("19-59"),
  );

  const filteredDocuments = useMemo(() => {
    const needle = normalize(query.trim());
    return state.documents.filter((doc) => {
      const matchesQuery =
        !needle ||
        normalize(
          [doc.title, doc.owner, doc.excerpt, doc.version, ...doc.tags].join(
            " ",
          ),
        ).includes(needle);

      return (
        matchesQuery &&
        (categoryFilter === "all" || doc.category === categoryFilter) &&
        (languageFilter === "all" || doc.language === languageFilter) &&
        (audienceFilter === "all" || doc.audience === audienceFilter) &&
        (statusFilter === "all" || doc.status === statusFilter)
      );
    });
  }, [
    state.documents,
    query,
    categoryFilter,
    languageFilter,
    audienceFilter,
    statusFilter,
  ]);

  const previewDoc = previewId
    ? state.documents.find((doc) => doc.id === previewId)
    : undefined;
  const deleteDoc = deleteId
    ? state.documents.find((doc) => doc.id === deleteId)
    : undefined;

  const owners = Array.from(
    new Set(state.documents.map((doc) => doc.owner)),
  );

  function handleUpload(doc: Omit<AiDocument, "id" | "updatedAt">) {
    addDocument(doc);
    setUploadModal(false);
    setNotice(t("admin.doc.uploadDone"));
  }

  function togglePublished(doc: AiDocument) {
    if (!doc.published && doc.status !== "indexed") {
      setNotice(t("admin.doc.publishBlocked"));
      return;
    }
    updateDocument(doc.id, { published: !doc.published });
    setNotice(
      t(
        doc.published
          ? "admin.doc.unpublishedNotice"
          : "admin.doc.publishedNotice",
      ),
    );
  }

  function handleReindex(doc: AiDocument) {
    reindexDocument(doc.id);
    setNotice(t("admin.doc.reindexed"));
  }

  function handleDelete() {
    if (!deleteDoc) return;
    removeDocument(deleteDoc.id);
    setDeleteId(null);
    setNotice(t("admin.doc.deleted"));
  }

  function handleReindexAll() {
    reindexAll();
    setNotice(t("admin.doc.reindexNotice"));
  }

  function handleDecreeIndex() {
    if (!decree) return;
    reindexDocument(decree.id);
    setNotice(t("admin.doc.decreeIndexed"));
  }

  return (
    <main className="ad-page">
      <AdminHero
        eyebrow={t("admin.doc.eyebrow")}
        title={t("admin.doc.title")}
        lead={t("admin.doc.lead")}
        chips={
          <>
            <span className="ad-chip">
              <AdminIcon name="document" />
              {state.documents.length === 1
                ? t("admin.doc.docCountOne")
                : t("admin.doc.docCount", {
                    count: state.documents.length,
                  })}
            </span>
            <span className="ad-chip">
              <AdminIcon name="database" />
              {t("admin.doc.stats.docsHint", {
                count: published.length,
              })}
            </span>
            <span className="ad-chip ad-chip--ok">
              <AdminIcon name="check" />
              {t(
                indexed.length === 1
                  ? "admin.doc.readyCountOne"
                  : "admin.doc.readyCount",
                { count: indexed.length },
              )}
            </span>
          </>
        }
        actions={
          <>
            <button
              type="button"
              className="ad-btn ad-btn--green"
              onClick={() => setUploadModal(true)}
            >
              <AdminIcon name="upload" />
              {t("admin.doc.upload")}
            </button>
            <button
              type="button"
              className="ad-btn ad-btn--ghost"
              onClick={handleReindexAll}
            >
              <AdminIcon name="refresh" />
              {t("admin.doc.reindexAll")}
            </button>
          </>
        }
      />

      {notice && <AdminToast message={notice} />}

      <div className="ad-doc-layout">
        <section className="ad-card">
          <div className="ad-toolbar">
            <AdminSearch
              value={query}
              onChange={setQuery}
              placeholder={t("admin.doc.searchPlaceholder")}
              label={t("admin.doc.searchPlaceholder")}
            />

            <label className="ad-filter">
              <span>{t("admin.doc.colCategory")}</span>
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
              >
                <option value="all">
                  {t("admin.doc.allCategories")}
                </option>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {t(`admin.doc.category.${item}`)}
                  </option>
                ))}
              </select>
            </label>

            <label className="ad-filter">
              <span>{t("admin.doc.filterAudience")}</span>
              <select
                value={audienceFilter}
                onChange={(event) =>
                  setAudienceFilter(event.target.value)
                }
              >
                <option value="all">{t("admin.doc.allAudiences")}</option>
                {AUDIENCES.map((item) => (
                  <option key={item} value={item}>
                    {t(`admin.doc.audience.${item}`)}
                  </option>
                ))}
              </select>
            </label>

            <label className="ad-filter">
              <span>{t("admin.doc.colLanguage")}</span>
              <select
                value={languageFilter}
                onChange={(event) =>
                  setLanguageFilter(event.target.value)
                }
              >
                <option value="all">
                  {t("admin.doc.allLanguages")}
                </option>
                {LANGUAGES.map((item) => (
                  <option key={item} value={item}>
                    {t(`admin.doc.language.${item}`)}
                  </option>
                ))}
              </select>
            </label>

            <label className="ad-filter">
              <span>{t("admin.doc.colStatus")}</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{t("admin.doc.allStatuses")}</option>
                <option value="indexed">
                  {t("admin.doc.status.indexed")}
                </option>
                <option value="processing">
                  {t("admin.doc.status.processing")}
                </option>
                <option value="draft">
                  {t("admin.doc.status.draft")}
                </option>
              </select>
            </label>

            <span className="ad-toolbar__spacer" />
            <span className="ad-toolbar__count">
              {filteredDocuments.length === 1
                ? t("admin.doc.filteredCountOne")
                : t("admin.doc.filteredCount", {
                    count: filteredDocuments.length,
                  })}
            </span>
          </div>

          {filteredDocuments.length === 0 ? (
            <AdminEmpty
              title={t("admin.doc.empty")}
              text={t("admin.doc.emptyText")}
              action={
                <button
                  type="button"
                  className="ad-btn ad-btn--green ad-btn--small"
                  onClick={() => setUploadModal(true)}
                >
                  <AdminIcon name="upload" />
                  {t("admin.doc.upload")}
                </button>
              }
            />
          ) : (
            <div className="ad-table-wrap">
              <table className="ad-table ad-table--documents">
                <thead>
                  <tr>
                    <th>{t("admin.doc.colDocument")}</th>
                    <th>{t("admin.doc.colCategory")}</th>
                    <th>{t("admin.doc.colAudienceLang")}</th>
                    <th>{t("admin.doc.version")}</th>
                    <th>{t("admin.doc.colSizeChunks")}</th>
                    <th>{t("admin.doc.colStatus")}</th>
                    <th>{t("admin.doc.colUpdated")}</th>
                    <th>{t("admin.doc.colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <span className="ad-doc-cell">
                          <span className="ad-doc-cell__icon">
                            <AdminIcon name="document" />
                          </span>
                          <span className="ad-doc-cell__text">
                            <strong>{doc.title}</strong>
                            <span className="ad-doc-cell__tags">
                              {doc.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="ad-tag">
                                  {tag}
                                </span>
                              ))}
                              {doc.tags.length === 0 && (
                                <span className="ad-muted">
                                  {t("admin.doc.noTags")}
                                </span>
                              )}
                            </span>
                            <span
                              className={`ad-doc-cell__state${
                                doc.published ? " is-live" : ""
                              }`}
                            >
                              <AdminIcon
                                name={doc.published ? "eye" : "lock"}
                              />
                              {t(
                                doc.published
                                  ? "admin.doc.published"
                                  : "admin.doc.notPublished",
                              )}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td>
                        <AdminBadge tone="blue">
                          {t(`admin.doc.category.${doc.category}`)}
                        </AdminBadge>
                      </td>
                      <td>
                        <span className="ad-doc-meta">
                          <AdminBadge tone="violet">
                            {t(`admin.doc.audience.${doc.audience}`)}
                          </AdminBadge>
                          <AdminBadge tone="slate">
                            {t(`admin.doc.language.${doc.language}`)}
                          </AdminBadge>
                        </span>
                      </td>
                      <td className="ad-table__num">
                        <AdminBadge tone="slate">{doc.version}</AdminBadge>
                      </td>
                      <td>
                        <span className="ad-territory">
                          <strong>{formatFileSize(doc.sizeMb, lang)}</strong>
                          <span>
                            {t("admin.doc.chunksCount", {
                              count: doc.chunks,
                            })}
                          </span>
                        </span>
                      </td>
                      <td>
                        <AdminBadge tone={STATUS_TONE[doc.status]}>
                          {t(`admin.doc.status.${doc.status}`)}
                        </AdminBadge>
                      </td>
                      <td className="ad-table__num">{doc.updatedAt}</td>
                      <td>
                        <span className="ad-actions">
                          <button
                            type="button"
                            className="ad-icon-btn"
                            title={t("admin.doc.preview")}
                            aria-label={t("admin.doc.preview")}
                            onClick={() => setPreviewId(doc.id)}
                          >
                            <AdminIcon name="eye" />
                          </button>

                          <AdminActionMenu
                            label={t("admin.common.actions")}
                            items={[
                              {
                                id: "reindex",
                                label: t("admin.doc.reindex"),
                                icon: "refresh",
                                onSelect: () => handleReindex(doc),
                              },
                              {
                                id: "publish",
                                label: t(
                                  doc.published
                                    ? "admin.doc.unpublish"
                                    : "admin.doc.publish",
                                ),
                                icon: doc.published ? "lock" : "power",
                                onSelect: () => togglePublished(doc),
                              },
                              {
                                id: "delete",
                                label: t("admin.doc.delete"),
                                icon: "trash",
                                tone: "danger",
                                onSelect: () => setDeleteId(doc.id),
                              },
                            ]}
                          />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="ad-field__hint">{t("admin.doc.publishHint")}</p>
        </section>

        <div className="ad-doc-side">
          <section className="ad-card ad-card--accent">
            <div className="ad-assistant-head">
              <span className="ad-assistant-avatar">
                <AdminIcon name="sparkles" />
              </span>
              <span>
                <strong>{t("admin.doc.assistantTitle")}</strong>
                <span>{t("admin.doc.assistantStatus")}</span>
              </span>
            </div>

            <div className="ad-assistant-facts">
              <div>
                <dt>{t("admin.doc.lastIndex")}</dt>
                <dd>{t("admin.doc.lastIndexValue")}</dd>
              </div>
              <div>
                <dt>{t("admin.doc.version")}</dt>
                <dd>{t("admin.doc.versionValue")}</dd>
              </div>
              <div>
                <dt>{t("admin.doc.tokens")}</dt>
                <dd>
                  {new Intl.NumberFormat(
                    lang === "ar" ? "ar-DZ" : "fr-DZ",
                  ).format(tokens)}
                </dd>
              </div>
              <div>
                <dt>{t("admin.doc.documentsUsed")}</dt>
                <dd>
                  {indexed.filter((doc) => doc.published).length}/
                  {state.documents.length}
                </dd>
              </div>
            </div>

            <AdminProgress
              value={coverage}
              label={t("admin.doc.coverage")}
              valueLabel={t("admin.doc.coverageValue", {
                count: coverage,
              })}
              tone={coverage === 100 ? "green" : "amber"}
            />

            <p className="ad-inline-note">
              <AdminIcon name="alert" />
              {drafts.length + processing.length === 0
                ? t("admin.doc.gapOk")
                : t("admin.doc.gapText", {
                    drafts: drafts.length,
                    processing: processing.length,
                  })}
            </p>

            <button
              type="button"
              className="ad-btn ad-btn--green"
              onClick={handleReindexAll}
            >
              <AdminIcon name="refresh" />
              {t("admin.doc.syncNow")}
            </button>
          </section>

          <section className="ad-card ad-decree">
            <div className="ad-card__head">
              <div>
                <h2 className="ad-card__title">
                  {t("admin.doc.decreeTitle")}
                </h2>
                <p className="ad-card__lead">
                  {t("admin.doc.decreeLead")}
                </p>
              </div>
              <AdminIcon name="flag" />
            </div>

            {decree ? (
              <>
                <div className="ad-detail-facts">
                  <span className="ad-fact">
                    <span>{t("admin.doc.version")}</span>
                    <strong>{decree.version}</strong>
                  </span>
                  <span className="ad-fact">
                    <span>{t("admin.doc.colStatus")}</span>
                    <strong>{t(`admin.doc.status.${decree.status}`)}</strong>
                  </span>
                  <span className="ad-fact">
                    <span>{t("admin.doc.colChunks")}</span>
                    <strong>{decree.chunks}</strong>
                  </span>
                </div>
                <p className="ad-field__hint">
                  {t("admin.doc.decreeHint")}
                </p>
                <button
                  type="button"
                  className="ad-btn ad-btn--soft ad-btn--small"
                  onClick={handleDecreeIndex}
                >
                  <AdminIcon name="refresh" />
                  {t("admin.doc.decreeIndex")}
                </button>
              </>
            ) : (
              <p className="ad-inline-note ad-inline-note--warn">
                <AdminIcon name="alert" />
                {t("admin.doc.decreeMissing")}
              </p>
            )}
          </section>

          <section className="ad-card">
            <div className="ad-card__head">
              <div>
                <h2 className="ad-card__title">
                  {t("admin.doc.byCategory")}
                </h2>
                <p className="ad-card__lead">
                  {t("admin.doc.assistantHint")}
                </p>
              </div>
              <AdminIcon name="layers" />
            </div>

            <div className="ad-region-bars">
              {CATEGORIES.map((category) => {
                const count = state.documents.filter(
                  (doc) => doc.category === category,
                ).length;
                const max = Math.max(
                  1,
                  ...CATEGORIES.map(
                    (item) =>
                      state.documents.filter(
                        (doc) => doc.category === item,
                      ).length,
                  ),
                );
                return (
                  <div key={category} className="ad-region-bar">
                    <span className="ad-region-bar__label">
                      {t(`admin.doc.category.${category}`)}
                    </span>
                    <span className="ad-region-bar__track">
                      <span
                        className="ad-region-bar__fill"
                        style={{
                          width: `${Math.round((count / max) * 100)}%`,
                        }}
                      />
                    </span>
                    <span className="ad-region-bar__value">{count}</span>
                  </div>
                );
              })}
            </div>

            <p className="ad-field__hint">
              {drafts.length === 1
                ? t("admin.doc.draftCountOne")
                : t("admin.doc.draftCount", { count: drafts.length })}
            </p>
          </section>
        </div>
      </div>

      {uploadModal && (
        <UploadModal
          owners={owners}
          onSave={handleUpload}
          onClose={() => setUploadModal(false)}
        />
      )}

      {previewDoc && (
        <DocumentPreviewModal
          document={previewDoc}
          onClose={() => setPreviewId(null)}
        />
      )}

      {deleteDoc && (
        <AdminModal
          title={t("admin.doc.deleteTitle")}
          onClose={() => setDeleteId(null)}
        >
          <p>
            {t("admin.doc.deleteLead", { title: deleteDoc.title })}
          </p>
          <div className="ad-modal__actions">
            <button
              type="button"
              className="ad-btn ad-btn--soft"
              onClick={() => setDeleteId(null)}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="ad-btn ad-btn--danger"
              onClick={handleDelete}
            >
              {t("admin.doc.deleteConfirm")}
            </button>
          </div>
        </AdminModal>
      )}
    </main>
  );
}

export default DocumentsPage;
