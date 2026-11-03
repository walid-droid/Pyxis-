# CADM — Spécification de la nouvelle logique (guide master ORSEC v3.0, nov. 2026)

> À donner à OpenCode. Cette spécification **remplace** la logique à 22 rôles / espace « organisme » / sites sensibles.
> Sources : guide master ORSEC v3.0, diagrammes UML v2.0 (photos).
> Légende : **[SOURCE]** = lu dans les documents ; **[PROPOSÉ]** = choix de conception à valider ; **[À COMPLÉTER]** = donnée illisible sur les photos, ne rien inventer.

## 0. Consignes pour OpenCode

1. Garder la pile actuelle : React 19, react-router, leaflet / react-leaflet, TypeScript strict. **Aucune nouvelle dépendance.**
2. Garder tout ce qui est générique dans `src/auth/` (session unique, `AuthContext`, `guards.tsx`, `access.ts`, affectation), l'i18n FR/AR découpée par espace, `AppShell`, le mode `DEMO_MODE`.
3. **Remplacer** : le catalogue de 22 rôles, l'espace `pages/organisme/` (personas par service), le sélecteur de niveau de plan par rôle, la notion « organisme destinataire choisi par le citoyen », les sites sensibles et l'exploitant (absents de la v3.0).
4. Tout texte visible : FR + AR (RTL). Aucune chaîne en dur dans les composants.
5. Données : mock en mémoire + `localStorage` derrière une couche `services/` (interfaces prêtes pour un backend). Pas d'appel réseau.
6. Après chaque étape : `tsc --noEmit` et `vite build` doivent passer. Mettre à jour `tests/access.test.ts`.
7. Ne pas deviner les cellules des matrices du §6.3 : les laisser en `TODO` dans `moduleMatrix.ts` (voir §6.3).

## 1. Principe général

Le citoyen **ne choisit plus d'organisme**. Il signale une catastrophe d'un **type** (C1 à C10). La plateforme **route automatiquement** le signalement vers les **modules de premier envoi** prévus pour ce type, **dans la commune de l'incident**. Le maire et le wali **ne reçoivent rien** à ce stade (RG-O02, RG-O07, RG-O18).

L'escalade est une chaîne en 6 étapes (§4). Les droits viennent de **trois choses** : le rôle du compte (un seul), le **module** et le **territoire** de rattachement, et la **phase / l'état du plan**.

## 2. Les 8 rôles **[SOURCE]**

| # | Rôle | Sprint | Famille abstraite | Rattachement |
|---|---|---|---|---|
| 1 | Citoyen | S1 | — | commune (de résidence, optionnel) |
| 2 | Administrateur système | S1 | — | aucun |
| 3 | Wali | S2 | Autorité | wilaya |
| 4 | Président de l'APC | S2 | Autorité | commune |
| 5 | Ministre de l'Intérieur | S2 | Autorité | national (voit toutes les wilayas) |
| 6 | Agent de module | S3 | Rôle de module | module + territoire |
| 7 | Responsable de module (**PCO**) | S3 | Rôle de module | module + commune |
| 8 | Directeur de module (**PCF**) | S3 | Rôle de module | module + wilaya **[À CONFIRMER : commune ou wilaya]** |

- Acteurs abstraits : **Utilisateur authentifié** (parent de tous), **Autorité** (wali, APC, ministre), **Rôle de module** (agent, responsable, directeur). Un cas d'utilisation relié à un acteur abstrait vaut pour tous ses rôles.
- **Un compte = un rôle.** Le module et le territoire sont des attributs du compte, pas des rôles.
- Acteurs système : **IA locale** (suggère type et gravité, ne décide jamais) et **Horloge** (plateforme : relances automatiques).
- PCF = poste de commandement fixe (directeur de module) ; PCO = poste de commandement opérationnel (responsable de module).

## 3. Référentiels **[SOURCE]**

### 3.1 Types de catastrophe

| Code | Type |
|---|---|
| C1 | Séismes et risques géologiques |
| C2 | Inondations |
| C3 | Risques climatiques |
| C4 | Feux de forêts |
| C5 | Risques industriels et énergétiques |
| C6 | Risques radiologiques et nucléaires |
| C7 | Risques pour la santé humaine |
| C8 | Risques pour la santé animale et végétale |
| C9 | Pollutions atmosphérique, terrestre, marine ou hydrique |
| C10 | Catastrophes liées aux grands rassemblements humains |

Chaque type porte des **consignes aux citoyens** (texte FR/AR, éditable par l'admin).

### 3.2 Les 13 modules, organismes et missions pendant l'urgence

`*` = module **absent de la phase de réhabilitation** (ses organismes gardent leurs missions habituelles).

| N° | Module | Organismes (plan de wilaya) | Mission pendant l'urgence |
|---|---|---|---|
| 1* | Secours, sauvetage et évacuation | Direction de la protection civile | Recherche, secours, sauvetage et évacuation des victimes vers les hôpitaux ; protection des personnes et des biens |
| 2* | Sécurité et ordre public | Groupement territorial de la Gendarmerie nationale ; Sûreté nationale ; Délégation à la sécurité publique | Protection du dispositif de secours ; ordre public ; lutte contre les infractions et contrôle des déplacements dans la zone sinistrée ; identification des victimes blessées et décédées |
| 3* | Prise en charge médicale et psychologique des sinistrés et hygiène des lieux (« Santé et hygiène ») | Direction de la santé et de la population ; Direction de l'environnement ; Direction des services agricoles (services vétérinaires) | Santé publique : prise en charge psychologique des sinistrés et des lieux ; contrôle sanitaire des aliments ; prévention des épidémies |
| 4 | Communication et information | Chef de cabinet du wali ; Radio locale | Continuité de l'information ; sensibilisation des sinistrés et du public ; collecte et diffusion des informations ; riposte à la désinformation |
| 5* | Solidarité, activités humanitaires et ravitaillement | Direction du commerce ; Direction de l'action sociale et de la solidarité ; Direction des affaires religieuses et des wakfs | Besoins alimentaires des sinistrés et des équipes ; réception et distribution des dons en nature |
| 6 | Énergie | Direction de l'énergie | Approvisionnement en énergie et en électricité des sinistrés, de la population et des secours ; coupures de gaz |
| 7 | Hébergement provisoire | Direction du logement ; de la jeunesse et des sports ; du tourisme ; de l'éducation ; de la formation professionnelle ; des affaires religieuses ; des œuvres universitaires | Hébergement des sinistrés : choix des sites ; aménagement des camps de toile avec les travaux publics |
| 8 | Travaux publics | Direction des travaux publics | Appui des secours en engins de travaux publics ; aménagement des sites d'accueil des sinistrés |
| 9 | Alimentation en eau potable | Direction des ressources en eau ; Direction du commerce | Approvisionnement en eau de la zone sinistrée et des secours ; contrôle de la qualité de l'eau |
| 10* | Matériels et équipements divers | Direction de l'administration locale ; Conservation des forêts ; Présidents des APC | Fourniture aux services de secours des moyens qui leur manquent |
| 11 | Liaisons et télécommunications | Direction des transmissions de la wilaya ; Direction de la poste, des télécommunications, des technologies et du numérique | Appui des secours et des modules en moyens de transmission et de communication |
| 12 | Transport | Direction des transports | Appui des secours et des modules en moyens de transport ; transport des personnes et des biens vers les centres d'accueil |
| 13 | Expertises, évaluation et bilan | Direction de la programmation et du suivi budgétaire ; Direction des domaines ; Trésorerie de wilaya ; Direction de l'urbanisme, de l'architecture et de la construction ; Direction des travaux publics | Collecte, dès le début, des données de tous les modules pour une image globale de la catastrophe, en vue du rapport détaillé |

Au niveau **communal**, le président de l'APC désigne les responsables parmi les services présents dans la commune ; le canevas communal reste à obtenir de la Protection civile **[À COMPLÉTER]**. La liste des 13 modules, des organismes et des missions doit rester **paramétrable** par l'admin.

## 4. Chaîne d'escalade **[SOURCE]**

| Étape | Ce qui se passe |
|---|---|
| 1. Signalement | Le citoyen signale une catastrophe. Routage vers les modules de premier envoi du type, dans la commune de l'incident (**alerte de module**). Le maire et le wali ne reçoivent rien. |
| 2. Intervention du module | Le responsable de module (PCO) confirme le signalement, lance l'intervention et y affecte ses agents. Le directeur de module (PCF) suit les interventions de son module. Si la situation est maîtrisée, l'intervention est clôturée. |
| 3. Hors de contrôle | Le responsable **ou** le directeur déclare la situation « hors de contrôle », **avec un motif**. La plateforme envoie aussitôt une **demande de déclenchement** au président de l'APC de la commune. |
| 4. Plan communal | Le président de l'APC déclenche le plan ORSEC communal. Les modules prévus sont mobilisés et leurs agents appelés. Les communes limitrophes passent **automatiquement en état d'alerte** et leurs présidents d'APC sont notifiés. Le wali est notifié et le plan de wilaya passe en état d'alerte. |
| 5. Plan de wilaya | Si la catastrophe s'étend à d'autres communes, le wali déclenche le plan de wilaya, qui **englobe** les plans communaux. Les wilayas limitrophes passent en état d'alerte, leurs walis sont notifiés. Le ministre est notifié. |
| 6. Plan national | Si plusieurs plans de wilaya sont déclenchés, le ministre déclenche le plan **national (ou inter-wilayas)**, qui englobe les plans de wilaya. |

### Automates **[PROPOSÉ, cohérent avec les étapes ci-dessus]**

- **Signalement** : `non_vérifié` → `confirmé` | `rejeté` (par le responsable de module). La gravité est fixée à la confirmation ; tout changement est justifié et tracé.
- **Intervention** : `en_cours` → `clôturée` (maîtrisée) | `hors_de_contrôle` (motif obligatoire).
- **DemandeDéclenchement** : `en_attente` → `traitée` (plan déclenché) | `refusée` ; l'**Horloge** relance si pas de réponse (délai configurable, constante `ESCALATION_REMINDER_MINUTES`).
- **Plan** : `en_alerte` → `déclenché` → `levé`. Phases d'un plan déclenché : `urgence` → `évaluation_contrôle` → `réhabilitation`.
- **MiseEnAlerte** : créée par cascade (communes limitrophes, niveau supérieur) ; la **levée du plan lève les alertes en cascade**.
- **Participation (appel des agents)** : `appelé` → `confirmé` | `libéré`.

## 5. Modèle de données **[SOURCE pour les noms et attributs lisibles]**

```ts
Utilisateur   { id, nom, prénom, courriel, motDePasse(chiffré), rôle, moduleId?, territoireId?, disponible?(agent), actif }
Territoire    { id, code, nom, niveau: "commune"|"wilaya"|"national", parentId? }
Voisinage     { territoireA, territoireB }              // même niveau, relation symétrique
Module        { id, numéro(1..13), nom, nomAr }
Organisme     { id, nom, moduleId }
TypeCatastrophe { id, code("C1".."C10"), libellé, consignesCitoyens }
ModuleParType { typeId, moduleId, étape: "premier_envoi"|"urgence"|"évaluation"|"réhabilitation", phases }

Signalement   { id, auteurId, typeId, description, latitude, longitude, communeId, photo?, personnesConcernées, gravité, état, dates }
Routage       { signalementId, moduleId, destinataireId, envoyéLe, luLe }
Intervention  { id, signalementId, moduleId, responsableId, état, début, fin?, motifHorsControle? }
AffectationAgent { interventionId, agentId, étatTâche, compteRendu }
DemandeAppui  { id, interventionId, moduleSollicitéId, état }
DemandeDéclenchement { id, niveauDemandé, territoireId, origine: "hors_de_contrôle"|"maire"|"wali"|"proposition_automatique",
                       auteurId, interventionId?, motif, état, planId?, réponse?, dates }   // champs partiellement lisibles
Plan          { id, niveau, territoireId, phase, état, planEnglobantId?, demandeOrigineId?, dates, exercice: boolean }
ModuleMobilisé{ planId, moduleId, mobiliséLe, libéréLe? }
MiseEnAlerte  { territoireId, planSourceId, raison: "limitrophe"|"niveau_supérieur", début, levée? }
Participation { planId, agentId, moduleId, état, appeléLe, confirméLe?, libéréLe? }
Notification  { destinataireId, typeÉvénement, objet, message, canal, crééeLe, lueLe? }
Journal       { acteurId, action, objet, détails, date }   // lecture seule, jamais modifié
```

Règles transverses : un exercice (`Plan.exercice = true`) ne modifie jamais les données réelles ; les suggestions de l'IA exigent une validation humaine ; tout signalement non confirmé est affiché « non vérifié » ; chaque décision écrit le `Journal` avec l'identifiant d'**affectation** actif (`currentAssignmentId`).

## 6. Règles métier à coder

### 6.1 Routage d'un signalement (étape 1)
Premiers modules par type **[SOURCE, tableau 9]** :

| Type | Modules de premier envoi | Pourquoi |
|---|---|---|
| C1 Séismes | 1, 8 | secours ; travaux publics (bâtiments, routes) |
| C2 Inondations | 1, 8 | secours ; travaux publics (ouvrages, routes) |
| C3 Risques climatiques | 1, 8 | secours ; travaux publics (neige, routes) |
| C4 Feux de forêts | 1, 10 | secours ; Conservation des forêts (module 10) |
| C5 Industriels et énergétiques | 1, 6 | secours ; énergie |
| C6 Radiologiques et nucléaires | 1, 3 | secours ; santé et environnement |
| C7 Santé humaine | 3 | santé (Direction de la santé) |
| C8 Santé animale et végétale | 3 | santé (services vétérinaires) |
| C9 Pollutions | 3, 1 | santé et environnement ; secours |
| C10 Grands rassemblements | 1, 2 | secours ; sécurité et ordre public |

Destinataires = utilisateurs `rôle ∈ {responsable de module, directeur de module, agent de module}` du module, dont le territoire couvre `communeId` du signalement. Créer un `Routage` + une `Notification` « alerte de module » par destinataire. **Aucune notification au maire ni au wali.**

### 6.2 Déclenchement et cascade (étapes 3 à 6)
- `Intervention` → `hors_de_contrôle` crée une `DemandeDéclenchement(origine="hors_de_contrôle", niveauDemandé="commune")` adressée au président de l'APC de la commune + notification.
- APC déclenche le plan communal : `Plan(niveau="commune", état="déclenché", phase="urgence")` ; créer les `ModuleMobilisé` (selon la matrice §6.3), appeler les agents (`Participation`), mettre en `MiseEnAlerte` les communes limitrophes (via `Voisinage`) et notifier leurs APC ; notifier le wali et mettre le plan de wilaya `en_alerte`.
- Wali déclenche le plan de wilaya (si plusieurs communes) : `planEnglobantId` des plans communaux = plan de wilaya ; alerter les wilayas limitrophes, notifier leurs walis et le ministre.
- Ministre déclenche le plan national quand **≥ 2 plans de wilaya** sont déclenchés ; englobe les plans de wilaya.
- Chaque autorité n'agit que sur **son niveau et son territoire** (APC = commune, wali = wilaya, ministre = national). La plateforme **propose** les escalades ; seule l'autorité décide.
- Lever un plan : fin des `ModuleMobilisé`, **levée des alertes en cascade**, création d'un rapport « à compléter ».

### 6.3 Matrice module × type × phase **[À COMPLÉTER]**
Les photos montrent deux tableaux de coches (lignes = 13 modules, colonnes = C1 à C10) :
- **Tableau 11** : modules mobilisés en **urgence et en évaluation/contrôle**. Les modules 1 à 4 sont cochés pour C1–C10.
- **Tableau 12** : modules mobilisés en **réhabilitation / reconstruction**.

Règles de lecture partiellement lisibles (à vérifier sur le document source) : six modules interviennent pour les dix types en urgence ; la santé n'est pas mobilisée pour la santé animale et végétale ; la solidarité n'est pas mobilisée pour certains types (feux, industriels, radiologiques, animaux/végétaux, rassemblements) ; l'hébergement provisoire n'intervient pas pour les risques sanitaires ni les pollutions ; en réhabilitation seuls restent certains modules (communication, énergie, hébergement, travaux publics, eau, etc.).

**Action** : créer `src/data/moduleMatrix.ts` avec `URGENCE: Record<ModuleNo, Record<"C1"|…|"C10", boolean | "TODO">>` et `REHABILITATION` identique, **toutes les cellules illisibles à `"TODO"`**, et un test qui échoue tant qu'il reste des `"TODO"`. Le propriétaire du projet remplit depuis le guide v3.0 (pages 11–12).

### 6.4 Permissions (remplacent les 42 codes précédents)

| Permission | Rôles |
|---|---|
| `CREER_SIGNALEMENT`, `SUIVRE_MON_SIGNALEMENT` | citoyen |
| `RECEVOIR_ALERTE_MODULE` | agent, responsable, directeur |
| `CONFIRMER_SIGNALEMENT`, `FIXER_GRAVITE`, `LANCER_INTERVENTION`, `AFFECTER_AGENTS`, `DEMANDER_APPUI_MODULE`, `CLOTURER_INTERVENTION` | responsable (PCO) |
| `DECLARER_HORS_CONTROLE` | responsable, directeur |
| `CONSULTER_MODULE` (signalements, interventions, effectifs du module) | directeur (PCF), responsable |
| `INDIQUER_DISPONIBILITE`, `SUIVRE_TACHE`, `ENVOYER_COMPTE_RENDU`, `CONFIRMER_PARTICIPATION` | agent |
| `TRAITER_DEMANDE_DECLENCHEMENT`, `DECLENCHER_PLAN`, `CHANGER_PHASE`, `LEVER_PLAN`, `PROPOSER_ESCALADE`, `DEMANDER_PLAN_SUPERIEUR`, `LANCER_EXERCICE`, `CONSULTER_PLANS_ALERTES_EFFECTIFS` | autorités (chacune sur son niveau/territoire) |
| `DECLENCHER_PLAN_NATIONAL` | ministre |
| `GERER_COMPTES`, `ATTRIBUER_ROLE`, `GERER_REFERENTIELS` (modules, organismes, types, matrice, consignes, territoires, voisinage), `CONSULTER_JOURNAL` | administrateur |

Contrôle d'accès dans cet ordre : session active → permission du rôle → territoire (et module pour les rôles de module) → niveau de plan correspondant au rôle. Échec = page « accès refusé ».

## 7. Espaces et écrans (frontend)

### 7.1 Citoyen (`/dashboard`, public + connecté)
- **Signaler une catastrophe** : choisir le type C1–C10 (liste claire), description, position (GPS ou carte), photo, nombre de personnes ; **suggestion IA** de type et de gravité (badge « Suggestion IA », jamais appliquée seule). Pas de choix d'organisme.
- **Suivre l'état de mon signalement** : `non vérifié` / `confirmé` / `rejeté`, avec date, module qui l'a traité.
- **Consignes** par type de catastrophe, **alertes reçues**, carte.

### 7.2 Espace module (`/module/*`) — agent, responsable, directeur
Même coque, menu filtré par permission :
- **Agent** : *Ma disponibilité* (interrupteur), *Mes tâches* (liste + détail + statut), *Compte rendu* (texte, photo, position ; utilisable hors ligne), *Appels* (confirmer sa participation à un plan).
- **Responsable (PCO)** : *Alertes de module* (signalements reçus) → *Confirmer ou rejeter* + gravité ; *Lancer une intervention* + *affecter des agents* ; *Suivi de l'intervention* ; *Demander l'appui d'un autre module* ; **Déclarer « hors de contrôle »** (motif obligatoire, confirmation, envoie la demande au maire) ; *Clôturer*.
- **Directeur (PCF)** : *Signalements et interventions du module* (lecture, filtres) ; *Effectifs* ; **Déclarer « hors de contrôle »** ; vue des interventions en cours et des demandes d'appui.

### 7.3 Espace autorité (`/autorite/*`) — APC, wali, ministre
- **Demandes de déclenchement** (liste prioritaire, origine, motif, intervention liée, **relances** de l'Horloge visibles) → *Déclencher* / *Refuser*.
- **Plans** : plan de son niveau, état, **plans englobés**, modules mobilisés (selon la matrice), phase avec *Changer la phase*, *Lever* (confirmation : lève les alertes en cascade).
- **Escalade** : propositions de la plateforme (niveau supérieur, territoires limitrophes), *Demander le plan du niveau supérieur*.
- **Alertes en cascade** : territoires voisins et niveau supérieur mis en alerte, notifications envoyées.
- **Effectifs et participations** : agents appelés, confirmés, libérés.
- **Exercices** : *Lancer un exercice* (jamais de mélange avec les données réelles, bandeau « EXERCICE »).
- **Ministre** : vue de toutes les wilayas, plans de wilaya déclenchés, *Déclencher le plan national* (proposé dès que ≥ 2 plans de wilaya).

### 7.4 Administrateur (`/admin/*`)
Comptes (créer, modifier, désactiver ; le rôle est obligatoire ; module et territoire requis selon le rôle), **8 rôles** (lecture + permissions), territoires (wilaya, communes) et **voisinage**, **13 modules** + organismes + missions, **types de catastrophe** (consignes FR/AR) et **matrice module × type × phase**, journal en lecture seule.

### 7.5 Routes **[PROPOSÉ]**
`/personnel/login`, `/module/{alertes,interventions,taches,disponibilite,appels,historique}`, `/autorite/{demandes,plans,escalade,alertes,effectifs,exercices}`, `/admin/{comptes,roles,territoires,modules,types,matrice,journal}`.

## 8. Ce qu'OpenCode doit faire, dans l'ordre

1. **Auth** : réécrire `auth/roles.ts` (8 rôles, familles abstraites), `auth/permissions.ts` (§6.4), `auth/demoAccounts.ts` (un compte par rôle + plusieurs modules/communes), supprimer `IMPLICIT_DESIGNATIONS` et les désignations ORSEC (le PCO/PCF sont maintenant des **rôles**). Ajuster `RequireSpace` : espaces `citizen`, `module`, `authority`, `admin`. Mettre à jour `tests/access.test.ts`.
2. **Données** : `src/data/` avec `modules.ts`, `types.ts`, `moduleParType.ts` (routage §6.1), `moduleMatrix.ts` (§6.3, TODO), `territories.ts` (Béjaïa + communes + voisinage), organismes (§3.2).
3. **Services** (`src/services/`) : `reports`, `routing`, `interventions`, `triggerRequests`, `plans` (cascade §6.2), `notifications`, `journal`, `clock` (relances). Pures, testées.
4. **Écrans** : citoyen (§7.1), module (§7.2), autorité (§7.3), admin (§7.4). Réutiliser `AppShell`, `CrisisMap`, composants existants.
5. **Nettoyage** : supprimer `pages/organisme/`, `pages/site/`, les personas, l'ancien sélecteur de niveau, les clés i18n devenues mortes (script d'élagage comme avant).
6. **i18n** : nouveaux fichiers par espace (`module.ts`, `authority.ts`, `admin.ts`, `citizen.ts`), FR + AR complets ; vérifier qu'aucune clé utilisée n'est manquante.
7. **Vérifications** : `tsc --noEmit --noUnusedLocals`, `vite build`, tests unitaires du routage et de la cascade (un signalement C4 vers modules 1 et 10 ; hors de contrôle → demande à l'APC ; déclenchement communal → limitrophes en alerte + wali notifié ; 2 plans de wilaya → proposition au ministre ; levée → alertes levées).

## 9. Points à valider avec l'équipe avant de coder

1. Le **directeur de module (PCF)** est-il rattaché à la commune ou à la wilaya ?
2. **Citoyen** : pas d'agriculteur en v3.0 ? Le site sensible et l'exploitant sont-ils définitivement hors périmètre ?
3. Délai de **relance** de l'Horloge, et qui est relancé (l'APC seulement ?).
4. Le **refus** d'une demande de déclenchement existe-t-il (décret : traitée sur-le-champ) ?
5. Contenu exact des **tableaux 11 et 12** et de la **DemandeDéclenchement** (champs partiellement lisibles sur la photo).
6. Règles **RG-O02, RG-O07, RG-O09, RG-O13, RG-O14, RG-O18** : citées par les diagrammes ; leur texte v3.0 n'est pas dans les photos.
