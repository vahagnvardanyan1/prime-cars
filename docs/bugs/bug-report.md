# Web Interface Guidelines Bug Report

## Status: ALL BUGS FIXED

**Date Completed:** January 24, 2026

---

## Summary

| Category | Total | Fixed | Skipped |
|----------|-------|-------|---------|
| Accessibility - Keyboard | 1 | 1 | 0 |
| Accessibility - ARIA | 7 | 7 | 0 |
| Forms | 3 | 2 | 1 |
| Other | 2 | 2 | 0 |
| **Total** | **13** | **12** | **1** |

---

## High Priority Bugs (FIXED)

### BUG-001: Clickable div without keyboard support
**File:** `src/components/pages/home/CarsCarousel.tsx:64-66`
**Status:** FIXED

**Fix Applied:**
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={() => router.push(`/cars/${car.id}`)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(`/cars/${car.id}`);
    }
  }}
  className="... focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2"
>
```

---

### BUG-002: Password toggle button missing aria-label
**File:** `src/components/ui/password-input.tsx:18-29`
**Status:** FIXED

**Fix Applied:**
```tsx
<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  tabIndex={-1}
  aria-label={showPassword ? "Hide password" : "Show password"}
>
  {showPassword ? (
    <EyeOff aria-hidden="true" className="h-5 w-5" />
  ) : (
    <Eye aria-hidden="true" className="h-5 w-5" />
  )}
</button>
```

---

## Medium Priority Bugs (FIXED)

### BUG-003: Header icons missing aria-hidden
**File:** `src/components/Header.tsx`
**Status:** FIXED

Added `aria-hidden="true"` to:
- Sun icons (2 locations)
- Moon icons (2 locations)
- X icons (2 locations)
- Menu icon (1 location)

---

### BUG-004: Footer icons missing aria-hidden
**File:** `src/components/Footer.tsx`
**Status:** FIXED

Added `aria-hidden="true"` to:
- Facebook, Instagram icons
- Mail, Phone, MapPin icons

Added `aria-label` to:
- Facebook link (`aria-label="Facebook"`)
- Instagram link (`aria-label="Instagram"`)

---

### BUG-005: ImportCalculator icons missing aria-hidden
**File:** `src/components/ImportCalculator.tsx`
**Status:** FIXED

Added `aria-hidden="true"` to:
- MoreHorizontal icon (line 437)
- Info icon (line 770)

---

### BUG-006: LoginModal spinner missing aria-hidden
**File:** `src/components/LoginModal.tsx:241-244`
**Status:** FIXED

Added `aria-hidden="true"` to spinner SVG.

---

### BUG-007: LoginModalFormik spinner missing aria-hidden
**File:** `src/components/LoginModalFormik.tsx:115-117`
**Status:** FIXED

Added `aria-hidden="true"` to spinner SVG.

---

### BUG-008: LanguageSwitcher Globe icon missing aria-hidden
**File:** `src/components/LanguageSwitcher.tsx:71`
**Status:** FIXED

**Fix Applied:**
```tsx
<Globe aria-hidden="true" className="h-5 w-5 opacity-70" />
```

---

### BUG-009: LoginModal missing autocomplete
**File:** `src/components/LoginModal.tsx:183-198`
**Status:** FIXED

Added `autoComplete="username"` to username input.

---

## Low Priority Bugs

### BUG-010: Number inputs missing inputMode
**File:** `src/components/ImportCalculator.tsx:490-497`
**Status:** FIXED

Added `inputMode="decimal"` to vehicle price input.

---

### BUG-011: LoginModal missing overscroll-behavior
**File:** `src/components/LoginModal.tsx:159`
**Status:** FIXED

Added `overscroll-contain` class to modal div.

---

### BUG-012: Placeholders missing ellipsis
**Files:** Translation files
**Status:** SKIPPED

Placeholders function correctly without ellipsis. This is a minor stylistic preference.

---

### BUG-013: Social links need accessible names
**File:** `src/components/Footer.tsx:28-44`
**Status:** FIXED (merged with BUG-004)

---

## Files Modified

| File | Changes |
|------|---------|
| `src/components/pages/home/CarsCarousel.tsx` | Keyboard support (role, tabIndex, onKeyDown, focus ring) |
| `src/components/ui/password-input.tsx` | aria-label, aria-hidden on icons |
| `src/components/Header.tsx` | aria-hidden on 7 icons |
| `src/components/Footer.tsx` | aria-hidden on 5 icons, aria-label on 2 links |
| `src/components/ImportCalculator.tsx` | aria-hidden on 2 icons, inputMode on input |
| `src/components/LoginModal.tsx` | autocomplete, aria-hidden, overscroll-contain, X icon aria-hidden |
| `src/components/LoginModalFormik.tsx` | aria-hidden on spinner |
| `src/components/LanguageSwitcher.tsx` | aria-hidden on Globe icon |

---

## Intentional Patterns (NOT BUGS)

### CalculatorResults.tsx - Blurred Restricted Data
```tsx
<span className="text-gray-400 opacity-60 blur-[3px] select-none">$000</span>
```
**Location:** Lines 221, 239, 252, 261, 278, 287, 300
**Purpose:** Intentionally hides pricing details from non-partner users.

---

## Components Already Compliant

These components properly implement accessibility:
- `src/components/ui/carousel.tsx` - Has role="region", aria-roledescription, keyboard navigation
- `src/components/ui/dialog.tsx` - Has sr-only close button text, proper focus ring
- `src/components/ui/button.tsx` - Has focus-visible:ring-[3px]
- `src/components/ui/select.tsx` - Has focus-visible styles, ARIA support
- `src/components/pages/HomePage.tsx` - Image has proper alt and dimensions
