import { useTheme } from "../context/ThemeContext";

interface BrandLogoProps {
  className?: string;
  alt?: string;
  priority?: "platform" | "poster";
}

const logoSources = {
  light: {
    platform: "/branding/platform-logo.png",
    poster: "/branding/poster-logo.png",
  },
  dark: {
    platform: "/branding/poster-logo.png",
    poster: "/branding/platform-logo.png",
  },
} as const;

export default function BrandLogo({
  className = "h-10 w-auto",
  alt = "SynoSys logo",
  priority = "platform",
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();

  return (
    <img
      src={logoSources[resolvedTheme][priority]}
      alt={alt}
      className={className}
    />
  );
}
