import "./admin.css";
import { useMemo, useState } from "react";
import StatCard from "../../components/StatCard";
import { useI18n } from "../../i18n";
import { useAdmin } from "./adminStore";
import {
  REGION_KEYS,
  TERRITORY_DATA_SOURCE,
  formatPopulation,
  type Commune,
  type Wilaya,
} from "./adminData";
import {
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

type WilayaDraft = Pick<Wilaya, "code" | "name" | "nameAr" | "region">;
type CommuneDraft = Pick<
  Commune,
  "name" | "nameAr" | "population" | "active" | "apcPresident"
>;

type ImportRow = {
  wilayaCode: string;
  wilayaName: string;
  wilayaNameAr: string;
  region: string;
  communeName: string;
  communeNameAr: string;
  population: number;
};

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob(["\uFEFF", content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Formulaire wilaya                                                   */
/* ------------------------------------------------------------------ */

function WilayaModal({
  takenCodes,
  onSave,
  onClose,
}: {
  takenCodes: string[];
  onSave: (draft: WilayaDraft) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [region, setRegion] = useState<string>(REGION_KEYS[0]);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!name.trim() || !code.trim()) {
      setError(t("admin.terr.required"));
      return;
    }
    if (takenCodes.includes(code.trim())) {
      setError(t("admin.terr.codeTaken"));
      return;
    }
    onSave({
      code: code.trim(),
      name: name.trim(),
      nameAr: nameAr.trim() || name.trim(),
      region,
    });
  }

  return (
    <AdminModal
      title={t("admin.terr.addWilayaTitle")}
      onClose={onClose}
      className="ad-modal--wide"
    >
      <p className="ad-card__lead">{t("admin.terr.addWilayaLead")}</p>

      <div className="ad-modal__form">
        <div className="ad-form-grid">
          <AdminField label={t("admin.terr.code")} htmlFor="wilaya-code">
            <input
              id="wilaya-code"
              value={code}
              placeholder="ex. 06"
              onChange={(event) => setCode(event.target.value)}
            />
          </AdminField>

          <AdminField label={t("admin.terr.region")} htmlFor="wilaya-region">
            <select
              id="wilaya-region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              {REGION_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t(`admin.terr.region.${key}`)}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField label={t("admin.terr.name")} htmlFor="wilaya-name">
            <input
              id="wilaya-name"
              value={name}
              placeholder="ex. Béjaïa"
              onChange={(event) => setName(event.target.value)}
            />
          </AdminField>

          <AdminField label={t("admin.terr.nameAr")} htmlFor="wilaya-name-ar">
            <input
              id="wilaya-name-ar"
              value={nameAr}
              placeholder="مثال: بجاية"
              dir="rtl"
              onChange={(event) => setNameAr(event.target.value)}
            />
          </AdminField>
        </div>

        {error && <p className="ad-modal__warning">{error}</p>}

        <AdminModalActions
          onClose={onClose}
          submitLabel={t("admin.terr.createWilaya")}
          submitType="button"
          onConfirm={handleSubmit}
        />
      </div>
    </AdminModal>
  );
}

/* ------------------------------------------------------------------ */
/* Désignation du wali                                                 */
/* ------------------------------------------------------------------ */

function WaliModal({
  wilayaName,
  current,
  onSave,
  onClose,
}: {
  wilayaName: string;
  current: string | null;
  onSave: (name: string | null) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(current ?? "");

  return (
    <AdminModal
      title={t("admin.terr.waliModalTitle")}
      onClose={onClose}
      className="ad-modal--wide"
    >
      <p className="ad-card__lead">
        {t("admin.terr.waliModalLead", { wilaya: wilayaName })}
      </p>

      <div className="ad-modal__form">
        <AdminField
          label={t("admin.terr.waliName")}
          hint={t("admin.terr.waliVacantHint")}
          htmlFor="wali-name"
        >
          <input
            id="wali-name"
            value={name}
            placeholder={t("admin.terr.waliPlaceholder")}
            onChange={(event) => setName(event.target.value)}
          />
        </AdminField>

        {name.trim() ? (
          <p className="ad-inline-note">
            <AdminIcon name="userCheck" />
            {t("admin.terr.waliAssignedNote")}
          </p>
        ) : (
          <p className="ad-inline-note ad-inline-note--warn">
            <AdminIcon name="alert" />
            {t("admin.terr.waliVacantNote")}
          </p>
        )}

        <AdminModalActions
          onClose={onClose}
          submitLabel={t("admin.terr.saveWali")}
          submitType="button"
          onConfirm={() => onSave(name.trim() || null)}
        />
      </div>
    </AdminModal>
  );
}

/* ------------------------------------------------------------------ */
/* Formulaire commune                                                  */
/* ------------------------------------------------------------------ */

function CommuneModal({
  commune,
  wilayaName,
  takenNames,
  onSave,
  onClose,
}: {
  commune?: Commune;
  wilayaName: string;
  takenNames: string[];
  onSave: (draft: CommuneDraft) => void;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const [name, setName] = useState(commune?.name ?? "");
  const [nameAr, setNameAr] = useState(commune?.nameAr ?? "");
  const [population, setPopulation] = useState(
    commune ? String(commune.population) : "",
  );
  const [apcPresident, setApcPresident] = useState(
    commune?.apcPresident ?? "",
  );
  const [active, setActive] = useState(commune?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!name.trim()) {
      setError(t("admin.terr.required"));
      return;
    }
    if (
      takenNames.some(
        (item) => item.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      setError(t("admin.terr.codeTaken"));
      return;
    }
    onSave({
      name: name.trim(),
      nameAr: nameAr.trim() || name.trim(),
      population: Math.max(0, Number(population) || 0),
      active,
      apcPresident: apcPresident.trim() || null,
    });
  }

  return (
    <AdminModal
      title={t(
        commune
          ? "admin.terr.editCommuneTitle"
          : "admin.terr.addCommuneTitle",
      )}
      onClose={onClose}
      className="ad-modal--wide"
    >
      <p className="ad-card__lead">
        {t(
          commune
            ? "admin.terr.editCommuneLead"
            : "admin.terr.addCommuneLead",
        )}
      </p>

      {!commune && (
        <p className="ad-inline-note">
          <AdminIcon name="map" />
          {t("admin.terr.addCommuneFor", { wilaya: wilayaName })}
        </p>
      )}

      <div className="ad-modal__form">
        <div className="ad-form-grid">
          <AdminField label={t("admin.terr.name")} htmlFor="commune-name">
            <input
              id="commune-name"
              value={name}
              placeholder="ex. Akbou"
              onChange={(event) => setName(event.target.value)}
            />
          </AdminField>

          <AdminField label={t("admin.terr.nameAr")} htmlFor="commune-name-ar">
            <input
              id="commune-name-ar"
              value={nameAr}
              placeholder="مثال: أقبو"
              dir="rtl"
              onChange={(event) => setNameAr(event.target.value)}
            />
          </AdminField>

          <AdminField
            label={t("admin.terr.populationLabel")}
            htmlFor="commune-population"
            hint={lang === "ar" ? undefined : t("admin.terr.populationHint")}
          >
            <input
              id="commune-population"
              type="number"
              min="0"
              value={population}
              placeholder="ex. 52000"
              onChange={(event) => setPopulation(event.target.value)}
            />
          </AdminField>

          <AdminField
            label={t("admin.terr.apcPresident")}
            htmlFor="commune-apc"
            hint={t("admin.terr.apcHint")}
          >
            <input
              id="commune-apc"
              value={apcPresident}
              placeholder={t("admin.terr.apcPlaceholder")}
              onChange={(event) => setApcPresident(event.target.value)}
            />
          </AdminField>

          <AdminField
            label={t("admin.terr.statusLabel")}
            htmlFor="commune-active"
          >
            <AdminToggle
              checked={active}
              onChange={setActive}
              label={
                active
                  ? t("admin.terr.active")
                  : t("admin.terr.inactive")
              }
            />
          </AdminField>
        </div>

        {error && <p className="ad-modal__warning">{error}</p>}

        <AdminModalActions
          onClose={onClose}
          submitLabel={t(
            commune
              ? "admin.terr.saveCommune"
              : "admin.terr.createCommune",
          )}
          submitType="button"
          onConfirm={handleSubmit}
        />
      </div>
    </AdminModal>
  );
}

/* ------------------------------------------------------------------ */
/* Import du référentiel CSV                                           */
/* ------------------------------------------------------------------ */

function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseTerritoryCsv(
  text: string,
): { rows: ImportRow[] } | { error: string } {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return { error: "empty" };

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const first = splitCsvLine(lines[0], delimiter).map((cell) =>
    cell.toLowerCase(),
  );
  const hasHeader = first.some((cell) => cell.includes("wilaya"));
  const body = hasHeader ? lines.slice(1) : lines;

  const rows: ImportRow[] = [];

  body.forEach((line, index) => {
    const cells = splitCsvLine(line, delimiter);
    if (cells.length < 4) return;
    const [
      wilayaCode,
      wilayaName,
      wilayaNameAr,
      region,
      communeName,
      communeNameAr,
      population,
    ] = cells;

    if (!wilayaCode || !wilayaName || !communeName) {
      throw new Error(`line:${index + (hasHeader ? 2 : 1)}`);
    }

    const normalizedCode = /^\d{1,2}$/.test(wilayaCode)
      ? wilayaCode.padStart(2, "0")
      : wilayaCode;

    rows.push({
      wilayaCode: normalizedCode,
      wilayaName,
      wilayaNameAr: wilayaNameAr || wilayaName,
      region: REGION_KEYS.includes(region as (typeof REGION_KEYS)[number])
        ? region
        : "north",
      communeName,
      communeNameAr: communeNameAr || communeName,
      population: Math.max(0, Number(population) || 0),
    });
  });

  return { rows };
}

function ImportModal({
  onImport,
  onClose,
}: {
  onImport: (text: string) => string | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    try {
      const content = await file.text();
      setText(content);
      setError(null);
    } catch {
      setError(t("admin.terr.importReadError"));
    }
  }

  return (
    <AdminModal
      title={t("admin.terr.importTitle")}
      onClose={onClose}
      className="ad-modal--wide"
    >
      <p className="ad-card__lead">{t("admin.terr.importLead")}</p>

      <p className="ad-inline-note">
        <AdminIcon name="database" />
        {t("admin.terr.importFormat")}
      </p>

      <div className="ad-modal__form">
        <AdminField
          label={t("admin.terr.importFile")}
          hint={t("admin.terr.importFileHint")}
          htmlFor="terr-import-file"
        >
          <input
            id="terr-import-file"
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </AdminField>

        <AdminField
          label={t("admin.terr.importPaste")}
          htmlFor="terr-import-text"
        >
          <textarea
            id="terr-import-text"
            value={text}
            placeholder={t("admin.terr.importPlaceholder")}
            onChange={(event) => {
              setText(event.target.value);
              setError(null);
            }}
          />
        </AdminField>

        {error && <p className="ad-modal__warning">{error}</p>}

        <AdminModalActions
          onClose={onClose}
          submitLabel={t("admin.terr.importAction")}
          submitType="button"
          disabled={!text.trim()}
          onConfirm={() => {
            const failure = onImport(text);
            if (failure) setError(failure);
          }}
        />
      </div>
    </AdminModal>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function TerritoriesPage() {
  const {
    state,
    addWilaya,
    addCommune,
    updateWilaya,
    updateCommune,
  } = useAdmin();
  const { t, lang } = useI18n();

  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [wilayaModal, setWilayaModal] = useState(false);
  const [waliModal, setWaliModal] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [communeModal, setCommuneModal] = useState<{
    wilayaCode: string;
    communeId?: string;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const normalizedQuery = query
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const filteredWilayas = useMemo(() => {
    if (!normalizedQuery) return state.wilayas;
    return state.wilayas.filter((wilaya) => {
      const haystack = [
        wilaya.code,
        wilaya.name,
        wilaya.nameAr,
        wilaya.wali ?? "",
        ...wilaya.communes.flatMap((commune) => [
          commune.name,
          commune.nameAr,
          commune.code,
          commune.apcPresident ?? "",
        ]),
      ]
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return haystack.includes(normalizedQuery);
    });
  }, [state.wilayas, normalizedQuery]);

  const selectedWilaya =
    filteredWilayas.find((wilaya) => wilaya.code === selectedCode) ??
    filteredWilayas[0] ??
    state.wilayas[0];

  const allCommunes = state.wilayas.flatMap((wilaya) => wilaya.communes);
  const activeCommunes = allCommunes.filter((commune) => commune.active);
  const population = allCommunes.reduce(
    (total, commune) => total + commune.population,
    0,
  );
  const vacantWilayas = state.wilayas.filter((wilaya) => !wilaya.wali).length;
  const vacantCommunes = allCommunes.filter(
    (commune) => !commune.apcPresident,
  ).length;

  const regionCounts = REGION_KEYS.map((key) => ({
    key,
    count: state.wilayas
      .filter((wilaya) => wilaya.region === key)
      .reduce((total, wilaya) => total + wilaya.communes.length, 0),
  }));
  const maxRegion = Math.max(1, ...regionCounts.map((item) => item.count));

  const editingCommune = communeModal?.communeId
    ? selectedWilaya?.communes.find(
        (commune) => commune.id === communeModal.communeId,
      )
    : undefined;

  function handleCreateWilaya(draft: WilayaDraft) {
    addWilaya(draft);
    setWilayaModal(false);
    setSelectedCode(draft.code);
    setNotice(t("admin.terr.wilayaCreated"));
  }

  function handleCreateCommune(draft: CommuneDraft) {
    if (!communeModal) return;
    if (editingCommune) {
      updateCommune(communeModal.wilayaCode, editingCommune.id, draft);
      setNotice(t("admin.terr.communeUpdated"));
    } else {
      addCommune(communeModal.wilayaCode, draft);
      setNotice(t("admin.terr.communeCreated"));
    }
    setCommuneModal(null);
  }

  function handleSaveWali(name: string | null) {
    if (!selectedWilaya) return;
    updateWilaya(selectedWilaya.code, { wali: name });
    setWaliModal(false);
    setNotice(
      name
        ? t("admin.terr.waliUpdated", { name, wilaya: selectedWilaya.name })
        : t("admin.terr.waliCleared", { wilaya: selectedWilaya.name }),
    );
  }

  function exportCsv() {
    const rows = [
      [
        "wilaya_code",
        "wilaya",
        "wilaya_ar",
        "region",
        "wali",
        "commune_code",
        "commune",
        "commune_ar",
        "apc_president",
        "population",
        "active",
      ],
      ...state.wilayas.flatMap((wilaya) =>
        wilaya.communes.map((commune) => [
          wilaya.code,
          wilaya.name,
          wilaya.nameAr,
          wilaya.region,
          wilaya.wali ?? "",
          commune.code,
          commune.name,
          commune.nameAr,
          commune.apcPresident ?? "",
          String(commune.population),
          commune.active ? "1" : "0",
        ]),
      ),
    ];
    downloadFile(
      "cadm-referentiel-territorial.csv",
      rows
        .map((row) =>
          row
            .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\n"),
      "text/csv;charset=utf-8",
    );
    setNotice(t("admin.terr.exportDone"));
  }

  function downloadTemplate() {
    downloadFile(
      "cadm-modele-communes.csv",
      [
        "wilaya_code;wilaya;wilaya_ar;region;commune;commune_ar;population",
        "06;Béjaïa;بجاية;north;Sidi Aïch;سيدي عيش;18000",
        "06;Béjaïa;بجاية;north;Amizour;أميزور;44800",
        "19;Sétif;سطيف;highlands;Bougaa;بوقاعة;34200",
      ].join("\n"),
      "text/csv;charset=utf-8",
    );
    setNotice(t("admin.terr.importDone"));
  }

  function handleImport(text: string): string | null {
    let parsed: ReturnType<typeof parseTerritoryCsv>;
    try {
      parsed = parseTerritoryCsv(text);
    } catch {
      return t("admin.terr.importError");
    }
    if ("error" in parsed) return t("admin.terr.importEmpty");
    if (parsed.rows.length === 0) return t("admin.terr.importEmpty");

    const knownWilayas = new Set(state.wilayas.map((wilaya) => wilaya.code));
    const seenCommunes = new Map<string, Set<string>>(
      state.wilayas.map((wilaya) => [
        wilaya.code,
        new Set(
          wilaya.communes.map((commune) => commune.name.trim().toLowerCase()),
        ),
      ]),
    );
    let newWilayas = 0;
    let newCommunes = 0;

    parsed.rows.forEach((row) => {
      if (!knownWilayas.has(row.wilayaCode)) {
        addWilaya({
          code: row.wilayaCode,
          name: row.wilayaName,
          nameAr: row.wilayaNameAr,
          region: row.region,
        });
        knownWilayas.add(row.wilayaCode);
        newWilayas += 1;
      }

      const names =
        seenCommunes.get(row.wilayaCode) ?? new Set<string>();
      seenCommunes.set(row.wilayaCode, names);

      const key = row.communeName.trim().toLowerCase();
      if (!names.has(key)) {
        names.add(key);
        addCommune(row.wilayaCode, {
          name: row.communeName,
          nameAr: row.communeNameAr,
          population: row.population,
          active: true,
        });
        newCommunes += 1;
      }
    });

    setImportOpen(false);
    setNotice(
      t("admin.terr.importSummary", {
        wilayas: newWilayas,
        communes: newCommunes,
      }),
    );
    return null;
  }

  return (
    <main className="ad-page">
      <AdminHero
        eyebrow={t("admin.terr.eyebrow")}
        title={t("admin.terr.title")}
        lead={t("admin.terr.lead")}
        chips={
          <>
            <span className="ad-chip">
              <AdminIcon name="map" />
              {t("admin.terr.wilayasHint", {
                count: state.wilayas.length,
              })}
            </span>
            <span className="ad-chip">
              <AdminIcon name="building" />
              {t("admin.terr.communesHint", {
                count: activeCommunes.length,
              })}
            </span>
            {vacantWilayas + vacantCommunes > 0 ? (
              <span className="ad-chip ad-chip--warn">
                <AdminIcon name="alert" />
                {t(
                  vacantWilayas + vacantCommunes === 1
                    ? "admin.terr.vacanciesHintOne"
                    : "admin.terr.vacanciesHint",
                  { count: vacantWilayas + vacantCommunes },
                )}
              </span>
            ) : (
              <span className="ad-chip ad-chip--ok">
                <AdminIcon name="check" />
                {t("admin.terr.noVacancy")}
              </span>
            )}
          </>
        }
        actions={
          <>
            <button
              type="button"
              className="ad-btn ad-btn--green"
              onClick={() => setWilayaModal(true)}
            >
              <AdminIcon name="plus" />
              {t("admin.terr.addWilaya")}
            </button>
            <button
              type="button"
              className="ad-btn ad-btn--ghost"
              onClick={() => setImportOpen(true)}
            >
              <AdminIcon name="upload" />
              {t("admin.terr.importFull")}
            </button>
          </>
        }
      />

      {notice && <AdminToast message={notice} />}

      {TERRITORY_DATA_SOURCE === "demo" && (
        <section className="ad-demo-banner">
          <span className="ad-demo-banner__icon">
            <AdminIcon name="database" />
          </span>
          <div className="ad-demo-banner__text">
            <strong>{t("admin.terr.demoTitle")}</strong>
            <p>
              {t("admin.terr.demoNotice", {
                wilayas: state.wilayas.length,
                communes: allCommunes.length,
              })}
            </p>
          </div>
          <div className="ad-demo-banner__actions">
            <button
              type="button"
              className="ad-btn ad-btn--soft ad-btn--small"
              onClick={downloadTemplate}
            >
              <AdminIcon name="download" />
              {t("admin.terr.importTemplate")}
            </button>
            <button
              type="button"
              className="ad-btn ad-btn--soft ad-btn--small"
              onClick={exportCsv}
            >
              <AdminIcon name="download" />
              {t("admin.terr.export")}
            </button>
          </div>
        </section>
      )}

      <div className="ad-stat-grid">
        <StatCard
          tone="verified"
          value={state.wilayas.length}
          label={t("admin.terr.wilayas")}
          badge={t("admin.terr.wilayasHint", {
            count: state.wilayas.length,
          })}
          badgeTone="neutral"
        />
        <StatCard
          tone="ongoing"
          value={allCommunes.length}
          label={t("admin.terr.communes")}
          badge={t("admin.terr.communesHint", {
            count: activeCommunes.length,
          })}
          badgeTone="success"
        />
        <StatCard
          tone="crisis"
          value={formatPopulation(population, lang)}
          label={t("admin.terr.population")}
          badge={t("admin.terr.populationHint")}
          badgeTone="info"
        />
        <StatCard
          tone="upcoming"
          value={vacantWilayas + vacantCommunes}
          label={t("admin.terr.vacancies")}
          badge={t("admin.terr.vacanciesStat", {
            wilayas: vacantWilayas,
            communes: vacantCommunes,
          })}
          badgeTone={
            vacantWilayas + vacantCommunes > 0 ? "warning" : "neutral"
          }
        />
      </div>

      <div className="ad-terr-layout">
        <section className="ad-card">
          <div className="ad-card__head">
            <div>
              <h2 className="ad-card__title">
                {t("admin.terr.listTitle")}
              </h2>
              <p className="ad-card__lead">
                {t(
                  filteredWilayas.length === 1
                    ? "admin.terr.listHintOne"
                    : "admin.terr.listHint",
                  { count: filteredWilayas.length },
                )}
              </p>
            </div>
          </div>

          <div className="ad-stack" style={{ gap: 10 }}>
            <AdminSearch
              value={query}
              onChange={setQuery}
              placeholder={t("admin.terr.searchPlaceholder")}
              label={t("admin.terr.searchPlaceholder")}
            />
          </div>

          {filteredWilayas.length === 0 ? (
            <AdminEmpty
              title={t("admin.terr.noResults")}
              text={t("admin.terr.noResultsText")}
              action={
                query ? (
                  <button
                    type="button"
                    className="ad-btn ad-btn--soft ad-btn--small"
                    onClick={() => setQuery("")}
                  >
                    <AdminIcon name="refresh" />
                    {t("admin.terr.clearSearch")}
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="ad-wilaya-list">
              {filteredWilayas.map((wilaya) => (
                <button
                  key={wilaya.code}
                  type="button"
                  className={`ad-wilaya${
                    wilaya.code === selectedWilaya?.code ? " is-active" : ""
                  }`}
                  onClick={() => setSelectedCode(wilaya.code)}
                >
                  <span className="ad-wilaya__code">{wilaya.code}</span>
                  <span className="ad-wilaya__text">
                    <strong>
                      {lang === "ar" ? wilaya.nameAr : wilaya.name}
                    </strong>
                    <span>
                      {t(`admin.terr.region.${wilaya.region}`)}
                      {!wilaya.wali && ` · ${t("admin.terr.waliVacantShort")}`}
                    </span>
                  </span>
                  <span className="ad-wilaya__count">
                    {t(
                      wilaya.communes.length === 1
                        ? "admin.terr.communesCountOne"
                        : "admin.terr.communesCount",
                      { count: wilaya.communes.length },
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="ad-stack">
          {selectedWilaya ? (
            <section className="ad-card">
              <div className="ad-detail-head">
                <div>
                  <p className="ad-eyebrow">
                    {t("admin.terr.selectedHint")}
                  </p>
                  <h2>
                    {lang === "ar"
                      ? selectedWilaya.nameAr
                      : selectedWilaya.name}{" "}
                    <span className="ad-muted">
                      · {selectedWilaya.code}
                    </span>
                  </h2>
                  <p>
                    {t("admin.terr.selectedTitle")} ·{" "}
                    {t(`admin.terr.region.${selectedWilaya.region}`)}
                  </p>
                </div>

                <button
                  type="button"
                  className="ad-btn ad-btn--green ad-btn--small"
                  onClick={() =>
                    setCommuneModal({ wilayaCode: selectedWilaya.code })
                  }
                >
                  <AdminIcon name="plus" />
                  {t("admin.terr.addCommune")}
                </button>
              </div>

              <div className="ad-officials">
                <div
                  className={`ad-official-card${
                    selectedWilaya.wali ? "" : " is-vacant"
                  }`}
                >
                  <span className="ad-official-card__icon">
                    <AdminIcon name="flag" />
                  </span>
                  <span className="ad-official-card__body">
                    <span className="ad-official-card__label">
                      {t("admin.terr.wali")}
                    </span>
                    <strong>
                      {selectedWilaya.wali ?? t("admin.terr.waliVacant")}
                    </strong>
                    <span>
                      {selectedWilaya.wali
                        ? t("admin.terr.waliRole")
                        : t("admin.terr.waliVacantHint")}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="ad-btn ad-btn--soft ad-btn--small ad-official-card__action"
                    onClick={() => setWaliModal(true)}
                  >
                    <AdminIcon name={selectedWilaya.wali ? "edit" : "userPlus"} />
                    {selectedWilaya.wali
                      ? t("admin.terr.editWali")
                      : t("admin.terr.assignWali")}
                  </button>
                </div>
              </div>

              {!selectedWilaya.wali && (
                <p className="ad-inline-note ad-inline-note--warn">
                  <AdminIcon name="alert" />
                  {t("admin.terr.waliVacancyAlert", {
                    wilaya: selectedWilaya.name,
                  })}
                </p>
              )}

              <div className="ad-detail-facts">
                <span className="ad-fact">
                  <span>{t("admin.terr.communes")}</span>
                  <strong>{selectedWilaya.communes.length}</strong>
                </span>
                <span className="ad-fact">
                  <span>{t("admin.terr.population")}</span>
                  <strong>
                    {formatPopulation(
                      selectedWilaya.communes.reduce(
                        (total, commune) => total + commune.population,
                        0,
                      ),
                      lang,
                    )}
                  </strong>
                </span>
                <span className="ad-fact">
                  <span>{t("admin.terr.communesHint", {
                    count: selectedWilaya.communes.filter(
                      (commune) => commune.active,
                    ).length,
                  })}</span>
                  <strong>
                    {selectedWilaya.communes.filter(
                      (commune) => commune.active,
                    ).length}
                  </strong>
                </span>
                <span className="ad-fact">
                  <span>{t("admin.terr.vacantCommunes")}</span>
                  <strong>
                    {selectedWilaya.communes.filter(
                      (commune) => !commune.apcPresident,
                    ).length}
                  </strong>
                </span>
              </div>

              <div className="ad-card__head" style={{ marginTop: 18 }}>
                <div>
                  <h3 className="ad-card__title">
                    {t("admin.terr.communesTitle")}
                  </h3>
                  <p className="ad-card__lead">
                    {t(
                      selectedWilaya.communes.length === 1
                        ? "admin.terr.communesCountOne"
                        : "admin.terr.communesCount",
                      { count: selectedWilaya.communes.length },
                    )}
                  </p>
                </div>
              </div>

              {selectedWilaya.communes.length === 0 ? (
                <AdminEmpty
                  title={t("admin.terr.noCommune")}
                  text={t("admin.terr.noCommuneText")}
                  action={
                    <button
                      type="button"
                      className="ad-btn ad-btn--green ad-btn--small"
                      onClick={() =>
                        setCommuneModal({
                          wilayaCode: selectedWilaya.code,
                        })
                      }
                    >
                      <AdminIcon name="plus" />
                      {t("admin.terr.addCommune")}
                    </button>
                  }
                />
              ) : (
                <div className="ad-table-wrap">
                  <table className="ad-table ad-table--territories">
                    <thead>
                      <tr>
                        <th>{t("admin.terr.colCommune")}</th>
                        <th>{t("admin.terr.colCode")}</th>
                        <th>{t("admin.terr.colPopulation")}</th>
                        <th>{t("admin.terr.colApc")}</th>
                        <th>{t("admin.terr.colStatus")}</th>
                        <th>{t("admin.terr.colActions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWilaya.communes.map((commune) => (
                        <tr key={commune.id}>
                          <td>
                            <span className="ad-territory">
                              <strong>
                                {lang === "ar" ? commune.nameAr : commune.name}
                              </strong>
                              <span>
                                {lang === "ar" ? commune.name : commune.nameAr}
                              </span>
                            </span>
                          </td>
                          <td className="ad-table__num">{commune.code}</td>
                          <td className="ad-table__num">
                            {formatPopulation(commune.population, lang)}
                          </td>
                          <td>
                            {commune.apcPresident ? (
                              <span className="ad-official">
                                <strong>{commune.apcPresident}</strong>
                                <span>{t("admin.terr.apcPresident")}</span>
                              </span>
                            ) : (
                              <span className="ad-vacancy">
                                <AdminIcon name="alert" />
                                {t("admin.terr.apcVacant")}
                              </span>
                            )}
                          </td>
                          <td>
                            <AdminBadge
                              tone={commune.active ? "green" : "slate"}
                            >
                              {t(
                                commune.active
                                  ? "admin.terr.active"
                                  : "admin.terr.inactive",
                              )}
                            </AdminBadge>
                          </td>
                          <td>
                            <span className="ad-actions">
                              <button
                                type="button"
                                className="ad-icon-btn"
                                title={t("admin.common.edit")}
                                aria-label={t("admin.common.edit")}
                                onClick={() =>
                                  setCommuneModal({
                                    wilayaCode: selectedWilaya.code,
                                    communeId: commune.id,
                                  })
                                }
                              >
                                <AdminIcon name="edit" />
                              </button>
                              <button
                                type="button"
                                className="ad-icon-btn"
                                title={t(
                                  commune.active
                                    ? "admin.terr.deactivate"
                                    : "admin.terr.activate",
                                )}
                                aria-label={t(
                                  commune.active
                                    ? "admin.terr.deactivate"
                                    : "admin.terr.activate",
                                )}
                                onClick={() =>
                                  updateCommune(
                                    selectedWilaya.code,
                                    commune.id,
                                    { active: !commune.active },
                                  )
                                }
                              >
                                <AdminIcon
                                  name={commune.active ? "lock" : "power"}
                                />
                              </button>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : null}

          <section className="ad-card">
            <div className="ad-card__head">
              <div>
                <h2 className="ad-card__title">
                  {t("admin.terr.regionsTitle")}
                </h2>
                <p className="ad-card__lead">
                  {t("admin.terr.regionsHint")}
                </p>
              </div>
              <AdminIcon name="layers" />
            </div>

            <div className="ad-region-bars">
              {regionCounts.map((item) => (
                <div key={item.key} className="ad-region-bar">
                  <span className="ad-region-bar__label">
                    {t(`admin.terr.region.${item.key}`)}
                  </span>
                  <span className="ad-region-bar__track">
                    <span
                      className="ad-region-bar__fill"
                      style={{
                        width: `${Math.round(
                          (item.count / maxRegion) * 100,
                        )}%`,
                      }}
                    />
                  </span>
                  <span className="ad-region-bar__value">
                    {t("admin.terr.regionCount", {
                      count: item.count,
                    })}
                  </span>
                </div>
              ))}
            </div>

            <div className="ad-card__foot">
              <AdminProgress
                value={
                  (activeCommunes.length /
                    Math.max(1, allCommunes.length)) *
                  100
                }
                label={t("admin.terr.coverage")}
                valueLabel={`${activeCommunes.length}/${allCommunes.length}`}
                tone="green"
              />
            </div>
          </section>
        </div>
      </div>

      {wilayaModal && (
        <WilayaModal
          takenCodes={state.wilayas.map((wilaya) => wilaya.code)}
          onSave={handleCreateWilaya}
          onClose={() => setWilayaModal(false)}
        />
      )}

      {waliModal && selectedWilaya && (
        <WaliModal
          wilayaName={
            lang === "ar" ? selectedWilaya.nameAr : selectedWilaya.name
          }
          current={selectedWilaya.wali}
          onSave={handleSaveWali}
          onClose={() => setWaliModal(false)}
        />
      )}

      {communeModal && selectedWilaya && (
        <CommuneModal
          commune={editingCommune}
          wilayaName={
            lang === "ar" ? selectedWilaya.nameAr : selectedWilaya.name
          }
          takenNames={selectedWilaya.communes
            .filter((commune) => commune.id !== editingCommune?.id)
            .map((commune) => commune.name)}
          onSave={handleCreateCommune}
          onClose={() => setCommuneModal(null)}
        />
      )}

      {importOpen && (
        <ImportModal
          onImport={handleImport}
          onClose={() => setImportOpen(false)}
        />
      )}
    </main>
  );
}

export default TerritoriesPage;
