// libs/data/src/lib/audit-event.type.ts

export type AuditEvent = {
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  actorOrgId: number;
  action: string;
  details?: any;
};
