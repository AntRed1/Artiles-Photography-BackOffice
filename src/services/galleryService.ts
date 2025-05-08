import api from "./api";
import type { GalleryItem } from "../types/gallery";

interface GalleryResponse {
  id: number;
  url: string;
  title: string;
  order: number;
}

export const getCarouselImages = async (): Promise<GalleryItem[]> => {
  const response = await api<GalleryResponse[]>("/carousel");
  return response;
};

export const getGalleryImages = async (): Promise<GalleryItem[]> => {
  const response = await api<GalleryResponse[]>("/gallery");
  return response;
};

export const uploadImage = async (
  type: "carousel" | "gallery",
  file: File,
  title: string,
  order: number
): Promise<GalleryItem> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("order", order.toString());
  const endpoint =
    type === "carousel" ? "/carousel/upload" : "/admin/gallery/upload";
  const response = await api<GalleryResponse>(endpoint, "POST", formData);
  return response;
};

export const updateImage = async (
  type: "carousel" | "gallery",
  id: number,
  data: { title: string; order: number }
): Promise<GalleryItem> => {
  const endpoint =
    type === "carousel" ? `/carousel/${id}` : `/admin/gallery/${id}`;
  const response = await api<GalleryResponse>(endpoint, "PUT", data);
  return response;
};

export const deleteImage = async (
  type: "carousel" | "gallery",
  id: number
): Promise<void> => {
  const endpoint =
    type === "carousel" ? `/carousel/${id}` : `/admin/gallery/${id}`;
  await api<void>(endpoint, "DELETE");
};
