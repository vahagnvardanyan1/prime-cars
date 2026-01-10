import { Suspense } from "react";

import { AdminUsersPage } from "@/components/admin/pages/AdminUsersPage";

const AdminUsersPageWrapper = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <AdminUsersPage />
    </Suspense>
  );
};

export default function UsersPage() {
  return <AdminUsersPageWrapper />;
}

