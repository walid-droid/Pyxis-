# Améliorations proposées — par rôle

| | |
|---|---|
| **Référence** | PROP-ROLE-2026-S44 |
| **Date** | 1er novembre 2026 |
| **Périmètre** | 22 rôles de `src/auth/roles.ts`, 5 espaces (population, autorité, site, organisme, administration) |
| **Base analysée** | `roles.ts`, `permissions.ts`, `App.tsx` (menus), `orgAccess.ts` (pages organisme), pages de `src/pages/*` |
| **Nature** | Propositions d'évolution fonctionnelle et ergonomique — aucune modification de code dans ce document |

---

## 1. Objet et méthode

Chaque rôle est décrit tel qu'il fonctionne aujourd'hui (espace, écrans réellement accessibles, permissions), puis recevait une liste d'améliorations classées :

- **[P1]** gain immédiat pour l'usage quotidien du rôle (à faire en priorité) ;
- **[P2]** confort ou couverture fonctionnelle supplémentaire ;
- **[P3]** ouverture produit, à arbitrer.

Les propositions s'appuient sur l'existant : `CrisisMap`, `AssistantPage` (popup IA présent dans `AppShell`), `StatCard`, les contextes `PlanContext` / `OrganismeContext` / `AdminContext`. Elles évitent de proposer ce qui existe déjà (FR/AR RTL, thème sombre, carte Leaflet, assistant IA).

---

## 2. Constats transverses

1. **Aucun centre de notifications.** Les alertes, validations, renforts et changements de phase ne génèrent aucune notification : l'utilisateur doit revenir sur la page pour voir l'évolution. → brique à construire une fois pour tous les rôles.
2. **Aucun mode hors-ligne.** Rien n'est persisté (pas de `localStorage` métier, pas de service worker, pas de manifeste). Les rôles terrain (`pc_agent`, `police`, `gendarmerie`, `engine_chief`, `org_agent`, `forestry_agent`) travaillent précisément là où le réseau manque.
3. **La carte n'est disponible que par intermittence** (`MissionsPage`, `WatchPage`) alors que presque tous les rôles raisonnent en géographie.
4. **Des actions sans effet.** Exemple : le bouton « Rapport détaillé » de `SiteSimulationsPage` n'a aucun `onClick`. Plusieurs écrans de démonstration ont des commandes inertes, ce qui brouille la lecture du produit.
5. **Des droits incohérents entre rôles proches** (voir § 3), à corriger avant d'ajouter des fonctionnalités.

### 2.1 Défauts d'accès repérés (à corriger)

| Rôle | Constat | Correction proposée |
|---|---|---|
| `forestry_agent` | Peut créer un signalement (`CREER_SIGNALEMENT`) mais n'a pas `CONSULTER_SIGNALEMENT` → aucun écran pour suivre ses propres signalements | Ouvrir `reports` en lecture pour l'auteur, ou ajouter « Mes signalements » |
| `police`, `gendarmerie` | Aucune permission `RECENSER_MOYENS` → pas de page Moyens, impossible de déclarer véhicules et effectifs engagés | Ajouter `RECENSER_MOYENS` (ou une vue Moyens en lecture seule) |
| `site_operator` | Pas de `CONSULTER_HISTORIQUE` → aucun historique des changements de statut du plan du site | Ajouter l'historique du plan (journal local) |
| `minister` | Peut déclencher/lever le plan mais pas valider les alertes | Assumer le choix (validation déléguée) ou ajouter `VALIDER_ALERTE` |
| `evac_lead` | `needsOrganism: false` alors que tous les autres rôles organisme l'exigent | Aligner sur `true` (rattachement obligatoire) |

---

## 3. Socle commun (à construire une fois, réutilisé par tous)

| Brique | Contenu | Rôles concernés |
|---|---|---|
| **Centre de notifications** | Cloche + panneau, notifications typées (alerte, mission, renfort, phase), marquage lu/non lu, filtre par rôle | Tous |
| **PWA hors-ligne** | Manifeste + service worker + file d'attente IndexedDB, bandeau « hors connexion », synchro à la reconnexion | Terrain et site |
| **Carte unifiée** | `CrisisMap` en composant partagé : calques incidents / moyens / zones évacuées / routes coupées, filtre par périmètre | Autorité, organisme, site |
| **Export & impression** | Export PDF des rapports, décisions, bilans victimes ; CSV des listes ; en-tête officiel | Autorité, organisme, admin |
| **Assistant contextualisé** | `AssistantPage` nourri par le rôle : résumé de situation, brouillon de rapport, aide à la saisie | Tous |

---

## 4. Population

### Citoyen — `citizen`
**Aujourd'hui** : 7 écrans (`/dashboard`, alertes, consignes, ressources, événements, mes signalements, contacts) ; permission `CREER_SIGNALEMENT`.
**À renforcer** : le signalement est un aller sans retour — pas de statut, pas de notification, pas de preuve.

- **[P1]** Suivi du signalement en temps réel dans `MyReportsPage` : statut (reçu → confirmé → traité → clôturé), horodatage, organisme en charge, motif de rejet.
- **[P1]** Notifications push (alerte, changement de phase, consigne) avec réglage par type.
- **[P2]** Alerte géolocalisée « autour de moi » : distance à l'incident, itinéraire vers l'abri le plus proche (`SheltersPage` existe mais n'est pas relié aux alertes).
- **[P2]** Fiche de vulnérabilité (PMR, personnes à prévenir) réutilisée par les secours.
- **[P3]** Signalement hors-ligne (file d'attente) et consignes vocales FR/AR.

### Agriculteur — `farmer`
**Aujourd'hui** : identique au citoyen (même espace, même permission) ; la description du rôle évoque les dégâts aux exploitations, sans écran dédié.

- **[P1]** Formulaire « dégâts agricoles » : parcelle, culture, superficie, photos, estimation, envoi au module agriculture.
- **[P1]** Distinction des signalements agricoles dans la file de l'organisme (étiquette dédiée).
- **[P2]** Suivi de l'indemnisation : dossier, pièces, attestation PDF.
- **[P3]** Alertes ciblées par culture et par commune (gel, crue, incendie) + calendrier cultural.

### Compte organisme (héritage S1) — `organism`
**Aujourd'hui** : 3 écrans (signalements, missions, moyens) ; rôle explicitement remplacé au sprint 3.

- **[P1]** Écran de transition : « votre compte sera scindé en rôles nominatifs », avec reprise automatique des signalements en cours.
- **[P2]** File de signalements avec délai de prise en charge (SLA) et priorisation.
- **[P3]** Consolidation multi-organismes pour un compte chapeau.

---

## 5. Administration

### Administrateur système — `admin`
**Aujourd'hui** : tableau de bord, comptes/rôles, territoires, organismes, paramètres (modules), documents, journal.
**À renforcer** : création de comptes un par un, aucun contrôle de sécurité, audit peu exploitable.

- **[P1]** Import CSV de comptes + modèles de rôles par organisme, avec rapport d'erreurs ligne à ligne.
- **[P2]** Sécurité des comptes : MFA, expiration, verrouillage après échecs, obligation de changement de mot de passe.
- **[P2]** Simulateur « qui peut quoi » : matrice rôle × permission × désignation, avec un mode « voir comme » (aperçu en lecture seule d'un espace).
- **[P2]** Journal d'audit filtrable (acteur, action, cible, période) + export, avec diff avant/après des changements de permissions.
- **[P3]** Sauvegarde/restauration des paramètres et versionnage des modules activés.

---

## 6. Autorités

### Wali — `wali`
**Aujourd'hui** : 6 écrans (vue d'ensemble, situation, plan ORSEC, décisions, alertes à valider, conduite de crise) ; périmètre wilaya ; `DEMANDER_APPUI_LIMITROPHE`.
**À renforcer** : beaucoup de pouvoir, peu de traçabilité de la décision elle-même.

- **[P1]** Registre des décisions signées : horodatage, auteur, justification, pièces jointes, export PDF officiel (à partir de `AuthorityDecisionsPage`).
- **[P1]** Délégation temporaire de pouvoirs (représentant, validateur d'alertes) avec date de fin et alerte d'expiration.
- **[P2]** Vue situation filtrable par commune + comparatif entre communes (incidents, moyens, délais).
- **[P2]** Suivi des demandes d'appui limitrophe : envoyée → acceptée → moyens arrivés, avec ETA.
- **[P3]** Briefing quotidien généré par l'assistant (situation, moyens, alertes, décisions attendues).

### Président d'APC — `apc_president`
**Aujourd'hui** : les 6 écrans de l'autorité, périmètre commune, sans appui limitrophe.
**À renforcer** : aucun outil proprement communal (quartiers, écoles, centres de santé, abris).

- **[P1]** Vue communale : quartiers, établissements sensibles, points de rassemblement et abris avec capacité.
- **[P1]** Escalade vers le wali : demande d'appui wilaya depuis l'écran de crise (symétrique de l'appui limitrophe).
- **[P2]** Recensement des moyens communaux (engins, personnel, salles) intégré au plan communal.
- **[P3]** Information des habitants : publication d'un message communal (consignes, lieux d'accueil).

### Ministre de l'Intérieur — `minister`
**Aujourd'hui** : 5 écrans (vue d'ensemble, situation, plan, décisions, crise) ; pas d'écran d'alertes ; périmètre national.
**À renforcer** : vision nationale annoncée mais l'écran de situation reste mono-wilaya.

- **[P1]** Tableau de bord national : wilayas en alerte, plans déclenchés, moyens engagés, victimes, tendance 24 h.
- **[P1]** Carte nationale agrégée avec sélection d'une wilaya pour descendre au détail.
- **[P2]** Arbitrage des demandes d'appui entre wilayas (file centralisée, décision, notification aux deux wilayas).
- **[P2]** Instructions nationales : diffusion d'une directive à tous les walis, avec accusé de lecture.
- **[P3]** Rapports consolidés hebdomadaires exportables + comparatif annuel.

---

## 7. Site sensible

### Exploitant de site — `site_operator`
**Aujourd'hui** : 4 écrans (vue d'ensemble, plan du site, simulations, consignes) ; périmètre site.
**À renforcer** : le site est autonome mais mal relié à l'extérieur ; plusieurs actions sont décoratives.

- **[P1]** Rendre le bouton « Rapport détaillé » opérant : génération d'un rapport d'exercice (participants, durée, écarts, actions correctives) exportable.
- **[P1]** Alerte automatique des autorités (wilaya + Protection civile) au déclenchement du plan du site, avec fiche de synthèse.
- **[P2]** Plan d'évacuation du site : points de rassemblement, cheminements, effectifs présents, exercices associés.
- **[P2]** Maintenance des équipements critiques : check-lists, échéances, historique des interventions.
- **[P3]** Demande d'exercice conjoint avec la Protection civile locale (créneau, scénario, participants).

---

## 8. Organisme et terrain

### Prévisionniste — `forecaster`
**Aujourd'hui** : un seul écran, `watch` (veille hydro) ; permissions `SURVEILLER_RISQUES`, `SAISIR_NIVEAUX_EAU`.
**À renforcer** : rôle clé mais interface la plus pauvre de l'application.

- **[P1]** Courbes et jauges par station (barrage, oued) avec seuils vert/orange/rouge et dernière mesure horodatée.
- **[P1]** Proposition d'alerte de crue en deux étapes : constat (mesure + photo) → proposition transmise à l'autorité, avec suivi de validation.
- **[P2]** Prévision à 24/48 h (tendance, pluie annoncée) et historique des crues comparables.
- **[P2]** État des stations : batterie, dernière transmission, panne — avec alerte de perte de signal.
- **[P3]** Diffusion automatique d'un bulletin hydro aux communes riveraines.

### Agent forestier — `forestry_agent`
**Aujourd'hui** : veille + moyens ; peut créer un signalement mais ne peut pas le suivre (§ 2.1).
**À renforcer** : aucune spécialisation feu de forêt.

- **[P1]** Signalement feu enrichi : position GPS, photos, vent, accès, présence d'habitations.
- **[P1]** Accès en lecture à ses propres signalements et à leur statut.
- **[P2]** Suivi du feu : front, moyens engagés, points d'eau, pistes — sur `CrisisMap`.
- **[P2]** Mode hors-ligne (zones forestières sans réseau) avec synchro différée.

### Directeur d'organisme — `org_director`
**Aujourd'hui** : 6 écrans (signalements, missions, moyens, renforts, PCF, historique).
**À renforcer** : pilote ses moyens à l'aveugle (pas d'indicateur de capacité).

- **[P1]** Vue capacité : équipes disponibles / engagées / en repos, taux d'engagement, relève à prévoir.
- **[P1]** Traitement des demandes de renfort avec impact immédiat sur les moyens disponibles.
- **[P2]** Désignation d'un représentant au PCO et d'un suppléant, avec dates et traçabilité.
- **[P3]** Indicateurs de performance : délai de prise en charge, taux de couverture, taux de comptes rendus à l'heure.

### Responsable d'unité — `unit_lead`
**Aujourd'hui** : 4 écrans (signalements, missions, moyens, renforts).
**À renforcer** : affectation des équipes et suivi terrain.

- **[P1]** Planning des équipes avec affectation des missions (glisser-déposer) et détection des conflits.
- **[P1]** Position et statut des équipes sur la carte (mobile, dernière position connue).
- **[P2]** Check-list de mission et compte rendu rapide (photo + note vocale transcrite).
- **[P3]** Bouton « unité en difficulté » remontant au PCO avec position.

### Responsable de la Protection civile — `pc_lead`
**Aujourd'hui** : 8 écrans (signalements, missions, moyens, renforts, victimes, évacuations, PCO, historique) + désignation implicite directeur du PCO.
**À renforcer** : la console PCO est le cœur du rôle, elle doit absorber la coordination multi-organismes.

- **[P1]** Console PCO multi-organismes : représentants présents, main courante horodatée, demandes en attente, phase en cours.
- **[P1]** Demande de déclenchement du plan avec pièces et suivi d'approbation par l'autorité.
- **[P2]** Coordination des évacuations depuis le PCO : itinéraires, points de rassemblement, capacités, convois.
- **[P2]** Synthèse de situation consolidée (victimes, moyens, zones) exportable pour le PCF.
- **[P3]** RETEX assisté : chronologie reconstituée, écarts, recommandations.

### Responsable médical — `medical_lead`
**Aujourd'hui** : 4 écrans (missions, moyens, renforts, victimes).
**À renforcer** : le bilan victimes est riche, la chaîne sanitaire ne l'est pas.

- **[P1]** Triage dynamique (START) et capacités hospitalières (lits, blocs, réanimation) mises à jour en direct.
- **[P1]** Chaîne d'évacuation sanitaire sur carte : ambulance → destination → ETA → disponibilité.
- **[P2]** Stocks médicaments et consommables avec seuils d'alerte.
- **[P2]** Registre victimes confidentiel : accès journalisé (RG05), export anonymisé pour les statistiques.
- **[P3]** Annuaire de crise : SAMU, hôpitaux, laboratoires, avec astreintes.

### Responsable des évacuations — `evac_lead`
**Aujourd'hui** : 4 écrans (missions, moyens, renforts, évacuations).
**À renforcer** : pas d'outil d'itinéraire ni de capacité d'accueil.

- **[P1]** Éditeur d'itinéraires et de déviations sur `CrisisMap`, avec validation police / gendarmerie.
- **[P1]** Occupation des points de rassemblement et des abris en temps réel (capacité, remplissage).
- **[P2]** Suivi des convois et des bus : position, remplissage, heure de départ.
- **[P3]** Message public d'évacuation multilingue (FR/AR) pré-rédigé et validé par l'autorité.

### Agent de la Protection civile — `pc_agent`
**Aujourd'hui** : 2 écrans (missions, moyens).
**À renforcer** : rôle 100 % terrain avec une interface de bureau.

- **[P1]** Vue mobile « Ma mission » : ordre de mission, adresse, contacts, check-list, bouton d'arrivée/départ.
- **[P1]** Compte rendu en 3 gestes : photo, note vocale, statut — avec file d'attente hors-ligne.
- **[P2]** Boutons « renfort » et « danger » remontant au PCO avec position.
- **[P3]** Pointage par QR code sur le site d'intervention.

### Chef d'engin — `engine_chief`
**Aujourd'hui** : 3 écrans (missions, moyens, véhicule).
**À renforcer** : la fiche véhicule est statique.

- **[P1]** Fiche véhicule vivante : carburant, eau, émulseur, heures moteur, prochaine maintenance.
- **[P1]** Check-list avant départ / après intervention, avec anomalies signalées.
- **[P2]** Position temps réel et demande de ravitaillement depuis le véhicule.
- **[P3]** Carnet d'entretien et historique des pannes.

### Police — `police`
**Aujourd'hui** : 2 écrans (missions, évacuations) ; permissions `SECURISER_ZONES`, `CONFIRMER_REOUVERTURE_ROUTE`.
**À renforcer** : la confirmation de réouverture de route n'a pas d'écran dédié.

- **[P1]** Écran « Voirie » : barrages, routes coupées, déviations, avec confirmation de réouverture (photo + heure).
- **[P1]** Périmètre de sécurité : tracé du barrage, points de contrôle, accès autorisés.
- **[P2]** Laissez-passer et contrôle d'accès (liste, QR, journal).
- **[P3]** Main courante partagée avec la gendarmerie sur un même événement.

### Gendarmerie — `gendarmerie`
**Aujourd'hui** : 2 écrans (missions, évacuations), mêmes permissions que la police.
**À renforcer** : aucune spécificité alors que le rôle couvre les zones rurales.

- **[P1]** Écran « Voirie » partagé avec la police, avec zones rurales et pistes.
- **[P1]** Escortes et convois : itinéraire, horaire, véhicules, point de rendez-vous.
- **[P2]** Constatations : saisie d'un PV simplifié (lieu, dommages, témoins) exportable.
- **[P3]** Coordination inter-services (police / gendarmerie / Protection civile) sur un même incident.

### Garde-côtes — `coast_guard`
**Aujourd'hui** : 2 écrans (missions, moyens).
**À renforcer** : rien de maritime dans l'application (pas de carte littorale ni de météo marine).

- **[P1]** Carte maritime : zones de baignade, ports, courants, zone d'intervention.
- **[P2]** Moyens nautiques : vedettes, semi-rigides, disponibilité, autonomie.
- **[P2]** Sauvetage en mer : alerte, dernière position connue, ETA des moyens.
- **[P3]** Météo marine et bulletin de houle intégrés à la veille.

### Médecin urgentiste — `emergency_doctor`
**Aujourd'hui** : 3 écrans (missions, victimes, renforts).
**À renforcer** : saisie victime lente, pas de lien avec la régulation.

- **[P1]** Saisie victime rapide : photo, triage, constantes, destination — utilisable hors-ligne.
- **[P1]** Lien avec la régulation médicale (avis, orientation, prévention des doublons).
- **[P2]** Disponibilité des lits et filières par établissement, en un écran.
- **[P3]** Télé-expertise : envoi d'un dossier anonymisé à un spécialiste.

### Agent d'organisme (travaux publics, eau, énergie, transport) — `org_agent`
**Aujourd'hui** : 2 écrans (missions, moyens) ; permission `CONFIRMER_REOUVERTURE_ROUTE`.
**À renforcer** : aucun écran métier par secteur.

- **[P1]** Ordre de mission et fiche d'intervention par secteur (eau, énergie, route, transport) avec pièces jointes.
- **[P1]** Confirmation de réouverture de route avec preuve photo et horodatage.
- **[P2]** Signalement de terrain enrichi (GPS, photos, gravité) remontant à l'organisme.
- **[P3]** Suivi des engins et du stock de pièces de l'organisme.

---

## 9. Tableau récapitulatif

| Rôle | Espace | Écrans | Priorité n° 1 |
|---|---|---|---|
| `citizen` | population | 7 | Suivi du signalement en temps réel |
| `farmer` | population | 7 | Formulaire dégâts agricoles |
| `organism` | organisme | 3 | Écran de transition vers les rôles S3 |
| `admin` | admin | 7 | Import CSV de comptes + modèles |
| `wali` | autorité | 6 | Registre des décisions signées |
| `apc_president` | autorité | 6 | Vue communale + escalade vers le wali |
| `minister` | autorité | 5 | Tableau de bord national |
| `site_operator` | site | 4 | Rapport d'exercice opérant |
| `forecaster` | organisme | 1 | Courbes et seuils par station |
| `forestry_agent` | organisme | 2 | Signalement feu enrichi |
| `org_director` | organisme | 6 | Vue capacité des moyens |
| `unit_lead` | organisme | 4 | Planning d'affectation des équipes |
| `pc_lead` | organisme | 8 | Console PCO multi-organismes |
| `medical_lead` | organisme | 4 | Triage + capacités hospitalières |
| `evac_lead` | organisme | 4 | Itinéraires et capacité des abris |
| `pc_agent` | organisme | 2 | Vue mobile « Ma mission » |
| `engine_chief` | organisme | 3 | Fiche véhicule vivante |
| `police` | organisme | 2 | Écran Voirie |
| `gendarmerie` | organisme | 2 | Écran Voirie + convois |
| `coast_guard` | organisme | 2 | Carte maritime |
| `emergency_doctor` | organisme | 3 | Saisie victime rapide |
| `org_agent` | organisme | 2 | Fiche d'intervention par secteur |

---

## 10. Feuille de route proposée

**Lot 1 — Fondations (2 à 3 semaines)**
Centre de notifications · correction des 5 défauts d'accès (§ 2.1) · boutons inertes · export PDF des rapports existants.

**Lot 2 — Terrain (4 à 6 semaines)**
PWA hors-ligne + `pc_agent`, `engine_chief`, `emergency_doctor`, `forestry_agent`, `org_agent` · carte unifiée · écran Voirie police/gendarmerie.

**Lot 3 — Pilotage (6 à 8 semaines)**
Registre des décisions (wali) · tableau de bord national (ministre) · console PCO multi-organismes (pc_lead) · capacité et triage (org_director, medical_lead) · vue communale (apc_president).

**Lot 4 — Ouverture**
Prévision hydrologique (forecaster) · carte maritime (coast_guard) · dégâts agricoles (farmer) · RETEX assisté par l'IA.

---

## 11. État d'avancement (mise en œuvre)

Les éléments ci-dessous ont été implémentés dans le prototype après validation du plan.

| Brique / rôle | Livré | Fichiers principaux |
|---|---|---|
| Centre de notifications | Cloche + panneau, non-lues persistées, 5 types, notifications générées par les actions (signalement, voirie, maritime) | `src/lib/notificationsContext.ts`, `src/lib/notifications.tsx`, `src/i18n/notifications.ts`, `src/components/NotificationCenter.tsx` |
| Exports | CSV UTF-8 (Excel/arabe) et impression PDF | `src/lib/exportData.ts` |
| Corrections d'accès | `forestry_agent` consulte ses signalements ; `police`/`gendarmerie` recensent leurs moyens ; `evac_lead` rattaché à un organisme | `src/auth/permissions.ts`, `src/auth/roles.ts` |
| Voirie (police, gendarmerie, organismes) | Registre des coupures, déviations, déclaration, réouverture horodatée avec photo, export CSV | `src/pages/organisme/RoadsPage.tsx`, `src/pages/organisme/orgAccess.ts` |
| Surveillance maritime (garde-côtes) | Zones et ports, moyens nautiques, météo marine, alerte de sauvetage, carte | `src/pages/organisme/MaritimePage.tsx` + permission `SURVEILLER_MARITIME` |
| Site sensible | Rapport d'exercice opérant (participants, durée, écarts, actions correctives) + export/impression | `src/pages/site/SiteSimulationsPage.tsx` |
| Registre des décisions | Export CSV et impression du journal | `src/pages/authority/AuthorityDecisionsPage.tsx` |
| Ministre | Vue nationale consolidée (wilayas, plans, moyens, victimes) | `src/pages/authority/AuthorityScopeOverview.tsx` |
| Président d'APC | Vue communale (quartiers, ménages, abris, établissements sensibles) | `src/pages/authority/AuthorityScopeOverview.tsx` |
| Agriculteur | Formulaire « dégâts agricoles » (culture, superficie, parcelle) rattaché au signalement | `src/pages/citizen/SubmitAlertPage.tsx`, `src/mockdata/report.ts` |
| Mode hors-ligne | Manifeste PWA, service worker avec cache de secours, bandeau hors connexion | `public/manifest.webmanifest`, `public/sw.js`, `src/components/OfflineBanner.tsx`, `src/main.tsx` |

Restent ouverts (P3, à arbitrer) : RETEX assisté par l'IA, télé-expertise médicale, météo marine temps réel, indemnisation agricole, QR code de pointage, mode « voir comme » de l'administrateur.

> **Suite ORSEC** : l'audit de conformité au guide master et les propositions P1/P2/P3 (PCF/PCO, Situations A-E, main courante, réquisitions, 13 modules, 25-61/25-62, EC-01 à EC-08) sont détaillés dans `docs/ameliorations-orsec.md`.
