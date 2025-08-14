/* eslint-disable @typescript-eslint/no-unused-vars */
import api, { ApiError } from "./api";
import type { GalleryItem } from "../types/gallery";

interface CarouselResponse {
  id: number;
  url: string;
  title: string;
  description: string;
}

interface GalleryResponse {
  id: number;
  imageUrl: string;
  description: string;
  uploadedAt: string;
}

// Configuración centralizada de endpoints
const ENDPOINTS = {
  carousel: {
    base: "/carousel",
    upload: "/carousel/upload",
    cloudinary: "/carousel/cloudinary",
    byId: (id: number) => `/carousel/${id}`,
  },
  gallery: {
    base: "/gallery",
    upload: "/gallery/upload",
    cloudinary: "/gallery/cloudinary",
    byId: (id: number) => `/gallery/${id}`,
    uploadById: (id: number) => `/gallery/${id}/upload`,
  },
} as const;

export const getCarouselImages = async (): Promise<GalleryItem[]> => {
  try {
    const response = await api<CarouselResponse[]>(ENDPOINTS.carousel.base);
    return response.map((item) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      description: item.description,
      type: "carousel",
    }));
  } catch (error) {
    throw new ApiError("Error al obtener imágenes del carrusel", 500);
  }
};

export const getGalleryImages = async (): Promise<GalleryItem[]> => {
  try {
    const response = await api<GalleryResponse[]>(ENDPOINTS.gallery.base);
    return response.map((item) => ({
      id: item.id,
      imageUrl: item.imageUrl,
      description: item.description,
      uploadedAt: item.uploadedAt,
      type: "gallery",
    }));
  } catch (error) {
    throw new ApiError("Error al obtener imágenes de la galería", 500);
  }
};

export const createImage = async (data: {
  file: File;
  title?: string;
  description: string;
  type: "carousel" | "gallery";
}): Promise<GalleryItem> => {
  return uploadImage(data);
};

export const uploadImage = async (data: {
  type: "carousel" | "gallery";
  description: string;
  file: File;
  title?: string;
}): Promise<GalleryItem> => {
  try {
    const { type, description, file, title } = data;
    const formData = new FormData();
    formData.append("file", file);

    if (type === "carousel" && title) {
      formData.append("title", title);
    }
    formData.append("description", description);
    // Normalizar type para el backend
    const normalizedType = type === "carousel" ? "CAROUSEL" : "GALLERY";
    formData.append("type", normalizedType);

    const endpoint =
      type === "carousel"
        ? ENDPOINTS.carousel.upload
        : ENDPOINTS.gallery.upload;

    const response = await api<CarouselResponse | GalleryResponse>(
      endpoint,
      "POST",
      formData
    );

    return mapResponseToGalleryItem(response, type);
  } catch (error) {
    throw handleApiError(error, "Error al subir imagen");
  }
};

export const selectCloudinaryImage = async (data: {
  type: "carousel" | "gallery";
  description: string;
  publicId: string;
  imageUrl: string;
  title?: string;
}): Promise<GalleryItem> => {
  try {
    const { type, description, publicId, imageUrl, title } = data;
    // Normalizar type para el backend
    const normalizedType = type === "carousel" ? "CAROUSEL" : "GALLERY";

    const body = {
      publicId,
      imageUrl,
      description,
      title,
      type: normalizedType,
    };

    const endpoint =
      type === "carousel"
        ? ENDPOINTS.carousel.cloudinary
        : ENDPOINTS.gallery.cloudinary;

    const response = await api<CarouselResponse | GalleryResponse>(
      endpoint,
      "POST",
      body
    );

    return mapResponseToGalleryItem(response, type);
  } catch (error) {
    throw handleApiError(error, "Error al seleccionar imagen de Cloudinary");
  }
};

export const updateImage = async (
  id: number,
  data: {
    file?: File | null;
    title?: string;
    description: string;
    type: "carousel" | "gallery";
    publicId?: string;
    imageUrl?: string;
  }
): Promise<GalleryItem> => {
  try {
    const endpoint =
      data.type === "carousel"
        ? ENDPOINTS.carousel.byId(id)
        : ENDPOINTS.gallery.byId(id);

    let response: CarouselResponse | GalleryResponse;

    if (data.file) {
      // Actualización con archivo
      const formData = new FormData();
      formData.append("file", data.file);
      if (data.title) formData.append("title", data.title);
      formData.append("description", data.description);
      // Normalizar type para el backend
      const normalizedType = data.type === "carousel" ? "CAROUSEL" : "GALLERY";
      formData.append("type", normalizedType);

      // Para gallery, usar endpoint específico para uploads
      const uploadEndpoint =
        data.type === "gallery" ? ENDPOINTS.gallery.uploadById(id) : endpoint;

      response = await api<CarouselResponse | GalleryResponse>(
        uploadEndpoint,
        "PUT",
        formData
      );
    } else {
      // Actualización de metadatos o Cloudinary
      const normalizedType = data.type === "carousel" ? "CAROUSEL" : "GALLERY";
      const updateData: Record<string, string | undefined> = {
        title: data.title,
        description: data.description,
        type: normalizedType,
      };

      if (data.publicId && data.imageUrl) {
        updateData.publicId = data.publicId;
        updateData.imageUrl = data.imageUrl;
      } else if (data.publicId) {
        updateData.publicId = data.publicId;
      }

      response = await api<CarouselResponse | GalleryResponse>(
        endpoint,
        "PUT",
        updateData
      );
    }

    return mapResponseToGalleryItem(response, data.type);
  } catch (error) {
    throw handleApiError(error, "Error al actualizar imagen");
  }
};

export const deleteImage = async (
  id: number,
  type: "carousel" | "gallery"
): Promise<void> => {
  try {
    const endpoint =
      type === "carousel"
        ? ENDPOINTS.carousel.byId(id)
        : ENDPOINTS.gallery.byId(id);

    await api<void>(endpoint, "DELETE");
  } catch (error) {
    throw handleApiError(error, "Error al eliminar imagen");
  }
};

// Funciones utilitarias para reducir duplicación de código
const mapResponseToGalleryItem = (
  response: CarouselResponse | GalleryResponse,
  type: "carousel" | "gallery"
): GalleryItem => {
  if (type === "carousel") {
    const carouselResponse = response as CarouselResponse;
    return {
      id: carouselResponse.id,
      url: carouselResponse.url,
      title: carouselResponse.title,
      description: carouselResponse.description,
      type: "carousel",
    };
  } else {
    const galleryResponse = response as GalleryResponse;
    return {
      id: galleryResponse.id,
      imageUrl: galleryResponse.imageUrl,
      description: galleryResponse.description,
      uploadedAt: galleryResponse.uploadedAt,
      type: "gallery",
    };
  }
};

const handleApiError = (error: unknown, defaultMessage: string): ApiError => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 403:
        return new ApiError(
          "No autorizado: Se requiere rol de administrador",
          403
        );
      case 400:
        return new ApiError(error.message, 400);
      case 404:
        return new ApiError("Recurso no encontrado", 404);
      default:
        return error;
    }
  }
  return new ApiError(defaultMessage, 500);
};
