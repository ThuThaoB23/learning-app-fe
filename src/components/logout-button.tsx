"use client";

import { useRouter } from "next/navigation";

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export default function LogoutButton({
  className,
  label = "Đăng xuất",
}: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tokenType");
    document.cookie = "accessToken=; path=/; max-age=0; samesite=lax";
    document.cookie = "tokenType=; path=/; max-age=0; samesite=lax";
    router.replace("/login");
    router.refresh();
  };

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {label}
    </button>
  );
}
