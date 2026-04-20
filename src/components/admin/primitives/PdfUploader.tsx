"use client";

import { useCallback, useState } from "react";

import { Upload, X, FileText, ExternalLink, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type PdfUploaderProps = {
  onFileSelect: (file: File | null) => void;
  currentFileName?: string;
  disabled?: boolean;
  translations?: {
    label: string;
    dragDrop: string;
    dropHere: string;
    clickToBrowse: string;
    maxSize: string;
    onlyPdfAllowed: string;
    fileSizeLimit: string;
    currentInvoice?: string;
    viewInvoice?: string;
    updateInvoice?: string;
    newFile?: string;
    willReplaceCurrent?: string;
    cancelUpdate?: string;
  };
};

// Extract filename from URL or path
const getDisplayName = (fileNameOrUrl: string): string => {
  if (!fileNameOrUrl) return "";
  
  // If it's a URL, extract the filename
  try {
    const url = new URL(fileNameOrUrl);
    const pathname = url.pathname;
    const filename = pathname.split('/').pop() || fileNameOrUrl;
    // Decode URL-encoded characters and return
    return decodeURIComponent(filename);
  } catch {
    // Not a valid URL, just return the filename or last part of path
    return fileNameOrUrl.split('/').pop() || fileNameOrUrl;
  }
};

export const PdfUploader = ({ 
  onFileSelect, 
  currentFileName, 
  disabled = false,
  translations = {
    label: "Invoice (PDF)",
    dragDrop: "Drag and drop your invoice",
    dropHere: "Drop the PDF file here",
    clickToBrowse: "or click to browse",
    maxSize: "PDF only, max 10MB",
    onlyPdfAllowed: "Only PDF files are allowed",
    fileSizeLimit: "File size must be less than 10MB",
    currentInvoice: "Current invoice",
    viewInvoice: "View",
    updateInvoice: "Update",
    newFile: "New file",
    willReplaceCurrent: "Will replace current",
    cancelUpdate: "Cancel update"
  }
}: PdfUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [showUploadNew, setShowUploadNew] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    setError("");

    if (file.type !== "application/pdf") {
      setError(translations.onlyPdfAllowed);
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError(translations.fileSizeLimit);
      return false;
    }

    return true;
  }, [translations.onlyPdfAllowed, translations.fileSizeLimit]);

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect, validateFile]);

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
    setShowUploadNew(false);
  };

  const handleUpdateClick = () => {
    setShowUploadNew(true);
  };

  const handleCancelUpdate = () => {
    setShowUploadNew(false);
    setSelectedFile(null);
    onFileSelect(null);
  };

  const existingFileName = currentFileName ? getDisplayName(currentFileName) : "";
  const hasExistingFile = !!currentFileName;
  const hasNewFile = selectedFile !== null;

  return (
    <div className="space-y-2">
      <Label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
        {translations.label}
      </Label>
      
      {/* Show existing file with View/Update options */}
      {hasExistingFile && !showUploadNew && !hasNewFile ? (
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#161b22] border border-gray-300 dark:border-white/10 rounded-lg">
          <FileText className="h-6 w-6 text-[#429de6] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={existingFileName}>
              {existingFileName.length > 30 ? `${existingFileName.slice(0, 27)}...` : existingFileName}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              {translations.currentInvoice}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={currentFileName}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#429de6] hover:text-[#3a8acc] bg-[#429de6]/10 hover:bg-[#429de6]/20 rounded-md transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {translations.viewInvoice}
            </a>
            {!disabled && (
              <button
                type="button"
                onClick={handleUpdateClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 rounded-md transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {translations.updateInvoice}
              </button>
            )}
          </div>
        </div>
      ) : hasNewFile ? (
        /* Show newly selected file */
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#161b22] border border-green-300 dark:border-green-800/50 rounded-lg">
          <FileText className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={selectedFile.name}>
              {selectedFile.name.length > 30 ? `${selectedFile.name.slice(0, 27)}...` : selectedFile.name}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              {hasExistingFile ? `${translations.willReplaceCurrent} • ` : `${translations.newFile} • `}{(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={hasExistingFile ? handleCancelUpdate : handleRemove}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-white/60 dark:hover:text-white/80 flex-shrink-0"
              title={hasExistingFile ? "Cancel update" : "Remove file"}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Cancel button when updating existing file */}
          {hasExistingFile && showUploadNew && !disabled && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCancelUpdate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                {translations.cancelUpdate}
              </button>
            </div>
          )}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-4 sm:p-6 transition-all duration-200
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
              <div className="mb-3 p-2.5 rounded-full bg-gray-100 dark:bg-white/5">
                <Upload className="h-5 w-5 text-gray-600 dark:text-white/60" />
              </div>
              
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {isDragging ? translations.dropHere : translations.dragDrop}
              </p>
              
              <p className="text-xs text-gray-500 dark:text-white/60 mb-2">
                {translations.clickToBrowse}
              </p>
              
              <p className="text-xs text-gray-400 dark:text-white/40">
                {translations.maxSize}
              </p>
            </div>
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
