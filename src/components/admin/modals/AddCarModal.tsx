"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";

import type { AdminCar } from "@/lib/admin/types";
import { createAdminCar } from "@/lib/admin/createAdminCar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUploadGrid } from "@/components/admin/modals/PhotoUploadGrid";
import { useAddCarForm } from "@/hooks/admin/useAddCarForm";
import { usePhotoUploads } from "@/hooks/admin/usePhotoUploads";

type AddCarModalProps = {
  open: boolean;
  onOpenChange: ({ open }: { open: boolean }) => void;
  onCreateCar: ({ car }: { car: AdminCar }) => void;
};

type User = {
  id: string;
  name: string;
  email: string;
};

export const AddCarModal = ({ open, onOpenChange, onCreateCar }: AddCarModalProps) => {
  const t = useTranslations();
  const { previews, setFileAt, removeFileAt, clearAll } = usePhotoUploads({ initialSlots: 1 });
  const form = useAddCarForm();
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null);
  const [invoiceDragOver, setInvoiceDragOver] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users from backend (mock for now)
  useEffect(() => {
    if (open) {
      setLoadingUsers(true);
      // TODO: Replace with actual API call
      // Example: fetch('/api/users').then(res => res.json()).then(setUsers)
      setTimeout(() => {
        setUsers([
          { id: "1", name: "John Doe", email: "john@example.com" },
          { id: "2", name: "Jane Smith", email: "jane@example.com" },
          { id: "3", name: "Bob Johnson", email: "bob@example.com" },
          { id: "4", name: "Alice Williams", email: "alice@example.com" },
        ]);
        setLoadingUsers(false);
      }, 500);
    }
  }, [open]);

  const close = () => {
    onOpenChange({ open: false });
  };

  const validateAndSetInvoice = (file: File) => {
    if (file.type === 'application/pdf') {
      setInvoiceFile(file);
      setInvoicePreview(file.name);
      setInvoiceError(null);
      return true;
    } else {
      setInvoiceError(t("admin.modals.addCar.invalidFormat"));
      setTimeout(() => setInvoiceError(null), 3000);
      return false;
    }
  };

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetInvoice(file);
    }
  };

  const handleInvoiceDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setInvoiceDragOver(true);
  };

  const handleInvoiceDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setInvoiceDragOver(false);
  };

  const handleInvoiceDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setInvoiceDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetInvoice(file);
    }
  };

  const removeInvoice = () => {
    setInvoiceFile(null);
    setInvoicePreview(null);
    setInvoiceError(null);
  };

  const onSubmit = () => {
    const parsed = form.derived.parsed;
    if (!parsed) return;

    // Use the first non-null preview as the main image
    const mainImage = previews.find(p => p !== null) ?? null;

    const car = createAdminCar({
      imageUrl: mainImage,
      model: form.fields.model,
      year: parsed.year,
      priceUsd: parsed.priceUsd,
      status: form.fields.status,
      details: parsed.details,
    });

    // TODO: Handle invoice file upload (invoiceFile)
    // TODO: Handle selected user (selectedUserId)
    // You can add this to your backend upload logic
    console.log('Selected User ID:', selectedUserId);
    console.log('Invoice File:', invoiceFile);

    onCreateCar({ car });
    close();
    clearAll();
    removeInvoice();
    setSelectedUserId("");
    form.actions.reset();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-[980px] overflow-hidden rounded-3xl border-gray-200 p-0 dark:border-white/10 dark:bg-[#0a0a0a] lg:max-w-[1100px]">
        <div className="flex max-h-[85vh] flex-col">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-white/10">
            <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("admin.modals.addCar.title")}
            </DialogTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("admin.modals.addCar.subtitle")}
            </p>
          </DialogHeader>
          </div>

          <div className="px-8 py-6 max-h-[calc(85vh-180px)] space-y-6 overflow-y-auto">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                {t("admin.modals.addCar.photosLabel")}
              </Label>
              <PhotoUploadGrid
                label=""
                previews={previews}
                onPickFile={setFileAt}
                onRemoveFile={removeFileAt}
                tileClassName="h-[160px]"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.addCar.user")}
                </Label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={loadingUsers}
                  className="h-11 w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white pl-4 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6] dark:bg-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iI0Q1RDdEQSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-[length:16px_16px] bg-[center_right_0.75rem] bg-no-repeat [&>option]:py-1 [&>option]:px-2"
                >
                  <option value="">
                    {loadingUsers ? t("admin.modals.addCar.loadingUsers") : t("admin.modals.addCar.selectUser")}
                  </option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.addCar.purchaseDate")}
                </Label>
                <Input
                  value={form.fields.purchaseDate}
                  onChange={(e) => form.actions.setPurchaseDate({ value: e.target.value })}
                  type="date"
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.addCar.type")}
                </Label>
                <Input
                  value={form.fields.type}
                  onChange={(e) => form.actions.setType({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.typePlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.model")}</Label>
                <Input
                  value={form.fields.model}
                  onChange={(e) => form.actions.setModel({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.modelPlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.year")}</Label>
                <Input
                  value={form.fields.year}
                  onChange={(e) => form.actions.setYear({ value: e.target.value })}
                  inputMode="numeric"
                  placeholder={t("admin.modals.addCar.yearPlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.auction")}</Label>
                <Input
                  value={form.fields.auction}
                  onChange={(e) => form.actions.setAuction({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.auctionPlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.city")}</Label>
                <Input
                  value={form.fields.city}
                  onChange={(e) => form.actions.setCity({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.cityPlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.lot")}</Label>
                <Input
                  value={form.fields.lot}
                  onChange={(e) => form.actions.setLot({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.lotPlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.addCar.paymentToAuction")}
                </Label>
                <Input
                  value={form.fields.paymentToAuctionUsd}
                  onChange={(e) => form.actions.setPaymentToAuctionUsd({ value: e.target.value })}
                  inputMode="numeric"
                  placeholder={t("admin.modals.addCar.paymentToAuctionPlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.vin")}</Label>
                <Input
                  value={form.fields.vin}
                  onChange={(e) => form.actions.setVin({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.vinPlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.price")}</Label>
                <Input
                  value={form.fields.priceUsd}
                  onChange={(e) => form.actions.setPriceUsd({ value: e.target.value })}
                  inputMode="numeric"
                  placeholder={t("admin.modals.addCar.pricePlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.status")}</Label>
                <select
                  value={form.fields.status}
                  onChange={(e) =>
                    form.actions.setStatus({
                      value: e.target.value as "Active" | "Draft" | "Pending Review",
                    })
                  }
                  className="h-11 w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white pl-4 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6] dark:bg-black dark:text-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iI0Q1RDdEQSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-[length:16px_16px] bg-[center_right_0.75rem] bg-no-repeat [&>option]:py-1 [&>option]:px-2"
                >
                  <option value="Pending Review">{t("admin.modals.addCar.statusPending")}</option>
                  <option value="Active">{t("admin.modals.addCar.statusActive")}</option>
                  <option value="Draft">{t("admin.modals.addCar.statusDraft")}</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.customerNotes")}</Label>
                <Textarea
                  value={form.fields.customerNotes}
                  onChange={(e) => form.actions.setCustomerNotes({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.customerNotesPlaceholder")}
                  className="min-h-[100px] rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Invoice Upload Section */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-white/10">
              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                {t("admin.modals.addCar.invoiceLabel")}
              </Label>
              
              {!invoicePreview ? (
                <div className="space-y-2">
                  <label 
                    onDragOver={handleInvoiceDragOver}
                    onDragLeave={handleInvoiceDragLeave}
                    onDrop={handleInvoiceDrop}
                    className={`group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-white/5 transition-all h-24 ${
                      invoiceDragOver 
                        ? 'border-[#429de6] bg-blue-50 dark:bg-[#429de6]/10 scale-[1.02] ring-2 ring-[#429de6]/50' 
                        : invoiceError
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-white/20'
                    }`}
                  >
                    <input
                      type="file"
                      accept="application/pdf"
                      className="sr-only"
                      onChange={handleInvoiceChange}
                    />
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200 dark:bg-white/5 dark:ring-white/10 transition-all ${
                        invoiceDragOver ? 'scale-110 ring-2 ring-[#429de6] bg-[#429de6]/10' : ''
                      }`}>
                        {invoiceDragOver ? (
                          <svg className="h-5 w-5 text-[#429de6] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-[#429de6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{t("admin.modals.addCar.uploadInvoice")}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {invoiceDragOver ? t("admin.modals.addCar.dropToUpload") : t("admin.modals.addCar.format")}
                        </div>
                      </div>
                    </div>
                  </label>
                  {invoiceError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                      <svg className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-red-600 dark:text-red-400">{invoiceError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-300 dark:border-white/20 bg-white dark:bg-black">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10">
                      <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{invoicePreview}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">PDF Document</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeInvoice}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 px-8 py-5 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a]">
          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-white/5 font-medium"
              onClick={close}
            >
              {t("admin.modals.addCar.cancel")}
            </Button>
            <Button
              type="button"
              className="h-11 px-6 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/20"
              disabled={!form.derived.isSubmitEnabled}
              onClick={onSubmit}
            >
              {t("admin.modals.addCar.submit")}
            </Button>
          </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};




