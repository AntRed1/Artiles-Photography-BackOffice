import api from "./api";
import type { LogsResponse, ActuatorResponse } from "../types/logs";

interface LogFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  method?: string;
  uri?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
}

export const fetchLogs = async (
  params: LogFilterParams
): Promise<LogsResponse> => {
  const filteredParams: Record<string, string | number | boolean> = Object.entries(params)
    .reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string | number | boolean>);

  return api<LogsResponse>("/admin/logs/filter", "GET", undefined, filteredParams);
};

export const deleteLogsBefore = async (
  date: string
): Promise<{ message: string }> => {
  return api<{ message: string }>("/admin/logs/before", "DELETE", undefined, {
    date,
  });
};

export const fetchActuatorData = async (): Promise<ActuatorResponse> => {
  return api<ActuatorResponse>("/admin/actuator", "GET");
};