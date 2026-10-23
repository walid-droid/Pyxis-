import "./resp-crise.css";
import { useState, type ReactNode } from "react";
import { useI18n } from "../../i18n";
import { mockTeams } from "../../mockdata/teams";
import ConfirmDialog from "./ConfirmDialog";
import { tone } from "./utils";

type BranchStatus = "available" | "engaged";

type Branch = {
  id: string;
  nameKey: string;
  lead: string;
  contact: string;
  status: BranchStatus;
  teamType: "Fire" | "Rescue" | "Medical" | "Logistics";
  missionKey: string;
  icon: ReactNode;
};

const BRANCHES: Branch[] = [
  {
    id: "fire",
    nameKey: "resp.chain.fire",
    lead: "Cdt. A. Bensalem",
    contact: "PC feu · 14 21",
    status: "engaged",
    teamType: "Fire",
    missionKey: "resp.chain.fireMission",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2c1.5 3.5-1 5-2.5 6.5A6.8 6.8 0 0 0 8 17a4.5 4.5 0 0 0 9 0c0-2-1-3.4-2.2-4.6" />
        <path d="M12 22a2.5 2.5 0 0 1-2.5-2.5c0-1.6 2.5-4 2.5-4s2.5 2.4 2.5 4A2.5 2.5 0 0 1 12 22Z" />
      </svg>
    ),
  },
  {
    id: "evac",
    nameKey: "resp.chain.evac",
    lead: "Cne. S. Haddad",
    contact: "PC évacuation · 14 22",
    status: "engaged",
    teamType: "Rescue",
    missionKey: "resp.chain.evacMission",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6-3-6 3Z" />
        <path d="M9 7v13M15 4v13" />
      </svg>
    ),
  },
  {
    id: "health",
    nameKey: "resp.chain.health",
    lead: "Dr. L. Meziane",
    contact: "SAMU · 14 15",
    status: "available",
    teamType: "Medical",
    missionKey: "resp.chain.healthMission",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z" />
        <path d="M3.5 12.5h4l1.5-3 2.5 6 1.5-3h7.5" />
      </svg>
    ),
  },
  {
    id: "engine",
    nameKey: "resp.chain.engine",
    lead: "Lt. K. Bouzid",
    contact: "Parc engins · 14 23",
    status: "engaged",
    teamType: "Logistics",
    missionKey: "resp.chain.engineMission",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 17h1l1.5-4H15l2 4h3a1 1 0 0 0 1-1v-4l-3-4H9l-2 3H4a1 1 0 0 0-1 1v5Z" />
        <circle cx="7" cy="17.5" r="1.8" />
        <circle cx="17.5" cy="17.5" r="1.8" />
      </svg>
    ),
  },
];

const LEAD_POOL = [
  "Cdt. A. Bensalem",
  "Cne. S. Haddad",
  "Dr. L. Meziane",
  "Lt. K. Bouzid",
  "Cne. N. Belkacem",
  "Lt. M. Saidi",
  "Cdt. F. Ould Ali",
];

const CENTER_CANDIDATES = [
  "R. Amrani",
  "S. Kaci",
  "N. Belkacem",
  "Cdt. A. Bensalem",
];

const INITIAL_LEADS: Record<string, string> = Object.fromEntries(
  BRANCHES.map((branch) => [branch.id, branch.lead]),
);

/** Écran 3 — organigramme de la chaîne de commandement. */
function CommandChain() {
  const { t, tc } = useI18n();
  const [selected, setSelected] = useState(BRANCHES[0].id);
  const [leads, setLeads] = useState<Record<string, string>>(INITIAL_LEADS);
  const [centerLeader, setCenterLeader] = useState("R. Amrani");
  const [notice, setNotice] = useState<string | null>(null);

  const [replacing, setReplacing] = useState(false);
  const [candidate, setCandidate] = useState(LEAD_POOL[0]);

  const [transferring, setTransferring] = useState(false);
  const [centerTo, setCenterTo] = useState(CENTER_CANDIDATES[0]);

  const branch = BRANCHES.find((item) => item.id === selected) ?? BRANCHES[0];
  const branchLead = leads[branch.id];
  const branchTeams = mockTeams
    .filter((team) => team.type === branch.teamType)
    .slice(0, 3);

  const candidates = LEAD_POOL.filter((name) => name !== branchLead);

  function openReplace() {
    setCandidate(candidates[0] ?? LEAD_POOL[0]);
    setReplacing(true);
  }

  function confirmReplace() {
    setLeads((current) => ({ ...current, [branch.id]: candidate }));
    setNotice(
      t("resp.chain.replaceDone", {
        name: candidate,
        branch: t(branch.nameKey),
      }),
    );
    setReplacing(false);
  }

  function openTransfer() {
    setCenterTo(
      CENTER_CANDIDATES.find((name) => name !== centerLeader) ??
        CENTER_CANDIDATES[0],
    );
    setTransferring(true);
  }

  function confirmTransfer() {
    setCenterLeader(centerTo);
    setNotice(t("resp.chain.transferDone", { name: centerTo }));
    setTransferring(false);
  }

  return (
    <main className="rc-page">
      <section className="rc-hero">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("resp.chain.eyebrow")}</p>
          <h1>{t("resp.chain.title")}</h1>
          <p className="rc-hero__lead">{t("resp.chain.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">{t("resp.chain.centerChip")}</span>
            <span className="rc-chip">{t("resp.chain.branchesChip")}</span>
          </div>
        </div>
      </section>

      {notice && (
        <p className="rc-toast" role="status">
          {notice}
        </p>
      )}

      <section className="rc-card">
        <div className="rc-chain">
          <div className="rc-chain__center">
            <strong>{centerLeader}</strong>
            <span>{t("resp.chain.center")}</span>
            <span className="rc-chain__role">
              {t("resp.chain.centerContact")}
            </span>
          </div>
          <span className="rc-chain__stem" aria-hidden="true" />

          <ul className="rc-chain__branches">
            {BRANCHES.map((item) => (
              <li key={item.id} className="rc-chain__branch">
                <button
                  type="button"
                  className={`rc-branch${item.id === selected ? " is-active" : ""}`}
                  aria-pressed={item.id === selected}
                  onClick={() => setSelected(item.id)}
                >
                  <span className="rc-branch__icon">{item.icon}</span>
                  <span className="rc-branch__name">{t(item.nameKey)}</span>
                  <span className="rc-branch__lead">{leads[item.id]}</span>
                  <span className="rc-branch__status">
                    <span
                      className={`rc-branch__dot${item.status === "engaged" ? " rc-branch__dot--engaged" : ""}`}
                      aria-hidden="true"
                    />
                    {t(`resp.chain.${item.status}`)}
                  </span>
                  <span className="rc-branch__contact">{item.contact}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rc-chain__detail">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t(branch.nameKey)}</h2>
            <span className={`rc-badge rc-badge--${branch.status}`}>
              {t(`resp.chain.${branch.status}`)}
            </span>
          </div>

          <div className="rc-grid rc-grid--split">
            <div className="rc-stack">
              <p className="rc-card__lead">{t(branch.missionKey)}</p>
              <dl className="rc-facts">
                <div>
                  <dt>{t("resp.chain.leadLabel")}</dt>
                  <dd>{branchLead}</dd>
                </div>
                <div>
                  <dt>{t("resp.chain.contact")}</dt>
                  <dd>{branch.contact}</dd>
                </div>
                <div>
                  <dt>{t("resp.chain.statusLabel")}</dt>
                  <dd>{t(`resp.chain.${branch.status}`)}</dd>
                </div>
                <div>
                  <dt>{t("resp.chain.teamsLabel")}</dt>
                  <dd>{t("resp.chain.teamsCount", { count: branchTeams.length })}</dd>
                </div>
              </dl>

              <div className="rc-actions">
                <button
                  type="button"
                  className="rc-btn rc-btn--soft rc-btn--small"
                  onClick={openReplace}
                >
                  {t("resp.chain.replace")}
                </button>
              </div>
            </div>

            <ul className="rc-list">
              {branchTeams.map((team) => (
                <li key={team.id} className="rc-team-line">
                  <div className="rc-team-line__body">
                    <strong>{tc(team.name)}</strong>
                    <span>{tc(team.location)}</span>
                  </div>
                  <span className={`rc-badge rc-badge--${tone(team.status)}`}>
                    {t(`resp.st.${tone(team.status)}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rc-chain__tools">
          <button
            type="button"
            className="rc-btn rc-btn--primary"
            onClick={openTransfer}
          >
            {t("resp.chain.transfer")}
          </button>
        </div>
      </section>

      {replacing && (
        <ConfirmDialog
          title={t("resp.chain.replaceTitle")}
          confirmLabel={t("resp.chain.replaceConfirm")}
          tone="green"
          onConfirm={confirmReplace}
          onClose={() => setReplacing(false)}
        >
          <p>
            {t("resp.chain.replaceLead", { branch: t(branch.nameKey) })}
          </p>

          <div className="rc-field">
            <label htmlFor="branch-lead">{t("resp.chain.leadLabel")}</label>
            <select
              id="branch-lead"
              value={candidate}
              onChange={(event) => setCandidate(event.target.value)}
            >
              {candidates.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </ConfirmDialog>
      )}

      {transferring && (
        <ConfirmDialog
          title={t("resp.chain.transferTitle")}
          confirmLabel={t("resp.chain.transferConfirm")}
          tone="danger"
          onConfirm={confirmTransfer}
          onClose={() => setTransferring(false)}
        >
          <p>{t("resp.chain.transferLead", { name: centerLeader })}</p>

          <div className="rc-field">
            <label htmlFor="center-leader">{t("resp.chain.center")}</label>
            <select
              id="center-leader"
              value={centerTo}
              onChange={(event) => setCenterTo(event.target.value)}
            >
              {CENTER_CANDIDATES.filter((name) => name !== centerLeader).map(
                (name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ),
              )}
            </select>
          </div>
        </ConfirmDialog>
      )}
    </main>
  );
}

export default CommandChain;
