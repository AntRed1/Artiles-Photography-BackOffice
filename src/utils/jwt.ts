export interface JwtPayload {
  sub: string;
  name: string;
  roles: string[];
  [key: string]: unknown;
}

export const decodeJwt = (): JwtPayload | null => {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      return null;
    }

    const base64Url = token.split(".")[1];
    if (!base64Url) {
      return null;
    }

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export const hasAdminRole = (payload: JwtPayload | null): boolean => {
  if (!payload || !payload.roles) {
    return false;
  }
  return payload.roles.includes("ROLE_ADMIN");
};
