export type AdminCarDetails = {
  purchaseDate?: string;
  type?: string;
  auction?: string;
  city?: string;
  lot?: string;
  vin?: string;
  customerNotes?: string;
  vehiclePdf?: string;
  insurancePdf?: string;
  shippingPdf?: string;
};

export type AdminCar = {
  id: string;
  imageUrl: string;
  photos?: string[];
  model: string;
  year: number;
  priceUsd: number;
  carPaid: boolean;
  shippingPaid: boolean;
  insurance: boolean;
  status?: string;
  details?: AdminCarDetails;
  vehiclePdf?: string;
  insurancePdf?: string;
  shippingPdf?: string;
  client?: string;
  invoiceId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUserRole = "Admin" | "Manager" | "Support" | "Viewer";

export enum VehicleType {
  AUTO = 'auto',
  MOTORCYCLE = 'motorcycle',
  LIMOUSINE = 'limousine',
  BOAT = 'boat',
  TRAILER = 'trailer',
  TRUCK = 'truck',
  OVERSIZED_TRUCK = 'oversized truck',
  JETSKI = 'jetski',
  ATV = 'ATV',
  MOPED = 'moped',
  SCOOTER = 'scooter',
  OTHER = 'other',
}

export enum VehicleModel {
  BMW = 'bmw',
 
}

export enum Auction {
  COPART = 'copart',
  IAAI = 'iaai',
  MANHEIM = 'manheim',
}

export enum Country {
  ARMENIA = 'Armenia',
  USA = 'USA',
  GEORGIA = 'Georgia',
  RUSSIA = 'Russia',
}

export enum EngineType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
}

export type AdminUser = {
  id: string;
  customerId?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passport?: string;
  phone?: string;
  location?: string;
  country?: string;
  companyName?: string;
  role: AdminUserRole;
  coefficient?: number;
  category?: Auction;
};

export type ShippingCity = {
  id: string;
  city: string;
  shippingUsd: number;
  auction?: Auction;
};

export type CreateUserData = {
  country?: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  passportNumber?: string;
  phone?: string;
  email?: string;
  login: string;
  password: string;
};

export type CreateUserResponse = {
  success: boolean;
  user?: AdminUser;
  error?: string;
};





