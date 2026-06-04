"use client";

import { useRef } from "react";
import { Paperclip, Loader } from "lucide-react";
import { AttachmentResponse } from "@/services/api/attachments.api";
import { useFileUpload } from "@/hooks/useFileUpload";

interface AttachmentPickerProps {
  conversationId: number;
  onAttachmentSelected?: (attachment: AttachmentResponse) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function AttachmentPicker({
  conversationId,
  onAttachmentSelected,
  onError,
  disabled = false,
}: AttachmentPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoading, progress, error, upload } = useFileUpload();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const attachment = await upload(file, conversationId);
      onAttachmentSelected?.(attachment);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to upload file";
      onError?.(errorMsg);
    }
  };

  const handleClick = () => {
    if (!disabled && !isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        title={isLoading ? `Uploading... ${Math.round(progress)}%` : "Attach file"}
        className={`p-2 rounded-lg transition-colors ${
          disabled || isLoading
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        {isLoading ? (
          <Loader className="w-5 h-5 animate-spin text-blue-500" />
        ) : (
          <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        disabled={disabled || isLoading}
        className="hidden"
        accept="*/*"
      />

      {error && (
        <div className="absolute bottom-full mb-2 bg-red-500 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
          {error}
        </div>
      )}

      {isLoading && progress > 0 && (
        <div className="absolute bottom-full mb-2 bg-blue-500 text-white text-xs py-1 px-2 rounded">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}
