"use client";

import { useState } from "react";
import { Download, X } from "lucide-react";
import { Attachment } from "@/types/chat.types";
import {
  useAttachmentPreview,
  useAttachmentPreviewUrl,
} from "@/hooks/useAttachmentPreview";
import { downloadAttachment } from "@/services/api/attachments.api";
import { VoiceNotePlayer } from "./VoiceNotePlayer";

interface AttachmentPreviewProps {
  attachment: Attachment;
  isOwn?: boolean;
  onRemove?: () => void;
  showDownload?: boolean;
}

export function AttachmentPreview({
  attachment,
  isOwn = false,
  onRemove,
  showDownload = true,
}: AttachmentPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const preview = useAttachmentPreview(attachment);
  const previewUrl = useAttachmentPreviewUrl(attachment);

  const handleDownload = () => {
    downloadAttachment(attachment.attachmentId, attachment.fileName);
  };

  // Voice notes use dedicated player
  if (preview.isAudio) {
    return <VoiceNotePlayer attachment={attachment} isOwn={isOwn} />;
  }

  // Image preview
  if (preview.isImage) {
    return (
      <div className="flex flex-col gap-2">
        <div className="relative group">
          <img
            src={previewUrl || attachment.url}
            alt={attachment.fileName}
            onClick={() => setIsExpanded(true)}
            className="max-w-sm max-h-96 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 rounded-lg bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
        </div>

        {/* Image info bar */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span className="truncate">{attachment.fileName}</span>
          <div className="flex gap-2">
            {showDownload && (
              <button
                onClick={handleDownload}
                title="Download"
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                title="Remove"
                className="p-1 hover:bg-red-200 dark:hover:bg-red-900 rounded"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded view modal */}
        {isExpanded && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={() => setIsExpanded(false)}
          >
            <img
              src={previewUrl || attachment.url}
              alt={attachment.fileName}
              className="max-w-full max-h-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    );
  }

  // Video preview
  if (preview.isVideo) {
    return (
      <div className="flex flex-col gap-2">
        <video
          src={previewUrl || attachment.url}
          controls
          className="max-w-sm max-h-96 rounded-lg bg-black"
        />
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span className="truncate">{attachment.fileName}</span>
          <div className="flex gap-2">
            {showDownload && (
              <button
                onClick={handleDownload}
                title="Download"
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                title="Remove"
                className="p-1 hover:bg-red-200 dark:hover:bg-red-900 rounded"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Document/generic file preview
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isOwn
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="text-2xl flex-shrink-0">{preview.icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
          {attachment.fileName}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {preview.fileSize}
        </p>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        {showDownload && (
          <button
            onClick={handleDownload}
            title="Download"
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            title="Remove"
            className="p-2 hover:bg-red-200 dark:hover:bg-red-900 rounded transition-colors"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
}
