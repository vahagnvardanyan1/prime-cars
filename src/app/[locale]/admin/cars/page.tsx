import { Suspense } from "react";

import { AdminCarsPage } from "@/components/admin/pages/AdminCarsPage";

const AdminCarsPageWrapper = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <AdminCarsPage />
    </Suspense>
  );
};

export default function CarsPage() {
  return <AdminCarsPageWrapper />;
}

