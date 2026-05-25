import { adminApiRequest, type AdminApiResult } from "@/lib/admin/adminApiRequest";

export const deleteAvailableCar = ({ id }: { id: string }): Promise<AdminApiResult<unknown>> =>
  adminApiRequest({
    path: `/available-cars/${id}`,
    method: "DELETE",
    errorFallback: "Failed to delete available car",
    errorContext: "deleting available car",
  });
