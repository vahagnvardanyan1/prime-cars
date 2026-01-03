import type { AdminCar, AdminUser, ShippingCity } from "@/lib/admin/types";

export const ADMIN_CARS: AdminCar[] = [
  {
    id: "car_01",
    imageUrl:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80",
    model: "BMW 3 Series Coupé 2.0i",
    year: 2022,
    priceUsd: 204_910,
    status: "Active",
  },
  {
    id: "car_02",
    imageUrl:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&q=80",
    model: "Tesla Model S Plaid",
    year: 2024,
    priceUsd: 321_410,
    status: "Pending Review",
  },
  {
    id: "car_03",
    imageUrl:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80",
    model: "Chevrolet Camaro ZL1",
    year: 2022,
    priceUsd: 266_510,
    status: "Draft",
  },
  {
    id: "car_04",
    imageUrl:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&q=80",
    model: "Porsche 911 Carrera",
    year: 2023,
    priceUsd: 189_500,
    status: "Sold",
  },
];

export const ADMIN_USERS: AdminUser[] = [
  {
    id: "user_01",
    name: "Ava Johnson",
    email: "ava.johnson@primecars.internal",
    role: "Admin",
  },
  {
    id: "user_02",
    name: "Noah Kim",
    email: "noah.kim@primecars.internal",
    role: "Manager",
  },
  {
    id: "user_03",
    name: "Sophia Patel",
    email: "sophia.patel@primecars.internal",
    role: "Support",
  },
  {
    id: "user_04",
    name: "Liam Martinez",
    email: "liam.martinez@primecars.internal",
    role: "Viewer",
  },
];

export const SHIPPING_CITIES: ShippingCity[] = [
  { id: "city_ny", city: "New York", shippingUsd: 100 },
  { id: "city_la", city: "Los Angeles", shippingUsd: 140 },
  { id: "city_mia", city: "Miami", shippingUsd: 120 },
  { id: "city_hou", city: "Houston", shippingUsd: 110 },
  { id: "city_chi", city: "Chicago", shippingUsd: 130 },
];



