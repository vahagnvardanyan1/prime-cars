import { AdminPageBoundary } from "@/components/admin/AdminPageBoundary";
import { AdminCarsPage } from "@/components/admin/pages/AdminCarsPage";

export default function CarsPage() {
  return (
    <AdminPageBoundary>
      <AdminCarsPage />
    </AdminPageBoundary>
  );
}
