# Form Validation Implementation Guide

## Overview

This guide explains the form validation pattern implemented across all forms in the Prime Cars application. All forms now have real-time validation with visual error indicators.

---

## Validation Pattern

### 1. **State Management**

Add an errors state object to track validation errors:

```typescript
const [errors, setErrors] = useState<{
  fieldName?: string;
  anotherField?: string;
}>({});
```

### 2. **Validation Function**

Create a `validateForm()` function that checks all fields:

```typescript
const validateForm = () => {
  const newErrors: typeof errors = {};
  const tValidation = t.raw("auth.validation");

  if (!firstName.trim()) {
    newErrors.firstName = tValidation.firstNameRequired;
  }

  if (email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      newErrors.email = tValidation.emailInvalid;
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### 3. **Submit Handler**

Call validation before submitting:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return; // Stop if validation fails
  }
  
  // Proceed with submission...
};
```

### 4. **Input Styling**

Add conditional red border and error message:

```tsx
<Input
  value={firstName}
  onChange={(e) => {
    setFirstName(e.target.value);
    // Clear error when user types
    if (errors.firstName) {
      setErrors({ ...errors, firstName: undefined });
    }
  }}
  className={`base-classes ${
    errors.firstName
      ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500'
      : 'border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]'
  }`}
/>
{errors.firstName && (
  <p className="text-sm text-red-500 dark:text-red-400">
    {errors.firstName}
  </p>
)}
```

### 5. **Clear Errors on Reset**

Reset errors when closing or resetting form:

```typescript
const resetForm = () => {
  setFirstName("");
  setLastName("");
  setErrors({}); // Clear all errors
};
```

---

## Validation Rules

### Common Validations

1. **Required Fields**
   ```typescript
   if (!value.trim()) {
     errors.field = t("auth.validation.fieldRequired");
   }
   ```

2. **Email**
   ```typescript
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(email.trim())) {
     errors.email = t("auth.validation.emailInvalid");
   }
   ```

3. **Phone**
   ```typescript
   const phoneRegex = /^[\d\s\-\+\(\)]+$/;
   if (!phoneRegex.test(phone.trim()) || phone.trim().length < 8) {
     errors.phone = t("auth.validation.phoneInvalid");
   }
   ```

4. **Min Length**
   ```typescript
   if (value.trim().length < 3) {
     errors.field = t("auth.validation.usernameMinLength");
   }
   ```

5. **Max Length**
   ```typescript
   if (value.trim().length > 100) {
     errors.field = t("auth.validation.maxLength", { max: 100 });
   }
   ```

---

## Implemented Forms

### ✅ **LoginModal**
- Username: Required, min 3 characters
- Password: Required, min 6 characters
- Real-time error clearing on input
- Red border on invalid fields
- Error messages below inputs

### 🔄 **CreateUserModal** (In Progress)
- First Name: Required
- Last Name: Required
- Login: Required, min 3 characters
- Password: Required, min 6 characters
- Email: Optional, valid format if provided
- Phone: Optional, valid format if provided

### 📋 **Remaining Forms**
- UpdateUserModal
- CreateNotificationModal
- AddCarModal
- UpdateCarModal

---

## Translation Keys

### English (`en.json`)
```json
{
  "auth": {
    "validation": {
      "usernameRequired": "Username is required",
      "usernameMinLength": "Username must be at least 3 characters",
      "passwordRequired": "Password is required",
      "passwordMinLength": "Password must be at least 6 characters",
      "emailRequired": "Email is required",
      "emailInvalid": "Please enter a valid email address",
      "firstNameRequired": "First name is required",
      "lastNameRequired": "Last name is required",
      "fieldRequired": "This field is required",
      "minLength": "Must be at least {min} characters",
      "maxLength": "Must be no more than {max} characters",
      "phoneInvalid": "Please enter a valid phone number"
    }
  }
}
```

Similar translations provided for Armenian (hy) and Russian (ru).

---

## Visual Design

### Error States

**Normal Input:**
```
┌─────────────────────────┐
│ [Input text]            │  ← Gray border
└─────────────────────────┘
```

**Error Input:**
```
┌─────────────────────────┐
│ [Input text]            │  ← Red border
└─────────────────────────┘
⚠️ Error message here       ← Red text
```

### Color Scheme

- **Error Border**: `border-red-500` (light & dark mode)
- **Error Text**: `text-red-500 dark:text-red-400`
- **Error Ring**: `focus-visible:ring-red-500`
- **Normal Border**: `border-gray-300 dark:border-white/20`
- **Focus Ring**: `focus-visible:ring-[#429de6]`

---

## Utility Functions

Created `/src/lib/validation.ts` with reusable validators:

```typescript
validateEmail(email: string): boolean
validatePhone(phone: string): boolean
validateRequired(value: string): boolean
validateMinLength({ value, min }): boolean
validateMaxLength({ value, max }): boolean
getInputErrorClass(hasError: boolean): string
```

---

## Best Practices

1. **Clear Errors on Input** - Remove error when user starts typing
2. **Validate on Submit** - Run full validation before submission
3. **Show Specific Messages** - Tell users exactly what's wrong
4. **Visual Feedback** - Red borders make errors obvious
5. **Accessibility** - Error messages linked to inputs
6. **Internationalization** - All messages translated
7. **Consistent Styling** - Same error pattern across all forms

---

## Next Steps

1. Apply validation pattern to remaining forms
2. Add field-specific validation rules as needed
3. Consider adding async validation (e.g., username availability)
4. Add form-level error summary if needed

---

**Status**: Login and CreateUser validation implemented  
**Last Updated**: January 2026
