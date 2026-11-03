import type {
  AffectationAgent,
  DemandeAppui,
  DemandeDeclenchement,
  Intervention,
  TaskState,
} from "./model";
import { pushNotification } from "./notifications";
import { moduleRecipients } from "./reports";
import { authorityOf } from "./scope";
import { appendJournal, newId, nowIso, updateDb } from "./store";
import { findSignalement, findUser } from "./selectors";

export function launchIntervention(
  signalementId: string,
  responsableId: string,
  moduleId: string,
): Intervention | undefined {
  return updateDb((db) => {
    const signalement = db.signalements.find((item) => item.id === signalementId);
    if (!signalement || signalement.etat !== "confirme") return undefined;
    const existing = db.interventions.find(
      (item) => item.signalementId === signalementId && item.moduleId === moduleId,
    );
    if (existing) return existing;

    const intervention: Intervention = {
      id: newId("int"),
      signalementId,
      moduleId,
      responsableId,
      etat: "en_cours",
      debut: nowIso(),
    };
    db.interventions.unshift(intervention);

    const module = db.reference.modules.find((item) => item.id === moduleId);
    moduleRecipients(db, moduleId, signalement.communeId)
      .filter((user) => user.role === "module_agent")
      .forEach((agent) => {
        pushNotification(
          db,
          agent.id,
          "participation",
          { fr: "Intervention lancée", ar: "تم إطلاق تدخل" },
          {
            fr: `Le module ${module?.nom.fr ?? moduleId} lance une intervention sur ${signalementId}.`,
            ar: `وحدة ${module?.nom.ar ?? moduleId} تطلق تدخلاً على ${signalementId}.`,
          },
        );
      });

    appendJournal(
      db,
      responsableId,
      "LANCEMENT_INTERVENTION",
      intervention.id,
      `Intervention du module ${moduleId} lancée sur ${signalementId}.`,
    );
    return intervention;
  });
}

export function assignAgent(
  interventionId: string,
  agentId: string,
  acteurId: string,
): AffectationAgent | undefined {
  return updateDb((db) => {
    const intervention = db.interventions.find((item) => item.id === interventionId);
    const agent = findUser(db, agentId);
    if (!intervention || !agent || agent.role !== "module_agent") return undefined;
    if (agent.moduleId !== intervention.moduleId) return undefined;
    const existing = db.affectations.find(
      (item) => item.interventionId === interventionId && item.agentId === agentId,
    );
    if (existing) return existing;

    const affectation: AffectationAgent = {
      id: newId("affect"),
      interventionId,
      agentId,
      etatTache: "a_faire",
      affecteLe: nowIso(),
      majLe: nowIso(),
    };
    db.affectations.unshift(affectation);
    pushNotification(
      db,
      agentId,
      "participation",
      { fr: "Nouvelle tâche", ar: "مهمة جديدة" },
      {
        fr: `Vous êtes affecté à l'intervention ${interventionId}.`,
        ar: `تم تكليفكم بالتدخل ${interventionId}.`,
      },
    );
    appendJournal(
      db,
      acteurId,
      "AFFECTATION_AGENT",
      affectation.id,
      `Agent ${agentId} affecté à l'intervention ${interventionId}.`,
    );
    return affectation;
  });
}

export function updateTask(
  affectationId: string,
  agentId: string,
  etatTache: TaskState,
  compteRendu?: string,
): void {
  updateDb((db) => {
    const affectation = db.affectations.find((item) => item.id === affectationId);
    if (!affectation || affectation.agentId !== agentId) return;
    affectation.etatTache = etatTache;
    if (compteRendu !== undefined) affectation.compteRendu = compteRendu;
    affectation.majLe = nowIso();
    appendJournal(
      db,
      agentId,
      "MISE_A_JOUR_TACHE",
      affectation.id,
      `Tâche ${etatTache}${compteRendu ? ` — ${compteRendu}` : ""}.`,
    );
  });
}

export function confirmParticipation(participationId: string, agentId: string): void {
  updateDb((db) => {
    const participation = db.participations.find((item) => item.id === participationId);
    if (!participation || participation.agentId !== agentId) return;
    if (participation.etat !== "appele") return;
    participation.etat = "confirme";
    participation.confirmeLe = nowIso();
    appendJournal(
      db,
      agentId,
      "CONFIRMATION_PARTICIPATION",
      participation.id,
      `Participation confirmée au plan ${participation.planId}.`,
    );
  });
}

export function closeIntervention(interventionId: string, acteurId: string): void {
  updateDb((db) => {
    const intervention = db.interventions.find((item) => item.id === interventionId);
    if (!intervention || intervention.etat === "cloturee") return;
    intervention.etat = "cloturee";
    intervention.fin = nowIso();
    db.affectations
      .filter((affectation) => affectation.interventionId === interventionId)
      .forEach((affectation) => {
        if (affectation.etatTache !== "terminee") affectation.etatTache = "terminee";
        affectation.majLe = nowIso();
      });
    const signalement = findSignalement(db, intervention.signalementId);
    if (signalement) {
      pushNotification(
        db,
        signalement.auteurId,
        "systeme",
        { fr: "Intervention clôturée", ar: "تم إغلاق التدخل" },
        {
          fr: `L'intervention sur votre signalement ${signalement.id} est terminée : situation maîtrisée.`,
          ar: `انتهى التدخل على تبليغكم ${signalement.id}: الوضع تحت السيطرة.`,
        },
      );
    }
    appendJournal(
      db,
      acteurId,
      "CLOTURE_INTERVENTION",
      interventionId,
      "Intervention clôturée, situation maîtrisée.",
    );
  });
}

/**
 * Étape 3 : le responsable ou le directeur déclare le hors-contrôle.
 * La demande de déclenchement part immédiatement vers le président de l'APC.
 */
export function declareOutOfControl(
  interventionId: string,
  acteurId: string,
  motif: string,
): DemandeDeclenchement | undefined {
  return updateDb((db) => {
    const intervention = db.interventions.find((item) => item.id === interventionId);
    if (!intervention) return undefined;
    const signalement = findSignalement(db, intervention.signalementId);
    if (!signalement) return undefined;

    const existing = db.demandes.find(
      (demande) =>
        demande.interventionId === interventionId && demande.etat === "en_attente",
    );
    if (existing) return existing;

    intervention.etat = "hors_de_controle";
    intervention.motifHorsControle = motif;
    intervention.horsControleLe = nowIso();
    intervention.horsControleParId = acteurId;

    const demande: DemandeDeclenchement = {
      id: newId("dem"),
      niveauDemande: "commune",
      territoireId: signalement.communeId,
      origine: "hors_de_controle",
      auteurId: acteurId,
      interventionId,
      motif,
      etat: "en_attente",
      creeLe: nowIso(),
      relances: [],
    };
    db.demandes.unshift(demande);

    const commune = db.reference.territories.find(
      (territory) => territory.id === signalement.communeId,
    );
    authorityOf(db, "commune", signalement.communeId).forEach((autorite) => {
      pushNotification(
        db,
        autorite.id,
        "demande_declenchement",
        {
          fr: "Demande de déclenchement du plan communal",
          ar: "طلب إطلاق المخطط البلدي",
        },
        {
          fr: `Le module ${intervention.moduleId} déclare la situation hors de contrôle à ${commune?.nom.fr ?? signalement.communeId}. Motif : ${motif}`,
          ar: `وحدة ${intervention.moduleId} تعلن الخروج عن السيطرة في ${commune?.nom.ar ?? signalement.communeId}. السبب: ${motif}`,
        },
      );
    });

    appendJournal(
      db,
      acteurId,
      "HORS_DE_CONTROLE",
      intervention.id,
      `Situation hors de contrôle : ${motif}. Demande ${demande.id} transmise à l'APC de ${commune?.nom.fr ?? signalement.communeId}.`,
    );
    return demande;
  });
}

export function requestSupport(
  interventionId: string,
  moduleSolliciteId: string,
  acteurId: string,
): DemandeAppui | undefined {
  return updateDb((db) => {
    const intervention = db.interventions.find((item) => item.id === interventionId);
    if (!intervention) return undefined;
    const signalement = findSignalement(db, intervention.signalementId);
    if (!signalement) return undefined;

    const demande: DemandeAppui = {
      id: newId("appui"),
      interventionId,
      moduleSolliciteId,
      etat: "en_attente",
      creeLe: nowIso(),
    };
    db.demandesAppui.unshift(demande);
    moduleRecipients(db, moduleSolliciteId, signalement.communeId)
      .filter((user) => user.role !== "module_agent")
      .forEach((destinataire) => {
        pushNotification(
          db,
          destinataire.id,
          "appui",
          { fr: "Demande d'appui", ar: "طلب دعم" },
          {
            fr: `Le module ${intervention.moduleId} demande l'appui du module ${moduleSolliciteId} sur ${interventionId}.`,
            ar: `وحدة ${intervention.moduleId} تطلب دعم وحدة ${moduleSolliciteId} في ${interventionId}.`,
          },
        );
      });
    appendJournal(
      db,
      acteurId,
      "DEMANDE_APPUI",
      demande.id,
      `Appui du module ${moduleSolliciteId} demandé pour ${interventionId}.`,
    );
    return demande;
  });
}
