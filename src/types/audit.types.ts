export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  user: {
    name: string;
    email: string;
  };
  ipAddress: string;
  details: string;
}
