export type CarListing = {
  id: number;
  image: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  location: string;
  engine: string;
  hp: number;
  fuel: string;
  transmission: string;
};

export const carsData: CarListing[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1691884454440-9a414bc25bbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzcG9ydHMlMjBjYXJ8ZW58MXx8fHwxNzY3MzU3OTEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    brand: "Porsche",
    model: "911 GT3",
    year: 2023,
    price: 189500,
    location: "Stuttgart, Germany",
    engine: "4.0L Flat-6",
    hp: 502,
    fuel: "Gasoline",
    transmission: "Manual",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1758179128122-6079c9cb3e4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwc2VkYW4lMjBjYXJ8ZW58MXx8fHwxNzY3Mzk0NTg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    brand: "Mercedes-Benz",
    model: "S-Class",
    year: 2024,
    price: 124900,
    location: "Tokyo, Japan",
    engine: "3.0L Turbo",
    hp: 429,
    fuel: "Gasoline",
    transmission: "Automatic",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1758217209786-95458c5d30a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzdXYlMjB2ZWhpY2xlfGVufDF8fHx8MTc2NzM5NDU4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    brand: "Range Rover",
    model: "Sport",
    year: 2024,
    price: 142800,
    location: "London, UK",
    engine: "4.4L V8",
    hp: 523,
    fuel: "Hybrid",
    transmission: "Automatic",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1728458032011-23a66142fbf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibXclMjBsdXh1cnklMjBjYXJ8ZW58MXx8fHwxNzY3NDQ3NTIzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    brand: "BMW",
    model: "M5 Competition",
    year: 2023,
    price: 135900,
    location: "Munich, Germany",
    engine: "4.4L Twin-Turbo V8",
    hp: 617,
    fuel: "Gasoline",
    transmission: "Automatic",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1667034864688-3ca5addf1e51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpJTIwc3BvcnRzJTIwY2FyfGVufDF8fHx8MTc2NzQ1MzcyNXww&ixlib=rb-4.1.0&q=80&w=1080",
    brand: "Audi",
    model: "RS6 Avant",
    year: 2023,
    price: 128500,
    location: "Ingolstadt, Germany",
    engine: "4.0L Twin-Turbo V8",
    hp: 591,
    fuel: "Gasoline",
    transmission: "Automatic",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1737051245172-afa43f12ebc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZXh1cyUyMHNlZGFuJTIwY2FyfGVufDF8fHx8MTc2NzQ1MzcyNnww&ixlib=rb-4.1.0&q=80&w=1080",
    brand: "Lexus",
    model: "LS 500h",
    year: 2024,
    price: 98900,
    location: "Tokyo, Japan",
    engine: "3.5L V6 Hybrid",
    hp: 354,
    fuel: "Hybrid",
    transmission: "Automatic",
  },
  {
    id: 7,
    image:
      "https://images.unsplash.com/photo-1696581084151-8a038c7dfc83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZXJyYXJpJTIwc3BvcnRzJTIwY2FyfGVufDF8fHx8MTc2NzQxMDc4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    brand: "Ferrari",
    model: "F8 Tributo",
    year: 2022,
    price: 329900,
    location: "Maranello, Italy",
    engine: "3.9L Twin-Turbo V8",
    hp: 710,
    fuel: "Gasoline",
    transmission: "Automatic",
  },
  {
    id: 8,
    image:
      "https://images.unsplash.com/photo-1719772692993-933047b8ea4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXNsYSUyMGVsZWN0cmljJTIwY2FyfGVufDF8fHx8MTc2NzM5NDczOHww&ixlib=rb-4.1.0&q=80&w=1080",
    brand: "Tesla",
    model: "Model S Plaid",
    year: 2024,
    price: 112500,
    location: "Fremont, USA",
    engine: "Tri-Motor Electric",
    hp: 1020,
    fuel: "Electric",
    transmission: "Automatic",
  },
  {
    id: 9,
    image:
      "https://images.unsplash.com/photo-1696581081896-c2e2edaf39d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW1ib3JnaGluaSUyMHN1cGVyY2FyfGVufDF8fHx8MTc2NzQxMDc4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    brand: "Lamborghini",
    model: "Huracán EVO",
    year: 2023,
    price: 289900,
    location: "Sant'Agata, Italy",
    engine: "5.2L V10",
    hp: 631,
    fuel: "Gasoline",
    transmission: "Automatic",
  },
];
