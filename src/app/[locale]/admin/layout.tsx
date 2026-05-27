"use client";

import { ReactNode, useState, useEffect } from "react";
import { Theme } from "@radix-ui/themes";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { AdminPreferencesMenu } from "@/components/admin/AdminPreferencesMenu";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminSidebarContent } from "@/components/admin/AdminSidebarContent";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/contexts/UserContext";
import { LoginModal } from "@/components/LoginModal";
import { NotificationPopup } from "@/components/NotificationPopup";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const t = useTranslations();
  const router = useRouter();
  const { user, isAdmin, isLoading: isLoadingUser } = useUser();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      setShowLoginModal(true);
    }
  }, [isLoadingUser, user]);

  const handleLoginClose = () => {
    if (!user) {
      router.push("/");
    }
    setShowLoginModal(false);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  // Show loading on server-side and initial client render to prevent hydration mismatch
  if (!hasMounted || isLoadingUser) {
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

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <LoginModal
          isOpen={showLoginModal}
          onClose={handleLoginClose}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <Theme appearance="inherit">
    <div className="flex h-dvh overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]" suppressHydrationWarning>
      {/* Show notification popup only for non-admin users */}
      {user && !isAdmin && <NotificationPopup userId={user.id} />}
      
      <AdminSidebar
        isAdmin={isAdmin}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(prev => !prev)}
      />

      <div className={`flex flex-1 flex-col overflow-hidden transition-[margin] duration-300 ${isSidebarCollapsed ? "md:ml-[72px]" : "md:ml-[280px]"}`}>
        <AdminTopbar
          left={
            <div className="flex items-center gap-4">
              <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 md:hidden rounded-xl border-gray-200 bg-white p-0 text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0b0f14] dark:text-white dark:hover:bg-white/5"
                    aria-label={t("admin.topbar.openNavAria")}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[320px] border-gray-200 bg-white p-0 dark:border-white/10 dark:bg-[#0b0f14]"
                >
                  <SheetTitle className="sr-only">
                    {t("admin.topbar.openNavAria")}
                  </SheetTitle>
                  <div className="h-full">
                    <AdminSidebarContent
                      onRequestClose={() => setIsMobileNavOpen(false)}
                      isAdmin={isAdmin}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden sm:block text-xl font-semibold uppercase tracking-[0.12em] text-gray-600 dark:text-gray-300">
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
    </div>
    </Theme>
  );
}

