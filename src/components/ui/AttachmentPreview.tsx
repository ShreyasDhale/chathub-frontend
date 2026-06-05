"use client";

import { useState } from "react";
import { Attachment } from "@/types/chat.types";
import {
  useAttachmentPreview,
  useAttachmentPreviewUrl,
} from "@/hooks/useAttachmentPreview";
import { downloadAttachment } from "@/services/api/attachments.api";
import { VoiceNotePlayer } from "./VoiceNotePlayer";
import ChatIcon from "@/components/ui/ChatIcon";

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

  function handleDownload() {
    downloadAttachment(attachment.attachmentId, attachment.fileName);
  }

  if (preview.isAudio) {
    return <VoiceNotePlayer attachment={attachment} isOwn={isOwn} />;
  }

  if (preview.isImage) {
    return (
      <div className="attach-card">
        <div className="attach-card-media">
          <img
            src={previewUrl || attachment.url}
            alt={attachment.fileName}
            onClick={() => setIsExpanded(true)}
            className="attach-image"
          />
        </div>
        <AttachmentMeta
          name={attachment.fileName}
          showDownload={showDownload}
          onDownload={handleDownload}
          onRemove={onRemove}
        />
        {isExpanded && (
          <div
            className="attach-lightbox"
            onClick={() => setIsExpanded(false)}
            role="dialog"
          >
            <img
              src={previewUrl || attachment.url}
              alt={attachment.fileName}
              className="attach-lightbox-img"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    );
  }

  if (preview.isVideo) {
    return (
      <div className="attach-card">
        <video
          src={previewUrl || attachment.url}
          controls
          className="attach-video"
        />
        <AttachmentMeta
          name={attachment.fileName}
          showDownload={showDownload}
          onDownload={handleDownload}
          onRemove={onRemove}
        />
      </div>
    );
  }

  return (
    <div className={`attach-doc ${isOwn ? "is-own" : ""}`}>
      <div className="attach-doc-icon" aria-hidden="true">
        {preview.icon}
      </div>
      <div className="attach-doc-info">
        <p className="attach-doc-name">{attachment.fileName}</p>
        <p className="attach-doc-size">{preview.fileSize}</p>
      </div>
      <div className="attach-doc-actions">
        {showDownload && (
          <button
            type="button"
            className="chat-icon-button"
            onClick={handleDownload}
            title="Download"
            aria-label="Download"
          >
            <ChatIcon name="attach" size={16} />
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            className="chat-icon-button"
            onClick={onRemove}
            title="Remove"
            aria-label="Remove"
          >
            <ChatIcon name="close" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function AttachmentMeta({
  name,
  showDownload,
  onDownload,
  onRemove,
}: {
  name: string;
  showDownload: boolean;
  onDownload: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="attach-meta">
      <span className="attach-meta-name">{name}</span>
      <div className="attach-meta-actions">
        {showDownload && (
          <button
            type="button"
            className="chat-icon-button"
            onClick={onDownload}
            title="Download"
            aria-label="Download"
          >
            <ChatIcon name="attach" size={14} />
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            className="chat-icon-button"
            onClick={onRemove}
            title="Remove"
            aria-label="Remove"
          >
            <ChatIcon name="close" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
