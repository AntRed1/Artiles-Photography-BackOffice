import api from "./api";

export interface PlausibleStats {
  visitors: number;
  pageviews: number;
  bounce_rate: number;
  visit_duration: number;
}

export interface PlausibleTimeseries {
  date: string;
  visitors: number;
  pageviews: number;
}

export interface PlausibleBreakdown {
  page: string;
  visitors: number;
  pageviews: number;
  bounce_rate: number;
  time_on_page: number;
  scroll_depth: number;
}

export interface PlausibleEvent {
  name: string;
  count: number;
}

export interface BrowserVersion {
  name: string;
  version: string;
  visitors: number;
}

export interface City {
  name: string;
  visitors: number;
}

export interface SourceData {
  name: string;
  visitors: number;
}

export interface DeviceData {
  name: string;
  visitors: number;
}

export const fetchStats = async (period: string): Promise<PlausibleStats> => {
  try {
    const data = await api<{
      results: {
        visitors?: { value: number };
        pageviews?: { value: number };
        bounce_rate?: { value: number };
        visit_duration?: { value: number };
      };
    }>(`/analytics/stats?period=${period}`, "GET");

    return {
      visitors: data.results.visitors?.value ?? 0,
      pageviews: data.results.pageviews?.value ?? 0,
      bounce_rate: data.results.bounce_rate?.value ?? 0,
      visit_duration: data.results.visit_duration?.value ?? 0,
    };
  } catch (error) {
    console.error("Error en fetchStats:", error);
    throw error;
  }
};

export const fetchVisitors = async (
  period: string
): Promise<PlausibleTimeseries[]> => {
  try {
    const data = await api<PlausibleTimeseries[]>(
      `/analytics/timeseries?period=${period}`,
      "GET"
    );
    return data;
  } catch (error) {
    console.error("Error en fetchVisitors:", error);
    throw error;
  }
};

export const fetchRecentActivity = async (
  period: string
): Promise<string[]> => {
  try {
    const data = await api<{ results: PlausibleBreakdown[] }>(
      `/analytics/recent-activity?period=${period}`,
      "GET"
    );
    return data.results.map((item) => `Visita a ${item.page}`);
  } catch (error) {
    console.error("Error en fetchRecentActivity:", error);
    throw error;
  }
};

export const fetchBreakdown = async (
  period: string
): Promise<{ results: PlausibleBreakdown[] }> => {
  try {
    const data = await api<{ results: PlausibleBreakdown[] }>(
      `/analytics/recent-activity?period=${period}`,
      "GET"
    );
    return data;
  } catch (error) {
    console.error("Error en fetchBreakdown:", error);
    throw error;
  }
};

export const fetchEvents = async (
  period: string
): Promise<PlausibleEvent[]> => {
  try {
    const data = await api<{ results: { name: string; visitors: number }[] }>(
      `/analytics/events?period=${period}`,
      "GET"
    );
    return data.results.map((item) => ({
      name: item.name,
      count: item.visitors,
    }));
  } catch (error) {
    console.error("Error en fetchEvents:", error);
    throw error;
  }
};

export const fetchBrowsers = async (
  period: string
): Promise<BrowserVersion[]> => {
  try {
    const data = await api<{
      results: { browser: string; version: string; visitors: number }[];
    }>(`/analytics/browsers?period=${period}`, "GET");
    return data.results.map((item) => ({
      name: item.browser,
      version: item.version,
      visitors: item.visitors,
    }));
  } catch (error) {
    console.error("Error en fetchBrowsers:", error);
    throw error;
  }
};

export const fetchCities = async (period: string): Promise<City[]> => {
  try {
    const data = await api<{ results: { city: string; visitors: number }[] }>(
      `/analytics/cities?period=${period}`,
      "GET"
    );
    return data.results.map((item) => ({
      name: item.city,
      visitors: item.visitors,
    }));
  } catch (error) {
    console.error("Error en fetchCities:", error);
    throw error;
  }
};

export const fetchSources = async (period: string): Promise<SourceData[]> => {
  try {
    const data = await api<{ results: { source: string; visitors: number }[] }>(
      `/analytics/sources?period=${period}`,
      "GET"
    );
    return data.results.map((item) => ({
      name: item.source,
      visitors: item.visitors,
    }));
  } catch (error) {
    console.error("Error en fetchSources:", error);
    throw error;
  }
};

export const fetchDevices = async (period: string): Promise<DeviceData[]> => {
  try {
    const data = await api<{ results: { device: string; visitors: number }[] }>(
      `/analytics/devices?period=${period}`,
      "GET"
    );
    return data.results.map((item) => ({
      name: item.device,
      visitors: item.visitors,
    }));
  } catch (error) {
    console.error("Error en fetchDevices:", error);
    throw error;
  }
};

export const trackEvent = async (
  name: string,
  props?: Record<string, string>,
  url: string = window.location.href,
  userAgent: string = navigator.userAgent,
  ipAddress: string = "unknown"
): Promise<void> => {
  try {
    await api("/analytics/track-event", "POST", {
      name,
      url,
      userAgent,
      ipAddress,
      props: JSON.stringify(props || {}),
    });
    console.log(`Evento enviado: ${name}`, props);
  } catch (error) {
    console.error("Error al enviar evento:", error);
    throw error;
  }
};
