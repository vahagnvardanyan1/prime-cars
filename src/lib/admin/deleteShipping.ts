import { adminApiRequest, type AdminApiResult } from "@/lib/admin/adminApiRequest";

export const deleteShipping = ({ id }: { id: string }): Promise<AdminApiResult<unknown>> =>
  adminApiRequest({
    path: `/shippings/admin/city-prices/${id}`,
    method: "DELETE",
    errorFallback: "Failed to delete shipping",
    errorContext: "deleting shipping",
  });
