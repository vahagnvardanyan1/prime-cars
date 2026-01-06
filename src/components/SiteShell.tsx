"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LoginModal } from "@/components/LoginModal";
import { useUser } from "@/contexts/UserContext";
import { locales } from "@/i18n/config";
import { usePathname } from "@/i18n/routing";

type SiteShellProps = {
  children: ReactNode;
};

export const SiteShell = ({ children }: SiteShellProps) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();
  const { refreshUser } = useUser();

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0] ?? "";
  const second = segments[1] ?? "";

  const isAdminRoute = locales.includes(first as (typeof locales)[number])
    ? second === "admin"
    : first === "admin";

  // Handle login success from any page (calculator, home, etc.)
  const handleLoginSuccess = async () => {
    console.log("✅ Login successful from SiteShell! Fetching user from /auth/me");
    
    // Fetch user data from API - skip refresh mechanism since we just logged in with fresh token
    await refreshUser(true);
    
    console.log("✅ User data fetched successfully!");
    
    // Close modal
    setIsLoginModalOpen(false);
  };

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <Header onLoginClick={() => setIsLoginModalOpen(true)} />
      <main>{children}</main>
      <Footer />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};
