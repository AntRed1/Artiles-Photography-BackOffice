import api from "./api";
import type { Config, ContactInfo, LegalResponse } from "../types/config";

export const getConfig = async (): Promise<Config> => {
  const response = await api<Config>("/config");
  return response;
};

export const updateConfig = async (
  id: number,
  config: Config
): Promise<Config> => {
  const response = await api<Config>(
    `/admin/config/${id}/no-file`,
    "PUT",
    config
  );
  return response;
};

export const updateConfigWithLogo = async (
  id: number,
  logoFile: File,
  config: Config
): Promise<Config> => {
  const formData = new FormData();
  formData.append("logoFile", logoFile);
  if (config.logoAltText) formData.append("logoAltText", config.logoAltText);
  if (config.heroBackgroundImage)
    formData.append("heroBackgroundImage", config.heroBackgroundImage);
  if (config.availabilityMessage)
    formData.append("availabilityMessage", config.availabilityMessage);
  if (config.responseTime) formData.append("responseTime", config.responseTime);
  formData.append(
    "notificationsEnabled",
    String(config.notificationsEnabled || false)
  );

  const response = await api<Config>(`/admin/config/${id}`, "PUT", formData);
  return response;
};

export const getContactInfo = async (): Promise<ContactInfo> => {
  const response = await api<ContactInfo>("/contact-info");
  return response;
};

export const updateContactInfo = async (
  id: number,
  contactInfo: ContactInfo
): Promise<ContactInfo> => {
  const response = await api<ContactInfo>(
    `/contact-info/admin/${id}`,
    "PUT",
    contactInfo
  );
  console.log("Respuesta de updateContactInfo:", response);
  return response;
};

export const createContactInfo = async (
  contactInfo: ContactInfo
): Promise<ContactInfo> => {
  const response = await api<ContactInfo>(
    "/contact-info/admin",
    "POST",
    contactInfo
  );
  return response;
};

export const deleteContactInfo = async (id: number): Promise<void> => {
  await api(`/contact-info/admin/${id}`, "DELETE");
};

export const getLegalByType = async (type: string): Promise<LegalResponse> => {
  const response = await api<LegalResponse>(`/legal/type/${type}`);
  return response;
};

export const updateLegal = async (
  id: number,
  legal: { type: string; content: string }
): Promise<LegalResponse> => {
  const response = await api<LegalResponse>(`/legal/admin/${id}`, "PUT", legal);
  return response;
};
