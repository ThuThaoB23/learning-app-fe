import type { Metadata } from "next";
import AuthCard from "../_components/auth-card";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản mới để bắt đầu hành trình học từ vựng.",
};

export default function RegisterPage() {
  return <AuthCard mode="register" />;
}
