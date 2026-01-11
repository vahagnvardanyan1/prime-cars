import { API_BASE_URL } from "@/i18n/config";

/**
 * Download a single image from URL using the /files proxy endpoint
 */
const downloadImage = async (url: string, filename: string): Promise<void> => {
  try {
    console.log(url, 'url');
    
    // Use /files endpoint to proxy the image and avoid CORS issues
    const proxyUrl = `${API_BASE_URL}/files?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, {
      mode: 'cors',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error(`Failed to download image: ${filename}`, error);
    throw error;
  }
};

/**
 * Download all images of a car
 * @param images - Array of image URLs
 * @param carName - Name of the car (used for filename prefix)
 * @returns Promise that resolves when all downloads are complete
 */
export const downloadCarImages = async ({
  images,
  carName,
}: {
  images: string[];
  carName: string;
}): Promise<{ success: boolean; downloadedCount: number; failedCount: number }> => {
  if (!images || images.length === 0) {
    return { success: false, downloadedCount: 0, failedCount: 0 };
  }
  console.log(images, 'images');

  // Sanitize car name for filename
  const sanitizedCarName = carName
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase();

  let downloadedCount = 0;
  let failedCount = 0;

  // Download images with a small delay between each to avoid overwhelming the browser
  for (let i = 0; i < images.length; i++) {
    const imageUrl = images[i];
    const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
    const filename = `${sanitizedCarName}_photo_${i + 1}.${extension}`;

    try {
      await downloadImage(imageUrl, filename);
      downloadedCount++;
      
      // Add a small delay between downloads to avoid browser blocking
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error(`Failed to download image ${i + 1}:`, error);
      failedCount++;
    }
  }

  return {
    success: failedCount === 0,
    downloadedCount,
    failedCount,
  };
};

/**
 * Download all images of a car as a ZIP file (requires JSZip library)
 * This is an alternative method that downloads all images as a single ZIP
 * Will download successfully fetched images even if some fail
 */
export const downloadCarImagesAsZip = async ({
  images,
  carName,
}: {
  images: string[];
  carName: string;
}): Promise<{ success: boolean; error?: string }> => {
  if (!images || images.length === 0) {
    return { success: false, error: 'No images to download' };
  }
  console.log(images, 'images');
  
  try {
    // Dynamically import JSZip only when needed
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Sanitize car name for filename
    const sanitizedCarName = carName
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    // Track errors for detailed reporting
    const errors: string[] = [];
    
    // Fetch all images and add to ZIP - don't throw on individual failures
    const imagePromises = images.map(async (imageUrl, index) => {
      try {
        // Use /files endpoint to proxy the image and avoid CORS issues
        const proxyUrl = `${API_BASE_URL}/files?url=${encodeURIComponent(imageUrl)}`;
        debugger

        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          const errorMsg = `Image ${index + 1}: HTTP ${response.status} ${response.statusText}`;
          console.warn(errorMsg);
          errors.push(errorMsg);
          return false;
        }
        
        const blob = await response.blob();
        const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
        const filename = `photo_${index + 1}.${extension}`;
        zip.file(filename, blob);
        return true;
      } catch (error) {
        const errorMsg = `Image ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg, error);
        errors.push(errorMsg);
        return false;
      }
    });

    const results = await Promise.all(imagePromises);
    const successCount = results.filter(r => r).length;
    
    // If no images were successfully downloaded, fail with detailed errors
    if (successCount === 0) {
      const errorDetails = errors.length > 0 
        ? `Failed to download any images:\n${errors.join('\n')}` 
        : 'Failed to download any images. Please check CORS configuration.';
      return {
        success: false,
        error: errorDetails,
      };
    }

    // Generate ZIP file with successfully downloaded images
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Download ZIP file
    const blobUrl = window.URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${sanitizedCarName}_photos.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    // Return success with warning if some images failed
    if (successCount < images.length) {
      const errorDetails = errors.length > 0
        ? `Downloaded ${successCount} of ${images.length} images. Errors:\n${errors.join('\n')}`
        : `Downloaded ${successCount} of ${images.length} images`;
      return { 
        success: true, 
        error: errorDetails 
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Failed to create ZIP file: ${error.message}\nStack: ${error.stack || 'N/A'}`
      : `Failed to download images: ${String(error)}`;
    console.error('Failed to create ZIP file:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
};
