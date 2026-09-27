import type {
  AccessAction,
  GlobalRole,
  MilestoneKey,
  MilestoneStatus,
  ParticipationStatus,
  ProjectRoleType,
  ProjectStatus,
  RequestStatus,
  VerificationLevel,
} from "@prisma/client";

export const GLOBAL_ROLE_LABELS: Record<GlobalRole, string> = {
  ESTRUCTURADOR: "Estructurador",
  INVERSOR: "Inversor",
  ENTIDAD_FINANCIERA: "Entidad financiera",
  CONSTRUCTORA: "Constructora",
  NOTARIA: "Notaría",
  PROPIETARIO_SUELO: "Propietario del suelo",
  TECNICO: "Técnico",
};

export const PROJECT_ROLE_LABELS: Record<ProjectRoleType, string> = {
  INVERSOR: "Inversor",
  ENTIDAD_FINANCIERA: "Entidad financiera",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  PAUSED: "Pausado",
  CLOSED: "Cerrado",
  ARCHIVED: "Archivado",
};

export const MILESTONE_KEY_LABELS: Record<MilestoneKey, string> = {
  VIABILIDAD: "Viabilidad",
  EQUITY: "Captación de equity",
  FINANCIACION: "Financiación",
};

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  PENDING: "Pendiente",
  ACTIVE: "En curso",
  CLOSED: "Cerrado",
};

export const PARTICIPATION_STATUS_LABELS: Record<ParticipationStatus, string> = {
  INVITED: "Invitado · NDA pendiente",
  ACTIVE: "Activo",
  WITHDRAWN: "Retirado",
  REMOVED: "Eliminado",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  WITHDRAWN: "Retirada",
};

export const VERIFICATION_LABELS: Record<VerificationLevel, string> = {
  UNVERIFIED: "Sin verificar",
  VERIFIED: "Identidad verificada",
  VERIFIED_FINANCIAL: "Identidad y solvencia verificadas",
};

export const ACCESS_ACTION_LABELS: Record<AccessAction, string> = {
  PARTICIPATION_INVITED: "Invitación enviada",
  NDA_ACCEPTED: "NDA aceptado",
  LEVEL_REQUESTED: "Nivel solicitado",
  LEVEL_APPROVED: "Nivel aprobado",
  LEVEL_REJECTED: "Solicitud rechazada",
  PARTICIPATION_WITHDRAWN: "Participación retirada",
  MILESTONE_CLOSED: "Hito cerrado",
};

export const ACCESS_ACTION_ICONS: Record<AccessAction, string> = {
  PARTICIPATION_INVITED: "mail",
  NDA_ACCEPTED: "draw",
  LEVEL_REQUESTED: "vpn_key",
  LEVEL_APPROVED: "lock_open",
  LEVEL_REJECTED: "cancel",
  PARTICIPATION_WITHDRAWN: "undo",
  MILESTONE_CLOSED: "flag",
};

export function projectCode(projectId: string): string {
  return `UMB-${projectId.slice(-6).toUpperCase()}`;
}
