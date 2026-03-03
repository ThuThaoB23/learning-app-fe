export const AUTH_SESSION_EXPIRED_EVENT = "learning-app:auth-session-expired";

export const getCookieValue = (name: string) => {
  if (typeof document === "undefined") {
    return null;
  }
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  return value ? decodeURIComponent(value) : null;
};

export const getAuthHeader = () => {
  const accessToken =
    getCookieValue("accessToken") ??
    (typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : null);
  const tokenType =
    getCookieValue("tokenType") ??
    (typeof window !== "undefined"
      ? window.localStorage.getItem("tokenType")
      : null) ??
    "Bearer";

  if (!accessToken) {
    return null;
  }

  return `${tokenType} ${accessToken}`;
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("tokenType");
  document.cookie = "accessToken=; path=/; max-age=0; samesite=lax";
  document.cookie = "tokenType=; path=/; max-age=0; samesite=lax";
};

export const notifyAuthSessionExpired = () => {
  if (typeof window === "undefined") {
    return;
  }

  clearAuthSession();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
};
