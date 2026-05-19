export interface AuditLog {
  id: string;
  action: string;
  username: string;
  details: string;
  timestamp?: string;
}
