/* eslint-disable @typescript-eslint/no-unused-vars */
import api, { ApiError } from "./api";
import type { Package } from "../types/package";

interface PhotographyPackageResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
  features: string[];
}

export const getPackages = async (): Promise<Package[]> => {
  try {
    const response = await api<PhotographyPackageResponse[]>("/packages");
    return response;
  } catch (_error) {
    throw new Error("No se pudieron cargar los paquetes");
  }
};

export const createPackage = async (
  title: string,
  description: string,
  price: number,
  file: File,
  isActive: boolean,
  features: string[]
): Promise<Package> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", price.toString());
  formData.append("isActive", isActive.toString());
  features.forEach((feature, index) => {
    formData.append(`features[${index}]`, feature);
  });
  try {
    const response = await api<PhotographyPackageResponse>(
      "/packages/admin/upload",
      "POST",
      formData
    );
    return response;
  } catch (error: unknown) {
    console.error("Error in createPackage:", error);
    const message =
      error instanceof ApiError && error.message.includes("validation")
        ? "Datos inválidos. Verifica los campos."
        : error instanceof ApiError
        ? error.message
        : "No se pudo crear el paquete";
    throw new Error(message);
  }
};

export const updatePackage = async (
  id: number,
  data: {
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    isActive: boolean;
    features: string[];
    file?: File;
  }
): Promise<Package> => {
  const formData = new FormData();
  if (data.file) {
    formData.append("file", data.file);
  }
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("price", data.price.toString());
  formData.append("imageUrl", data.imageUrl);
  formData.append("isActive", data.isActive.toString());
  data.features.forEach((feature, index) => {
    formData.append(`features[${index}]`, feature);
  });
  try {
    const response = await api<PhotographyPackageResponse>(
      `/packages/admin/${id}`,
      "PUT",
      formData
    );
    return response;
  } catch (error: unknown) {
    console.error("Error in updatePackage:", {
      error,
      status: error instanceof ApiError ? error.status : "unknown",
      message: error instanceof ApiError ? error.message : "Unknown error",
    });
    const message =
      error instanceof ApiError && error.message.includes("validation")
        ? "Datos inválidos. Verifica los campos."
        : error instanceof ApiError
        ? error.message
        : "No se pudo actualizar el paquete";
    throw new Error(message);
  }
};

export const deletePackage = async (id: number): Promise<void> => {
  try {
    await api<void>(`/packages/admin/${id}`, "DELETE");
  } catch (_error) {
    throw new Error("No se pudo eliminar el paquete");
  }
};
