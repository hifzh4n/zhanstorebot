export interface AdminLog {
  logId: string;
  action: string;
  adminId: string;
  adminEmail: string;
  message: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
  createdAt: unknown;
}
