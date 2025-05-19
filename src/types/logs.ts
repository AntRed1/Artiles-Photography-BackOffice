/* eslint-disable @typescript-eslint/no-explicit-any */
export interface HttpLog {
  id: number;
  method: string;
  uri: string;
  queryString?: string;
  requestBody?: string;
  status: number;
  contentType?: string;
  responseBody?: string;
  timestamp: string;
}

export interface LogsResponse {
  logs: HttpLog[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ActuatorResponse {
  health: {
    status: string;
    components?: Record<string, { status: string; details?: any }>;
  };
  info: Record<string, any>;
  metrics: {
    names: string[];
  };
}
