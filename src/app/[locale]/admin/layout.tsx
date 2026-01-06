"use client";

import { ReactNode, useState, useEffect } from "react";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { AdminPreferencesMenu } from "@/components/admin/AdminPreferencesMenu";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminSidebarContent } from "@/components/admin/AdminSidebarContent";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/contexts/UserContext";
import { LoginModal } from "@/components/LoginModal";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const t = useTranslations();
  const { user, isAdmin, isLoading: isLoadingUser } = useUser();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check on mount if user exists
  useEffect(() => {
    if (!isLoadingUser && !user) {
      setShowLoginModal(true);
    }
  }, [isLoadingUser, user]);

  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
  };

  if (isLoadingUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#429de6] border-r-transparent"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("admin.loadingUser")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
      <AdminSidebar isAdmin={isAdmin} />

      <div className="flex flex-1 flex-col overflow-hidden md:ml-[280px]">
        <AdminTopbar
          left={
            <div className="flex items-center gap-4">
              <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-gray-900 dark:text-white"
                    aria-label={t("admin.topbar.openNavAria")}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[320px] border-gray-200 bg-white p-0 dark:border-white/10 dark:bg-[#0b0f14]"
                >
                  <div className="h-full">
                    <AdminSidebarContent
                      onRequestClose={() => setIsMobileNavOpen(false)}
                      isAdmin={isAdmin}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden sm:block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                {user?.companyName || "Prime Cars"}
              </div>
            </div>
          }
          right={<AdminPreferencesMenu />}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-full">
            {children}
          </div>
        </main>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

