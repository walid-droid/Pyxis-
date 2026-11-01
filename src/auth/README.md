# auth/ — rôles, permissions et session

Source unique du contrôle d'accès de CADM.

| Fichier | Rôle |
|---|---|
| `roles.ts` | Les 22 rôles de compte (un seul rôle par compte), leur espace, leur rattachement, leur sprint |
| `permissions.ts` | Codes de permission, `ROLE_PERMISSIONS`, désignations ORSEC (`DESIGNATION_PERMISSIONS`) |
| `session.ts` | Session unique (rôle, rattachement, **affectation**, désignations) |
| `access.ts` | `canAccess()` : permission → territoire/organisme → niveau de plan (RG-O01) |
| `AuthContext.ts`, `AuthProvider.tsx` | `useAuth()` : `session`, `role`, `can()`, `canAny()` |
| `guards.tsx` | `RequireSpace`, `RequirePermission`, `Can`, `AccessDenied` |
| `demoAccounts.ts` | Comptes de démonstration (sans backend) |

## Règles
1. Ne jamais tester un rôle dans un composant : utiliser `can("PERMISSION", contexte)`.
2. Ajouter un rôle = `roles.ts` + `ROLE_PERMISSIONS`. L'écran d'administration et les menus suivent.
3. Les fonctions de crise (directeur du PCF, du PCO, responsable de module…) sont des **désignations**, pas des rôles.
4. `currentAssignmentId(session)` doit être scellé dans toute décision ou entrée de journal.
5. Mode démo (`DEMO_MODE`, voir `config.ts`) : sélecteur de rôle et comptes de démonstration. Désactivé en production
   (sauf `VITE_DEMO=1`). Brancher `lib/session.ts` sur le vrai backend d'authentification avant la mise en service.
