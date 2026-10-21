export type AuditLogType = 'SYSTEM' | 'MANAGEMENT';

export interface AuditLog {
  id: string;
  action: string;
  email?: string;
  username?: string;
  details?: string;
  timestamp: string;
  module?: AuditLogType;
  category?: AuditLogType;
  domain?: string;
  logType?: string;
  status?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogParams {
  page: number;
  size: number;
  sort?: string;
  action?: string;
  email?: string;
  category?: AuditLogType;
  module?: AuditLogType;
  keyword?: string;
  status?: string;
  from?: string;
  to?: string;
}
