import type { AdminCar, AdminUser, ShippingCity } from "@/lib/admin/types";
import { VehicleType, VehicleModel, Auction } from "@/lib/admin/types";

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


export const SHIPPING_CITIES: ShippingCity[] = [
  { id: "city_ny", city: "New York", shippingUsd: 100 },
  { id: "city_la", city: "Los Angeles", shippingUsd: 140 },
  { id: "city_mia", city: "Miami", shippingUsd: 120 },
  { id: "city_hou", city: "Houston", shippingUsd: 110 },
  { id: "city_chi", city: "Chicago", shippingUsd: 130 },
];

// Mock car data for testing
export const MOCK_CAR_DATA = {
  model: VehicleModel.BMW,
  year: "2023",
  priceUsd: "28500",
  purchaseDate: "2024-01-15",
  type: VehicleType.AUTO,
  auction: Auction.COPART,
  city: "Los Angeles",
  lot: "54123987",
  vin: "4T1BF1FK5EU123456",
  customerNotes: "Clean title, minor front bumper damage, excellent mechanical condition.",
};

export const MOCK_VEHICLE_MODELS = [
  VehicleModel.BMW
];

export const MOCK_AUCTIONS = [
  Auction.COPART,
  Auction.IAAI,
];

export const MOCK_CITIES = [
  "Los Angeles",
  "Dallas",
  "Phoenix",
  "Houston",
  "Chicago",
  "Atlanta",
  "Miami",
  "New York",
];

export const generateRandomCarData = () => {
  const currentYear = new Date().getFullYear();
  const randomYear = currentYear - Math.floor(Math.random() * 5); // 0-5 years old
  const randomModel = MOCK_VEHICLE_MODELS[Math.floor(Math.random() * MOCK_VEHICLE_MODELS.length)];
  const randomAuction = MOCK_AUCTIONS[Math.floor(Math.random() * MOCK_AUCTIONS.length)];
  const randomCity = MOCK_CITIES[Math.floor(Math.random() * MOCK_CITIES.length)];
  const randomPrice = 15000 + Math.floor(Math.random() * 40000);
  const randomLot = Math.floor(10000000 + Math.random() * 90000000).toString();
  const randomVin = `1HGBH41JXMN${Math.floor(100000 + Math.random() * 900000)}`;
  
  const vehicleTypes = [
    VehicleType.AUTO,
    VehicleType.MOTORCYCLE,
    VehicleType.TRUCK,
    VehicleType.LIMOUSINE,
    VehicleType.BOAT,
  ];
  const randomType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];

  return {
    model: randomModel,
    year: randomYear.toString(),
    priceUsd: randomPrice.toString(),
    purchaseDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: randomType,
    auction: randomAuction,
    city: randomCity,
    lot: randomLot,
    vin: randomVin,
    customerNotes: [
      "Clean title, minor cosmetic damage.",
      "Salvage title, front-end damage, needs repairs.",
      "Clean title, excellent condition, low mileage.",
      "Runs and drives, minor scratches.",
      "Clean title, one owner, full service history.",
    ][Math.floor(Math.random() * 5)],
  };
};





