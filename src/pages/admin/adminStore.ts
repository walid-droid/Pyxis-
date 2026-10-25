import { createContext, useContext } from "react";
import type {
  ActivityCategory,
  ActivityEntry,
  ActivityTone,
  AdminModule,
  AdminRole,
  AdminUser,
  AiDocument,
  Commune,
  EventType,
  Organisation,
  SeverityLevel,
  UserStatus,
  Wilaya,
} from "./adminData";

export type AdminState = {
  users: AdminUser[];
  roles: AdminRole[];
  organisations: Organisation[];
  wilayas: Wilaya[];
  severities: SeverityLevel[];
  eventTypes: EventType[];
  modules: AdminModule[];
  documents: AiDocument[];
  activity: ActivityEntry[];
};

export type NewUser = Omit<AdminUser, "id" | "createdAt" | "lastLogin">;
export type NewOrganisation = Omit<Organisation, "id" | "createdAt">;
export type NewCommune = Pick<
  Commune,
  "name" | "nameAr" | "population" | "active"
> & {
  apcPresident?: string | null;
};
export type NewWilaya = Pick<Wilaya, "code" | "name" | "nameAr" | "region">;
export type NewSeverity = Omit<SeverityLevel, "id">;
export type NewEventType = Omit<EventType, "id">;
export type NewDocument = Omit<AiDocument, "id" | "updatedAt">;

/** Métadonnées de journalisation pour les actions sensibles. */
export type LogMeta = {
  actionKey?: string;
  target?: string;
  category?: ActivityCategory;
  detail?: string;
  tone?: ActivityTone;
};

export type AdminContextValue = {
  state: AdminState;
  addUser: (user: NewUser) => string;
  updateUser: (id: string, patch: Partial<AdminUser>, meta?: LogMeta) => void;
  removeUser: (id: string) => void;
  resendInvitation: (id: string) => void;
  setUsersStatus: (
    ids: string[],
    status: UserStatus,
    reason: string,
  ) => void;
  addRole: (role: Omit<AdminRole, "id">) => string;
  updateRole: (id: string, patch: Partial<AdminRole>, detail?: string) => void;
  addOrganisation: (org: NewOrganisation) => string;
  updateOrganisation: (id: string, patch: Partial<Organisation>) => void;
  approveOrganisation: (id: string) => void;
  rejectOrganisation: (id: string, reason: string) => void;
  addWilaya: (wilaya: NewWilaya) => void;
  updateWilaya: (code: string, patch: Partial<Wilaya>) => void;
  addCommune: (wilayaCode: string, commune: NewCommune) => void;
  updateCommune: (
    wilayaCode: string,
    communeId: string,
    patch: Partial<Commune>,
  ) => void;
  addSeverity: (level: NewSeverity) => void;
  updateSeverity: (id: string, patch: Partial<SeverityLevel>) => void;
  addEventType: (type: NewEventType) => void;
  updateEventType: (id: string, patch: Partial<EventType>) => void;
  toggleModule: (id: string) => void;
  addDocument: (document: NewDocument) => string;
  updateDocument: (
    id: string,
    patch: Partial<AiDocument>,
    meta?: LogMeta,
  ) => void;
  removeDocument: (id: string) => void;
  reindexDocument: (id: string) => void;
  reindexAll: () => void;
  linkAccount: (
    userId: string,
    link: {
      organisationId: string;
      wilaya: string;
      commune: string;
    },
  ) => void;
  unlinkAccount: (userId: string) => void;
};

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used inside AdminProvider");
  }
  return context;
}
