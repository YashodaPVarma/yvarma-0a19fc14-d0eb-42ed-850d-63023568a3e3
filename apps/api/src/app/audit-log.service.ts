// apps/api/src/app/audit-log.service.ts
import { Injectable } from '@nestjs/common';
import { AuditEvent } from '../../../../libs/data/src/lib/audit-event.type';

/** Simple in-memory audit log service used across the application. */
@Injectable()
export class AuditLogService {
  /** Stores recent audit events (max 100). */
  private readonly events: AuditEvent[] = [];

  /** Record a new audit event. */
  log(event: AuditEvent) {
    this.events.push(event);

    // Maintain a fixed-size log buffer.
    if (this.events.length > 100) {
      this.events.shift();
    }

    // Console output for visibility during development.
    console.log(
      `[AUDIT] ${event.timestamp} | ${event.actorEmail} (${event.actorRole}, org ${event.actorOrgId}) -> ${event.action}`,
      event.details ?? '',
    );
  }

  /** Return all events with newest first. */
  getAll() {
    return [...this.events].reverse();
  }
}
