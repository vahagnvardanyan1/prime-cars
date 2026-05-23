# Download Car Images Feature

This guide explains how to use the download car images functionality.

## Installation

First, install the required dependency:

```bash
npm install jszip
```

## Usage

### Option 1: Use the Ready-Made Button Component

The easiest way is to use the `DownloadImagesButton` component:

```tsx
import { DownloadImagesButton } from "@/components/ui/DownloadImagesButton";

// In your component
<DownloadImagesButton
  images={car.photos}
  carName={`${car.brand} ${car.model} ${car.year}`}
  variant="outline"
  size="default"
  useZip={true} // Downloads as ZIP file (recommended)
/>
```

### Option 2: Use the Utility Functions Directly

If you need more control, use the utility functions directly:

```tsx
import { downloadCarImages, downloadCarImagesAsZip } from "@/lib/utils/downloadImages";
import { toast } from "sonner";

// Download as individual files
const handleDownloadIndividual = async () => {
  const result = await downloadCarImages({
    images: car.photos,
    carName: `${car.brand} ${car.model}`,
  });
  
  if (result.success) {
    toast.success(`Downloaded ${result.downloadedCount} images`);
  }
};

// Download as ZIP file (recommended for multiple images)
const handleDownloadZip = async () => {
  const result = await downloadCarImagesAsZip({
    images: car.photos,
    carName: `${car.brand} ${car.model}`,
  });
  
  if (result.success) {
    toast.success("Images downloaded as ZIP");
  }
};
```

## Examples

### Admin Panel - Available Cars View

```tsx
import { DownloadImagesButton } from "@/components/ui/DownloadImagesButton";

// In your admin car details or table
<DownloadImagesButton
  images={car.photos}
  carName={car.model}
  variant="outline"
  size="sm"
/>
```

### Car Details Page

```tsx
import { DownloadImagesButton } from "@/components/ui/DownloadImagesButton";

// In car details page
<div className="flex gap-2">
  <Button>Contact Dealer</Button>
  <DownloadImagesButton
    images={car.photos}
    carName={`${car.brand} ${car.model} ${car.year}`}
    variant="ghost"
  />
</div>
```

## Component Props

### DownloadImagesButton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `string[]` | required | Array of image URLs to download |
| `carName` | `string` | required | Name of the car (used for filename) |
| `variant` | `"default" \| "outline" \| "ghost"` | `"outline"` | Button style variant |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | Button size |
| `useZip` | `boolean` | `true` | Download as ZIP file (recommended for 2+ images) |
| `className` | `string` | - | Additional CSS classes |

## Features

- ✅ Downloads all car images
- ✅ ZIP file download option (for CORS-enabled images)
- ✅ Individual file download (works without CORS issues)
- ✅ Automatic filename sanitization
- ✅ Loading states
- ✅ Error handling with toast notifications
- ✅ Multilingual support (EN, HY, RU)
- ✅ Progress feedback

## CORS Considerations

### Why CORS Matters

When downloading images, browsers enforce CORS (Cross-Origin Resource Sharing) policies. If your images are hosted on a different domain (like AWS S3, Cloudinary, etc.) that doesn't allow CORS requests, you may encounter errors.

### Solutions Implemented

1. **Individual Downloads (Recommended - No CORS Issues)**
   - Uses direct download links via `<a>` tag with `download` attribute
   - Bypasses CORS restrictions
   - Works with any image URL
   - Default method: `useZip={false}`

2. **ZIP Downloads (Requires CORS)**
   - Bundles all images into a single ZIP file
   - Requires images to be CORS-enabled
   - Falls back gracefully with error message
   - Use: `useZip={true}`

### Enabling CORS on Your Image Server

If you want to enable ZIP downloads, configure your image server:

**AWS S3 CORS Configuration:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

**Cloudinary:**
- CORS is enabled by default for authenticated requests

## Notes

- **Individual download** is the default and recommended method (no CORS issues)
- **ZIP download** only works if images are CORS-enabled
- Filenames are automatically sanitized (special characters removed)
- File extensions are preserved from original URLs
- Works in both admin panel and public pages
- Downloads happen sequentially with a small delay to avoid browser blocking
