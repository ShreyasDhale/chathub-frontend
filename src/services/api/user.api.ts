import { apiRequest } from "@/services/api/httpClient";
import { DynamicApiResponse } from "@/types/api.types";
import { UserProfile } from "@/types/chat.types";

/** GET /Users/Profile */
export function getProfile() {
  return apiRequest<DynamicApiResponse<UserProfile, null>>("/Users/Profile", {
    method: "GET",
    showToast: false,
  });
}

/** PUT /Users/UpdateProfile */
export function updateProfile(dto: {
  DisplayName?: string;
  AvatarUrl?: string;
  Bio?: string;
}) {
  return apiRequest<DynamicApiResponse<null, null>>("/Users/UpdateProfile", {
    method: "PUT",
    body: dto,
    showToast: true,
  });
}

/** PUT /Users/ChangePassword */
export function changePassword(dto: {
  CurrentPassword: string;
  NewPassword: string;
}) {
  return apiRequest<DynamicApiResponse<null, null>>("/Users/ChangePassword", {
    method: "PUT",
    body: dto,
    showToast: true,
  });
}
