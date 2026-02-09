"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type RefreshButtonProps = {
  className?: string;
  label?: string;
};

export default function RefreshButton({
  className,
  label = "Làm mới",
}: RefreshButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => {
          router.refresh();
        });
      }}
      disabled={isPending}
      className={className}
    >
      {isPending ? "Đang làm mới..." : label}
    </button>
  );
}
