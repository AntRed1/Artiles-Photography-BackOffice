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
  showPrice: boolean;
  features: string[];
  publicId?: string;
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
  showPrice: boolean,
  features: string[]
): Promise<Package> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", price.toString());
  formData.append("isActive", isActive.toString());
  formData.append("showPrice", showPrice.toString());
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

export const selectCloudinaryPackageImage = async (
  title: string,
  description: string,
  price: number,
  publicId: string,
  isActive: boolean,
  showPrice: boolean,
  features: string[]
): Promise<Package> => {
  try {
    const body = {
      title,
      description,
      price,
      publicId,
      isActive,
      showPrice,
      features,
    };
    const response = await api<PhotographyPackageResponse>(
      "/packages/admin/cloudinary",
      "POST",
      body
    );
    return response;
  } catch (error: unknown) {
    console.error("Error in selectCloudinaryPackageImage:", error);
    const message =
      error instanceof ApiError && error.message.includes("validation")
        ? "Datos inválidos. Verifica los campos."
        : error instanceof ApiError
        ? error.message
        : "No se pudo seleccionar la imagen de Cloudinary";
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
    showPrice: boolean;
    features: string[];
    file?: File;
    publicId?: string | null;
  }
): Promise<Package> => {
  console.log("updatePackage called with data:", {
    id,
    hasFile: !!data.file,
    publicId: data.publicId,
    title: data.title,
  });

  const formData = new FormData();

  // Campos básicos siempre presentes
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("price", data.price.toString());
  formData.append("isActive", data.isActive.toString());
  formData.append("showPrice", data.showPrice.toString());

  // Agregar features
  data.features.forEach((feature, index) => {
    formData.append(`features[${index}]`, feature);
  });

  // Manejar imagen - prioridad: archivo > publicId > mantener actual
  if (data.file && data.file.size > 0) {
    console.log("Adding file to FormData:", data.file.name);
    formData.append("file", data.file);
  } else if (data.publicId && data.publicId.trim() !== "") {
    console.log("Adding publicId to FormData:", data.publicId);
    formData.append("publicId", data.publicId);
  } else {
    console.log("No new image provided, keeping current image");
  }

  // Debug: log FormData contents
  console.log("FormData contents:");
  for (const [key, value] of formData.entries()) {
    console.log(
      `${key}:`,
      value instanceof File ? `File: ${value.name}` : value
    );
  }

  try {
    const response = await api<PhotographyPackageResponse>(
      `/packages/admin/${id}`,
      "PUT",
      formData
    );
    console.log("Update successful:", response);
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
