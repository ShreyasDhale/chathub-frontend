import { useState, useCallback } from "react";
import {
  uploadAttachment,
  AttachmentResponse,
} from "@/services/api/attachments.api";

export type UploadState = {
  isLoading: boolean;
  progress: number;
  error: string | null;
  attachment: AttachmentResponse | null;
};

export function useFileUpload() {
  const [state, setState] = useState<UploadState>({
    isLoading: false,
    progress: 0,
    error: null,
    attachment: null,
  });

  const upload = useCallback(
    async (file: File, conversationId: number) => {
      setState({ isLoading: true, progress: 0, error: null, attachment: null });

      try {
        const attachment = await uploadAttachment(
          file,
          conversationId,
          (progress) => {
            setState((prev) => ({ ...prev, progress }));
          }
        );

        setState({
          isLoading: false,
          progress: 100,
          error: null,
          attachment,
        });

        return attachment;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setState({
          isLoading: false,
          progress: 0,
          error: errorMessage,
          attachment: null,
        });
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      error: null,
      attachment: null,
    });
  }, []);

  return { ...state, upload, reset };
}
