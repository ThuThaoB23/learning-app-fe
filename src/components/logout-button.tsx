"use client";

import { useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/client-auth";

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
    clearAuthSession();
    router.replace("/login");
    router.refresh();
  };

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {label}
    </button>
  );
}
