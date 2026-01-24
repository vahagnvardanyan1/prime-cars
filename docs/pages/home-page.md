# HomePage Documentation

## Overview
The HomePage is the main landing page for Prime Cars, a car import business. It features a hero section, popular cars carousel, and import cost calculator.

## Route
- Path: `/{locale}/` (e.g., `/en/`, `/hy/`, `/ru/`)
- File: `src/app/[locale]/page.tsx`

---

## Component Architecture

```
HomePage (Server Component)
├── Hero Section
│   ├── Title & Description
│   ├── CTA Button → /calculator
│   └── Logo Image
├── Popular Deals Section
│   └── CarsCarousel (Client Component)
│       └── CarouselItem[] → Car cards with navigation
└── Import Costs Section
    └── ImportCalculator (Client Component)
        └── CalculatorResults (on submit)
```

---

## File Structure

### Core Files
| File | Type | Purpose |
|------|------|---------|
| `src/app/[locale]/page.tsx` | Route | Next.js page entry point |
| `src/components/pages/HomePage.tsx` | Server Component | Main page layout and sections |
| `src/components/pages/home/CarsCarousel.tsx` | Client Component | Popular cars carousel |
| `src/components/ImportCalculator.tsx` | Client Component | Import cost form |
| `src/components/calculator/CalculatorResults.tsx` | Client Component | Calculator results display |

### Layout Components (Shared)
| File | Purpose |
|------|---------|
| `src/components/SiteShell.tsx` | Wraps all public pages with Header, Footer, LoginModal |
| `src/components/Header.tsx` | Navigation, theme toggle, language switcher, sign-in |
| `src/components/Footer.tsx` | Links, contact info, social media |
| `src/components/LoginModal.tsx` | Authentication modal |

### UI Components Used
| File | Used For |
|------|----------|
| `src/components/ui/carousel.tsx` | Embla carousel wrapper (has keyboard nav, ARIA) |
| `src/components/ui/select.tsx` | Dropdown selects in calculator |
| `src/components/ui/button.tsx` | Action buttons |

---

## Data Flow

### Cars Data
```
HomePage (Server)
    ↓ fetchAllAvailableCars()
    ↓ API: GET /available-cars
    ↓ Maps BackendAvailableCar → Car
    ↓ passes cars[] to CarsCarousel
```

### Calculator Data
```
ImportCalculator (Client)
    ↓ User fills form
    ↓ fetchShippingCities() → city prices
    ↓ fetchExchangeRates() → AMD rates
    ↓ calculateVehicleTaxes() → backend API
    ↓ Shows CalculatorResults
```

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/available-cars` | GET | Fetch all cars for carousel |
| `/api/calculate` | POST | Calculate import taxes |
| `/shipping-prices` | GET | Fetch shipping prices by city |
| CBA API | GET | Exchange rates (AMD/USD/EUR) |

---

## Types

### Car Type (`src/lib/cars/types.ts`)
```typescript
type Car = {
  id: string;
  imageUrl: string;
  photos?: string[];
  brand: string;
  model: string;
  year: number;
  priceUsd: number;
  category: "AVAILABLE" | "ONROAD" | "TRANSIT";
  status: CarStatus;
  location?: string;
  engine?: string;
  horsepower?: number;
  fuelType?: string;
  transmission?: string;
  description?: string;
  vin?: string;
  engineSize?: number;
};
```

---

## Translations Used

### Home Section (`src/messages/en.json`)
```json
"home": {
  "hero": {
    "title": "Selling Cars, Building Trust",
    "description": "At the heart of our business...",
    "primaryCta": "Calculate",
    "heroImageAlt": "Luxury Car"
  },
  "popularDeals": {
    "title": "Most Popular Car Rental Deals",
    "description": "Discover unbeatable deals...",
    "priceLabel": "Price",
    "noCars": "No cars available at the moment"
  },
  "importCosts": {
    "title": "Calculate Your Import Costs",
    "description": "Get an instant estimate..."
  }
}
```

### Header (used on all pages)
```json
"header": {
  "logoAlt": "Prime Cars Logo",
  "signInNow": "Sign In",
  "toggleThemeAria": "Toggle theme",
  "toggleMenuAria": "Toggle menu",
  "closeMenuAria": "Close menu"
}
```

### Navigation
```json
"nav": {
  "home": "Home",
  "cars": "Cars",
  "calculator": "Calculator",
  "partners": "For Partners"
}
```

---

## Contexts & Hooks

| Context/Hook | File | Purpose |
|--------------|------|---------|
| `useUser` | `src/contexts/UserContext.tsx` | Current user, isAdmin, login state |
| `useTheme` | `src/components/ThemeContext.tsx` | Dark/light mode |

---

## Configuration

### i18n Config (`src/i18n/config.ts`)
```typescript
locales = ["en", "ru", "hy"]
defaultLocale = "hy"
API_BASE_URL = "https://prime-auto-backend-production.up.railway.app"
```

### Navigation (`src/lib/site-nav.ts`)
```typescript
siteNavItems = [
  { key: "home", href: "/" },
  { key: "cars", href: "/cars" },
  { key: "calculator", href: "/calculator" },
  { key: "partners", href: "/partners" }
]
```

---

## Related Component Details

### CarsCarousel.tsx
```tsx
// Line 64-66 - The clickable card wrapper
<div
  onClick={() => router.push(`/cars/${car.id}`)}
  className="bg-white dark:bg-[#111111] rounded-xl ... cursor-pointer"
>
  // Car image, badges, details, price
</div>
```

### Header.tsx - Icon Usage
```tsx
// Theme toggle button (line 100-111)
<button aria-label={t("header.toggleThemeAria")}>
  {theme === "dark" ? <Sun /> : <Moon />}
</button>

// Mobile menu toggle (line 137-148)
<button aria-label={t("header.toggleMenuAria")}>
  {isMobileMenuOpen ? <X /> : <Menu />}
</button>
```

### Footer.tsx - Icon Usage
```tsx
// Social links (line 28-44)
<a href="facebook..."><Facebook /></a>
<a href="instagram..."><Instagram /></a>

// Contact section (line 91-116)
<Mail />
<Phone />
<MapPin />
```
