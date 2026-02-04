import type { Metadata } from "next";
import AuthCard from "../_components/auth-card";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập để tiếp tục lộ trình học từ vựng.",
};

export default function LoginPage() {
  return <AuthCard mode="login" />;
}
