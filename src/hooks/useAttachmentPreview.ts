import { useMemo } from "react";
import { Attachment } from "@/types/chat.types";

export type AttachmentType =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "archive"
  | "unknown";

export function getAttachmentType(mimeType: string): AttachmentType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("word") ||
    mimeType.includes("text") ||
    mimeType.includes("sheet")
  ) {
    return "document";
  }
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("7z") ||
    mimeType.includes("tar") ||
    mimeType.includes("gzip")
  ) {
    return "archive";
  }
  return "unknown";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toUpperCase() || "FILE";
}

export function useAttachmentPreview(attachment: Attachment | undefined) {
  return useMemo(() => {
    if (!attachment) {
      return {
        type: "unknown" as AttachmentType,
        icon: "📎",
        isPreviewable: false,
        isImage: false,
        isAudio: false,
        isVideo: false,
      };
    }

    const type = getAttachmentType(attachment.mimeType);
    const isImage = type === "image";
    const isAudio = type === "audio";
    const isVideo = type === "video";
    const isPreviewable = isImage || isAudio || isVideo;

    let icon = "📎";
    switch (type) {
      case "image":
        icon = "🖼️";
        break;
      case "video":
        icon = "🎥";
        break;
      case "audio":
        icon = "🎵";
        break;
      case "document":
        icon = "📄";
        break;
      case "archive":
        icon = "📦";
        break;
    }

    return {
      type,
      icon,
      isPreviewable,
      isImage,
      isAudio,
      isVideo,
      fileSize: formatFileSize(attachment.size),
      fileExt: getFileExtension(attachment.fileName),
    };
  }, [attachment]);
}

export function useAttachmentPreviewUrl(attachment: Attachment | undefined) {
  return useMemo(() => {
    if (!attachment) return null;
    const type = getAttachmentType(attachment.mimeType);
    if (type === "image" || type === "video") {
      return attachment.url;
    }
    return null;
  }, [attachment]);
}
