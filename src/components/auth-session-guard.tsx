"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  clearAuthSession,
} from "@/lib/client-auth";

let isRedirectingToLogin = false;

export default function AuthSessionGuard() {
  const router = useRouter();

  useEffect(() => {
    isRedirectingToLogin = false;

    const redirectToLogin = () => {
      clearAuthSession();
      if (isRedirectingToLogin) {
        return;
      }

      isRedirectingToLogin = true;
      router.replace("/login");
      router.refresh();
    };

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await originalFetch(input, init);
      if (response.status === 401) {
        redirectToLogin();
      }
      return response;
    };

    const handleSessionExpired = () => {
      redirectToLogin();
    };

    window.addEventListener(
      AUTH_SESSION_EXPIRED_EVENT,
      handleSessionExpired,
    );

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired,
      );
      isRedirectingToLogin = false;
    };
  }, [router]);

  return null;
}
