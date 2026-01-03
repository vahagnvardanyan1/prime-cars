"use client";

import { useEffect, useMemo, useState } from "react";

type UsePhotoUploadsArgs = {
  maxFiles: number;
};

export const usePhotoUploads = ({ maxFiles }: UsePhotoUploadsArgs) => {
  const [files, setFiles] = useState<(File | null)[]>(
    Array.from({ length: maxFiles }).map(() => null),
  );

  const previews = useMemo(() => {
    return files.map((file) => (file ? URL.createObjectURL(file) : null));
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const setFileAt = ({ index, file }: { index: number; file: File | null }) => {
    setFiles((prev) => prev.map((p, i) => (i === index ? file : p)));
  };

  const clearAll = () => {
    setFiles(Array.from({ length: maxFiles }).map(() => null));
  };

  return { files, previews, setFileAt, clearAll };
};


