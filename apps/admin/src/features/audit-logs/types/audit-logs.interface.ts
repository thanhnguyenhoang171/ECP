export type AuditLogType = 'SYSTEM' | 'MANAGEMENT';

export interface AuditLog {
  id: string;
  type: AuditLogType;
  action: string;
  username: string;
  details: string;
  target?: string; // Ví dụ: "Product #123", "Order #ORD-01"
  ipAddress?: string;
  timestamp: string;
}

export interface AuditLogStats {
  totalLogs: number;
  systemLogs: number;
  managementLogs: number;
}
