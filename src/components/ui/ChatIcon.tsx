import { ChatActionIcon } from "@/constants/chatActions";

type Props = {
  name: ChatActionIcon | "phone-down" | "phone-up" | "send" | "mic-off" | "video-off" | "expand" | "compress" | "user" | "back" | "close" | "check" | "chevron-down";
  size?: number;
};

/**
 * Inline SVG icons for the entire chat UI (no external icon library dependency).
 * All icons share consistent stroke and viewBox conventions.
 */
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
        <svg {...common} aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      );
    case "call":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M5 4.5h3.5l1.6 4-2 1.5a11 11 0 005 5l1.5-2 4 1.6V17a2 2 0 01-2 2A14 14 0 013 6.5a2 2 0 012-2z" />
        </svg>
      );
    case "video":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="6" width="13" height="12" rx="2" />
          <path d="M16 10l5-2.5v9L16 14z" />
        </svg>
      );
    case "info":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
      );
    case "members":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
          <circle cx="17" cy="9" r="2.2" />
          <path d="M14.5 19c0-2 1.5-3.6 4-3.6s2.5.3 2.5.3" />
        </svg>
      );
    case "mute":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M11 5L6 9H3v6h3l5 4V5z" />
          <path d="M16 9l5 5M21 9l-5 5" />
        </svg>
      );
    case "unmute":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M11 5L6 9H3v6h3l5 4V5z" />
          <path d="M16 8a5 5 0 010 8M19 5a8 8 0 010 14" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 17v4" />
          <path d="M9 3h6l-1 7 3 2H6l3-2-1-7z" />
        </svg>
      );
    case "more":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "attach":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M21.5 12.5l-8 8a5.5 5.5 0 01-7.8-7.8l9-9a3.5 3.5 0 014.95 4.95l-9 9a1.5 1.5 0 01-2.12-2.12L16.5 8" />
        </svg>
      );
    case "emoji":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "voice":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M6 11a6 6 0 0012 0M12 17v3M9 20h6" />
        </svg>
      );
    case "newChat":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M5 12h14M12 5v14" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.6 1.6 0 00.32 1.76l.06.06a2 2 0 11-2.84 2.84l-.06-.06A1.6 1.6 0 0015 19.4a1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.76.32l-.06.06a2 2 0 01-2.84-2.84l.06-.06A1.6 1.6 0 004.6 15a1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.32-1.76l-.06-.06a2 2 0 112.84-2.84l.06.06A1.6 1.6 0 009 4.6a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.76-.32l.06-.06a2 2 0 112.84 2.84l-.06.06A1.6 1.6 0 0019.4 9c.1.4.4.83 1 1H21a2 2 0 110 4h-.1c-.6.17-.9.6-1 1z" />
        </svg>
      );
    case "archive":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="4" width="18" height="4" rx="1" />
          <path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8" />
          <path d="M10 12h4" />
        </svg>
      );
    case "leave":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <path d="M16 17l5-5-5-5M21 12H9" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      );
    case "phone-down":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" transform="rotate(135 12 12)" />
        </svg>
      );
    case "phone-up":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
      );
    case "send":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M22 2L11 13" />
          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      );
    case "mic-off":
      return (
        <svg {...common} aria-hidden="true">
          <line x1="2" y1="2" x2="22" y2="22" />
          <path d="M19 11a7 7 0 01-1.4 4.2M9 9v3a3 3 0 005.12 2.12L9 9z" />
          <path d="M14.7 12.5A3 3 0 0015 11V5a3 3 0 00-6 0M12 19v3M8 23h8" />
        </svg>
      );
    case "video-off":
      return (
        <svg {...common} aria-hidden="true">
          <line x1="2" y1="2" x2="22" y2="22" />
          <path d="M16 16H5a2 2 0 01-2-2V8a2 2 0 012-2h2" />
          <path d="M21 8l-5 3v2" />
        </svg>
      );
    case "expand":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      );
    case "compress":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
        </svg>
      );
    case "user":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
        </svg>
      );
    case "back":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      );
    case "close":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M5 12l5 5L20 7" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
    default:
      return null;
  }
}
