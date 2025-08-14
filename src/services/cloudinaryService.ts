import api from "./api";
import { ApiError } from "./api";

export interface CloudinaryResource {
  bytes: number;
  public_id: string;
  created_at: string;
  secure_url?: string;
}

export interface CloudinaryTrendData {
  date: string;
  storage: number;
  transformations: number;
}

export interface CloudinaryMetric {
  totalImages: number;
  storageUsageBytes: number;
  transformationCount: number;
  recentUploads: CloudinaryResource[];
  trendData: CloudinaryTrendData[];
}

export interface CloudinaryImagesResponse {
  images: CloudinaryResource[];
  nextCursor: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export const fetchCloudinaryImages = async (
  page: number = 1,
  size: number = 20,
  nextCursor?: string
): Promise<CloudinaryImagesResponse> => {
  try {
    const params: { page?: number; size: number; next_cursor?: string } = {
      size,
    };
    if (nextCursor) {
      params.next_cursor = nextCursor;
    } else {
      params.page = page;
    }
    const response = await api<CloudinaryImagesResponse>(
      "/cloudinary-metrics/images",
      "GET",
      undefined,
      params
    );
    console.log(
      `[fetchCloudinaryImages] Success: Fetched images for page ${page}, size ${size}, nextCursor: ${
        nextCursor || "none"
      }, totalCount: ${response.totalCount}`
    );
    return response;
  } catch (error: unknown) {
    console.error(
      `[fetchCloudinaryImages] Error fetching images for page ${page}, size ${size}, nextCursor: ${
        nextCursor || "none"
      }:`,
      {
        error,
        endpoint: `/cloudinary-metrics/images`,
        params: { page, size, next_cursor: nextCursor },
      }
    );
    throw new ApiError(
      `Error al obtener imágenes de Cloudinary: ${
        error instanceof Error ? error.message : "Desconocido"
      }`,
      error instanceof ApiError ? error.status : 500
    );
  }
};

export const fetchCloudinaryMetrics = async (): Promise<CloudinaryMetric> => {
  try {
    const response = await api<CloudinaryMetric>("/cloudinary-metrics", "GET");
    return response;
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 429) {
      throw new ApiError(
        "Límite de tasa de Cloudinary excedido. Intenta de nuevo más tarde.",
        429
      );
    }
    throw new ApiError(
      `Error al obtener métricas de Cloudinary: ${
        error instanceof Error ? error.message : "Desconocido"
      }`,
      error instanceof ApiError ? error.status : 500
    );
  }
};

export const deleteCloudinaryImage = async (
  publicId: string
): Promise<void> => {
  console.log(`Intentando eliminar imagen con publicId: ${publicId}`);
  try {
    await api(
      `/cloudinary-metrics/${encodeURIComponent(publicId)}`,
      "DELETE",
      undefined,
      undefined
    );
    console.log(`Imagen con publicId ${publicId} eliminada correctamente`);
  } catch (error: unknown) {
    console.error(`Error al eliminar imagen con publicId ${publicId}:`, {
      error,
      publicId,
      endpoint: `/cloudinary-metrics/${encodeURIComponent(publicId)}`,
    });
    if (error instanceof ApiError && error.status === 429) {
      throw new ApiError(
        "Límite de tasa de Cloudinary excedido. Intenta de nuevo más tarde.",
        429
      );
    }
    if (error instanceof ApiError && error.status === 401) {
      throw new ApiError(
        "Sesión expirada. Por favor, inicia sesión nuevamente.",
        401
      );
    }
    if (error instanceof ApiError && error.status === 403) {
      throw new ApiError(
        "Acceso denegado. Se requiere rol de administrador.",
        403
      );
    }
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      throw new ApiError(
        `Error de CORS o servidor no disponible para publicId ${publicId}. Verifica la configuración del servidor o la conexión de red.`,
        0
      );
    }
    throw new ApiError(
      `Error al eliminar la imagen de Cloudinary con publicId ${publicId}: ${
        error instanceof Error ? error.message : "Desconocido"
      }`,
      error instanceof ApiError ? error.status : 500
    );
  }
};
