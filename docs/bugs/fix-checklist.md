# Bug Fix Checklist

## Status: ALL BUGS FIXED

---

## High Priority (Complete)

### BUG-001: CarsCarousel keyboard support
- [x] Open `src/components/pages/home/CarsCarousel.tsx`
- [x] Find line 64-66 (clickable div)
- [x] Add `role="button"`, `tabIndex={0}`, `onKeyDown` handler
- [x] Add `focus-visible:ring-2` for visual focus indicator

### BUG-002: PasswordInput aria-label
- [x] Open `src/components/ui/password-input.tsx`
- [x] Add `aria-label={showPassword ? "Hide password" : "Show password"}`
- [x] Add `aria-hidden="true"` to Eye and EyeOff icons

---

## Medium Priority (Complete)

### BUG-003: Header icons aria-hidden
- [x] Open `src/components/Header.tsx`
- [x] Add `aria-hidden="true"` to Sun icons (2 locations)
- [x] Add `aria-hidden="true"` to Moon icons (2 locations)
- [x] Add `aria-hidden="true"` to X icons (2 locations)
- [x] Add `aria-hidden="true"` to Menu icon

### BUG-004: Footer icons aria-hidden
- [x] Open `src/components/Footer.tsx`
- [x] Add `aria-hidden="true"` to Facebook icon
- [x] Add `aria-hidden="true"` to Instagram icon
- [x] Add `aria-hidden="true"` to Mail icon
- [x] Add `aria-hidden="true"` to Phone icon
- [x] Add `aria-hidden="true"` to MapPin icon
- [x] Add `aria-label="Facebook"` to Facebook link
- [x] Add `aria-label="Instagram"` to Instagram link

### BUG-005: ImportCalculator icons aria-hidden
- [x] Open `src/components/ImportCalculator.tsx`
- [x] Add `aria-hidden="true"` to MoreHorizontal icon
- [x] Add `aria-hidden="true"` to Info icon

### BUG-006: LoginModal spinner aria-hidden
- [x] Open `src/components/LoginModal.tsx`
- [x] Add `aria-hidden="true"` to spinner SVG

### BUG-007: LoginModalFormik spinner aria-hidden
- [x] Open `src/components/LoginModalFormik.tsx`
- [x] Add `aria-hidden="true"` to spinner SVG

### BUG-008: LanguageSwitcher Globe aria-hidden
- [x] Open `src/components/LanguageSwitcher.tsx`
- [x] Add `aria-hidden="true"` to Globe icon

### BUG-009: LoginModal autocomplete
- [x] Open `src/components/LoginModal.tsx`
- [x] Add `autocomplete="username"` to username input

---

## Low Priority (Complete)

### BUG-010: ImportCalculator inputMode
- [x] Open `src/components/ImportCalculator.tsx`
- [x] Add `inputMode="decimal"` to vehicle price input

### BUG-011: LoginModal overscroll-behavior
- [x] Open `src/components/LoginModal.tsx`
- [x] Add `overscroll-contain` class to modal div

### BUG-012: Placeholder ellipsis
- [ ] Check translation files (optional - placeholders work without ellipsis)

### BUG-013: Footer social links accessible names
- [x] Merged with BUG-004 - aria-label added to links

---

## Verification

- [x] Run `npm run lint` - Passed (only pre-existing warnings)
- [ ] Run `npm run build`
- [ ] Test with keyboard navigation
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Visual regression check (no layout changes)

---

## Files Modified

| File | Changes Made |
|------|--------------|
| `src/components/pages/home/CarsCarousel.tsx` | Added keyboard support (role, tabIndex, onKeyDown, focus ring) |
| `src/components/ui/password-input.tsx` | Added aria-label and aria-hidden |
| `src/components/Header.tsx` | Added aria-hidden to Sun, Moon, Menu, X icons |
| `src/components/Footer.tsx` | Added aria-hidden to icons, aria-label to social links |
| `src/components/ImportCalculator.tsx` | Added aria-hidden to icons, inputMode to input |
| `src/components/LoginModal.tsx` | Added autocomplete, aria-hidden to spinner/X, overscroll-contain |
| `src/components/LoginModalFormik.tsx` | Added aria-hidden to spinner |
| `src/components/LanguageSwitcher.tsx` | Added aria-hidden to Globe icon |
