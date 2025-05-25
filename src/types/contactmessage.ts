export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  clientIp: string | null;
  userAgent: string | null;
  createdAt: string;
}
