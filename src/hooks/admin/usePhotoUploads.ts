"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UsePhotoUploadsArgs = {
  maxFiles?: number;
  initialSlots?: number;
};

export const usePhotoUploads = ({ maxFiles, initialSlots = 1 }: UsePhotoUploadsArgs) => {
  const [files, setFiles] = useState<(File | null)[]>(
    Array.from({ length: initialSlots }).map(() => null),
  );
  
  // Store preview URLs separately with a ref to track which files they belong to
  const [previews, setPreviews] = useState<(string | null)[]>(
    Array.from({ length: initialSlots }).map(() => null)
  );
  const fileToUrlMap = useRef<Map<File, string>>(new Map());

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
    return () => {
      for (const url of fileToUrlMap.current.values()) {
        URL.revokeObjectURL(url);
      }
      fileToUrlMap.current.clear();
    };
  }, []);

  const setFileAt = useCallback(({ index, file }: { index: number; file: File | null }) => {
    setFiles((prev) => {
      const updated = prev.map((p, i) => (i === index ? file : p));
      
      // If we're setting a file at the last index and it's not null,
      // and we haven't reached maxFiles limit, add a new empty slot
      if (file && index === prev.length - 1 && (!maxFiles || prev.length < maxFiles)) {
        return [...updated, null];
      }
      
      return updated;
    });
  }, [maxFiles]);

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
    setFiles(Array.from({ length: initialSlots }).map(() => null));
  }, [initialSlots]);

  const addMultipleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => {
      // Find the first empty slot index
      const firstEmptyIndex = prev.findIndex(f => f === null);
      
      if (firstEmptyIndex === -1) {
        // No empty slots, append all new files
        const allFiles = [...prev.filter(f => f !== null), ...newFiles];
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
      
      for (let i = firstEmptyIndex; i < updated.length && fileIndex < newFiles.length; i++) {
        if (updated[i] === null) {
          updated[i] = newFiles[fileIndex];
          fileIndex++;
        }
      }
      
      // Add remaining files if any
      while (fileIndex < newFiles.length) {
        if (!maxFiles || updated.length < maxFiles) {
          updated.push(newFiles[fileIndex]);
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
  }, [maxFiles]);

  return { files, previews, setFileAt, removeFileAt, clearAll, addMultipleFiles };
};





