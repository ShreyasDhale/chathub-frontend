import { ChatAction } from "@/constants/chatActions";

type Props = {
  name: ChatAction["icon"];
  size?: number;
};

/** Inline SVG icons for chat toolbars (no external icon library dependency). */
export default function ChatIcon({ name, size = 20 }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      );
    case "call":
      return (
        <svg {...common}>
          <path d="M6.5 4.5h3l1.5 4-2 1.5a11 11 0 005 5l1.5-2 4 1.5v3a2 2 0 01-2 2A15 15 0 014.5 6.5a2 2 0 012-2z" />
        </svg>
      );
    case "video":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="12" height="12" rx="2" />
          <path d="M15 10l6-3v10l-6-3" />
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 10v6M12 7h.01" />
        </svg>
      );
    case "members":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
          <path d="M16 11h6M19 8v6" />
        </svg>
      );
    case "mute":
      return (
        <svg {...common}>
          <path d="M11 5L6 9H3v6h3l5 4V5z" />
          <path d="M16 9l4 4M20 9l-4 4" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 17v4M8 3h8l-1 7 3 2H6l3-2-1-7z" />
        </svg>
      );
    case "more":
      return (
        <svg {...common}>
          <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "attach":
      return (
        <svg {...common}>
          <path d="M8 12l8.5-8.5a3 3 0 014 4L12 20a5 5 0 01-7-7l9-9" />
        </svg>
      );
    case "emoji":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "voice":
      return (
        <svg {...common}>
          <rect x="9" y="4" width="6" height="11" rx="3" />
          <path d="M6 11a6 6 0 0012 0M12 17v3" />
        </svg>
      );
    case "newChat":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    default:
      return null;
  }
}
