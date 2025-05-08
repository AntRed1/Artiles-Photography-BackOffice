import api from "./api";
import type { Package } from "../types/package";

interface PhotographyPackageResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

export const getPackages = async (): Promise<Package[]> => {
  const response = await api<PhotographyPackageResponse[]>("/packages");
  return response;
};

export const createPackage = async (
  title: string,
  description: string,
  price: number,
  file: File
): Promise<Package> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", price.toString());
  const response = await api<PhotographyPackageResponse>(
    "/admin/packages/upload",
    "POST",
    formData
  );
  return response;
};

export const updatePackage = async (
  id: number,
  data: { title: string; description: string; price: number }
): Promise<Package> => {
  const response = await api<PhotographyPackageResponse>(
    `/admin/packages/${id}`,
    "PUT",
    data
  );
  return response;
};

export const deletePackage = async (id: number): Promise<void> => {
  await api<void>(`/admin/packages/${id}`, "DELETE");
};
