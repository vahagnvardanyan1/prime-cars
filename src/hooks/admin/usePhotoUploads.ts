"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// MIME types of the formats the admin photo flow accepts. Pinned to the four
// the backend image pipeline supports — anything else is silently rejected at
// the hook boundary and surfaced via `invalidFiles` for the consumer to render.
export const ALLOWED_PHOTO_TYPES = [
  "image/jpeg", // covers .jpg and .jpeg
  "image/png",
  "image/webp",
] as const;

const isAllowedPhoto = (file: File, allowedTypes: readonly string[]): boolean =>
  allowedTypes.includes(file.type);

type UsePhotoUploadsArgs = {
  maxFiles?: number;
  initialSlots?: number;
  allowedTypes?: readonly string[];
};

export const usePhotoUploads = ({
  maxFiles,
  initialSlots = 1,
  allowedTypes = ALLOWED_PHOTO_TYPES,
}: UsePhotoUploadsArgs) => {
  // Use lazy state initialization to avoid creating arrays on every render
  const [files, setFiles] = useState<(File | null)[]>(() =>
    Array.from({ length: initialSlots }, () => null)
  );

  // Store preview URLs separately with a ref to track which files they belong to
  const [previews, setPreviews] = useState<(string | null)[]>(() =>
    Array.from({ length: initialSlots }, () => null)
  );
  const fileToUrlMap = useRef<Map<File, string>>(new Map());

  // Files the user attempted to add but were rejected because their MIME type
  // is not in `allowedTypes`. Consumers render an inline error from this.
  const [invalidFiles, setInvalidFiles] = useState<File[]>([]);

  // Update previews only when files actually change
  useEffect(() => {
    const newPreviews = files.map((file) => {
      if (!file) return null;
      
      // Reuse existing URL if we already have one for this file
      if (fileToUrlMap.current.has(file)) {
        return fileToUrlMap.current.get(file)!;
      }
      
      // Create new URL only for new files
      const url = URL.createObjectURL(file);
      fileToUrlMap.current.set(file, url);
      return url;
    });
    
    // Revoke URLs for files that are no longer in the list
    const currentFiles = new Set(files.filter((f): f is File => f !== null));
    for (const [file, url] of fileToUrlMap.current.entries()) {
      if (!currentFiles.has(file)) {
        URL.revokeObjectURL(url);
        fileToUrlMap.current.delete(file);
      }
    }
    
    setPreviews(newPreviews);
  }, [files]);

  // Cleanup all URLs on unmount
  useEffect(() => {
    // Capture ref value in effect to avoid stale ref in cleanup
    const urlMap = fileToUrlMap.current;
    return () => {
      for (const url of urlMap.values()) {
        URL.revokeObjectURL(url);
      }
      urlMap.clear();
    };
  }, []);

  const setFileAt = useCallback(({ index, file }: { index: number; file: File | null }) => {
    if (file && !isAllowedPhoto(file, allowedTypes)) {
      setInvalidFiles([file]);
      return;
    }
    setInvalidFiles([]);
    setFiles((prev) => {
      const updated = prev.map((p, i) => (i === index ? file : p));

      // If we're setting a file at the last index and it's not null,
      // and we haven't reached maxFiles limit, add a new empty slot
      if (file && index === prev.length - 1 && (!maxFiles || prev.length < maxFiles)) {
        return [...updated, null];
      }

      return updated;
    });
  }, [maxFiles, allowedTypes]);

  const removeFileAt = useCallback(({ index }: { index: number }) => {
    setFiles((prev) => {
      // If there's only one slot, just clear it
      if (prev.length === 1) {
        return [null];
      }
      
      // Remove the file at the index
      const filtered = prev.filter((_, i) => i !== index);
      
      // If all remaining slots are empty, keep at least one empty slot
      if (filtered.every(f => f === null)) {
        return [null];
      }
      
      return filtered;
    });
  }, []);

  const clearAll = useCallback(() => {
    setFiles(Array.from({ length: initialSlots }, () => null));
    setInvalidFiles([]);
  }, [initialSlots]);

  const clearInvalidFiles = useCallback(() => {
    setInvalidFiles([]);
  }, []);

  const addMultipleFiles = useCallback((incoming: File[]) => {
    const allowed = incoming.filter((file) => isAllowedPhoto(file, allowedTypes));
    const rejected = incoming.filter((file) => !isAllowedPhoto(file, allowedTypes));

    if (rejected.length > 0) {
      setInvalidFiles(rejected);
    } else if (allowed.length > 0) {
      setInvalidFiles([]);
    }

    if (allowed.length === 0) return;

    setFiles((prev) => {
      // Find the first empty slot index
      const firstEmptyIndex = prev.findIndex(f => f === null);
      
      if (firstEmptyIndex === -1) {
        // No empty slots, append all new files
        const allFiles = [...prev.filter(f => f !== null), ...allowed];
        // Respect maxFiles limit
        const limitedFiles = maxFiles ? allFiles.slice(0, maxFiles) : allFiles;
        // Add one empty slot at the end if under the limit
        if (!maxFiles || limitedFiles.length < maxFiles) {
          return [...limitedFiles, null];
        }
        return limitedFiles;
      }
      
      // Fill empty slots with new files
      const updated = [...prev];
      let fileIndex = 0;
      
      for (let i = firstEmptyIndex; i < updated.length && fileIndex < allowed.length; i++) {
        if (updated[i] === null) {
          updated[i] = allowed[fileIndex];
          fileIndex++;
        }
      }
      
      // Add remaining files if any
      while (fileIndex < allowed.length) {
        if (!maxFiles || updated.length < maxFiles) {
          updated.push(allowed[fileIndex]);
          fileIndex++;
        } else {
          break;
        }
      }
      
      // Add one empty slot at the end if under the limit
      if (!maxFiles || updated.length < maxFiles) {
        return [...updated, null];
      }
      
      return updated;
    });
  }, [maxFiles, allowedTypes]);

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      // Don't reorder if one of the indices is out of bounds
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
        return prev;
      }
      
      // Don't reorder if either index points to null (empty slot)
      if (prev[fromIndex] === null || prev[toIndex] === null) {
        return prev;
      }
      
      const updated = [...prev];
      const [movedFile] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedFile);
      return updated;
    });
  }, []);

  return {
    files,
    previews,
    setFileAt,
    removeFileAt,
    clearAll,
    addMultipleFiles,
    reorderFiles,
    invalidFiles,
    clearInvalidFiles,
  };
};





