# Ordre de changement — Interface CADM

| | |
|---|---|
| **Référence** | OC-UI-2026-S43 |
| **Version du document** | 1.0 |
| **Date d'émission** | 28 octobre 2026 |
| **Période couverte** | 25 → 27 octobre 2026 |
| **Interface de référence (avant)** | Interface citoyenne « verte » — commit `f1dc588` |
| **Livraison évaluée (après)** | Prototype frontend v4.1 — commit `d5bdc19` |
| **Périmètre** | Couche de présentation (React / CSS) des trois espaces : citoyen, responsable de crise, administration |
| **Nature du changement** | Refonte visuelle et ergonomique, sans modification du modèle de données |

---

## 1. Objet

Ce document recense l'ensemble des changements apportés aux interfaces de l'application CADM durant la semaine du 25 au 27 octobre 2026. Il prend pour base de comparaison l'**interface citoyenne verte** (commit `f1dc588`), qui servait de référence avant le passage à la nouvelle identité visuelle.

Il constitue la pièce justificative à transmettre au chef d'équipe : il décrit les écrans concernés, la nature de chaque évolution, les fichiers impactés et l'état de validation.

Le document couvre également la **refonte du style des cartes d'alerte**, réalisée par un membre de l'équipe et intégrée aux livraisons v4 et v4.1 (voir section 4.5).

---

## 2. Référentiel de comparaison

L'analyse s'appuie sur l'historique Git du dépôt, entre l'état « vert » et la dernière livraison :

| Commit | Date | Libellé | Rôle dans la comparaison |
|---|---|---|---|
| `f1dc588` | 25/10/2026 | `refactor(admin): simplify dashboard layout to match citizen space` | **État de référence** — interface verte |
| `656a6f7` | 26/10/2026 | `prototype frontend v4` | Nouvelle identité visuelle, coquille, landing, auth, espaces |
| `d5bdc19` | 27/10/2026 | `prototype frontend v4.1` | Finitions : suppression des liserés, bouton de connexion, ajustements |

**Volume global :** 73 fichiers modifiés, **+5 382 / −2 330 lignes**.

L'arbre de travail était propre au moment de l'audit : tous les changements décrits ci-dessous sont donc bien contenus dans les commits ci-dessus, sans modification non versionnée.

---

## 3. Synthèse des changements

| # | Domaine | Changement majeur | Impact |
|---|---|---|---|
| CH-01 | Identité visuelle | Passage du vert au cramoisi (`--color-brand: #b3261e`), nouvelles surfaces, thème sombre neutre | Global |
| CH-02 | Coquille applicative | Barre supérieure et panneau latéral en verre, fenêtre Assistant IA, bouton de connexion | Tous espaces |
| CH-03 | Landing page | Réécriture des sections, recherche fonctionnelle, géolocalisation, modales, FR/AR | Public |
| CH-04 | Espace citoyen | Nouveaux bandeaux photo, tableau de bord réorganisé, page « Mes signalements » | Citoyen |
| CH-05 | Cartes d'alerte | **Refonte du style des cartes (contribution équipe)** + recherche et filtres | Citoyen |
| CH-06 | Espace crise | Tableau de bord allégé, page de gestion d'incident enrichie, bandeau photo ; rôle « responsable de crise » en cours de remplacement par le modèle ORSEC | Responsable |
| CH-07 | Administration | Tableau de bord simplifié, bandeau photo, boutons harmonisés | Admin |
| CH-08 | Authentification | Nouveau gabarit plein écran avec vidéo, page mot de passe oublié | Citoyen / Crise / Admin |
| CH-09 | Assistant IA | Déplacé en page dédiée et ouvert en fenêtre modale depuis tous les espaces | Tous espaces |
| CH-10 | Accessibilité / i18n | Piège de focus, réduction des animations, thème sombre, RTL, traductions FR/AR | Global |
| CH-11 | Espaces ORSEC | Préparation des espaces **autorité** et **site sensible** : coque, navigation, tableaux de bord et pages dédiées, en attendant l'ordre de changement n° 02 | Autorité / Exploitant |
| CH-12 | Cycle de vie du plan | Machine à états du plan (saisi → approuvé → alerte → déclenché → levé), 13 modules du décret, désignation des responsables, déclenchement motivé, rapport de levée | Autorité / Exploitant |

---

## 4. Changements détaillés

### 4.1 Identité visuelle et thèmes — CH-01

**Avant :** l'interface s'appuyait sur des accents verts (`--color-green: #16704a`), des bandeaux sombres verts et un fond topographique. Les cartes portaient des liserés colorés.

**Après :**

- Introduction d'une gamme de marque cramoisie distincte du rouge d'alerte critique :
  - `--color-brand: #b3261e`, `--color-brand-hover: #8f1b15`, `--color-brand-soft: #fdecea`, `--color-brand-glow` ;
  - `--color-alert: #e11d2e` conservé séparément pour la signalétique d'urgence.
- Nouveaux jetons de surfaces en verre (`--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-shadow`).
- Nouveaux jetons de navigation (`--nav-glass-bg`, `--nav-glass-border`, `--nav-control-bg`).
- Nouveaux jetons de bandeau : `--hero-scrim`, `--hero-wash`, `--hero-border`.
- **Bandeaux photo** : ajout de `public/heroes/citizen.jpg`, `manager.jpg` et `admin.jpg`, utilisés avec un voile cramoisi et un dégradé de lisibilité.
- **Suppression des liserés latéraux verts de 5 px** sur les bandeaux (citoyen, alertes, crise, admin).
- **Suppression des bordures supérieures décoratives de 2 à 4 px** sur les cartes (statistiques, alertes, événements, contacts, consignes, admin, authentification, landing).
- Thème sombre retravaillé : fonds quasi-noirs neutres (`#08080a`, `#111114`, `#1a1a1e`), accents `#ff5a4f`, surfaces en verre.

Fichiers principaux : `src/index.css`, `src/dark.css`, `src/rtl.css`, `public/heroes/*`.

### 4.2 Coquille applicative et navigation — CH-02

- Barre supérieure et panneau latéral habillés en **verre dépoli** (fond translucide, bordure claire, flou), avec état « scrollé ».
- En-tête : logo, statut de connexion, bouton **Assistant IA**, sélecteurs de langue et de thème, bouton de menu (mobile).
- Panneau latéral : navigation par espace, état replié mémorisé (`localStorage`), fond assombri sur mobile.
- **Pied du panneau latéral** :
  - utilisateur connecté → bouton **« Se déconnecter »** ;
  - visiteur non connecté → nouveau bouton **« Se connecter »**, qui ouvre la page de connexion puis ramène l'utilisateur sur la page d'où il vient.
- **Fenêtre Assistant IA** ouverte depuis la barre supérieure, commune aux trois espaces : rôle `dialog`, `aria-modal`, fermeture par `Échap` ou clic sur le fond, verrouillage du défilement et **piège de focus**.
- Nouveau **kit d'interface partagé** : `Button`, `Chip`, styles de boutons communs (`src/components/ui/`).

Fichiers principaux : `src/components/AppShell.tsx`, `src/App.css`, `src/components/ui/*`, `src/App.tsx`, `src/config.ts`.

### 4.3 Landing page — CH-03

- Réécriture des sections : en-tête, héros, situation, risques, alertes, suivi, sources, pied de page.
- **Textes externalisés** dans `src/landing/landingCopy.js` (environ 536 lignes) avec versions **française et arabe**.
- **Menu de langue** dédié dans l'en-tête (`LanguageMenu.jsx`).
- **Recherche du héros rendue fonctionnelle** : la saisie redirige vers `/alerts?q=…`, reprise par la page Alertes.
- **Géolocalisation** : le bouton de localisation recentre les abris et postes de secours via `/resources?lat=…&lng=…`, avec repli sur la liste si la position est refusée ou indisponible.
- Nouvelles **modales** : suivi (`TrackingModal`), confidentialité (`PrivacyModal`), et refonte de la modale d'authentification requise (`RequireAuthModal`).
- Bandeau d'appel d'urgence et lien de signalement conservés, libellés traduits.
- Ajustements CSS : suppression des traits rouges décoratifs, harmonisation des espacements et des cartes.

Fichiers principaux : `src/landing/*`, `src/landing/sections/*`, `src/i18n/index.ts`.

### 4.4 Espace citoyen — CH-04

#### Tableau de bord (`HomePage`)

- Bandeau d'accueil avec **photo citoyenne** et voile cramoisi, à la place du fond topographique vert.
- Accroche, texte d'introduction et appels à l'action révisés.
- **Accès rapides réorganisés** : la tuile « Assistant » est remplacée par **« Mes signalements »**, qui mène à la nouvelle page de suivi.
- Cartes d'accès rapide harmonisées avec le kit d'interface (boutons, puces, états de survol).

#### Mes signalements (`MyReportsPage`) — nouvelle page

- Page dédiée au suivi des signalements du citoyen : **307 lignes de composant**, **704 lignes de styles**.
- Bandeau d'en-tête avec compteur de signalements actifs et bouton **« Nouveau signalement »**.
- **Filtres par statut** (tous, reçu, vérification, équipe mobilisée, intervention, clôturé) avec compteurs.
- **Liste chronologique** avec pastilles de statut, lieu, date et résumé.
- **Fenêtre de détail** d'un signalement (contenu, statut, historique).
- Message de confirmation après soumission, avec référence du signalement.
- Formats de date localisés (`fr-DZ` / `ar-DZ`).

#### Alertes

- Bandeau photo, filtres de gravité aux couleurs de marque.
- **Recherche par paramètre d'URL** `?q=` : insensible aux accents et à la casse (« bejaia » retrouve « Béjaïa »).
- Bandeau de recherche avec **bouton d'effacement** et compteur de résultats.
- Les compteurs des filtres se recalculent sur le résultat de recherche.
- **État vide** retravaillé : texte centré et bouton d'effacement de la recherche.
- Voir section 4.5 pour le détail des cartes.

#### Abris et secours, contacts, événements, consignes, signalement

- Harmonisation des couleurs (vert → marque), des bordures, des ombres et des états de survol.
- `SheltersPage` : ajustements de mise en page et de filtres.
- `SubmitAlertPage` : formulaire réaligné sur les nouveaux jetons, états de focus et de survol.
- `ConsignesPage` : modale de consigne sans liseré supérieur, accents de marque.
- `ContactsPage` et `EventsPage` : suppression des bordures supérieures colorées, cartes uniformisées.

### 4.5 Cartes d'alerte (CH-05) — contribution de l'équipe

> **Cette section documente spécifiquement la refonte du style des cartes d'alerte réalisée par un membre de l'équipe.** Le travail a été intégré dans les livraisons v4 (`656a6f7`) et v4.1 (`d5bdc19`).

**Contributeur :** _[nom à compléter]_ — **Date de livraison :** 26–27 octobre 2026.

#### Périmètre

| Fichier | Rôle |
|---|---|
| `src/components/AlertRow.css` | Ligne de résultat de la liste d'alertes |
| `src/components/WarningCard.css` | Carte d'alerte (aperçu) |
| `src/pages/citizen/AlertsPage.css` | Page Alertes : filtres, recherche, état vide |
| `src/pages/citizen/AlertsPage.tsx` | Recherche `?q=`, effacement, compteurs |

#### Changements de style

| Élément | Avant (interface verte) | Après |
|---|---|---|
| Survol d'une ligne | Fond codé en dur `#f1f4f1` | Jeton `--color-surface-muted` (cohérent clair/sombre) |
| Focus clavier | Contour vert | Contour **cramoisi** (`--color-brand`) |
| Ligne sélectionnée | Fond vert à 8 % + **liseré interne vert de 3 px** | Fond cramoisi à 8 % ; liseré interne **supprimé en v4.1** |
| Pastille de sélection | Verte | Cramoisie |
| Bouton « Voir plus » | Vert au survol et au focus | Cramoisi |
| Carte active | Anneau vert | Anneau **cramoisi** de 2 px |
| Carte vérifiée / non vérifiée | Bordure supérieure verte / orange | **Bordure supérieure supprimée** (v4.1), information portée par le badge |
| Filtres de gravité actifs | Vert | Cramoisi (`--color-brand-soft` en fond) |
| Compteur de filtre actif | Pastille verte | Pastille cramoisie |

#### Changements fonctionnels associés

- **Recherche par URL** : la landing transmet `?q=`, la page filtre les alertes vérifiées sur le titre, le lieu, la source et la description, en français et en arabe.
- **Normalisation des accents** avant comparaison.
- **Bouton « Effacer la recherche »** qui retire proprement le paramètre `q` sans recharger la page.
- **Compteurs de filtres** recalculés à partir des résultats de recherche, et non plus du jeu complet.
- **État vide** revu pour le cas « aucune alerte ne correspond ».

#### Cohérence

La refonte respecte les nouveaux jetons de marque et fonctionne en thème clair, en thème sombre et en RTL. Les états interactifs (survol, focus, sélection) restent distinguables sans recourir à la couleur seule : le focus conserve un contour visible et la sélection un fond contrasté.

### 4.6 Espace responsable de crise — CH-06

- **Tableau de bord de commandement allégé** : le composant passe d'environ 753 à 219 lignes ; les cartes statistiques, la carte opérationnelle et les flux d'activité sont remplacés par une **grille d'accès rapides** (incidents, chaîne de commandement, signalements, diffusion, ressources, journal) alignée sur l'espace citoyen.
- **Page de gestion d'incident enrichie** (`IncidentManagement.tsx`, +110 lignes) : suivi et traitement des incidents.
- Bandeau photo `manager.jpg` avec voile cramoisi, remplaçant le fond vert.
- Boutons, liens de retour, cartes et états de focus passés à la marque.
- Page de connexion crise (`RespLoginPage`) alignée sur le nouveau gabarit d'authentification.

> **Évolution réglementaire à prévoir — le rôle « responsable de crise » est supprimé.**
> Le document `CADM_Organisation_acteurs_ORSEC v4` (v1.0, 27/10/2026, tableaux 8 et 14, p. 6 et 13) acte que le « gestionnaire de crise » n'est plus un rôle de compte : la crise est portée par **l'autorité compétente** (président de l'APC pour la commune, wali pour la wilaya, ministre de l'Intérieur pour le plan national), et les fonctions de commandement deviennent des **désignations ORSEC** temporaires (directeur du PCF, directeur du PCO, responsable de module). Au sprint 1, le rôle est remplacé par un compte **« organisme »** qui reçoit et traite les signalements (RG-O18).
> L'espace `/responsable` tel qu'il existe aujourd'hui est donc **transitoire** : ses écrans devront être redistribués entre l'autorité, la Protection civile et les organismes. Ce changement relève de l'ordre de changement n° 02, soumis à l'approbation du Product Owner, et **n'est pas encore implémenté** dans le code.

Fichiers principaux : `src/pages/command/CommandDashboard.tsx`, `IncidentManagement.tsx`, `resp-crise.css`.

### 4.7 Espace administration — CH-07

- **Tableau de bord simplifié** : suppression de la grille de quatre cartes statistiques (utilisateurs, rôles, territoires, documents) pour converger vers la présentation de l'espace citoyen.
- Bandeau photo `admin.jpg` avec voile cramoisi.
- Boutons primaires et accentués passés au cramoisi, ombres harmonisées.
- Cartes administratives sans bordure supérieure décorative.
- Pages Documents, Organisations, Territoires et Utilisateurs/Rôles : suppression des blocs statistiques locaux redondants.
- Page de connexion admin alignée sur le nouveau gabarit.

Fichiers principaux : `src/pages/admin/AdminDashboard.tsx`, `admin.css`, pages admin secondaires.

### 4.8 Authentification — CH-08

- **Nouveau gabarit plein écran** (`AuthLayout`) :
  - fond **vidéo** (`video.mp4`) avec voile, chargée uniquement si l'utilisateur n'a pas demandé la réduction des animations et si la connexion n'est pas limitée (`saveData`, 2G/3G) ;
  - en-tête avec logo, retour à l'accueil, sélecteur de langue ;
  - carte de formulaire en verre, centrée ;
  - pied de page informatif.
- **Transition de sortie** : la page s'efface en douceur avant la redirection après connexion.
- **Page « Mot de passe oublié »** ajoutée (`ForgotPasswordPage.tsx`) et reliée au lien du formulaire de connexion.
- Formulaire de connexion : titre passé en `h1`, liens vers les espaces responsable/admin retirés de la page citoyenne, redirection vers la page demandée conservée.
- Formulaire d'inscription réaligné sur le nouveau gabarit.
- Suppression des liserés supérieurs sur les cartes de connexion crise et admin.

Fichiers principaux : `src/pages/auth/AuthLayout.tsx`, `AuthLayout.css`, `LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`.

### 4.9 Assistant IA — CH-09

- Page déplacée de `src/pages/citizen/` vers `src/pages/assistant/` (elle n'est plus rattachée au seul espace citoyen).
- **Ouverture en fenêtre modale** depuis la barre supérieure de tous les espaces, sans quitter la page courante.
- Accès plein écran conservé via la route dédiée.
- Interface recolorée (verts → cramoisi), y compris en thème sombre : bulles, barre latérale, orbe, boutons.
- Comportement accessible : libellé dynamique « Ouvrir / Fermer l'assistant », `aria-expanded`, `aria-controls`, restitution du focus au bouton d'origine.

Fichiers principaux : `src/pages/assistant/AssistantPage.tsx`, `AssistantPage.css`, `src/components/AppShell.tsx`.

### 4.10 Accessibilité, thème sombre, RTL et internationalisation — CH-10

- **Accessibilité**
  - piège de focus et fermeture par `Échap` dans la fenêtre Assistant ;
  - `role="dialog"`, `aria-modal`, `aria-label` sur les fenêtres ;
  - contour de focus visible et unifié sur les éléments interactifs ;
  - respect de `prefers-reduced-motion` (vidéos et animations) ;
  - détection `saveData` / réseau lent pour ne pas charger la vidéo ;
  - lien d'évitement conservé sur la landing ;
  - messages de statut (`role="status"`) pour la recherche et les confirmations.
- **Thème sombre** : palette neutre, surfaces en verre, contrastes revus sur les cartes, formulaires, assistant et modales.
- **RTL** : ajustements de 47 lignes dans `src/rtl.css` (sens des marges, bordures, alignements, icônes directionnelles).
- **i18n** : environ 197 lignes ajoutées/modifiées dans `src/i18n/index.ts` et 10 dans `src/i18n-content.ts` ; nouvelles clés pour la connexion depuis la barre latérale, la recherche d'alertes, « Mes signalements », l'assistant et la landing. Couverture **français / arabe**.

---

### 4.11 Espaces autorité et site sensible — CH-11 (préparation ORSEC)

Ces deux espaces ne remplacent pas encore `/responsable` : ils préparent la redistribution prévue par l'ordre de changement n° 02. Ils partagent la session et la page de connexion de l'espace crise.

- **Espace autorité** (`/autorite`) : vue d'ensemble (niveau d'alerte, modules activés, décisions, signalements), situation par wilaya, plan ORSEC avec déclenchement/levée et journal des décisions.
- **Espace site sensible** (`/site`) : vue d'ensemble (état du plan, simulations, effectif, inspection), plan du site avec déclenchement/levée, programme annuel des simulations et consignes d'évacuation.
- **Même langage visuel** : bandeau photo, cartes, grille d'accès rapides, badges et boutons réutilisés depuis `resp-crise.css` ; seuls le voile du bandeau et les tons des cartes changent (bleu nuit pour l'autorité, vert profond pour le site).
- **Navigation dédiée** : `AppShell` accepte désormais les variantes `authority` et `site`, avec un libellé de rôle propre.
- **Internationalisation** : nouvelles clés FR/AR pour les deux espaces ; l'arabe retombe sur le français en cas de clé manquante.
- **Accès** : les routes restent protégées par `RequireRespAuth` et redirigent vers `/responsable/login`.

Fichiers principaux : `src/pages/authority/` (4 pages + `authority.css`), `src/pages/site/` (4 pages + `site.css`), `src/App.tsx`, `src/config.ts`, `src/components/AppShell.tsx`, `src/i18n/index.ts`.

### 4.12 Cycle de vie du plan ORSEC — CH-12

Les pages `/autorite/plan` et `/site/plan` appliquent désormais le cycle prévu par le décret n° 19-59 et les règles RG-O01 à RG-O20.

- **Frise de vie** : saisi → approuvé → état d'alerte → déclenché (urgence, évaluation et contrôle, réhabilitation) → levé. L'étape d'approbation est marquée « non requise » pour le plan national (RG-O14) et l'état d'alerte est marqué « non requis » pour un plan de site.
- **Niveaux de plan** : l'espace autorité distingue le plan communal, le plan de wilaya et le plan national (autorité compétente, approbation, PCF/PCO et destinataires différents).
- **13 modules du décret (art. 43)** : liste complète avec organisme, état de préparation et responsable désignable. La désignation remplace la précédente et conserve l'historique (UC-02, RG-O04).
- **Approbation** : le plan doit être approuvé avant tout déclenchement ; l'auteur et la date sont enregistrés (RG-O14).
- **Déclenchement** : formulaire avec motif (survenance, moyens insuffisants, moyens complémentaires), incidents concernés et modules concernés ; ouverture du PCF et du PCO pour un plan de wilaya ou de commune ; notification des autorités (UC-03, RG-O03, RG-O17).
- **Levée** : fermeture des postes, création automatique du rapport détaillé « à compléter », puis transmission (UC-04, RG-O07).
- **Journal du plan** : chaque action est datée et tracée ; les rapports et les désignations sont consultables depuis la page.
- **Site sensible** : le plan est présenté comme approuvé par le wali ; l'exploitant déclenche et lève uniquement le plan de son site, sans état d'alerte.

Fichiers principaux : `src/pages/shared/plan/` (`orsecPlan.ts`, `PlanContext.ts`, `PlanProvider.tsx`, `PlanStepper.tsx`, `PlanModuleList.tsx`, `PlanDialogs.tsx`, `plan.css`), `src/pages/authority/AuthorityPlanPage.tsx`, `src/pages/site/SitePlanPage.tsx`, `src/pages/authority/AuthorityDashboard.tsx`, `src/main.tsx`, `src/i18n/index.ts`.

---

## 5. Impacts

### 5.1 Impact utilisateur

| Espace | Impact |
|---|---|
| Visiteur (landing) | Nouvelle identité, recherche et géolocalisation réellement fonctionnelles, choix de langue, modales d'information |
| Citoyen | Tableau de bord réorienté vers le suivi des signalements, page « Mes signalements », alertes filtrables et recherchables, bouton de connexion visible |
| Responsable de crise | Vue de commandement plus lisible, page de gestion d'incident enrichie ; rôle à redistribuer vers l'autorité, la Protection civile et les organismes (ORSEC) |
| Administrateur | Tableau de bord épuré, cohérence visuelle avec les autres espaces |
| Tous | Assistant accessible partout, thème sombre et RTL pris en charge |

### 5.2 Impact technique

- Aucune modification de contrat d'API ni de modèle de données : les données restent simulées (`mockdata`).
- Nouvelles routes : `MY_REPORTS_PATH`, `FORGOT_PASSWORD_PATH`, `ASSISTANT_PATH`, `RESP_ASSISTANT_PATH`, `ADMIN_ASSISTANT_PATH`.
- Nouveaux actifs : trois photos de bandeau (`public/heroes/`). La vidéo d'authentification (`public/video.mp4`) existait déjà mais est désormais exploitée par le nouveau gabarit.
- Nouveau module de persistance des signalements : `src/lib/reports.ts` et `src/mockdata/report.ts`.
- Introduction d'un kit d'interface réutilisable (`src/components/ui/`), qui réduit la duplication de styles.

### 5.3 Impact sur les tests

- Les parcours de connexion, d'inscription et de signalement doivent être rejoués (gabarit d'authentification modifié).
- Les parcours de recherche d'alerte et de suivi de signalement sont nouveaux et nécessitent une recette dédiée.
- Les trois espaces doivent être vérifiés en thème clair, thème sombre et RTL.

---

## 6. Recette et validation

| Contrôle | Commande / méthode | Résultat |
|---|---|---|
| Validation syntaxique CSS | Script de vérification sur les 21 feuilles de style | **OK** — 21/21 |
| Analyse statique JS/TS | `npm run lint` (oxlint) | **OK** — aucun avertissement |
| Compilation TypeScript + build | `npm run build` (`tsc -b && vite build`) | **OK** — 245 modules transformés |
| Cohérence de l'arbre Git | `git status` | **Propre** — aucun changement non versionné |

**Artefacts de build :** CSS 222,16 kB (39,82 kB gzip), JS 1 062,81 kB (287,41 kB gzip).

**Réserve technique :** Vite signale un chunk JavaScript supérieur à 500 kB. Cela n'empêche pas la livraison mais pourra justifier un découpage du code (`code-splitting`) ultérieurement.

---

## 7. Réserves et points à confirmer

1. **Attribution nominative** — la refonte des cartes d'alerte est identifiée comme une contribution d'équipe ; le nom du contributeur reste à compléter dans la section 4.5 avant diffusion.
2. **Poids des médias** — les trois photos de bandeau pèsent environ 160 à 265 kB chacune, et la vidéo d'authentification `public/video.mp4` atteint **environ 76 Mo**. Son chargement conditionnel (réduction des animations, `saveData`, 2G/3G) limite l'impact, mais une version compressée ou un poster statique est recommandé avant mise en production.
3. **Recette fonctionnelle** — aucun test automatisé d'interface n'est présent dans le dépôt ; la validation repose sur le lint, le build et une vérification manuelle.
4. **Accessibilité** — le piège de focus et les libellés ARIA sont en place, mais un passage avec lecteur d'écran (NVDA / VoiceOver) reste à planifier.
5. **Contenus** — les textes de la landing sont centralisés dans `landingCopy.js` ; toute correction éditoriale ultérieure doit être faite dans ce fichier, pour les deux langues.
6. **Modèle de rôles** — la suppression du rôle « responsable de crise » et son remplacement par le modèle ORSEC (autorité, PCO, organismes) sont actés dans le document d'organisation des acteurs, mais restent soumis à l'approbation de l'ordre de changement n° 02. L'espace `/responsable` doit être considéré comme transitoire jusqu'à cette validation.

---

## 8. Annexes

### 8.1 Fichiers impactés (regroupés par domaine)

> Liste exhaustive : `git diff --name-only f1dc588..d5bdc19` (73 fichiers).

**Racine et thèmes**
`src/index.css`, `src/dark.css`, `src/rtl.css`, `src/App.css`, `src/App.tsx`, `src/config.ts`, `src/i18n/index.ts`, `src/i18n-content.ts`

**Composants**
`src/components/AppShell.tsx`, `AlertRow.css`, `WarningCard.css`, `StatCard.css`, `LanguageToggle.tsx`, `ThemeToggle.tsx`
`src/components/ui/Button.tsx`, `Chip.tsx`, `buttonStyles.ts`, `ui.css`

**Landing**
`src/landing/Landing.jsx`, `landing.css`, `landingCopy.js`, `utils.js`
`src/landing/sections/` : `Header`, `Hero`, `Situation`, `Risks`, `Alerts`, `Tracking`, `Sources`, `Footer`, `Pro`, `RequireAuthModal`, `LandingModal`, `TrackingModal`, `PrivacyModal`, `LanguageMenu`

**Espace citoyen**
`src/pages/citizen/HomePage.tsx`, `HomePage.css`, `AlertsPage.tsx`, `AlertsPage.css`, `MyReportsPage.tsx`, `MyReportsPage.css`, `SheltersPage.tsx`, `SheltersPage.css`, `SubmitAlertPage.tsx`, `SubmitAlertPage.css`, `ConsignesPage.css`, `ContactsPage.css`, `EventsPage.css`

**Assistant**
`src/pages/assistant/AssistantPage.tsx`, `AssistantPage.css`

**Espace crise**
`src/pages/command/CommandDashboard.tsx`, `IncidentManagement.tsx`, `RespLoginPage.tsx`, `resp-crise.css`, `CrisisResources.tsx`

**Espaces autorité et site sensible (préparation ORSEC)**
`src/pages/authority/` : `AuthorityDashboard.tsx`, `AuthoritySituationPage.tsx`, `AuthorityPlanPage.tsx`, `AuthorityDecisionsPage.tsx`, `authority.css`
`src/pages/site/` : `SiteDashboard.tsx`, `SitePlanPage.tsx`, `SiteSimulationsPage.tsx`, `SiteConsignesPage.tsx`, `site.css`
`src/pages/shared/plan/` : `orsecPlan.ts`, `PlanContext.ts`, `PlanProvider.tsx`, `PlanStepper.tsx`, `PlanModuleList.tsx`, `PlanDialogs.tsx`, `plan.css`

**Administration**
`src/pages/admin/AdminDashboard.tsx`, `AdminLoginPage.tsx`, `DocumentsPage.tsx`, `OrganisationsPage.tsx`, `TerritoriesPage.tsx`, `UsersRolesPage.tsx`, `admin.css`

**Authentification**
`src/pages/auth/AuthLayout.tsx`, `AuthLayout.css`, `LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`

**Données et actifs**
`src/lib/reports.ts`, `src/mockdata/report.ts`, `public/heroes/citizen.jpg`, `public/heroes/manager.jpg`, `public/heroes/admin.jpg`

### 8.2 Correspondance avec les livraisons

| Livraison | Contenu principal |
|---|---|
| **v4** (`656a6f7`) | Identité cramoisie, bandeaux photo, kit d'interface, landing, authentification, tableau de bord citoyen, « Mes signalements », assistant, refonte des cartes d'alerte |
| **v4.1** (`d5bdc19`) | Suppression des liserés latéraux et supérieurs, bouton « Se connecter » dans la barre latérale, fenêtre Assistant, finitions de la page Alertes, ajustements i18n |

---

*Document généré à partir de l'historique Git du dépôt, entre les commits `f1dc588` et `d5bdc19`. Les libellés d'écran sont donnés en français ; les traductions arabes correspondantes sont gérées dans `src/i18n/index.ts` et `src/landing/landingCopy.js`.*
