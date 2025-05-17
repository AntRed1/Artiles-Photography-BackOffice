import api from "./api";
import type { Testimonial } from "../types/testimonial";

interface TestimonialResponse {
  id: number;
  name: string;
  message: string;
  rating: number;
  createdAt: string;
  device: string;
  ipAddress: string;
  location: string;
  enable: boolean;
}

export const getTestimonials = async (): Promise<Testimonial[]> => {
  const response = await api<TestimonialResponse[]>("/testimonials/all");
  return response.map((res) => ({
    id: res.id,
    name: res.name,
    message: res.message,
    rating: res.rating,
    createdAt: res.createdAt,
    enable: res.enable,
  }));
};

export const createTestimonial = async (data: {
  name: string;
  message: string;
  rating: number;
}): Promise<Testimonial> => {
  const response = await api<TestimonialResponse>(
    "/testimonials",
    "POST",
    data
  );
  return {
    id: response.id,
    name: response.name,
    message: response.message,
    rating: response.rating,
    createdAt: response.createdAt,
    enable: response.enable,
  };
};

export const updateTestimonial = async (
  id: number,
  data: { name: string; message: string; rating: number }
): Promise<Testimonial> => {
  const response = await api<TestimonialResponse>(
    `/testimonials/${id}`,
    "PUT",
    data
  );
  return {
    id: response.id,
    name: response.name,
    message: response.message,
    rating: response.rating,
    createdAt: response.createdAt,
    enable: response.enable,
  };
};

export const toggleTestimonialVisibility = async (
  id: number
): Promise<Testimonial> => {
  const response = await api<TestimonialResponse>(
    `/testimonials/${id}/toggle-enable`,
    "PATCH"
  );
  return {
    id: response.id,
    name: response.name,
    message: response.message,
    rating: response.rating,
    createdAt: response.createdAt,
    enable: response.enable,
  };
};

export const deleteTestimonial = async (
  id: number
): Promise<{ message: string }> => {
  return await api<{ message: string }>(`/testimonials/${id}`, "DELETE");
};
