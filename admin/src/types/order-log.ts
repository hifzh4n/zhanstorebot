export interface OrderLog {
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: unknown;
}
