import { adminApiRequest, type AdminApiResult } from "@/lib/admin/adminApiRequest";

export const deleteUser = ({ id }: { id: string }): Promise<AdminApiResult<unknown>> =>
  adminApiRequest({
    path: `/users/${id}`,
    method: "DELETE",
    errorFallback: "Failed to delete user",
    errorContext: "deleting user",
  });
