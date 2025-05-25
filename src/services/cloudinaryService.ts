import api from "./api";

export interface CloudinaryResource {
  public_id: string;
  created_at: string;
  secure_url?: string; // Added for image previews
}

export interface CloudinaryTrendData {
  date: string;
  storage: number; // In MB
  transformations: number;
}

export interface CloudinaryMetric {
  totalImages: number;
  storageUsageBytes: number;
  transformationCount: number;
  recentUploads: CloudinaryResource[];
  trendData: CloudinaryTrendData[]; // New field for historical data
}

export const fetchCloudinaryMetrics = async (): Promise<CloudinaryMetric> => {
  const response = await api<CloudinaryMetric>("/cloudinary-metrics", "GET");
  return response;
};
