import { AdminPageBoundary } from "@/components/admin/AdminPageBoundary";
import { AdminNotificationsPage } from "@/components/admin/pages/AdminNotificationsPage";

export default function NotificationsPage() {
  return (
    <AdminPageBoundary>
      <AdminNotificationsPage />
    </AdminPageBoundary>
  );
}
