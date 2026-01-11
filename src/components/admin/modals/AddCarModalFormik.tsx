"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import { Formik, Form, Field } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { VehicleType, VehicleModel, Auction } from "@/lib/admin/types";
import { createCarSchema, type CreateCarFormValues } from "@/lib/validation/schemas";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PhotoUploadGrid } from "@/components/admin/modals/PhotoUploadGrid";
import { PdfUploader } from "@/components/admin/primitives/PdfUploader";
import { usePhotoUploads } from "@/hooks/admin/usePhotoUploads";
import { useUsers } from "@/lib/react-query/hooks/useUsers";
import { useCreateCar } from "@/lib/react-query/hooks/useCars";

type AddCarModalFormikProps = {
  open: boolean;
  onOpenChange: ({ open }: { open: boolean }) => void;
  onCarCreated?: () => void;
};

export const AddCarModalFormik = ({ open, onOpenChange, onCarCreated }: AddCarModalFormikProps) => {
  const t = useTranslations();
  const { files, previews, setFileAt, removeFileAt, clearAll } = usePhotoUploads({ initialSlots: 1 });
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  
  const { data: usersData, isLoading: loadingUsers } = useUsers();
  const createCarMutation = useCreateCar();

  const close = () => {
    onOpenChange({ open: false });
  };

  const initialValues: CreateCarFormValues = {
    userId: "",
    model: VehicleModel.BMW,
    year: new Date().getFullYear(),
    priceUsd: 0,
    carPaid: false,
    shippingPaid: false,
    insurance: false,
    purchaseDate: new Date().toISOString().split("T")[0],
    type: VehicleType.AUTO,
    auction: Auction.COPART,
    city: "",
    lot: "",
    vin: "",
    customerNotes: "",
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-[980px] overflow-hidden rounded-3xl border-gray-200 bg-white p-0 dark:border-white/10 dark:bg-[#0a0a0a] lg:max-w-[1100px]">
        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(createCarSchema)}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            const imageFiles = files.filter((file): file is File => file !== null);

            createCarMutation.mutate(
              {
                data: values,
                images: imageFiles,
                invoiceFile: invoiceFile,
              },
              {
                onSuccess: () => {
                  resetForm();
                  clearAll();
                  setInvoiceFile(null);
                  if (onCarCreated) onCarCreated();
                  close();
                },
                onSettled: () => {
                  setSubmitting(false);
                },
              }
            );
          }}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting, isValid }) => (
            <Form className="flex max-h-[85vh] flex-col">
              <div className="px-8 py-6 border-b border-gray-200 dark:border-white/10">
                <DialogHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t("admin.modals.addCar.title")}
                      </DialogTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {t("admin.modals.addCar.subtitle")}
                      </p>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="px-8 py-6 max-h-[calc(85vh-180px)] space-y-6 overflow-y-auto">
                {/* Photos */}
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
                  {/* User Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.modals.addCar.user")}
                    </Label>
                    <Field
                      as="select"
                      name="userId"
                      disabled={loadingUsers}
                      className="h-11 w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white pl-4 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6] dark:bg-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iI0Q1RDdEQSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-[length:16px_16px] bg-[center_right_0.75rem] bg-no-repeat"
                    >
                      <option value="">
                        {loadingUsers ? t("admin.modals.addCar.loadingUsers") : t("admin.modals.addCar.selectUser")}
                      </option>
                      {usersData?.users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </Field>
                    {touched.userId && errors.userId && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.userId}</p>
                    )}
                  </div>

                  {/* Purchase Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.modals.addCar.purchaseDate")}
                    </Label>
                    <Field
                      name="purchaseDate"
                      type="date"
                      className={`h-11 w-full rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white px-4 ${
                        touched.purchaseDate && errors.purchaseDate
                          ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                          : "border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]"
                      }`}
                    />
                    {touched.purchaseDate && errors.purchaseDate && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.purchaseDate}</p>
                    )}
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.modals.addCar.type")}
                    </Label>
                    <Field
                      as="select"
                      name="type"
                      className="h-11 w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white pl-4 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6] dark:bg-black dark:text-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-[length:16px_16px] bg-[center_right_0.75rem] bg-no-repeat"
                    >
                      <option value={VehicleType.AUTO}>{t("admin.modals.addCar.vehicleTypes.auto")}</option>
                      <option value={VehicleType.MOTORCYCLE}>{t("admin.modals.addCar.vehicleTypes.motorcycle")}</option>
                      <option value={VehicleType.LIMOUSINE}>{t("admin.modals.addCar.vehicleTypes.limousine")}</option>
                      <option value={VehicleType.BOAT}>{t("admin.modals.addCar.vehicleTypes.boat")}</option>
                      <option value={VehicleType.TRAILER}>{t("admin.modals.addCar.vehicleTypes.trailer")}</option>
                      <option value={VehicleType.TRUCK}>{t("admin.modals.addCar.vehicleTypes.truck")}</option>
                      <option value={VehicleType.OVERSIZED_TRUCK}>{t("admin.modals.addCar.vehicleTypes.oversizedTruck")}</option>
                      <option value={VehicleType.JETSKI}>{t("admin.modals.addCar.vehicleTypes.jetski")}</option>
                      <option value={VehicleType.ATV}>{t("admin.modals.addCar.vehicleTypes.atv")}</option>
                      <option value={VehicleType.MOPED}>{t("admin.modals.addCar.vehicleTypes.moped")}</option>
                      <option value={VehicleType.SCOOTER}>{t("admin.modals.addCar.vehicleTypes.scooter")}</option>
                      <option value={VehicleType.OTHER}>{t("admin.modals.addCar.vehicleTypes.other")}</option>
                    </Field>
                  </div>

                  {/* Model */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.model")}</Label>
                    <Field
                      as="select"
                      name="model"
                      className="h-11 w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white pl-4 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6] dark:bg-black dark:text-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-[length:16px_16px] bg-[center_right_0.75rem] bg-no-repeat"
                    >
                      {Object.values(VehicleModel).map((model) => (
                        <option key={model} value={model}>
                          {model.toUpperCase()}
                        </option>
                      ))}
                    </Field>
                  </div>

                  {/* Year */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.modals.addCar.year")} <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Field
                      name="year"
                      type="number"
                      placeholder={t("admin.modals.addCar.yearPlaceholder")}
                      className={`h-11 w-full rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white px-4 ${
                        touched.year && errors.year
                          ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                          : "border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]"
                      }`}
                    />
                    {touched.year && errors.year && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.year}</p>
                    )}
                  </div>

                  {/* Auction */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.auction")}</Label>
                    <Field
                      as="select"
                      name="auction"
                      className="h-11 w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white pl-4 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6] dark:bg-black dark:text-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-[length:16px_16px] bg-[center_right_0.75rem] bg-no-repeat"
                    >
                      {Object.values(Auction).map((auction) => (
                        <option key={auction} value={auction}>
                          {auction.toUpperCase()}
                        </option>
                      ))}
                    </Field>
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.city")}</Label>
                    <Field
                      name="city"
                      placeholder={t("admin.modals.addCar.cityPlaceholder")}
                      className="h-11 w-full rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white px-4"
                    />
                  </div>

                  {/* Lot */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.lot")}</Label>
                    <Field
                      name="lot"
                      placeholder={t("admin.modals.addCar.lotPlaceholder")}
                      className="h-11 w-full rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white px-4"
                    />
                  </div>

                  {/* VIN */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.vin")}</Label>
                    <Field
                      name="vin"
                      placeholder={t("admin.modals.addCar.vinPlaceholder")}
                      className={`h-11 w-full rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white px-4 ${
                        touched.vin && errors.vin
                          ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                          : "border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]"
                      }`}
                    />
                    {touched.vin && errors.vin && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.vin}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.price")}</Label>
                    <Field
                      name="priceUsd"
                      type="number"
                      placeholder={t("admin.modals.addCar.pricePlaceholder")}
                      className={`h-11 w-full rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white px-4 ${
                        touched.priceUsd && errors.priceUsd
                          ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                          : "border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]"
                      }`}
                    />
                    {touched.priceUsd && errors.priceUsd && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.priceUsd}</p>
                    )}
                  </div>

                  {/* Car Payment Status */}
                  <div 
                    className={`
                      relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
                      ${values.carPaid 
                        ? "bg-green-50/80 border-green-300 dark:bg-green-950/30 dark:border-green-800/50 hover:bg-green-50 dark:hover:bg-green-950/40" 
                        : "bg-orange-50/80 border-orange-300 dark:bg-orange-950/30 dark:border-orange-800/50 hover:bg-orange-50 dark:hover:bg-orange-950/40"
                      }
                    `}
                    onClick={() => setFieldValue("carPaid", !values.carPaid)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          {values.carPaid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                          )}
                          <Label htmlFor="carPaid" className="text-base font-bold text-gray-900 dark:text-white cursor-pointer">
                            {t("admin.modals.addCar.carPaid")}
                          </Label>
                        </div>
                        <div className={`
                          inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold
                          ${values.carPaid 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" 
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                          }
                        `}>
                          {values.carPaid ? t("admin.modals.addCar.paid") : t("admin.modals.addCar.notPaid")}
                        </div>
                      </div>
                      <Switch
                        id="carPaid"
                        checked={values.carPaid}
                        onCheckedChange={(checked) => setFieldValue("carPaid", checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Shipping Payment Status */}
                  <div 
                    className={`
                      relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
                      ${values.shippingPaid 
                        ? "bg-green-50/80 border-green-300 dark:bg-green-950/30 dark:border-green-800/50 hover:bg-green-50 dark:hover:bg-green-950/40" 
                        : "bg-orange-50/80 border-orange-300 dark:bg-orange-950/30 dark:border-orange-800/50 hover:bg-orange-50 dark:hover:bg-orange-950/40"
                      }
                    `}
                    onClick={() => setFieldValue("shippingPaid", !values.shippingPaid)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          {values.shippingPaid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                          )}
                          <Label htmlFor="shippingPaid" className="text-base font-bold text-gray-900 dark:text-white cursor-pointer">
                            {t("admin.modals.addCar.shippingPaid")}
                          </Label>
                        </div>
                        <div className={`
                          inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold
                          ${values.shippingPaid 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" 
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                          }
                        `}>
                          {values.shippingPaid ? t("admin.modals.addCar.paid") : t("admin.modals.addCar.notPaid")}
                        </div>
                      </div>
                      <Switch
                        id="shippingPaid"
                        checked={values.shippingPaid}
                        onCheckedChange={(checked) => setFieldValue("shippingPaid", checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Insurance */}
                  <div 
                    className={`
                      relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
                      ${values.insurance 
                        ? "bg-blue-50/80 border-blue-300 dark:bg-blue-950/30 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/40" 
                        : "bg-gray-50/80 border-gray-300 dark:bg-gray-800/30 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      }
                    `}
                    onClick={() => setFieldValue("insurance", !values.insurance)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          {values.insurance ? (
                            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                          )}
                          <Label htmlFor="insurance" className="text-base font-bold text-gray-900 dark:text-white cursor-pointer">
                            {t("admin.modals.addCar.insurance")}
                          </Label>
                        </div>
                        <div className={`
                          inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold
                          ${values.insurance 
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" 
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300"
                          }
                        `}>
                          {values.insurance ? t("admin.modals.addCar.exists") : t("admin.modals.addCar.notExists")}
                        </div>
                      </div>
                      <Switch
                        id="insurance"
                        checked={values.insurance}
                        onCheckedChange={(checked) => setFieldValue("insurance", checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Customer Notes */}
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.customerNotes")}</Label>
                    <Field
                      as="textarea"
                      name="customerNotes"
                      placeholder={t("admin.modals.addCar.customerNotesPlaceholder")}
                      className="min-h-[100px] w-full rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white resize-none px-4 py-3"
                    />
                  </div>
                </div>

                {/* Invoice Upload */}
                <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                  <PdfUploader
                    onFileSelect={setInvoiceFile}
                    disabled={isSubmitting}
                  />
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
                    type="submit"
                    className="h-11 px-6 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/20"
                    disabled={!isValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{t("admin.modals.addCar.submitting")}</span>
                      </div>
                    ) : (
                      t("admin.modals.addCar.submit")
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
