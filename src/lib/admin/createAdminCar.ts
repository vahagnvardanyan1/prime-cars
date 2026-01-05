import type { AdminCar, AdminCarDetails, AdminCarStatus } from "@/lib/admin/types";

type CreateAdminCarArgs = {
  imageUrl: string | null;
  model: string;
  year: number;
  priceUsd: number;
  status: AdminCarStatus;
  details: AdminCarDetails;
};

export const createAdminCar = ({
  imageUrl,
  model,
  year,
  priceUsd,
  status,
  details,
}: CreateAdminCarArgs): AdminCar => {
  const safeImageUrl =
    imageUrl ??
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&q=80";

  return {
    id: `car_${Date.now()}`,
    imageUrl: safeImageUrl,
    model,
    year,
    priceUsd,
    status,
    details,
  };
};


