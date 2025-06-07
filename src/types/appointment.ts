export interface Appointment {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientEmail: string;
  googleEventId?: string;
  location?: string;
  description?: string;
  reminderSent: boolean;
}