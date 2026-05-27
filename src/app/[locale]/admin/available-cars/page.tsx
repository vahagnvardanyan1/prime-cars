import { AdminPageBoundary } from "@/components/admin/AdminPageBoundary";
import { AdminAvailableCarsPage } from "@/components/admin/pages/AdminAvailableCarsPage";

export default function AvailableCarsPage() {
  return (
    <AdminPageBoundary>
      <AdminAvailableCarsPage />
    </AdminPageBoundary>
  );
}
