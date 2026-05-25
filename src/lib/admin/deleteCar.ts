import { adminApiRequest, type AdminApiResult } from "@/lib/admin/adminApiRequest";

export const deleteCar = ({ id }: { id: string }): Promise<AdminApiResult<unknown>> =>
  adminApiRequest({
    path: `/vehicles/${id}`,
    method: "DELETE",
    errorFallback: "Failed to delete car",
    errorContext: "deleting car",
  });
