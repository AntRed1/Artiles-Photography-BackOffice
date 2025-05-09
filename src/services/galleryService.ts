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

export const getCarouselImages = async (): Promise<GalleryItem[]> => {
  try {
    const response = await api<CarouselResponse[]>("/carousel");
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
    const response = await api<GalleryResponse[]>("/gallery");
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
  return uploadImage(data.type, data.file, data.title || "", data.description);
};

export const uploadImage = async (
  type: "carousel" | "gallery",
  file: File,
  title: string,
  description: string
): Promise<GalleryItem> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (type === "carousel" && title) {
      formData.append("title", title);
    }
    formData.append("description", description);
    const endpoint =
      type === "carousel"
        ? "/carousel/upload"
        : "/gallery/admin/gallery/upload";
    const response = await api<CarouselResponse | GalleryResponse>(
      endpoint,
      "POST",
      formData
    );
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
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new ApiError(
          "No autorizado: Se requiere rol de administrador",
          403
        );
      }
      if (error.status === 400) {
        throw new ApiError(error.message, 400);
      }
    }
    throw new ApiError("Error al subir imagen", 500);
  }
};

export const updateImage = async (
  id: number,
  data: { title?: string; description: string; type: "carousel" | "gallery" }
): Promise<GalleryItem> => {
  try {
    const endpoint =
      data.type === "carousel"
        ? `/carousel/${id}`
        : `/gallery/admin/gallery/${id}`;
    const response = await api<CarouselResponse | GalleryResponse>(
      endpoint,
      "PUT",
      data
    );
    if (data.type === "carousel") {
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
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new ApiError(
          "No autorizado: Se requiere rol de administrador",
          403
        );
      }
      if (error.status === 400) {
        throw new ApiError(error.message, 400);
      }
    }
    throw new ApiError("Error al actualizar imagen", 500);
  }
};

export const deleteImage = async (
  id: number,
  type: "carousel" | "gallery"
): Promise<void> => {
  try {
    const endpoint =
      type === "carousel" ? `/carousel/${id}` : `/gallery/admin/gallery/${id}`;
    await api<void>(endpoint, "DELETE");
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new ApiError(
          "No autorizado: Se requiere rol de administrador",
          403
        );
      }
      if (error.status === 400) {
        throw new ApiError(error.message, 400);
      }
    }
    throw new ApiError("Error al eliminar imagen", 500);
  }
};
