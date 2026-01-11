import { Suspense } from "react";

import { AdminAvailableCarsPage } from "@/components/admin/pages/AdminAvailableCarsPage";

const AdminAvailableCarsPageWrapper = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <AdminAvailableCarsPage />
    </Suspense>
  );
};

export default function AvailableCarsPage() {
  return <AdminAvailableCarsPageWrapper />;
}
