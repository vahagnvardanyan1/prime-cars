"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LoginModal } from "@/components/LoginModal";

type SiteShellProps = {
  children: ReactNode;
};

export const SiteShell = ({ children }: SiteShellProps) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/admin");

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
      />
    </div>
  );
};
