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
