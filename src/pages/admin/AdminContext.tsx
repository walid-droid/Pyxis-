import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CURRENT_ADMIN,
  INITIAL_ACTIVITY,
  INITIAL_DOCUMENTS,
  INITIAL_EVENT_TYPES,
  INITIAL_MODULES,
  INITIAL_ORGANISATIONS,
  INITIAL_ROLES,
  INITIAL_SEVERITIES,
  INITIAL_USERS,
  INITIAL_WILAYAS,
  type ActivityCategory,
  type ActivityEntry,
  type ActivityTone,
} from "./adminData";
import {
  AdminContext,
  type AdminContextValue,
  type AdminState,
} from "./adminStore";

const ACTIVITY_LIMIT = 120;

const initialState: AdminState = {
  users: INITIAL_USERS,
  roles: INITIAL_ROLES,
  organisations: INITIAL_ORGANISATIONS,
  wilayas: INITIAL_WILAYAS,
  severities: INITIAL_SEVERITIES,
  eventTypes: INITIAL_EVENT_TYPES,
  modules: INITIAL_MODULES,
  documents: INITIAL_DOCUMENTS,
  activity: INITIAL_ACTIVITY,
};

function todayLabel(): string {
  return new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

let sequence = 0;
function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence}`;
}

function entry(
  actionKey: string,
  target: string,
  category: ActivityCategory,
  tone: ActivityTone,
  detail?: string,
): ActivityEntry {
  return {
    id: nextId("act"),
    actionKey,
    target,
    author: CURRENT_ADMIN,
    category,
    detail: detail?.trim() || undefined,
    tone,
    at: Date.now(),
  };
}

function withActivity(
  activity: ActivityEntry[],
  added: ActivityEntry | null,
): ActivityEntry[] {
  return added ? [added, ...activity].slice(0, ACTIVITY_LIMIT) : activity;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminState>(initialState);

  const addUser = useCallback<AdminContextValue["addUser"]>((user) => {
    const id = nextId("u");
    setState((current) => ({
      ...current,
      users: [
        {
          ...user,
          id,
          createdAt: todayLabel(),
          lastLogin: "—",
        },
        ...current.users,
      ],
      activity: withActivity(
        current.activity,
        entry(
          "admin.act.userCreated",
          user.name,
          "accounts",
          "green",
          user.status === "invited"
            ? "Invitation envoyée à l'adresse indiquée."
            : undefined,
        ),
      ),
    }));
    return id;
  }, []);

  const updateUser = useCallback<AdminContextValue["updateUser"]>(
    (id, patch, meta) => {
      setState((current) => {
        const target = current.users.find((user) => user.id === id);
        if (!target) return current;

        let actionKey = meta?.actionKey ?? "admin.act.userUpdated";
        let tone: ActivityTone = meta?.tone ?? "blue";
        let category: ActivityCategory = meta?.category ?? "accounts";

        if (!meta?.actionKey) {
          if (patch.status === "suspended") {
            actionKey = "admin.act.userSuspended";
            tone = "red";
            category = "security";
          } else if (patch.status === "active") {
            actionKey = "admin.act.userActivated";
            tone = "green";
          } else if (patch.roleId && patch.roleId !== target.roleId) {
            actionKey = "admin.act.userRoleChanged";
            tone = "amber";
            category = "roles";
          }
        }

        return {
          ...current,
          users: current.users.map((user) =>
            user.id === id ? { ...user, ...patch } : user,
          ),
          activity: withActivity(
            current.activity,
            entry(
              actionKey,
              meta?.target ?? target.name,
              category,
              tone,
              meta?.detail,
            ),
          ),
        };
      });
    },
    [],
  );

  const removeUser = useCallback<AdminContextValue["removeUser"]>((id) => {
    setState((current) => {
      const target = current.users.find((user) => user.id === id);
      if (!target) return current;
      return {
        ...current,
        users: current.users.filter((user) => user.id !== id),
        activity: withActivity(
          current.activity,
          entry(
            "admin.act.userDeleted",
            target.name,
            "accounts",
            "red",
            "Suppression définitive du compte.",
          ),
        ),
      };
    });
  }, []);

  const resendInvitation = useCallback<AdminContextValue["resendInvitation"]>(
    (id) => {
      setState((current) => {
        const target = current.users.find((user) => user.id === id);
        if (!target) return current;
        return {
          ...current,
          activity: withActivity(
            current.activity,
            entry(
              "admin.act.invitationResent",
              target.name,
              "accounts",
              "blue",
              `Invitation renvoyée à ${target.email}.`,
            ),
          ),
        };
      });
    },
    [],
  );

  const setUsersStatus = useCallback<AdminContextValue["setUsersStatus"]>(
    (ids, status, reason) => {
      setState((current) => {
        const targets = current.users.filter((user) => ids.includes(user.id));
        if (targets.length === 0) return current;

        const actionKey =
          status === "suspended"
            ? "admin.act.userSuspended"
            : status === "active"
              ? "admin.act.userActivated"
              : "admin.act.invitationResent";
        const tone: ActivityTone =
          status === "suspended" ? "red" : status === "active" ? "green" : "blue";
        const category: ActivityCategory =
          status === "suspended" ? "security" : "accounts";
        const label =
          targets.length > 1
            ? `${targets.length} comptes · ${targets
                .map((user) => user.name)
                .join(", ")}`
            : targets[0].name;

        return {
          ...current,
          users: current.users.map((user) =>
            ids.includes(user.id) ? { ...user, status } : user,
          ),
          activity: withActivity(
            current.activity,
            entry(actionKey, label, category, tone, reason),
          ),
        };
      });
    },
    [],
  );

  const addRole = useCallback<AdminContextValue["addRole"]>((role) => {
    const id = nextId("role");
    setState((current) => ({
      ...current,
      roles: [...current.roles, { ...role, id }],
      activity: withActivity(
        current.activity,
        entry("admin.act.roleCreated", role.name, "roles", "violet"),
      ),
    }));
    return id;
  }, []);

  const updateRole = useCallback<AdminContextValue["updateRole"]>(
    (id, patch, detail) => {
      setState((current) => {
        const target = current.roles.find((role) => role.id === id);
        if (!target) return current;
        return {
          ...current,
          roles: current.roles.map((role) =>
            role.id === id ? { ...role, ...patch } : role,
          ),
          activity: withActivity(
            current.activity,
            entry(
              "admin.act.roleUpdated",
              patch.name ?? target.name,
              "roles",
              "violet",
              detail,
            ),
          ),
        };
      });
    },
    [],
  );

  const addOrganisation = useCallback<AdminContextValue["addOrganisation"]>(
    (org) => {
      const id = nextId("org");
      setState((current) => ({
        ...current,
        organisations: [
          ...current.organisations,
          { ...org, id, createdAt: todayLabel() },
        ],
        activity: withActivity(
          current.activity,
          entry(
            "admin.act.orgCreated",
            org.name,
            "organisations",
            "green",
            org.status === "pending"
              ? "Organisation créée en attente de validation."
              : undefined,
          ),
        ),
      }));
      return id;
    },
    [],
  );

  const updateOrganisation = useCallback<
    AdminContextValue["updateOrganisation"]
  >((id, patch) => {
    setState((current) => {
      const target = current.organisations.find((org) => org.id === id);
      if (!target) return current;
      return {
        ...current,
        organisations: current.organisations.map((org) =>
          org.id === id ? { ...org, ...patch } : org,
        ),
        activity: withActivity(
          current.activity,
          entry(
            "admin.act.orgUpdated",
            patch.name ?? target.name,
            "organisations",
            "blue",
          ),
        ),
      };
    });
  }, []);

  const approveOrganisation = useCallback<
    AdminContextValue["approveOrganisation"]
  >((id) => {
    setState((current) => {
      const target = current.organisations.find((org) => org.id === id);
      if (!target) return current;
      return {
        ...current,
        organisations: current.organisations.map((org) =>
          org.id === id ? { ...org, status: "active" } : org,
        ),
        activity: withActivity(
          current.activity,
          entry(
            "admin.act.orgApproved",
            target.name,
            "organisations",
            "green",
            "Habilitation vérifiée : organisation activée.",
          ),
        ),
      };
    });
  }, []);

  const rejectOrganisation = useCallback<
    AdminContextValue["rejectOrganisation"]
  >((id, reason) => {
    setState((current) => {
      const target = current.organisations.find((org) => org.id === id);
      if (!target) return current;
      return {
        ...current,
        organisations: current.organisations.map((org) =>
          org.id === id ? { ...org, status: "suspended" } : org,
        ),
        activity: withActivity(
          current.activity,
          entry(
            "admin.act.orgRejected",
            target.name,
            "organisations",
            "red",
            reason,
          ),
        ),
      };
    });
  }, []);

  const addWilaya = useCallback<AdminContextValue["addWilaya"]>((wilaya) => {
    setState((current) => ({
      ...current,
      wilayas: [...current.wilayas, { ...wilaya, wali: null, communes: [] }].sort(
        (a, b) => a.code.localeCompare(b.code),
      ),
      activity: withActivity(
        current.activity,
        entry(
          "admin.act.wilayaCreated",
          wilaya.name,
          "territories",
          "green",
        ),
      ),
    }));
  }, []);

  const updateWilaya = useCallback<AdminContextValue["updateWilaya"]>(
    (code, patch) => {
      setState((current) => {
        const target = current.wilayas.find((wilaya) => wilaya.code === code);
        if (!target) return current;
        return {
          ...current,
          wilayas: current.wilayas.map((wilaya) =>
            wilaya.code === code ? { ...wilaya, ...patch } : wilaya,
          ),
          activity: withActivity(
            current.activity,
            entry(
              "admin.act.wilayaUpdated",
              target.name,
              "territories",
              "blue",
              patch.wali !== undefined
                ? patch.wali
                  ? `Wali désigné : ${patch.wali}.`
                  : "Poste de wali déclaré vacant."
                : undefined,
            ),
          ),
        };
      });
    },
    [],
  );

  const addCommune = useCallback<AdminContextValue["addCommune"]>(
    (wilayaCode, commune) => {
      setState((current) => {
        const wilaya = current.wilayas.find((item) => item.code === wilayaCode);
        const index = (wilaya?.communes.length ?? 0) + 1;
        return {
          ...current,
          wilayas: current.wilayas.map((item) =>
            item.code === wilayaCode
              ? {
                  ...item,
                  communes: [
                    ...item.communes,
                    {
                      ...commune,
                      apcPresident: commune.apcPresident ?? null,
                      id: nextId("c"),
                      code: `${wilayaCode}-${String(index).padStart(2, "0")}`,
                    },
                  ],
                }
              : item,
          ),
          activity: withActivity(
            current.activity,
            entry(
              "admin.act.communeCreated",
              `${commune.name} · ${wilaya?.name ?? wilayaCode}`,
              "territories",
              "green",
            ),
          ),
        };
      });
    },
    [],
  );

  const updateCommune = useCallback<AdminContextValue["updateCommune"]>(
    (wilayaCode, communeId, patch) => {
      setState((current) => {
        const wilaya = current.wilayas.find((item) => item.code === wilayaCode);
        const target = wilaya?.communes.find((item) => item.id === communeId);
        return {
          ...current,
          wilayas: current.wilayas.map((item) =>
            item.code === wilayaCode
              ? {
                  ...item,
                  communes: item.communes.map((commune) =>
                    commune.id === communeId
                      ? { ...commune, ...patch }
                      : commune,
                  ),
                }
              : item,
          ),
          activity: withActivity(
            current.activity,
            target
              ? entry(
                  "admin.act.communeUpdated",
                  `${patch.name ?? target.name} · ${wilaya?.name ?? wilayaCode}`,
                  "territories",
                  "blue",
                  patch.apcPresident !== undefined
                    ? patch.apcPresident
                      ? `Président de l'APC désigné : ${patch.apcPresident}.`
                      : "Poste de président de l'APC déclaré vacant."
                    : undefined,
                )
              : null,
          ),
        };
      });
    },
    [],
  );

  const addSeverity = useCallback<AdminContextValue["addSeverity"]>((level) => {
    setState((current) => ({
      ...current,
      severities: [...current.severities, { ...level, id: nextId("sev") }],
      activity: withActivity(
        current.activity,
        entry("admin.act.severityCreated", level.name, "settings", "amber"),
      ),
    }));
  }, []);

  const updateSeverity = useCallback<AdminContextValue["updateSeverity"]>(
    (id, patch) => {
      setState((current) => {
        const target = current.severities.find((level) => level.id === id);
        if (!target) return current;
        return {
          ...current,
          severities: current.severities.map((level) =>
            level.id === id ? { ...level, ...patch } : level,
          ),
          activity: withActivity(
            current.activity,
            entry(
              "admin.act.severityUpdated",
              patch.name ?? target.name,
              "settings",
              "amber",
              patch.active === false
                ? "Niveau désactivé : plus proposé pour la qualification des incidents."
                : undefined,
            ),
          ),
        };
      });
    },
    [],
  );

  const addEventType = useCallback<AdminContextValue["addEventType"]>((type) => {
    setState((current) => ({
      ...current,
      eventTypes: [...current.eventTypes, { ...type, id: nextId("evt") }],
      activity: withActivity(
        current.activity,
        entry("admin.act.eventCreated", type.name, "settings", "blue"),
      ),
    }));
  }, []);

  const updateEventType = useCallback<AdminContextValue["updateEventType"]>(
    (id, patch) => {
      setState((current) => {
        const target = current.eventTypes.find((type) => type.id === id);
        if (!target) return current;
        return {
          ...current,
          eventTypes: current.eventTypes.map((type) =>
            type.id === id ? { ...type, ...patch } : type,
          ),
          activity: withActivity(
            current.activity,
            entry(
              "admin.act.eventUpdated",
              patch.name ?? target.name,
              "settings",
              "blue",
            ),
          ),
        };
      });
    },
    [],
  );

  const toggleModule = useCallback<AdminContextValue["toggleModule"]>((id) => {
    setState((current) => {
      const target = current.modules.find((module) => module.id === id);
      if (!target) return current;
      return {
        ...current,
        modules: current.modules.map((module) =>
          module.id === id ? { ...module, enabled: !module.enabled } : module,
        ),
        activity: withActivity(
          current.activity,
          entry(
            target.enabled
              ? "admin.act.moduleDisabled"
              : "admin.act.moduleEnabled",
            target.nameKey,
            "settings",
            target.enabled ? "red" : "violet",
          ),
        ),
      };
    });
  }, []);

  const addDocument = useCallback<AdminContextValue["addDocument"]>((doc) => {
    const id = nextId("doc");
    setState((current) => ({
      ...current,
      documents: [
        { ...doc, id, updatedAt: todayLabel() },
        ...current.documents,
      ],
      activity: withActivity(
        current.activity,
        entry(
          "admin.act.documentAdded",
          doc.title,
          "documents",
          "blue",
          doc.published ? "Document publié dès le dépôt." : undefined,
        ),
      ),
    }));

    // Simulation de l'indexation de l'assistant IA.
    window.setTimeout(() => {
      setState((current) => ({
        ...current,
        documents: current.documents.map((document) =>
          document.id === id
            ? {
                ...document,
                status: "indexed",
                chunks: Math.max(12, document.chunks || 42),
              }
            : document,
        ),
      }));
    }, 2200);

    return id;
  }, []);

  const updateDocument = useCallback<AdminContextValue["updateDocument"]>(
    (id, patch, meta) => {
      setState((current) => {
        const target = current.documents.find((doc) => doc.id === id);
        if (!target) return current;

        let actionKey = meta?.actionKey ?? "admin.act.documentUpdated";
        let tone: ActivityTone = meta?.tone ?? "blue";
        if (!meta?.actionKey && patch.published !== undefined) {
          actionKey = patch.published
            ? "admin.act.documentPublished"
            : "admin.act.documentUnpublished";
          tone = patch.published ? "green" : "amber";
        }

        return {
          ...current,
          documents: current.documents.map((doc) =>
            doc.id === id ? { ...doc, ...patch } : doc,
          ),
          activity: withActivity(
            current.activity,
            entry(
              actionKey,
              meta?.target ?? target.title,
              meta?.category ?? "documents",
              tone,
              meta?.detail,
            ),
          ),
        };
      });
    },
    [],
  );

  const removeDocument = useCallback<AdminContextValue["removeDocument"]>(
    (id) => {
      setState((current) => {
        const target = current.documents.find((doc) => doc.id === id);
        if (!target) return current;
        return {
          ...current,
          documents: current.documents.filter((doc) => doc.id !== id),
          activity: withActivity(
            current.activity,
            entry(
              "admin.act.documentDeleted",
              target.title,
              "documents",
              "red",
            ),
          ),
        };
      });
    },
    [],
  );

  const reindexDocument = useCallback<AdminContextValue["reindexDocument"]>(
    (id) => {
      setState((current) => ({
        ...current,
        documents: current.documents.map((doc) =>
          doc.id === id ? { ...doc, status: "processing" } : doc,
        ),
      }));

      window.setTimeout(() => {
        setState((current) => {
          const target = current.documents.find((doc) => doc.id === id);
          return {
            ...current,
            documents: current.documents.map((doc) =>
              doc.id === id
                ? {
                    ...doc,
                    status: "indexed",
                    chunks: Math.max(doc.chunks, 18),
                    updatedAt: todayLabel(),
                  }
                : doc,
            ),
            activity: withActivity(
              current.activity,
              target
                ? entry(
                    "admin.act.documentIndexed",
                    target.title,
                    "documents",
                    "blue",
                  )
                : null,
            ),
          };
        });
      }, 1800);
    },
    [],
  );

  const reindexAll = useCallback<AdminContextValue["reindexAll"]>(() => {
    setState((current) => ({
      ...current,
      documents: current.documents.map((doc) => ({
        ...doc,
        status: doc.status === "draft" ? "draft" : "processing",
      })),
    }));

    window.setTimeout(() => {
      setState((current) => ({
        ...current,
        documents: current.documents.map((doc) =>
          doc.status === "processing"
            ? { ...doc, status: "indexed", updatedAt: todayLabel() }
            : doc,
        ),
        activity: withActivity(
          current.activity,
          entry(
            "admin.act.indexRebuilt",
            "Assistant IA",
            "documents",
            "violet",
          ),
        ),
      }));
    }, 2400);
  }, []);

  const linkAccount = useCallback<AdminContextValue["linkAccount"]>(
    (userId, link) => {
      setState((current) => {
        const target = current.users.find((user) => user.id === userId);
        const org = current.organisations.find(
          (item) => item.id === link.organisationId,
        );
        if (!target) return current;
        return {
          ...current,
          users: current.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  organisationId: link.organisationId,
                  wilaya: link.wilaya,
                  commune: link.commune,
                }
              : user,
          ),
          activity: withActivity(
            current.activity,
            entry(
              "admin.act.orgLinked",
              `${target.name} · ${org?.name ?? ""}`,
              "organisations",
              "green",
            ),
          ),
        };
      });
    },
    [],
  );

  const unlinkAccount = useCallback<AdminContextValue["unlinkAccount"]>(
    (userId) => {
      setState((current) => {
        const target = current.users.find((user) => user.id === userId);
        if (!target) return current;
        return {
          ...current,
          users: current.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  organisationId: null,
                  commune: "",
                }
              : user,
          ),
          activity: withActivity(
            current.activity,
            entry(
              "admin.act.orgUnlinked",
              target.name,
              "organisations",
              "amber",
            ),
          ),
        };
      });
    },
    [],
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      state,
      addUser,
      updateUser,
      removeUser,
      resendInvitation,
      setUsersStatus,
      addRole,
      updateRole,
      addOrganisation,
      updateOrganisation,
      approveOrganisation,
      rejectOrganisation,
      addWilaya,
      updateWilaya,
      addCommune,
      updateCommune,
      addSeverity,
      updateSeverity,
      addEventType,
      updateEventType,
      toggleModule,
      addDocument,
      updateDocument,
      removeDocument,
      reindexDocument,
      reindexAll,
      linkAccount,
      unlinkAccount,
    }),
    [
      state,
      addUser,
      updateUser,
      removeUser,
      resendInvitation,
      setUsersStatus,
      addRole,
      updateRole,
      addOrganisation,
      updateOrganisation,
      approveOrganisation,
      rejectOrganisation,
      addWilaya,
      updateWilaya,
      addCommune,
      updateCommune,
      addSeverity,
      updateSeverity,
      addEventType,
      updateEventType,
      toggleModule,
      addDocument,
      updateDocument,
      removeDocument,
      reindexDocument,
      reindexAll,
      linkAccount,
      unlinkAccount,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

/* Ré-export utilitaire pour les pages qui n'ont pas besoin du contexte. */
export type { AdminState };
