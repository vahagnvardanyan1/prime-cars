"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useTheme } from "@/components/ThemeContext";

export const Toaster = (props: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      className="app-toaster"
      theme={theme}
      position="bottom-right"
      closeButton
      expand
      duration={2000}
      {...props}
    />
  );
};
