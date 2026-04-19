import type { ReactNode } from "react";

import "./globals.css";

import { ThemeInitScript } from "@/components/ThemeInitScript";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
        <meta name="google-site-verification" content="F4kBhWdm_HcUK5bfLAHiWZSPvzqs8eRlLafm81NZHZw" />
      </head>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;


