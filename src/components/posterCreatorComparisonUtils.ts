import {
  BadgeCheck,
  CalendarCheck2,
  CalendarClock,
  Clock3,
  Headset,
  MessageCircleMore,
  PhoneMissed,
  PhoneOff,
  ShieldCheck,
  TrendingUp,
  UserX,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ComparisonIconId } from "../types/platform";

export type ComparisonSide = "left" | "right";

export const comparisonIconMap: Record<ComparisonIconId, LucideIcon> = {
  "phone-missed": PhoneMissed,
  "clock-3": Clock3,
  "user-x": UserX,
  zap: Zap,
  "calendar-clock": CalendarClock,
  "calendar-check": CalendarCheck2,
  "badge-check": BadgeCheck,
  "message-circle-more": MessageCircleMore,
  headset: Headset,
  "shield-check": ShieldCheck,
  "trending-up": TrendingUp,
  "phone-off": PhoneOff,
};

export const comparisonIconOptions: Array<{
  id: ComparisonIconId;
  label: string;
}> = [
  { id: "phone-missed", label: "Phone Missed" },
  { id: "clock-3", label: "Clock" },
  { id: "user-x", label: "User X" },
  { id: "zap", label: "Zap" },
  { id: "calendar-clock", label: "Calendar Clock" },
  { id: "calendar-check", label: "Calendar Check" },
  { id: "badge-check", label: "Badge Check" },
  { id: "message-circle-more", label: "Message Circle" },
  { id: "headset", label: "Headset" },
  { id: "shield-check", label: "Shield Check" },
  { id: "trending-up", label: "Trending Up" },
  { id: "phone-off", label: "Phone Off" },
];

export const getComparisonBulletField = (side: ComparisonSide) =>
  side === "left" ? "comparisonLeftBullets" : "comparisonRightBullets";

export const colorWithAlpha = (color: string, alpha: number) => {
  if (color.startsWith("#")) {
    const value = color.replace("#", "");
    const normalized =
      value.length === 3
        ? value
            .split("")
            .map((character) => `${character}${character}`)
            .join("")
        : value;

    const red = Number.parseInt(normalized.slice(0, 2), 16);
    const green = Number.parseInt(normalized.slice(2, 4), 16);
    const blue = Number.parseInt(normalized.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  if (color.startsWith("rgba(")) {
    const values = color
      .replace("rgba(", "")
      .replace(")", "")
      .split(",")
      .slice(0, 3)
      .map((value) => value.trim());

    return `rgba(${values.join(", ")}, ${alpha})`;
  }

  if (color.startsWith("rgb(")) {
    return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  }

  return color;
};
