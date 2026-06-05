import { apiRequest } from "@/services/api/httpClient";
import { DynamicApiResponse } from "@/types/api.types";
import { UserProfile, UsersListItem } from "@/types/chat.types";

/** GET /Users/Profile */
export function getProfile() {
  return apiRequest<DynamicApiResponse<UserProfile, null>>("/Users/Profile", {
    method: "GET",
    showToast: false,
  });
}

/** GET /Users/Search?search=&page=&pageSize= — backend returns a DataTable. */
export function searchUsers(query: string, page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    search: query,
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  return apiRequest<DynamicApiResponse<UsersListItem[] | { Rows: UsersListItem[] }, null>>(
    `/Users/Search?${params}`,
    { method: "GET", showToast: false }
  );
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
