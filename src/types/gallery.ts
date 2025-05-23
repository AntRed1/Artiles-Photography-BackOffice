export interface GalleryItem {
  id: number;
  url?: string; // Para carrusel
  imageUrl?: string; // Para galería
  title?: string; // Para carrusel
  description: string;
  uploadedAt?: string; // Para galería
  type: "carousel" | "gallery"; // Añadido para distinguir el tipo de imagen
}