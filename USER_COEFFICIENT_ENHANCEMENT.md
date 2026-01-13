# User Coefficient Enhancement - Implementation Summary

## Overview
Enhanced the User Coefficient management system to support negative values and fetch user-specific adjustment amounts from the backend. The eye icon displays the adjustment amount inline when clicked.

## Changes Implemented

### 1. **Negative Coefficient Support**

#### Component: `UserCoefficientRow.tsx`
- Updated `handleCoefficientChange` to accept negative numbers
- Added handling for standalone minus sign (`"-"`)
- Changed regex from `/^\d*$/` to `/^-?\d*$/` to allow negative integers
- Updated `canApply` validation to remove `num >= 0` constraint
- Added checks to prevent applying when value is just a minus sign

#### Localization Updates (All 3 languages)
- **English**: Updated `coefficientPlaceholder` to `"+/- 100"` and added description about supporting negative values
- **Armenian**: Changed placeholder and description to indicate support for negative values
- **Russian**: Updated with equivalent translations for negative value support

---

### 2. **Backend Integration for User Adjustment Amount**

#### New File: `fetchUserPrices.ts`
**Location**: `src/lib/admin/fetchUserPrices.ts`

**Purpose**: Fetch user-specific adjustment amount from backend

**API Endpoint**: `GET /shippings/admin/user-adjustments/{userId}?category={category}`

**Request Parameters**:
- `userId` (required): User's unique identifier
- `category` (optional): Auction category (IAAI, COPART, MANHEIM)

**Response Type**:
```typescript
{
  status: "success";
  data: [{
    id: string;
    category: string;
    adjustment_amount: number;
    last_adjustment_amount?: number;
    last_adjustment_date?: string;
  }]
}
```

**UserAdjustment Type**:
```typescript
{
  id: string;
  category: string;
  adjustment_amount: number;
  last_adjustment_amount?: number;
  last_adjustment_date?: string;
}
```

---

### 3. **Enhanced UserCoefficientRow Component**

#### Updated: `UserCoefficientRow.tsx`

**New Imports**:
- `Eye` icon from `lucide-react`
- `fetchUserAdjustment` function and `UserAdjustment` type

**New State Variables**:
```typescript
const [userAdjustment, setUserAdjustment] = useState<UserAdjustment | undefined>(undefined);
const [isLoadingAdjustment, setIsLoadingAdjustment] = useState(false);
const [showAdjustmentAmount, setShowAdjustmentAmount] = useState(false);
```

**New `useEffect` Hook**:
- Automatically fetches user-specific adjustment when auction selection changes
- Updates coefficient field with fetched adjustment_amount if not manually changed
- Clears data when auction is set to "none"

**New Eye Icon Button**:
- Only visible when auction is selected and adjustment exists
- Shows loading spinner while fetching adjustment
- Toggles display of adjustment amount inline
- Shows adjustment amount with +/- prefix next to the eye icon when clicked

---

### 4. **Localization Changes**

**Removed** modal-specific translations from all three languages:
- Removed `viewPrices` key
- Removed entire `viewUserPrices` object with modal-specific strings

The adjustment amount is displayed inline without text, so no additional translations are needed.

---

## User Flow

### 1. **Entering Negative Coefficients**
1. Admin navigates to Settings > User Coefficients tab
2. Selects a user row
3. Types negative value in coefficient field (e.g., `-50`)
4. Selects auction category
5. Clicks "Update Coefficient" to apply

### 2. **Viewing User Adjustment Amount**
1. Admin selects an auction from dropdown for a user
2. System automatically fetches user-specific adjustment from backend
3. Eye icon appears next to auction dropdown (only if adjustment exists)
4. Admin clicks eye icon
5. Adjustment amount displays inline next to the icon with +/- prefix

### 3. **Automatic Data Refresh**
- When auction selection changes, system automatically:
  - Fetches adjustment amount for selected auction
  - Updates coefficient field with adjustment_amount if available
  - Shows loading state during fetch
  - Displays eye icon only when adjustment data exists

---

## Technical Details

### API Integration
**Endpoint**: `/shippings/admin/user-adjustments/{userId}`
**Query Parameter**: `category` (optional)
**Authentication**: Uses `authenticatedFetch` with JWT token
**Error Handling**: Graceful error handling with console logging

### State Management
- Local component state for adjustment visibility toggle
- Fetched adjustment stored in component state
- Loading states for better UX
- Automatic data refresh on auction change

### Performance Considerations
- Prices fetched only when auction is selected (not "none")
- Loading spinners prevent multiple simultaneous requests
- Data cleared when auction deselected
- Efficient re-renders with `useMemo` and `useEffect`

---

## Files Created
1. `/src/lib/admin/fetchUserPrices.ts` - Backend API integration for user adjustments

## Files Modified
1. `/src/components/admin/primitives/UserCoefficientRow.tsx` - Main component with inline adjustment display
2. `/src/messages/en.json` - Removed modal translations
3. `/src/messages/hy.json` - Removed modal translations
4. `/src/messages/ru.json` - Removed modal translations

## Files Deleted
1. `/src/components/admin/modals/ViewUserPricesModal.tsx` - Modal component removed

---

## Testing Checklist

### Negative Coefficient Testing
- ✅ Can enter negative numbers (e.g., -100, -50)
- ✅ Cannot submit just "-" without number
- ✅ Validation prevents incomplete values
- ✅ Placeholder shows "+/- 100" to indicate support

### Backend Integration Testing
- ✅ Adjustment fetches when auction selected
- ✅ Loading state shows during fetch
- ✅ Coefficient auto-fills with adjustment_amount from backend
- ✅ Error handling for failed requests
- ✅ Data clears when auction deselected

### Eye Icon & Inline Display Testing
- ✅ Eye icon visible only when auction selected AND adjustment exists
- ✅ Eye icon shows loading spinner during fetch
- ✅ Clicking eye icon toggles adjustment amount display
- ✅ Adjustment amount shows with +/- prefix
- ✅ Amount displays inline next to eye icon
- ✅ Eye icon hidden when no adjustment data available

### Localization Testing
- ✅ All necessary strings remain in translations
- ✅ Removed modal-specific translations from all languages

---

## Future Enhancements
1. Add last adjustment history display
2. Add export functionality for user adjustment reports
3. Add adjustment audit log with timestamps
4. Add bulk adjustments for multiple users
5. Add comparison view between users' adjustments

---

## Notes for Backend Team
- Ensure `/shippings/admin/user-adjustments/{userId}` endpoint returns adjustment data filtered by category
- Response format:
  ```json
  {
    "status": "success",
    "data": [{
      "id": "string",
      "category": "copart|iaai|manheim",
      "adjustment_amount": number,
      "last_adjustment_amount": number (optional),
      "last_adjustment_date": "ISO date string" (optional)
    }]
  }
  ```
- Return empty array in `data` when user has no adjustments
- Frontend uses the first item from the `data` array
- The `adjustment_amount` can be positive or negative
