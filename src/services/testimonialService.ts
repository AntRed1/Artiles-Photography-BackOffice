import api from "./api";
import type { Testimonial } from "../types/testimonial";

interface TestimonialResponse {
  id: number;
  author: string;
  comment: string;
  rating: number;
  date: string;
}

export const getTestimonials = async (): Promise<Testimonial[]> => {
  const response = await api<TestimonialResponse[]>("/testimonials/all");
  return response;
};

export const createTestimonial = async (
  data: { author: string; comment: string; rating: number }
): Promise<Testimonial> => {
  const response = await api<TestimonialResponse>("/testimonials", "POST", data);
  return response;
};

export const updateTestimonial = async (
  id: number,
  data: { author: string; comment: string; rating: number }
): Promise<Testimonial> => {
  const response = await api<TestimonialResponse>(`/admin/testimonials/${id}`, "PUT", data);
  return response;
};

export const toggleTestimonialVisibility = async (id: number): Promise<Testimonial> => {
  const response = await api<TestimonialResponse>(`/admin/testimonials/${id}/toggle-enable`, "PATCH");
  return response;
};

export const deleteTestimonial = async (id: number): Promise<void> => {
  await api<void>(`/admin/testimonials/${id}`, "DELETE");
};