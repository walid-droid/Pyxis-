# Améliorations ORSEC — audit de conformité et propositions d'interfaces

| | |
|---|---|
| **Référence** | PROP-ORSEC-2026-S44 |
| **Date** | 1er novembre 2026 |
| **Source de référence** | `docs/orsec-guide-master.pdf` — *Digital ORSEC Platform, Master System Revision & Architecture Guide* (9 pages) |
| **Base analysée** | `src/App.tsx`, `src/auth/*`, `src/pages/shared/plan/*`, `src/pages/organisme/*`, `src/pages/authority/*`, `src/pages/site/*`, `src/pages/citizen/*`, `public/sw.js` |
| **Nature** | Propositions d'évolution — aucune modification de code dans ce document |
| **Complément** | `docs/ameliorations-par-role.md` (propositions par rôle déjà mises en œuvre) |

---

## 1. Objet et méthode

Le guide ORSEC ne décrit pas seulement des écrans : il fixe une **doctrine de commandement**, un **cycle de vie juridique** et des **obligations de traçabilité**. L'application actuelle couvre déjà correctement la boucle « signaler → planifier → déclencher → rendre compte », mais elle reste majoritairement construite comme un **portail métier unique**, alors que le guide impose des **interfaces séparées par niveau de commandement**.

Chaque proposition est classée :

- **[P1]** conformité opérationnelle ou juridique : à traiter avant toute démonstration « ORSEC réelle » ;
- **[P2]** couverture métier : complète les 13 modules, la sortie de crise et l'information du public ;
- **[P3]** robustesse et cas limites : fiabilité de classe crise, à arbitrer après le socle.

Les propositions sont rattachées à des fichiers existants et à des rôles de `src/auth/roles.ts`. Elles ne reprennent pas ce qui est déjà livré : notifications, exports CSV/impression, PWA de secours, carte, FR/AR RTL, thème sombre, Voirie, Maritime, rapport d'exercice du site.

### 1.1 Les six écrans du guide, confrontés à l'application

| Écran prescrit par le guide | Existant aujourd'hui | Écart principal |
|---|---|---|
| 1. Console exécutive PCF (wali / maire) | `PcfPage`… dans l'espace **organisme**, sans le wali | Le PCF n'est pas dans l'espace de l'autorité ; il ne montre ni réquisitions ni vue macro |
| 2. Écran tactique PCO (DPC / COS) | `PcoPage` avec un fil statique | Pas de main courante saisissable, ni PMA, ni GPS, ni secteurs, ni hors-ligne réel |
| 3. Postes modules spécialisés (13) | Pages génériques santé / voirie / évacuation | Pas de console par module, pas de données propres aux modules 4, 5, 6, 9, 11, 12, 13 |
| 4. App premiers intervenants | `MissionsPage`, `VehiclePage`, `ResourcesPage` | Pas de mode « 4 gros boutons », pas de photo géolocalisée instantanée |
| 5. Portail alerte publique | `AuthorityAlertsPage` valide des alertes internes | Aucun canal de communication publique, aucun démenti de rumeur |
| 6. Panneau Admin & RH | Comptes, rôles, journal | Pas de gestion des **affectations** (titulaire, suppléant, intérim), ni scellement historique |

---

## 2. Synthèse exécutive — les dix décisions structurantes

1. **Ouvrir une vraie console PCF dans l'espace autorité** et rendre la console PCF de l'organisme en lecture seule. Le wali/maire commande la stratégie ; le COS commande la tactique.
2. **Remplacer la notion de « phase » par les Situations A à E** du guide, avec une matrice de transitions signées et justifiées.
3. **Créer une main courante numérique unique**, horodatée, scellée, partagée PCF ↔ PCO ↔ terrain, avec corrections par avenant (jamais par modification silencieuse).
4. **Transformer la réquisition (Art. 70) en workflow** : inventaire privé, génération, signature numérique, accusé de réception, délai maximal, bascule automatique (EC-03), PDF vérifiable.
5. **Introduire la sectorisation multi-PCO** (PCO central + PCO avancés) pour les catastrophes à fronts multiples.
6. **Créer un cockpit par module ORSEC** (les 13), au lieu de réutiliser les mêmes écrans génériques.
7. **Ouvrir un espace de sortie de crise** : évaluation des dégâts (Décret 25-61) et gestion des décombres (Décret 25-62).
8. **Créer le portail d'information publique** (module 4) : communiqués géociblés, consignes, démentis, couverture.
9. **Gérer les affectations dans le temps** et sceller l'ID d'affectation dans chaque décision, entrée de main courante et réquisition.
10. **Traiter les cas limites EC-01 à EC-08** en commençant par la file hors-ligne, l'allocation prioritaire, le panache HAZMAT et la passation de garde.

---

## 3. Ce que le guide impose réellement

| Exigence du guide | Référence | Conséquence pour l'interface |
|---|---|---|
| Hiérarchie des plans : national, inter-wilayas, wilaya, communal, sites sensibles | Loi 24-04, art. 4 et 65-72 | Un niveau `inter_wilaya` doit exister, distinct d'une simple « escalation » de la wilaya |
| Séparation stricte PCF / PCO | § 2 | Deux applications, deux propriétaires, deux jeux d'actions ; le PCF ne place pas les lances |
| 13 modules d'intervention, chacun avec un responsable | § 3 | Autant de cockpits que de modules, avec des données métier différentes |
| Situations A à E | § 6 | Machine à états explicite, transitions autorisées, preuve juridique de chaque bascule |
| Réquisition légale Art. 70 | Loi 24-04, art. 70 | Formulaire, signature, notification, délai, remplacement, journal |
| 6 types d'écrans sur-mesure | § 5 | PCF grand écran, PCO tablette, modules PC, terrain smartphone, portail public, admin |
| Cas limites EC-01 à EC-08 | § 7 | Comportements de secours visibles et testables, pas seulement des messages d'erreur |
| Découplage Rôle / Personne / Affectation | § 4 | Le rôle est permanent, la personne mutable, l'affectation datée et scellée |
| PPI / PII et 2 exercices annuels | Décret 25-63, art. 2-8, 19-21, 24 | Basculement exploitant → Protection civile, calendrier et preuves d'exercice |
| Évaluation des dégâts et décombres | Décrets 25-61 et 25-62 | Formulaires, cartographie, calendrier, dossier intersectoriel |

---

## 4. Audit des écarts

| # | Écart constaté | Preuve dans le code | Risque | Proposition |
|---|---|---|---|---|
| G1 | Le PCF n'est pas accessible au wali ni au président d'APC | `PcfPage.tsx` est routé sous `/organisme/pcf` ; `wali`/`apc_president` n'ont pas `VOIR_PCF` dans `permissions.ts` | L'autorité ne peut pas tenir son propre poste de commandement | § 5.1 |
| G2 | Le PCF de l'organisme peut changer la phase | `PcfPage.tsx` appelle `setPhase` via `CHANGER_PHASE` | Confusion stratégie/tactique ; le guide l'interdit explicitement | § 5.1 et § 6 |
| G3 | Le PCO n'a pas de main courante saisissable | `PcoPage.tsx` affiche `PCO_FEED`, un tableau statique | Perte de la chronologie légale et des preuves de terrain | § 5.2 et § 7 |
| G4 | Pas de PMA, pas de triage, pas de GPS des engins | `PcoPage.tsx` ne contient ni PMA ni positions | Le COS ne peut pas piloter le médical ni vérifier les moyens engagés | § 5.2 |
| G5 | Pas de sectorisation multi-PCO | Un seul `PcoPage`, aucun type `Sector` | Un front multiple (feux simultanés, inondations) sature un PCO unique | § 5.3 |
| G6 | Le cycle de vie est une phase linéaire, pas les Situations A-E | `PlanPhase = "urgence" \| "evaluation" \| "rehabilitation"` dans `orsecPlan.ts` | Pas de pré-alerte, pas d'escalade inter-wilayas, pas de sortie de crise normée | § 6 |
| G7 | Aucune main courante numérique partagée | `HistoryPage.tsx` et `PcoPage.tsx` utilisent des journaux statiques | Audit impossible ; plusieurs versions de la vérité | § 7 |
| G8 | La réquisition n'est qu'un libellé de décision | `AuthorityDecisionsPage.tsx` affiche `authority.decisions.type.requisition` | Aucun acte juridique opposable, aucun délai, aucun remplacement | § 8 |
| G9 | Les 13 modules sont déclarés mais pas outillés | `ORSEC_MODULES` existe ; seuls santé, voirie, évacuation, forêt et maritime ont un écran | Les modules 4, 5, 6, 9, 10, 11, 12, 13 n'ont pas de poste de travail | § 9 |
| G10 | Pas d'évaluation des dégâts ni de gestion des décombres | Aucun écran ni donnée 25-61 / 25-62 | La Situation E ne peut pas être clôturée juridiquement | § 10.2 |
| G11 | Pas de portail d'information publique | `AuthorityAlertsPage` ne diffuse que vers l'interne | Désinformation, consignes contradictoires, pas de canal officiel | § 10.1 |
| G12 | L'affectation temporelle existe dans la session mais n'est pas administrée | `session.ts` porte `titleType` / `from` / `to` ; aucun écran admin ne les gère | Mutations non traçables, suppléants non gérés, audit historique faux | § 10.3 |
| G13 | Les cas limites ne sont pas couverts | PWA = cache de secours (`public/sw.js`) ; pas de file IndexedDB, pas de résolution de conflit | Perte de données en coupure réseau, double affectation, panique | § 11 |
| G14 | Pas de calendrier de conformité | Simulations présentes dans `AuthorityCrisisPage` et `SiteSimulationsPage`, sans obligation ni preuve | Risque de non-respect des 2 exercices annuels (25-63, art. 24) | § 10.4 |
| G15 | Le plan de site n'a pas de basculement PPI/PII | `SitePlanPage` déclenche un plan de site, sans handshake avec la Protection civile | Le passage de l'exploitant au PPI n'est pas tracé | § 10.5 |
| G16 | Pas de mode « mur d'images » PCF | `CrisisMap` est intégré dans des pages, sans mode lecture à distance | Le PCF ne peut pas projeter une vue stable sur grand écran | § 10.6 |

---

## 5. [P1] Séparer réellement les trois niveaux de commandement

### 5.1 Console exécutive PCF — espace autorité

**Principe** : le PCF est dirigé par l'autorité civile (wali ou maire). Il ne fait pas de tactique. Il **déclare**, **arbitre**, **réquisitionne**, **communique** et **rend compte**.

**Cible** : nouvelle page `src/pages/authority/AuthorityPcfPage.tsx`, route `/autorite/pcf`, accessible par `VOIR_PCF` accordé à `wali`, `apc_president` et, en lecture, au `minister` via son périmètre national.

**Structure proposée**

| Zone | Contenu | Actions |
|---|---|---|
| Bandeau de situation | Situation A-E, référence du plan, heure du dernier point, portée territoriale, présence du COS | Ouvrir la fiche de situation |
| Indicateurs stratégiques | Victimes (décédés / blessés / disparus), hébergements ouverts, lits disponibles, modules engagés, taux de saturation | Filtrer par commune / secteur |
| Carte macro | `CrisisMap` en lecture : périmètres de danger, communes touchées, axes coupés, centres ouverts | Sélectionner une zone pour voir la synthèse |
| Changement de situation | Bouton unique, protégé : justification obligatoire, clé de signature, double confirmation | `B → C`, `C → D`, `C → E` selon la matrice § 6.2 |
| File de réquisitions | Demandes préparées par les modules, à signer ou refuser | Signer, refuser avec motif, imprimer |
| État des 13 modules | Responsable désigné, disponibilité, dernier compte rendu, alerte de saturation | Demander un point, désigner un suppléant |
| Décisions & main courante | Fil chronologique en lecture, filtres stratégiques | Exporter le registre |
| Communication publique | Aperçu du dernier communiqué, validateur, portée | Ouvrir le portail § 10.1 |
| Escalade inter-wilayas | Wilayas limitrophes, moyens mutualisés, statut DGPC | Demander l'appui, accepter l'escalade |

**Interdits explicites dans cette console** (à vérifier par permission, pas seulement par l'UI) :

- affecter une équipe à une mission tactique ;
- déplacer un engin ou un itinéraire d'ambulance ;
- modifier une victime ou un triage ;
- clôturer une entrée de main courante rédigée par le COS.

**Réutilisation** : `CrisisMap`, `StatCard`, `Modal`, styles `resp-crise.css`, `PlanContext`. La console PCF de l'organisme (`PcfPage`) devient **« Représentation du PCF »** en lecture seule : elle conserve les renforts et la liste des habilitations, mais retire les boutons de phase.

**Fichiers pressentis**

- `src/pages/authority/AuthorityPcfPage.tsx` (+ CSS éventuelle dans `authority.css`) ;
- `src/config.ts` : `AUTHORITY_PCF_PATH` ;
- `src/App.tsx` : route + entrée de menu avec `VOIR_PCF` ;
- `src/auth/permissions.ts` : `VOIR_PCF` pour `wali` et `apc_president` ;
- `src/pages/organisme/PcfPage.tsx` : suppression du pilotage de phase, renvoi vers la console autorité.

### 5.2 Écran tactique PCO — tablette et PC mobile

**Principe** : le PCO est dirigé par le DPC / COS. Il **exécute**, **chronomètre**, **trie**, **affecte**, **demande**. Il ne déclare pas la situation, il la **constate** et la remonte.

**Cible** : refonte de `src/pages/organisme/PcoPage.tsx` en interface à onglets, utilisable sur tablette, avec une barre d'action collante et un indicateur hors-ligne permanent.

**Onglets proposés**

1. **Situation tactique** : incident actif, secteur, périmètre, météo, dernière remontée, bouton « Point de situation ».
2. **Main courante** : composeur d'entrée (catégorie, texte, GPS, photo, voix), fil chronologique, avenants.
3. **Carte tactique** : engins, ambulances, PMA, points de rassemblement, zones évacuées, routes coupées, position des équipes.
4. **PMA / Triage** : tableau Rouge / Jaune / Vert / Noir, lits de réanimation, banque de sang, rotations d'ambulance, évacuations.
5. **Moyens** : équipes disponibles / engagées / hors service, engins, carburant, détection de double affectation.
6. **Secteurs** : PCO central + PCO avancés, responsable de secteur, effectifs, statut de consolidation.
7. **Renforts & rapports** : demande au PCF, compte rendu, passation de garde.

**Règles d'interface**

- cibles tactiles ≥ 48 px, utilisables avec gants ;
- contraste élevé, mode sombre par défaut sur le terrain ;
- une seule action principale par écran ;
- indicateur `Hors-ligne · N entrées en attente` visible en permanence ;
- jamais de tableau large : listes empilées, badges, cartes ;
- le bouton « Envoyer au PCF » est distinct de « Enregistrer localement ».

**Fichiers pressentis**

- `src/pages/organisme/PcoPage.tsx` (refonte) et composants `PcoMainCourante.tsx`, `PcoPma.tsx`, `PcoSectors.tsx`, `PcoMap.tsx` ;
- `src/pages/organisme/organismeData.ts` : types `PcoSector`, `PmaPatient`, `TacticalUnit` ;
- `src/lib/mainCouranteContext.ts` (§ 7).

### 5.3 Sectorisation multi-PCO

**Principe** : lors d'une catastrophe à fronts multiples, le PCO central se démultiplie en **PCO avancés (PCO-A)**. Chaque secteur a un officier responsable, ses moyens, sa main courante locale ; le PCO central consolide et le PCF arbitre les priorités.

**Modèle minimal**

```ts
type PcoSector = {
  id: string;
  name: Localized;
  commander: string;
  pcoLevel: "central" | "advanced";
  footprint: [number, number][]; // périmètre cartographique
  incidentIds: number[];
  status: "open" | "consolidated" | "closed";
  lastRollupAt: string;
};
```

**Écran** : un sélecteur de secteur en haut du PCO, une vue « Consolidation » pour le PCO central (effectifs, victimes, moyens, saturation par secteur), et une vue « PCF » agrégée par secteur.

**Règle EC-04** : une modification de terrain du COS prévaut sur une édition statique du PCF ; l'UI doit afficher « Dernière remontée terrain » et non permettre au PCF d'écraser silencieusement une donnée tactique.

---

## 6. [P1] Situations A à E et matrice de transitions

### 6.1 Les cinq situations

| Code | Situation | Déclencheur | Ce que change l'interface |
|---|---|---|---|
| **A** | État normal | Fin de crise, plan approuvé | Veille, annuaire des 13 modules, stocks, calendrier des exercices, taux de préparation |
| **B** | Pré-alerte | BMS ONM, indice feu, secousse CRAAG, seuil hydrologique | Bandeau orange, pré-alerte des 13 responsables, accusés de réception, carte des communes vulnérables ; **aucun engagement de moyens** |
| **C** | Urgence active | Déclaration signée du wali/maire | Ouverture PCF + PCO, main courante, réquisitions, communication publique, situation toutes les 30 min |
| **D** | Escalade inter-wilayas | Saturation des capacités, décision DGPC | Bandeau rouge, dashboards des wilayas limitrophes, pool de moyens mutualisés, commandement DGPC |
| **E** | Évaluation & réhabilitation | Fin des opérations de secours | Bascule vers inspection des bâtiments, dégâts 25-61, décombres 25-62, dossier intersectoriel, RETEX |

### 6.2 Matrice de transitions

| Depuis | Vers | Acteur | Conditions | Preuve exigée |
|---|---|---|---|---|
| A | B | Autorité ou veille | Faisceau d'indices / BMS / seuil | Source, zone, niveau, notification aux modules |
| B | A | Autorité | Fin de l'alerte | Justification |
| B | C | Wali / maire | Pré-alerte active, moyens prêts | Clé de signature + justification + modules concernés |
| C | D | Wali / ministre / DGPC | Capacité locale saturée ou débordement territorial | Demande d'appui, accord DGPC, liste des wilayas |
| D | C | DGPC | Retour sous seuil | Décision de rétrocession, justification |
| C | E | Wali / maire | Fin des opérations de secours | Rapport de clôture, bilan victimes, état des moyens |
| E | A | Autorité | Dossier 25-61 transmis, décombres planifiés, RETEX validé | Références des pièces, signature |
| A / B | A | Autorité | Annulation / faux positif | Motif, notification |

**Règles**

- aucune transition directe `A → C` sans passer par B, sauf **déclenchement d'urgence immédiat** avec justification et signature (cas prévu par la loi, à tracer comme dérogation) ;
- chaque transition produit une entrée de main courante et une notification aux 13 modules ;
- l'interface ne propose que les transitions autorisées pour le rôle et la situation courante ;
- un bandeau global (`Situation B — Pré-alerte`) est visible dans tous les espaces, avec la couleur et le libellé AR.

### 6.3 Modèle de données proposé

```ts
export type SituationCode = "A" | "B" | "C" | "D" | "E";

export type SituationTransition = {
  id: string;
  from: SituationCode;
  to: SituationCode;
  at: string;                 // ISO 8601
  by: string;                 // personne
  assignmentId: string;       // affectation scellée
  role: Role;                 // rôle au moment de l'acte
  justification: string;
  signatureHash: string;
  source?: string;            // BMS, CRAAG, ANRH…
  moduleIds: ModuleId[];
};
```

Ajouter `situation: SituationCode` et `transitions: SituationTransition[]` à `OrsecPlan`, sans supprimer `status` (cycle d'approbation) ni `phase` (séquence opérationnelle). La page `AuthorityPlanPage` gagne un **panneau « Situation »** au-dessus du stepper existant.

### 6.4 Migration depuis l'existant

| Aujourd'hui | Devient |
|---|---|
| `status: draft / pending / approved` | Cycle d'**approbation** du plan, inchangé |
| `status: alert` | Situation **B** |
| `status: active` + `phase: urgence` | Situation **C** |
| `phase: evaluation` | Situation **E** (phase d'évaluation) |
| `phase: rehabilitation` | Situation **E** (phase de réhabilitation) |
| `status: approved` + `liftedAt` | Situation **A** (retour au normal) |
| Escalade inter-wilayas | Nouvelle situation **D** |

---

## 7. [P1] Main courante numérique partagée

### 7.1 Principes

La main courante est **la** pièce d'audit de la crise. Elle doit être :

- **append-only** : on n'efface pas, on ajoute un avenant lié ;
- **horodatée** et **géolocalisée** quand l'entrée vient du terrain ;
- **signée** par une affectation (`assignmentId`), pas seulement par un nom ;
- **scellée** par un chaînage de hachage (`prevHash` → `hash`) pour détecter toute réécriture ;
- **partagée** : PCF, PCO, autorité et modules lisent le même flux, avec des droits d'écriture différents ;
- **exportable** : PDF officiel + CSV, avec filtre par période, secteur, module, auteur.

### 7.2 Modèle

```ts
type MainCouranteEntry = {
  id: string;
  at: string;
  authorName: string;
  assignmentId: string;
  role: Role;
  scope: "pcf" | "pco" | "sector" | "module" | "authority";
  sectorId?: string;
  category: "alerte" | "operation" | "victime" | "moyen" | "decision" | "communication" | "rehabilitation";
  message: string;
  coordinates?: [number, number];
  attachments?: { id: string; name: string; kind: "photo" | "pdf" | "audio" }[];
  amendmentOf?: string;
  prevHash: string;
  hash: string;
  syncStatus: "local" | "synced";
};
```

### 7.3 Écrans

| Écran | Rôle | Fonctions |
|---|---|---|
| Composeur PCO | `pc_lead`, `unit_lead`, `pc_agent` | Catégorie, texte, GPS, photo, voix, envoi local puis synchronisation |
| Fil PCF | `wali`, `apc_president`, `minister` | Lecture, filtres, export, annotation stratégique (avenant) |
| Fil module | `org_director`, `org_agent` | Entrées de son module uniquement |
| Journal public | Citoyen | Version résumée et validée, sans données personnelles |
| Audit admin | `admin` | Vérification de la chaîne, export, replay à une date |

### 7.4 Hors-ligne

Chaque entrée créée hors connexion reçoit un **ID local** et un statut `local`. À la reconnexion :

1. envoi dans l'ordre chronologique ;
2. déduplication par ID ;
3. en cas de conflit, **primauté du terrain** (EC-04) : l'entrée du COS est conservée, l'entrée PCF devient un avenant explicite ;
4. l'utilisateur voit `N entrées synchronisées` ou `N conflits à arbitrer`.

**Fichiers pressentis** : `src/lib/mainCouranteContext.ts`, `src/components/MainCourante.tsx` + CSS, `src/i18n/mainCourante.ts`, branché dans `PlanProvider` ou un provider dédié.

---

## 8. [P1] Réquisition légale (Art. 70)

### 8.1 Workflow complet

| État | Déclencheur | Acteur | Effet |
|---|---|---|---|
| `draft` | Besoin identifié par un module | Responsable de module | Proposition, moyen, lieu, délai |
| `signed` | Validation de l'autorité | Wali / maire | Signature numérique, hash, PDF généré |
| `notified` | Envoi au propriétaire / exploitant | PCF | SMS / push / remise en main propre |
| `acknowledged` | Accusé du propriétaire | Propriétaire | Délai de mise à disposition |
| `in_progress` | Moyen en route | Module | Position / ETA |
| `completed` | Moyen arrivé et affecté | Module | Preuve photo, bon de réception |
| `refused` | Refus explicite | Propriétaire | Motif, signalement Art. 85 |
| `timeout` | Pas d'accusé sous T_max (15 min) | Système | Bascule automatique sur moyen équivalent |
| `cancelled` | Plus besoin | Autorité | Motif, notification |

### 8.2 Formulaire de réquisition

Champs obligatoires : base légale (Art. 70), autorité signataire, identité du propriétaire (NIN), moyen (nature, immatriculation / série), lieu de mise à disposition, date/heure de début et de fin, indemnisation prévue, mode de notification, témoin éventuel, hash de signature.

### 8.3 Écran

- **File d'attente PCF** : demandes par module, niveau d'urgence, délai restant, bouton « Signer ».
- **Détail** : pièces jointes, carte du lieu, historique des notifications, accusés.
- **Registre** : recherche par propriétaire, moyen, module, période ; export CSV/PDF.
- **QR de vérification** sur le PDF : ouvre la fiche publique de la réquisition et vérifie le hash.

### 8.4 EC-03 — panne ou refus

Si le propriétaire ne confirme pas sous **15 minutes** :

1. l'entrée passe en `timeout` ;
2. le système recherche le moyen équivalent le plus proche (même type, même capacité) ;
3. une nouvelle réquisition est proposée, l'ancienne reste dans le registre avec le motif ;
4. le PCF est notifié, avec un indicateur « remplacement automatique » ;
5. le refus explicite est consigné et signalé (Art. 85), sans bloquer l'opération.

**Fichiers pressentis** : `src/lib/requisitionsContext.ts`, `src/pages/authority/AuthorityRequisitionsPage.tsx`, `src/i18n/requisitions.ts`, entrée de menu PCF et `AUTHORITY_DECISIONS_PATH`.

---

## 9. [P2] Les 13 cockpits de module

### 9.1 Couverture actuelle et cible

| # | Module | Responsable | Existant | Cockpit à créer |
|---|---|---|---|---|
| 1 | Secours & sauvetage | DPC / chef d'unité | Missions, moyens, PCO | Engins, équipes, victimes extraites, pompes, cynophiles, hélicoptères |
| 2 | Sécurité & ordre public | GN / Sûreté | Voirie, missions | Périmètres, déviations, identification des victimes, garde des archives |
| 3 | Santé | DSP / EPSP | Victimes, urgences | Lits Réa / bloc, sang, triage, transferts, PMA |
| 4 | Information & communication | Chef de cabinet / SG | Aucun | Communiqués, rumeurs, BMS, couverture, portée |
| 5 | Solidarité & approvisionnement | DCP / DASS | Aucun | Stocks, rations, couvertures, points de distribution, CRA |
| 6 | Énergie | DEM / Sonelgaz | Aucun | Coupures, sites prioritaires, groupes, carburant, rétablissement |
| 7 | Hébergement provisoire | DUAC / DEP | Évacuation, abris citoyens | Centres, capacité, occupation, besoins, familles |
| 8 | Travaux publics | DTP | Voirie | Engins lourds, axes, ponts de secours, déblaiement |
| 9 | Eau potable | DRE / ADE / ONA | Veille hydro | Camions-citernes, conduites, potabilité, stations |
| 10 | Matériels & équipements | DAL / Forêts | Moyens, véhicules | Inventaire, parc privé, réquisitions, disponibilité |
| 11 | Télécommunications | DPT / Algérie Télécom | Aucun | Radios, lignes d'urgence, couverture, antennes mobiles |
| 12 | Transport | DT | Évacuation | Bus, camions, rotations, itinéraires, capacités |
| 13 | Expertises & bilans | DPSB / Domaines | Aucun | Dégâts, sinistrés, estimation financière, dossier post-crise |

### 9.2 Architecture recommandée

- une route `/organisme/module/:moduleId`, protégée par une permission `CONSOLE_MODULE` **et** une désignation `MODULE_MANAGER` portant le `moduleId` ;
- un fichier de configuration `src/pages/organisme/moduleConsoles.ts` : titre, indicateurs, widgets, actions, données de démonstration ;
- un composant générique `ModuleConsolePage` qui compose des panneaux ; les modules 3, 7, 8, 13 reçoivent en plus un panneau métier dédié ;
- un lien depuis `OrganismeDashboard` et depuis la fiche de désignation du plan ;
- une carte de synthèse « 13 modules » dans le PCF et le PCO.

**Priorité d'implémentation** : Santé (3), Travaux publics (8), Énergie (6), Hébergement (7), Expertises (13), puis Information (4), Solidarité (5), Eau (9), Télécom (11), Transport (12), Matériels (10), Sécurité (2), Secours (1).

### 9.3 Exemples de contenu

**Santé** : lits disponibles par établissement, lits de réanimation, blocs opératoires, stock de sang par groupe, file SAMU, patients triés, transferts en cours, alerte de saturation.

**Travaux publics** : parc d'engins (bulldozers, excavateurs, camions), état des axes, ponts de secours, chantiers de déblaiement, carburant, demandes de réquisition.

**Énergie** : coupures par commune, sites prioritaires (hôpitaux, PMA, centres d'accueil), groupes électrogènes, citernes Naftal, ETA de rétablissement.

**Hébergement** : centres ouverts, capacité / occupation, familles hébergées, stock de couvertures, besoins, sanitaires, accessibilité PMR.

**Expertises** : formulaires 25-61, bâtiments inspectés (vert/orange/rouge), sinistrés, estimations, pièces, transmission au comité intersectoriel.

---

## 10. [P2] Compléter le cycle ORSEC

### 10.1 Portail d'alerte et d'information publique (module 4)

**Constat** : `AuthorityAlertsPage` valide des alertes internes ; aucun écran ne rédige, ne géocible et ne publie un message au public.

**Cible** :

- page autorité `/autorite/communication` : rédaction FR/AR, modèles (évacuation, confinement, route coupée, retour à la normale), zone géographique, canal (push, SMS, site public), planification, validation par l'autorité, couverture et accusés ;
- page publique `/information` : situation en cours, consignes, abris ouverts, carte, dernière mise à jour, accessibilité, faible bande passante ;
- registre des rumeurs : source, affirmation, réponse officielle, statut (à vérifier / démenti / confirmé) ;
- permission `PUBLIER_COMMUNIQUE` et `DEMENTIR_RUMEUR`, accordées par désignation `INFORMATION_OFFICER` (chef de cabinet, chargé de communication) pour ne pas créer un 23e rôle.

**Point d'attention RTL** : les messages publics doivent être stockés en FR et AR, jamais traduits à la volée ; les modèles doivent être relus par un locuteur arabophone.

### 10.2 Sortie de crise : dégâts (25-61) et décombres (25-62)

**Cible** : page `/autorite/rehabilitation` avec deux onglets.

**Évaluation des dégâts (25-61)**

- inspection des bâtiments : vert / orange / rouge, photos, GPS, adresse, propriétaire, occupation ;
- formulaire par ménage / entreprise : logement, biens, activité, pertes estimées, pièces ;
- consolidation par commune, secteur et module ;
- dossier intersectoriel : synthèse, total financier, pièces, statut de transmission ;
- export PDF/CSV avec références et signatures.

**Gestion des décombres (25-62)**

- points de collecte, sites de dépôt, périmètres ;
- calendrier de déblaiement par zone ;
- tonnage estimé / réalisé, engins affectés, entreprises ;
- contrôle environnemental : amiante, produits dangereux, eau, sol ;
- suivi des réclamations et du nettoiement final.

**Rattachement** : la Situation E ne peut être clôturée que si le dossier 25-61 est transmis et le plan 25-62 est validé.

### 10.3 Découplage temporel Rôle / Personne / Affectation

**Constat** : `session.ts` modélise déjà `Assignment` (`TITULAIRE`, `SUPPLEANT_1`, `SUPPLEANT_2`, `INTERIM`, `from`, `to`), mais aucun écran d'administration ne le gère et aucune décision ne scelle l'ID d'affectation.

**Cible** :

- page admin `/admin/affectations` : personne, rôle, organisme, territoire, type de titre, début, fin, statut, suppléant de, motif ;
- contrôle de chevauchement : un seul titulaire actif par poste ;
- expiration automatique et alerte J-30 / J-7 ;
- bandeau global « Vous agissez en tant que suppléant de [poste] jusqu'au [date] » ;
- scellement de `assignmentId` dans `PlanLog`, `MainCouranteEntry`, `SituationTransition`, `Requisition`, exports ;
- journal admin filtrable par date d'affectation, avec un mode « Qui était en poste le 15/07/2024 ? » ;
- conservation des décisions passées : un nouveau wali ne réécrit pas l'audit de 2024.

**Fichiers pressentis** : `src/pages/admin/AssignmentsPage.tsx`, `src/auth/assignments.ts`, extension de `AdminContext` / `adminData.ts`, `AssignmentBanner` dans `AppShell`.

### 10.4 Calendrier de conformité et fiches 01 à 11

**Cible** : panneau « Conformité » dans la page plan de l'autorité et dans l'admin.

- obligations : 2 exercices annuels (25-63, art. 24), programme ORSEC 2026, révision du plan, mise à jour des contacts, inventaire des moyens ;
- statut : à planifier / planifié / réalisé / en retard ;
- preuves : date, scénario, participants, rapport, écarts, actions correctives ;
- taux de complétude des **11 fiches** du canevas bleu (Fiches 01 à 11), avec pièces jointes et dates ;
- alerte sur `revisionDue` déjà présent dans `OrsecPlan`.

### 10.5 Site sensible : PPI / PII et basculement

**Cible** : compléter `SitePlanPage`.

- distinguer **PII** (plan interne de l'exploitant) et **PPI** (plan particulier d'intervention) ;
- bouton « Dépassement de capacité » : l'exploitant déclare le basculement, la Protection civile prend la main, le wali est informé ;
- preuve : horodatage, motif, seuil dépassé, personnes présentes, moyen demandé ;
- étude de danger (06-198) : document, date, version, validation ;
- exercices : au moins 2 par an, avec rapport et actions correctives.

### 10.6 Mode « mur d'images » PCF

**Cible** : un mode plein écran, sans navigation, lancé depuis la console PCF.

- carte macro plein écran, rotation automatique entre vues (situation, moyens, victimes, hébergements) ;
- typographie très grande, contrastes élevés, aucune interaction requise ;
- bandeau situation A-E et horloge ;
- bascule automatique en mode dégradé si le réseau tombe (dernière image connue + heure).

---

## 11. [P3] Cas limites EC-01 à EC-08

| Code | Cas | Aujourd'hui | Proposition d'interface |
|---|---|---|---|
| **EC-01** | Blackout 4G / électricité | Service worker de cache, pas de file métier | File IndexedDB, statut `local`, synchronisation, relais local simulé, indicateur de conflits |
| **EC-02** | Catastrophes en cascade | Aucune priorisation | Moteur de priorité (vie humaine d'abord), détection de double affectation, alerte de goulot au PCF |
| **EC-03** | Refus / panne d'un moyen réquisitionné | Réquisition non outillée | Timeout 15 min, bascule sur moyen équivalent, signalement Art. 85 |
| **EC-04** | Conflit d'édition PCO / PCF | Aucune règle | Primauté du terrain, horodatage, avenant visible, pas d'écrasement silencieux |
| **EC-05** | Conflit maire / wali | Pas de règle | L'ORSEC wilaya absorbe l'ORSEC communal ; bandeau d'override et journal |
| **EC-06** | Panache toxique HAZMAT | Aucun écran | Périmètre dynamique selon vent ONM, zones d'évacuation, alerte secouristes |
| **EC-07** | Rotation de garde COS | Aucune passation | Transfert de session à deux facteurs, rapport d'état scellé, double validation |
| **EC-08** | Surcharge WebSocket | Aucun mécanisme | Mode dégradé, fréquence réduite pour les véhicules non critiques, alerte de fraîcheur |

**Priorité P3** : EC-01 (déjà amorcé par la PWA), EC-04 (règle de gouvernance), EC-07 (passation), puis EC-02, EC-06, EC-08.

---

## 12. Impacts par rôle

| Rôle | Interface à créer / modifier | Permission ou désignation |
|---|---|---|
| `citizen` | Portail public `/information`, suivi des consignes et des abris | — |
| `farmer` | Portail public + déclaration de dégâts agricoles dans le dossier 25-61 | `CREER_SIGNALEMENT` |
| `organism` | Écran de transition vers les rôles nominatifs | — |
| `admin` | Affectations temporelles, audit par date, matrice des transitions | `GERER_PERMISSIONS`, `ATTRIBUER_ROLE` |
| `wali` | **Console PCF**, réquisitions, situations, escalade inter-wilayas, communication | `VOIR_PCF` (à ajouter), `SIGNER_REQUISITION` |
| `apc_president` | **PCF communal**, réquisitions, hébergement, dégâts communaux | `VOIR_PCF` (à ajouter) |
| `minister` | PCF national en lecture, arbitrage inter-wilayas, consolidation 25-61 | `VOIR_PCF` en lecture, `ARBITRER_APPUI` |
| `site_operator` | PPI/PII, basculement, étude de danger, exercices | `DECLENCHER_PLAN`, `DEMANDER_BASCULEMENT` |
| `forecaster` | Situation B : proposition de pré-alerte, seuils, bulletin | `SURVEILLER_RISQUES`, `PROPOSER_PRE_ALERTE` |
| `forestry_agent` | Situation B : indice feu, signalement, appui secours | `SURVEILLER_RISQUES` |
| `org_director` | **Console de module**, réquisitions, représentation PCF en lecture | `CONSOLE_MODULE`, `MODULE_MANAGER` |
| `unit_lead` | PCO de secteur, main courante, demande de renfort | `CONSOLE_PCO`, `CONSOLE_SECTEUR` |
| `pc_lead` | **PCO complet** : main courante, PMA, secteurs, passation | `CONSOLE_PCO`, `PCO_DIRECTOR` |
| `medical_lead` | PMA / triage, lits, sang, transferts | `SUIVRE_VICTIMES`, `CONSOLE_PMA` |
| `evac_lead` | Hébergement, transport, itinéraires, capacités | `GERER_EVACUATIONS` |
| `pc_agent` | Mode terrain : 4 boutons, photo GPS, main courante | `EXECUTER_MISSION` |
| `engine_chief` | Mode terrain + état de l'engin, carburant, position | `SUIVRE_VEHICULE` |
| `police` | Périmètres, déviations, routes, identification | `SECURISER_ZONES` |
| `gendarmerie` | Idem + convois, garde des archives | `SECURISER_ZONES` |
| `coast_guard` | Maritime (déjà livré) + rattachement au module sécurité | `SURVEILLER_MARITIME` |
| `emergency_doctor` | Triage PMA, victimes, urgences | `SUIVRE_VICTIMES` |
| `org_agent` | Console de module en saisie, main courante de module | `CONSOLE_MODULE` |

---

## 13. Routes, permissions et modèles à ajouter

### 13.1 Nouvelles routes

| Route | Espace | Page |
|---|---|---|
| `/autorite/pcf` | autorité | `AuthorityPcfPage` |
| `/autorite/requisitions` | autorité | `AuthorityRequisitionsPage` |
| `/autorite/communication` | autorité | `AuthorityCommunicationPage` |
| `/autorite/rehabilitation` | autorité | `AuthorityRecoveryPage` |
| `/admin/affectations` | admin | `AssignmentsPage` |
| `/organisme/module/:moduleId` | organisme | `ModuleConsolePage` |
| `/organisme/pco/secteur/:sectorId` | organisme | `PcoSectorPage` (ou onglet) |
| `/information` | public | `PublicInformationPage` |

### 13.2 Nouvelles permissions

| Permission | Usage | Rôles / désignations |
|---|---|---|
| `VOIR_PCF` | Ouvrir la console PCF | `wali`, `apc_president`, `minister` (lecture) |
| `SIGNER_REQUISITION` | Signer un ordre de réquisition | `wali`, `apc_president` |
| `CONSOLE_MODULE` | Ouvrir un cockpit de module | `org_director`, `org_agent` + `MODULE_MANAGER` |
| `CONSOLE_PMA` | Tenir le PMA / triage | `medical_lead`, `emergency_doctor` |
| `CONSOLE_SECTEUR` | Piloter un PCO avancé | `unit_lead` + désignation secteur |
| `PUBLIER_COMMUNIQUE` | Publier une information publique | désignation `INFORMATION_OFFICER` |
| `DEMENTIR_RUMEUR` | Répondre à une rumeur | désignation `INFORMATION_OFFICER` |
| `PROPOSER_PRE_ALERTE` | Proposer une Situation B | `forecaster`, `forestry_agent` |
| `DEMANDER_BASCULEMENT` | Déclarer le dépassement PII → PPI | `site_operator` |
| `ARBITRER_APPUI` | Arbitrer les appuis inter-wilayas | `minister` |
| `GERER_AFFECTATIONS` | Gérer les affectations | `admin` |

### 13.3 Nouveaux contextes / modèles

| Fichier | Rôle |
|---|---|
| `src/lib/mainCouranteContext.ts` | Journal append-only, chaînage, sync, avenants |
| `src/lib/requisitionsContext.ts` | Cycle de vie des réquisitions, timeout, remplacement |
| `src/lib/situation.ts` | Situations A-E, matrice, transitions, signatures |
| `src/auth/assignments.ts` | Affectations, chevauchements, expiration, scellement |
| `src/pages/organisme/moduleConsoles.ts` | Configuration des 13 cockpits |
| `src/pages/organisme/pcoSectors.ts` | Secteurs, responsables, consolidation |
| `src/pages/authority/recoveryData.ts` | Dégâts, bâtiments, décombres |

---

## 14. Principes de design par interface

| Interface | Ambiance | Règles |
|---|---|---|
| **PCF** | Clair, calme, institutionnel | Lecture à 3 m, 3 colonnes maximum, grands chiffres, aucune action destructive sans double confirmation |
| **PCO** | Sombre, contraste élevé, tactique | Cibles ≥ 48 px, une main, barre d'action collante, hors-ligne visible, pas de tableaux larges |
| **Terrain** | Minimal, gros boutons | 4 états : `En route`, `Sur les lieux`, `Mission accomplie`, `Renfort urgent` ; photo/GPS en un geste |
| **Modules** | Dense, métier | Indicateurs + liste + action ; filtrer par module et par territoire |
| **Public** | Accessible, faible bande passante | FR/AR, textes courts, icônes, carte légère, aucune authentification |
| **Admin** | Tableau de bord | Audit, filtres, export, historique par date d'affectation |

**Contraintes transverses** : FR/AR avec RTL complet ; les cartes ne sont pas miroir ; les nombres, plaques et coordonnées restent LTR ; le mode sombre se charge après les CSS de page ; toute action doit être réversible ou tracée.

---

## 15. Feuille de route

### Lot 0 — Quick wins de démonstration (2 à 3 jours)

- bandeau Situation A-E global, branché sur `PlanContext` ;
- console PCF **en lecture seule** dans l'espace autorité (situation, carte, modules, réquisitions) ;
- main courante **en lecture** partagée entre PCF et PCO ;
- page publique `/information` statique avec situation et consignes ;
- file de réquisitions avec les 5 états principaux.

### Lot 1 — Conformité opérationnelle (2 à 3 semaines)

- console PCF complète + retrait du pilotage de phase côté organisme ;
- machine à états A-E avec signatures et matrice ;
- main courante saisissable, scellée, hors-ligne ;
- PCO tactique : main courante, PMA, secteur, moyens ;
- réquisitions Art. 70 complètes avec timeout EC-03 ;
- gestion des affectations et bandeau « suppléant ».

### Lot 2 — Couverture métier (3 à 4 semaines)

- 13 cockpits de module (générique + 5 détaillés) ;
- portail d'information publique et registre des rumeurs ;
- espace de réhabilitation 25-61 / 25-62 ;
- PPI/PII du site et basculement ;
- calendrier de conformité et fiches 01-11 ;
- mode terrain « 4 boutons ».

### Lot 3 — Robustesse (2 à 3 semaines)

- EC-01 file offline + résolution de conflits ;
- EC-02 allocation prioritaire et anti-double affectation ;
- EC-06 panache HAZMAT ;
- EC-07 passation de garde ;
- EC-08 mode dégradé ;
- mode mur d'images PCF ;
- contrats API REST / WebSocket et journal d'audit immuable.

---

## 16. Scénario d'acceptation

**Béjaïa — inondation de la Soummam + feu simultané à Gouraya.**

1. L'ONM et la CRAAG déclenchent des signaux ; le prévisionniste et l'agent forestier proposent une **Situation B**. Les 13 responsables reçoivent une pré-alerte et accusent réception.
2. Le wali déclare la **Situation C** avec justification et signature. Le PCF s'ouvre côté autorité, le PCO côté Protection civile, un secteur avancé est créé à Akbou.
3. Le COS saisit la main courante depuis la tablette ; une coupure réseau survient : les entrées restent locales, puis se synchronisent. Le PCF voit la chronologie et le nombre d'entrées en attente.
4. Le module Travaux publics demande un bulldozer privé ; le PCF signe la réquisition ; le propriétaire ne répond pas sous 15 minutes ; le système bascule sur un engin équivalent et conserve la trace du refus.
5. Les capacités de la wilaya saturent ; le wali demande l'appui de Tizi Ouzou ; la **Situation D** est déclenchée sous l'égide de la DGPC ; les dashboards des deux wilayas sont fédérés.
6. Les secours se terminent ; la **Situation E** ouvre l'inspection des bâtiments, le dossier 25-61 et le plan de décombres 25-62.
7. Six mois plus tard, un audit rejoue la crise : chaque décision affiche la personne, le rôle et l'affectation en vigueur au moment des faits, y compris si le wali a changé.

---

## 17. Ce qu'il ne faut pas faire

1. **Fusionner PCF et PCO** dans une seule page « crise » : c'est l'erreur que le guide identifie comme majeure.
2. **Donner au PCF les boutons tactiques** (affectation d'équipe, itinéraire, triage) : cela paralyse le COS.
3. **Réutiliser les mêmes écrans pour les 13 modules** : les données et les gestes métier sont différents.
4. **Modifier une entrée de main courante** : toujours ajouter un avenant lié.
5. **Clore une Situation E** sans dossier 25-61 ni plan 25-62.
6. **Créer un 23e rôle** pour le chargé de communication : utiliser une désignation `INFORMATION_OFFICER`.
7. **Traduire les communiqués à la volée** : stocker FR et AR validés.
8. **Supprimer les données historiques lors d'une mutation** : le découplage temporel est la garantie légale.

---

## 18. Traçabilité guide → propositions

| Section du guide | Écart | Propositions |
|---|---|---|
| § 1 Cadre légal (24-04, 25-63, 25-61, 25-62, 06-198) | G6, G10, G14, G15 | § 6, § 10.2, § 10.4, § 10.5 |
| § 2 PCF vs PCO | G1, G2, G3, G4 | § 5.1, § 5.2 |
| § 2 Multi-PCO / sectorisation | G5 | § 5.3 |
| § 3 Les 13 modules | G9 | § 9 |
| § 4 Découplage temporel | G12 | § 10.3 |
| § 5 Les 6 écrans | G1-G4, G9, G11 | § 5, § 9, § 10.1, § 10.6 |
| § 6 Situations A-E | G6 | § 6 |
| § 7 Cas limites EC-01 à EC-08 | G13 | § 11 |
| § 8 Contrats API | Absence de backend | § 13.3, Lot 3 |
| § 9 Feuille de route | — | § 15 |

---

*Document de proposition. Les fichiers cités sont des cibles d'implémentation, pas des modifications déjà réalisées.*
