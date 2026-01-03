"use client";

import { useMemo, useState } from "react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoUploadGrid } from "@/components/admin/modals/PhotoUploadGrid";
import { usePhotoUploads } from "@/hooks/admin/usePhotoUploads";

type AddCarModalProps = {
  open: boolean;
  onOpenChange: ({ open }: { open: boolean }) => void;
};

export const AddCarModal = ({ open, onOpenChange }: AddCarModalProps) => {
  const { previews, setFileAt, clearAll } = usePhotoUploads({ maxFiles: 2 });

  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [status, setStatus] = useState<"Active" | "Draft" | "Pending Review">(
    "Pending Review",
  );

  const isSubmitEnabled = useMemo(() => {
    return model.trim().length > 0 && year.trim().length > 0 && priceUsd.trim().length > 0;
  }, [model, priceUsd, year]);

  const close = () => {
    onOpenChange({ open: false });
  };

  const onSubmit = () => {
    // Visual-only: no backend.
    close();
    clearAll();
    setModel("");
    setYear("");
    setPriceUsd("");
    setStatus("Pending Review");
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="sm:max-w-[720px] rounded-2xl border-gray-200 p-0 dark:border-white/10 dark:bg-[#0b0f14]">
        <div className="px-7 py-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-gray-900 dark:text-white">
              Add Car
            </DialogTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Focused modal: upload two photos and enter the essentials.
            </p>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            <PhotoUploadGrid
              label="Car Photos"
              maxFiles={2}
              previews={previews}
              onPickFile={setFileAt}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">Model</Label>
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Mercedes-Benz S-Class"
                  className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">Year</Label>
                <Input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  inputMode="numeric"
                  placeholder="2024"
                  className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">Price (USD)</Label>
                <Input
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(e.target.value)}
                  inputMode="numeric"
                  placeholder="189500"
                  className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">Status</Label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "Active" | "Draft" | "Pending Review")
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                >
                  <option value="Pending Review">Pending Review</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-7 py-5 dark:border-white/10">
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white dark:hover:bg-white/5"
              onClick={close}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-60"
              disabled={!isSubmitEnabled}
              onClick={onSubmit}
            >
              Submit
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};


