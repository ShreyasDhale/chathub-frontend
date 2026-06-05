"use client";

import { useRef } from "react";
import ChatIcon from "@/components/ui/ChatIcon";
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
    <div className="attachment-picker">
      <button
        type="button"
        className="chat-icon-button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        title={isLoading ? `Uploading ${Math.round(progress)}%` : "Attach file"}
        aria-label="Attach file"
      >
        {isLoading ? (
          <span className="upload-spinner" aria-hidden="true" />
        ) : (
          <ChatIcon name="attach" size={18} />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        disabled={disabled || isLoading}
        className="visually-hidden"
        accept="*/*"
      />

      {error && <div className="attachment-error">{error}</div>}

      {isLoading && progress > 0 && (
        <div className="attachment-progress">{Math.round(progress)}%</div>
      )}
    </div>
  );
}
