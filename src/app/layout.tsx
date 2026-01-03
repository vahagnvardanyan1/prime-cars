import type { ReactNode } from "react";

import "./globals.css";

import { SiteShell } from "@/components/SiteShell";
import { ThemeInitScript } from "@/components/ThemeInitScript";
import { ThemeProvider } from "@/components/ThemeContext";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body>
        <ThemeProvider>
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;


