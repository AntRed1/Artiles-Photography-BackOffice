import api from "./api";
import type { Config } from "../types/config";

interface ConfigurationResponse {
  id: number;
  siteTitle: string;
  description: string;
  keywords: string;
  primaryColor: string;
  font: string;
  contact: {
    whatsapp: string;
    phone: string;
    email: string;
    address: string;
    latitude: string;
    longitude: string;
  };
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    tiktok: string;
  };
}

interface ContactInfoResponse {
  id: number;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  latitude: string;
  longitude: string;
}

export const getConfig = async (): Promise<Config> => {
  const response = await api<ConfigurationResponse>("/config");
  return response;
};

export const updateConfig = async (
  id: number,
  config: Config
): Promise<Config> => {
  const response = await api<ConfigurationResponse>(
    `/admin/config/${id}`,
    "PUT",
    config
  );
  return response;
};

export const getContactInfo = async (): Promise<ContactInfoResponse> => {
  const response = await api<ContactInfoResponse>("/contact-info");
  return response;
};

export const updateContactInfo = async (
  id: number,
  contactInfo: ContactInfoResponse
): Promise<ContactInfoResponse> => {
  const response = await api<ContactInfoResponse>(
    `/admin/contact-info/${id}`,
    "PUT",
    contactInfo
  );
  return response;
};
