import { apiRequest } from "@/services/api/httpClient";
import { DynamicApiResponse } from "@/types/api.types";

export type AttachmentResponse = {
  attachmentId: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt?: string;
};

/**
 * POST /Messages/UploadAttachment
 * Uploads a file (image, document, etc.) and returns attachment metadata
 */
export async function uploadAttachment(
  file: File,
  conversationId: number,
  onProgress?: (progress: number) => void
): Promise<AttachmentResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("conversationId", conversationId.toString());

  // For file upload with progress tracking, we need to use XMLHttpRequest directly
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progress tracking
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    xhr.addEventListener("load", () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText) as DynamicApiResponse<
            AttachmentResponse,
            null
          >;
          if (response.Model) {
            resolve(response.Model);
          } else {
            reject(new Error("No attachment data in response"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      } catch (error) {
        reject(error);
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"));
    });

    // Get auth token from localStorage
    const token = localStorage.getItem("jwt_token") || "";
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/Messages/UploadAttachment`;

    xhr.open("POST", apiUrl, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
}

/**
 * POST /Messages/UploadVoiceNote
 * Uploads an audio blob as a voice note and returns attachment metadata
 */
export async function uploadVoiceNote(
  audioBlob: Blob,
  conversationId: number,
  onProgress?: (progress: number) => void
): Promise<AttachmentResponse> {
  const file = new File([audioBlob], "voice-note.webm", {
    type: audioBlob.type || "audio/webm",
  });
  return uploadAttachment(file, conversationId, onProgress);
}

/**
 * GET /Messages/DownloadAttachment/{id}
 * Downloads an attachment file by ID
 */
export function downloadAttachment(attachmentId: string, fileName: string) {
  const token = localStorage.getItem("jwt_token") || "";
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/Messages/DownloadAttachment/${attachmentId}`;

  // Create a link and trigger download
  const link = document.createElement("a");
  link.href = apiUrl;
  link.download = fileName;
  link.setAttribute("Authorization", `Bearer ${token}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * REST fallback: Send message with attachment metadata
 * Used if attachment needs to be associated with a specific message
 */
export function sendMessageWithAttachment(payload: {
  ConversationId: number;
  Message: string;
  AttachmentId?: string;
  ClientMessageId?: number;
}) {
  return apiRequest<DynamicApiResponse<null, null>>(
    "/Messages/Send",
    {
      method: "POST",
      body: payload,
      showToast: false,
    }
  );
}
