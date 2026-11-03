# CADM v3.0 — Naming Conventions

**Project:** CADM crisis-management platform (ORSEC v3.0 rewrite)
**Audience:** developers, reviewers, and documentation generators
**Status:** authoritative for the v3.0 codebase

> This document describes every naming convention used in the repository: files, folders,
> TypeScript identifiers, domain vocabulary, roles, permissions, routes, i18n keys, data-model
> fields, CSS classes, storage keys, and tests. It is written to be converted directly into a
> PDF (see “PDF production brief” at the end).

---

## 1. Language policy

| Area | Language | Example |
|---|---|---|
| User interface | French + Arabic (bilingual, RTL) | `"signalement"` / `"تبليغ"` |
| Domain vocabulary in code | French | `Signalement`, `Plan`, `DemandeDeclenchement` |
| Technical scaffolding | English | `useDb`, `selectors`, `services`, `layout` |
| Permissions | French, uppercase | `LANCER_INTERVENTION` |
| Enum / union values | French, lowercase snake_case | `"hors_de_controle"` |
| Comments | French | `// Le citoyen ne choisit pas d'organisme.` |

Rule: **visible text never lives in components**; it always goes through `t("key")`.
Every key exists twice, in `_FR` and `_AR` dictionaries.

---

## 2. Files and folders

### 2.1 React pages

- Page components: `PascalCase` + `Page` suffix → `SubmitAlertPage.tsx`, `AdminMatrixPage.tsx`.
- Layouts: `PascalCase` + `Layout` suffix → `AuthorityLayout.tsx`, `ModuleLayout.tsx`.
- Shared visual helpers: `camelCase` → `src/pages/shared/v3/helpers.ts`.
- One folder per space: `citizen/`, `module/`, `authority/`, `admin/`, `auth/`, `assistant/`.

```
src/pages/
  citizen/    HomePage, AlertsPage, SheltersPage, SubmitAlertPage,
              MyReportsPage, ConsignesPage, PublicInformationPage, …
  module/     ModuleLayout, ModuleDashboard, ModuleAlertsPage, …
  authority/  AuthorityLayout, AuthorityDashboard, AuthorityPlansPage, …
  admin/      AdminLayout, AdminDashboard, AdminAccountsPage, …
  auth/       LoginPage, RegisterPage, StaffLoginPage, AuthLayout
  shared/     crisis/ (CrisisMap), v3/ (helpers, v3.css)
```

### 2.2 Services and data

- Service modules: `camelCase`, singular topic → `store.ts`, `seed.ts`, `plans.ts`,
  `interventions.ts`, `authority.ts`, `notifications.ts`, `journal.ts`.
- React hooks in the service layer: `use` prefix → `useDb.ts`, `useSessionScope.ts`.
- Reference data: `camelCase` → `modules.ts`, `types.ts`, `territories.ts`,
  `moduleMatrix.ts`, `moduleParType.ts`, `locale.ts`.
- Auth layer: `camelCase` → `access.ts`, `permissions.ts`, `roles.ts`, `session.ts`,
  `guards.tsx`, `AuthContext.ts`, `AuthProvider.tsx`, `demoAccounts.ts`.
- i18n dictionaries, one file per space → `citizen.ts`, `module.ts`, `authority.ts`,
  `admin.ts`, `notifications.ts`, `crisis.ts`, shared `index.ts`.

### 2.3 Tests

- `tests/<domain>.test.ts` → `tests/access.test.ts`, `tests/matrix.test.ts`,
  `tests/routing.test.ts`, `tests/cascade.test.ts`.
- Exported suites: `<DOMAIN>_TESTS: Array<() => void>`.
- Individual checks: `assert<Invariant>()`, e.g. `assertExerciseIsolation()`.

### 2.4 CSS

- Global shell styles: existing `App.css`, `index.css`, `dark.css`, `rtl.css`.
- Shared v3 screen styles: `src/pages/shared/v3/v3.css` (classes prefixed `v3-`).
- Crisis/map styles: `src/pages/shared/crisis/resp-crise.css` (classes prefixed `rc-`).
- Admin styles: `src/pages/admin/admin.css` (classes prefixed `ad-`).
- Authority screen styles: `src/pages/authority/authority.css`.
- BEM-like pattern: `block`, `block__element`, `block--modifier`
  → `.v3-card`, `.v3-card__head`, `.v3-btn--small`.

---

## 3. TypeScript identifiers

| Kind | Convention | Example |
|---|---|---|
| Type / interface / enum-like union | `PascalCase` | `Signalement`, `PlanLevel`, `MatrixCell` |
| Component | `PascalCase` | `AuthorityPlansPage` |
| Function / variable | `camelCase` | `canTreatDemande`, `modulesToMobilize` |
| React hook | `use` + `PascalCase` | `useDb`, `useSessionScope` |
| Constant | `SCREAMING_SNAKE_CASE` | `PERMISSIONS`, `FIRST_WAVE`, `TYPE_CODES` |
| Lookup table | `SCREAMING_SNAKE_CASE` | `URGENCE`, `REHABILITATION`, `ROLE_DEFS` |
| Boolean | `is` / `has` / `can` / `needs` | `isAssignmentActive`, `canTriggerNational` |
| Event handler | `handle` + action | `handleSubmit`, `handleConfirm`, `handleTrigger` |
| Path constant | `SCREAMING_SNAKE_CASE` + `_PATH` | `AUTHORITY_PLANS_PATH` |
| localStorage key | `cadm-...-v3` | `cadm-v3-db`, `cadm-auth-session-v3` |

---

## 4. Domain vocabulary (French identifiers)

| Identifier | Meaning |
|---|---|
| `signalement` | Citizen report; routed automatically by catastrophe type |
| `typeId` / `TypeCode` | Catastrophe type `C1`…`C10` |
| `intervention` | Field response opened by a module after confirmation |
| `demande` / `DemandeDeclenchement` | Formal request to trigger a plan |
| `plan` | ORSEC plan at `commune`, `wilaya`, or `national` level |
| `phase` | `urgence`, `evaluation_controle`, `rehabilitation` |
| `etat` / `PlanState` | `en_alerte`, `declenche`, `leve` |
| `miseEnAlerte` | Cascading alert to a neighbouring / lower territory |
| `mobilisation` / `ModuleMobilise` | Module engaged by a plan |
| `participation` | Agent called to a plan (`appele`, `confirme`, `libere`) |
| `affectation` / `AffectationAgent` | Agent assigned to an intervention |
| `territoire` | `commune`, `wilaya`, or `national` (`dz`) |
| `module` | One of the 13 ORSEC modules (`module-1` … `module-13`) |
| `organisme` | Organisation attached to a module (reference data only) |
| `exercice` | Simulation plan, always isolated from real data |
| `journal` | Read-only audit trail of decisions |

---

## 5. Enumerations and codes

### 5.1 Catastrophe types

`C1` … `C10` — stored as `TypeCode`, never as free text.
Reference list: `src/data/types.ts` (`TYPES_CATASTROPHE`, `TYPE_CODES`).

### 5.2 Modules

- Numeric key: `ModuleNo` = `1` … `13`.
- String id: `module-1` … `module-13`.
- Matrix rows are keyed by the numeric `ModuleNo`.

### 5.3 Union values (lowercase French snake_case)

```
SignalState:       non_verifie | confirme | rejete
InterventionState: en_cours | cloturee | hors_de_controle
PlanLevel:         commune | wilaya | national
PlanPhase:         urgence | evaluation_controle | rehabilitation
PlanState:         en_alerte | declenche | leve
RequestState:      en_attente | traitee | refusee
ParticipationState: appele | confirme | libere
Gravity:           faible | moyenne | elevee | critique
```

---

## 6. Roles and permissions

### 6.1 The 8 account roles (one role per account)

```
citizen
admin
wali
apc_president
minister
module_agent
module_manager      // responsible for a module (PCO)
module_director     // module director (PCF)
```

Role → space mapping (`src/auth/roles.ts`):
`citizen → citizen`, `admin → admin`, `wali/apc_president/minister → authority`,
`module_agent/module_manager/module_director → module`.

### 6.2 Permissions (SCREAMING_SNAKE_CASE, French)

```
CREER_SIGNALEMENT, SUIVRE_MON_SIGNALEMENT
RECEVOIR_ALERTE_MODULE, CONFIRMER_SIGNALEMENT, FIXER_GRAVITE,
LANCER_INTERVENTION, AFFECTER_AGENTS, DEMANDER_APPUI_MODULE,
CLOTURER_INTERVENTION, DECLARER_HORS_CONTROLE, CONSULTER_MODULE,
INDIQUER_DISPONIBILITE, SUIVRE_TACHE, ENVOYER_COMPTE_RENDU,
CONFIRMER_PARTICIPATION
TRAITER_DEMANDE_DECLENCHEMENT, DECLENCHER_PLAN, CHANGER_PHASE,
LEVER_PLAN, PROPOSER_ESCALADE, DEMANDER_PLAN_SUPERIEUR,
LANCER_EXERCICE, CONSULTER_PLANS_ALERTES_EFFECTIFS,
DECLENCHER_PLAN_NATIONAL
GERER_COMPTES, ATTRIBUER_ROLE, GERER_REFERENTIELS, CONSULTER_JOURNAL
```

Access control order (`src/auth/access.ts`): session → role permission → module scoping →
territory scoping → plan-level scoping (`commune` for APC, `wilaya` for wali,
`national` for minister).

---

## 7. Service-layer function naming

| Prefix / pattern | Purpose | Example |
|---|---|---|
| `find<Entity>` | Lookup by id | `findPlan`, `findSignalement` |
| `<entities>For<Scope>` | Scoped selector | `plansForSession`, `demandesForSession` |
| `can<Action>` | Guard / permission check | `canTreatDemande`, `canTriggerNational` |
| `create<Entity>` | Creation | `createSignalement`, `createIntervention` |
| `confirm<Entity>` / `reject<Entity>` | Decision | `confirmSignalement`, `rejectSignalement` |
| `trigger<Entity>` / `lift<Entity>` | Lifecycle action | `triggerPlan`, `liftPlan` |
| `change<Property>` | Update | `changePlanPhase` |
| `ensure<Entity>` | Idempotent creation | `ensureAlertPlan` |
| `<entities>To<Result>` | Derivation | `modulesToMobilize` |
| `use<X>` | React hook | `useDb`, `useSessionScope` |

Persistence: a single `Db` object in `localStorage` under `cadm-v3-db`, exposed through
`useDb()` (`useSyncExternalStore`), with an in-memory fallback.

---

## 8. Routes and path constants

All routes are declared once in `src/config.ts` as `<SPACE>_<SCREEN>_PATH`.

| Space | Prefix | Examples |
|---|---|---|
| Public / citizen | `/` | `/dashboard`, `/alerts`, `/submit-alert`, `/my-reports`, `/information` |
| Auth | `/…` | `/login`, `/register`, `/forgot-password`, `/personnel/login`, `/admin/login` |
| Module | `/module` | `/module/alertes`, `/module/interventions`, `/module/taches` |
| Authority | `/autorite` | `/autorite/demandes`, `/autorite/plans`, `/autorite/escalade` |
| Admin | `/admin` | `/admin/comptes`, `/admin/roles`, `/admin/matrice`, `/admin/journal` |

Legacy or mistyped staff-login URLs (`/personel`, `/personel/login`, `/personnel`,
`/staff/login`, `/resp/login`, `/responsable`, …) are listed in
`STAFF_LOGIN_ALIAS_PATHS` and permanently redirect to `STAFF_LOGIN_PATH`
(`/personnel/login`). Unknown URLs render `NotFoundPage` with the bilingual
`notFound.*` keys; there is no catch-all redirect to the dashboard.

---

## 9. i18n key conventions

### 9.1 Shape

```
<space>.<screen>.<element>
```

- `space`: `nav`, `common`, `login`, `submit`, `alerts`, `severity`, `gravity`,
  `module`, `authority`, `admin`, `publicInfo`, `notif`.
- `screen` and `element`: `camelCase`.
- Examples: `authority.plans.title`, `module.nav.interventions`,
  `admin.accounts.duplicateEmail`, `submit.aiBadge`.

### 9.2 Dynamic keys

Use a faithful union suffix and always provide every value:

```ts
t(`authority.plans.level.${plan.niveau}`)
t(`authority.plans.phase.${plan.phase}`)
t(`authority.plans.state.${plan.etat}`)
t(`module.state.${signalement.etat}`)
t(`admin.roles.family.${definition.family}`)
```

Required dynamic families:
`authority.plans.level|phase|state`, `authority.requests.origin|state`,
`authority.staff.state`, `authority.alerts.reason`, `authority.level`,
`module.state`, `module.interventions.interventionState`,
`admin.roles.family`, `admin.territories.level`, `severity`, `gravity`,
`alerts.gravity`.

### 9.3 Interpolation

```
{count}, {name}, {type}, {gravity}, {hours}, {minutes}
```

Example: `"authority.situation.incidents": "{count} incidents"`.

### 9.4 The bilingual rule

- Every key is present in both `…_FR` and `…_AR`.
- Arabic values are real translations, not transliterations.
- `applyLanguage` / `I18nProvider` set `<html lang dir>`; RTL is global (`rtl.css`).
- A visible string outside `t()` is a defect (except reference data already localized
  in `Localized { fr, ar }` objects).

---

## 10. Data-model field naming

- French `camelCase`: `creeLe`, `majLe`, `traiteLe`, `affecteLe`, `territoireId`,
  `typeId`, `communeId`, `niveauDemande`, `personnesConcernees`.
- Timestamps: ISO 8601 strings; “last updated” is `majLe`.
- Optional end dates: `levee`, `libereLe`, `traiteLe`, `to` (assignment).
- Id prefixes produced by `newId(prefix)`:

```
sig-   signalement        int-    intervention
plan-  plan               dem-    demande
part-  participation      alerte- mise en alerte
notif- notification       j-      journal entry
```

- Seeded semantic ids: `wilaya-bejaia`, `commune-bejaia`, `commune-akbou`, `dz`, `module-1`.
- Bilingual reference values use `Localized = { fr: string; ar: string }`.

---

## 11. Reference data and matrix naming

- `URGENCE` and `REHABILITATION`: `Record<ModuleNo, Record<TypeCode, boolean | "TODO">>`.
- `"TODO"` is a **sentinel**, never a boolean substitute. Unknown cells stay `"TODO"`.
- `FIRST_WAVE`: `Record<TypeCode, ModuleNo[]>` — requires at least one module per type.
- `DEFAULT_MATRIX`, `MODULES`, `TYPES_CATASTROPHE`, `TERRITORIES` are the seeded reference sets.
- Admin-editable copies live in `db.reference.{modules,types,territories,matrix}`.

---

## 12. Storage keys

```
cadm-v3-db                        single application database
cadm-auth-session-v3              active session (one role per account)
cadm-lang                         language (fr | ar)
cadm-theme                        light | dark
cadm-demo                         demo flag
cadm-notifications-read           read notifications
cadm-*-sidebar-collapsed[-v3]     per-space sidebar state
```

---

## 13. CSS class prefixes

| Prefix | Scope |
|---|---|
| `app-` | application shell (sidebar, topbar) |
| `v3-` | shared v3 screens (buttons, cards, tables, stats) |
| `rc-` | crisis / map screens (`resp-crise.css`) |
| `ad-` | admin space (`admin.css`) |
| `au-` | authority notes and accents (`authority.css`) |
| `auth-` | authentication screens (`AuthLayout.css`) |

Modifiers use `--`: `.v3-btn--small`, `.rc-badge--critical`, `.ad-badge--green`.
RTL: no mirrored class names; use logical properties and the global `rtl.css`.

---

## 14. Tests

- Location: `tests/`, compiled by the app tsconfig (`"include": ["src", "tests"]`).
- Naming: `<domain>.test.ts`; suite exported as `<DOMAIN>_TESTS`.
- Assertions: `assert<Invariant>()`; helpers `expectTrue` / `expectFalse`.
- Matrix rule: `assertMatrixComplete()` **must fail while `"TODO"` cells remain** — this
  is the explicit acceptance gate from the specification.
- No new test dependency: tests are pure TypeScript and validated by `tsc -b` / `npm run build`.

---

## 15. v3.0-specific “do not” list

These names and concepts were removed and must not reappear:

- ❌ the 22-role catalogue and per-role plan-level selector;
- ❌ `pages/organisme/`, `pages/site/`, site-operator and sensitive-site concepts;
- ❌ citizen-chosen recipient organism (routing is automatic by type);
- ❌ designations (`DESIGNER_FONCTION`, `HABILITER_PERSONNE`) as access logic;
- ❌ hard-coded French or Arabic UI strings outside `t()` / `Localized`;
- ❌ boolean guesses in the matrix — unknown cells stay `"TODO"`.

---

## 16. Quick reference

| Concept | Naming |
|---|---|
| Citizen report | `Signalement` / `sig-…` |
| Catastrophe type | `C1`…`C10` (`TypeCode`) |
| Module | `module-1`…`module-13` (`ModuleNo` 1…13) |
| Plan | `Plan` (`commune` / `wilaya` / `national`) |
| Plan phase | `urgence`, `evaluation_controle`, `rehabilitation` |
| Plan state | `en_alerte`, `declenche`, `leve` |
| Trigger request | `DemandeDeclenchement` / `dem-…` |
| Cascading alert | `MiseEnAlerte` / `alerte-…` |
| Participation | `Participation` / `part-…` |
| Intervention | `Intervention` / `int-…` |
| Journal entry | `JournalEntry` / `j-…` |
| Exercise | `exercice: true` (always isolated) |
| i18n key | `<space>.<screen>.<element>` |
| Route constant | `<SPACE>_<SCREEN>_PATH` |

---

## 17. PDF production brief (for Claude)

When converting this document to PDF:

1. Use **A4 portrait**, 2 cm margins, 11 pt body, 1.15 line height.
2. Render **H1 as cover title**, H2 as section headings starting on the same page unless
   the next section would be split.
3. Keep the tables intact (repeat header rows); do not break a table row across pages.
4. Use a monospace font (e.g. JetBrains Mono / DejaVu Sans Mono) for all code spans,
   identifiers, and key names; ensure Arabic glyphs render with a font that supports RTL
   (e.g. Noto Naskh Arabic) — Arabic examples appear in Section 1 and 9.4.
5. Add a header “CADM v3.0 — Naming Conventions” and a footer with page numbers.
6. Include a clickable table of contents generated from H2 headings.
7. Do not rewrite, summarize, or reorder the content — this file is the source of truth.
