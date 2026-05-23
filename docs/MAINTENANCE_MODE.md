# Maintenance Mode Guide

This guide explains how to enable and disable maintenance mode for the Prime Cars website.

## Quick Start

### Method 1: Using the Configuration File (Recommended for Development)

#### Enable Maintenance Mode

1. Open `/src/lib/maintenance.ts`
2. Change `DEFAULT_MAINTENANCE_MODE` from `false` to `true`:

```typescript
const DEFAULT_MAINTENANCE_MODE = true;
```

3. Save the file
4. The website will now show the maintenance page to all visitors

#### Disable Maintenance Mode

1. Open `/src/lib/maintenance.ts`
2. Change `DEFAULT_MAINTENANCE_MODE` from `true` to `false`:

```typescript
const DEFAULT_MAINTENANCE_MODE = false;
```

3. Save the file
4. The website will return to normal operation

### Method 2: Using Environment Variables (Recommended for Production)

#### Enable Maintenance Mode

1. Create or edit your `.env.local` file in the project root
2. Add or update:

```env
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_MAINTENANCE_ESTIMATED_TIME="2 hours"
NEXT_PUBLIC_MAINTENANCE_CONTACT_EMAIL="support@primecars.com"
```

3. Restart your development server or redeploy
4. The website will show the maintenance page

#### Disable Maintenance Mode

1. Edit your `.env.local` file
2. Change to:

```env
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

3. Restart your development server or redeploy
4. The website will return to normal

**Note:** Environment variables override the configuration file setting.

## Features

### ✨ What Happens in Maintenance Mode

- All visitors see a beautiful maintenance page
- The page shows:
  - Clear "Under Maintenance" message
  - Estimated time for completion
  - Contact email for support
  - Animated loading indicators
  - Full dark/light mode support

### 🎨 Customization

#### Option 1: Environment Variables (Recommended)

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_MAINTENANCE_ESTIMATED_TIME="2 hours"
NEXT_PUBLIC_MAINTENANCE_CONTACT_EMAIL="your@email.com"
```

#### Option 2: Code Changes

Edit the values in `/src/app/[locale]/layout.tsx`:

```typescript
<MaintenancePage 
  estimatedTime="2 hours"           // Change estimated completion time
  contactEmail="your@email.com"     // Change contact email
/>
```

### 🔐 IP Whitelist (Optional)

If you need to test the website while in maintenance mode, you can whitelist specific IP addresses.

1. Open `/src/lib/maintenance.ts`
2. Add IPs to the whitelist array:

```typescript
export const MAINTENANCE_WHITELIST_IPS: string[] = [
  '192.168.1.1',    // Your office IP
  '10.0.0.1',       // Your home IP
];
```

**Note:** IP whitelisting is configured but needs to be implemented in the layout if you want to use it. Add this check:

```typescript
// In layout.tsx
const clientIP = headers().get('x-forwarded-for') || headers().get('x-real-ip') || '';
if (isMaintenanceMode() && !isWhitelisted(clientIP)) {
  return <MaintenancePage ... />;
}
```

## Files Modified

- `/src/components/MaintenancePage.tsx` - The maintenance page component
- `/src/lib/maintenance.ts` - Maintenance mode configuration
- `/src/app/[locale]/layout.tsx` - Layout integration

## Use Cases

### Scheduled Maintenance
```typescript
// Before maintenance window
export const MAINTENANCE_MODE = false;

// During maintenance
export const MAINTENANCE_MODE = true;

// After maintenance
export const MAINTENANCE_MODE = false;
```

### Emergency Updates
```typescript
// Immediately enable maintenance mode
export const MAINTENANCE_MODE = true;
```

### Testing
```typescript
// Enable maintenance mode
export const MAINTENANCE_MODE = true;

// Add your IP to whitelist for testing
export const MAINTENANCE_WHITELIST_IPS: string[] = ['your.ip.address'];
```

## Design

The maintenance page includes:
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Animated wrench icon
- Information cards for estimated time and contact
- Status message
- Loading animation

## Support

If you need help with maintenance mode, contact the development team.
