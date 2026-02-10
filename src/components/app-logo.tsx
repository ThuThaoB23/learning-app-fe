import Image from "next/image";

type AppLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export default function AppLogo({
  size = 44,
  className,
  priority = false,
}: AppLogoProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/10 ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src="/logo-v2.png"
        alt="Learning App logo"
        fill
        sizes={`${size}px`}
        priority={priority}
        className="object-contain"
      />
    </div>
  );
}
