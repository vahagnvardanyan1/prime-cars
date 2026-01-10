import type { AdminUserRole } from "@/lib/admin/types";

export const formatUsd = ({ value }: { value: number }) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

export const getRoleTone = ({ role }: { role: AdminUserRole }) => {
  switch (role) {
    case "Admin":
      return "primary";
    case "Manager":
      return "neutral";
    case "Support":
      return "neutral";
    case "Viewer":
      return "neutral";
    default:
      return "neutral";
  }
};





