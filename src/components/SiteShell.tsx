"use client";

import type { ReactNode } from "react";

import { useState } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LoginModal } from "@/components/LoginModal";

type SiteShellProps = {
  children: ReactNode;
};

export const SiteShell = ({ children }: SiteShellProps) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
