import { Suspense } from "react";

import { AdminNotificationsPage } from "@/components/admin/pages/AdminNotificationsPage";

const AdminNotificationsPageWrapper = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <AdminNotificationsPage />
    </Suspense>
  );
};

export default function NotificationsPage() {
  return <AdminNotificationsPageWrapper />;
}
