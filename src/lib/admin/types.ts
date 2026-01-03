export type AdminCarStatus = "Active" | "Draft" | "Pending Review" | "Sold";

export type AdminCar = {
  id: string;
  imageUrl: string;
  model: string;
  year: number;
  priceUsd: number;
  status: AdminCarStatus;
};

export type AdminUserRole = "Admin" | "Manager" | "Support" | "Viewer";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
};

export type ShippingCity = {
  id: string;
  city: string;
  shippingUsd: number;
};



