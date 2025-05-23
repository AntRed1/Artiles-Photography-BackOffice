export interface Config {
  id: number;
  logoUrl: string;
  logoAltText?: string;
  heroBackgroundImage?: string;
  availabilityMessage?: string;
  responseTime?: string;
  notificationsEnabled?: boolean;
}

export interface ContactInfo {
  id: number;
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  addressDetails?: string;
  googleMapsUrl?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
}

export interface LegalResponse {
  id: number;
  type: string;
  content: string;
}
