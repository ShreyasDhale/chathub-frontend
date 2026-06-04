import { apiRequest } from "@/services/api/httpClient";
import { DynamicApiResponse } from "@/types/api.types";
import { Notification } from "@/types/chat.types";

/** GET /Notifications/UnreadCount */
export function getUnreadCount() {
  return apiRequest<DynamicApiResponse<number, null>>(
    "/Notifications/UnreadCount",
    { method: "GET", showToast: false }
  );
}

/** GET /Notifications/List?page=&pageSize= */
export function getNotifications(page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  return apiRequest<DynamicApiResponse<Notification[], null>>(
    `/Notifications/List?${params}`,
    { method: "GET", showToast: false }
  );
}

/** POST /Notifications/MarkRead */
export function markNotificationsRead(notificationIds: number[]) {
  return apiRequest<DynamicApiResponse<null, null>>(
    "/Notifications/MarkRead",
    {
      method: "POST",
      body: { NotificationIds: notificationIds },
      showToast: false,
    }
  );
}
