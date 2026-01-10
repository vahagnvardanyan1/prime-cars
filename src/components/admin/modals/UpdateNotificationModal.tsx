"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateNotification } from "@/lib/admin/notifications/updateNotification";
import type { Notification } from "@/lib/admin/notifications/types";

type UpdateNotificationModalProps = {
  open: boolean;
  notification: Notification | null;
  onOpenChange: ({ open }: { open: boolean }) => void;
  onNotificationUpdated: () => void;
};

export const UpdateNotificationModal = ({
  open,
  notification,
  onOpenChange,
  onNotificationUpdated,
}: UpdateNotificationModalProps) => {
  const t = useTranslations("admin.modals.updateNotification");
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (notification) {
      setMessage(notification.message || "");
      setDescription(notification.description || "");
      setReason(notification.reason || "");
    }
  }, [notification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notification) return;

    if (!message.trim() || !description.trim()) {
      toast.error(t("error"), {
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateNotification({
        id: notification.id,
        data: {
          message: message.trim(),
          description: description.trim(),
          reason: reason.trim(),
        },
      });

      if (result.success) {
        toast.success(t("success"), {
          description: t("successDescription"),
        });
        
        onNotificationUpdated();
        onOpenChange({ open: false });
      } else {
        toast.error(t("error"), {
          description: result.error || t("errorDescription"),
        });
      }
    } catch (error) {
      toast.error(t("error"), {
        description: error instanceof Error ? error.message : t("errorDescription"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange({ open: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isSubmitting && onOpenChange({ open: nextOpen })}>
      <DialogContent className="max-w-2xl bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("title")}
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-gray-900 dark:text-white">
              {t("message")}
            </Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("messagePlaceholder")}
              disabled={isSubmitting}
              className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-900 dark:text-white">
              {t("description")}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              disabled={isSubmitting}
              rows={3}
              className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium text-gray-900 dark:text-white">
              {t("reason")} <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
              disabled={isSubmitting}
              rows={2}
              className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/5"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#429de6] text-white hover:bg-[#3a8dd6] dark:bg-[#429de6] dark:hover:bg-[#3a8dd6]"
            >
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
