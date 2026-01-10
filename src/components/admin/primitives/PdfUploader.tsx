"use client";

import { useCallback, useState } from "react";

import { Upload, X, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type PdfUploaderProps = {
  onFileSelect: (file: File | null) => void;
  currentFileName?: string;
  disabled?: boolean;
};

export const PdfUploader = ({ onFileSelect, currentFileName, disabled = false }: PdfUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const validateFile = (file: File): boolean => {
    setError("");

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return false;
    }

    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError("");
    onFileSelect(null);
  };

  const displayFileName = selectedFile?.name || currentFileName;

  return (
    <div className="space-y-2">
      <Label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
        Invoice (PDF)
      </Label>
      
      {displayFileName ? (
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#161b22] border border-gray-300 dark:border-white/10 rounded-lg">
          <FileText className="h-8 w-8 text-[#429de6] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {displayFileName}
            </p>
            {selectedFile && (
              <p className="text-xs text-gray-500 dark:text-white/60 mt-1">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            )}
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-white/60 dark:hover:text-red-400 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 sm:p-8 transition-all duration-200
            ${isDragging 
              ? "border-[#429de6] bg-[#429de6]/5 dark:bg-[#429de6]/10" 
              : "border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInput}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id="invoice-upload"
          />
          
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 p-3 rounded-full bg-gray-100 dark:bg-white/5">
              <Upload className="h-6 w-6 text-gray-600 dark:text-white/60" />
            </div>
            
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {isDragging ? "Drop the PDF file here" : "Drag and drop your invoice"}
            </p>
            
            <p className="text-xs text-gray-500 dark:text-white/60 mb-3">
              or click to browse
            </p>
            
            <p className="text-xs text-gray-400 dark:text-white/40">
              PDF only, max 10MB
            </p>
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
          {error}
        </p>
      )}
    </div>
  );
};
