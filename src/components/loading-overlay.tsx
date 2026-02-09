"use client";

type LoadingOverlayProps = {
  show: boolean;
  className?: string;
};

export default function LoadingOverlay({
  show,
  className,
}: LoadingOverlayProps) {
  if (!show) {
    return null;
  }

  return (
    <div
      className={`absolute inset-0 z-[140] flex items-center justify-center bg-black/50 backdrop-blur-sm ${className ?? ""}`}
    >
      <span className="loader" aria-label="Loading" />
    </div>
  );
}
