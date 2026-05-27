import { AdminPageBoundary } from "@/components/admin/AdminPageBoundary";
import { AdminUsersPage } from "@/components/admin/pages/AdminUsersPage";

export default function UsersPage() {
  return (
    <AdminPageBoundary>
      <AdminUsersPage />
    </AdminPageBoundary>
  );
}
