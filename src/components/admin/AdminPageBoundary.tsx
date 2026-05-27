import { Suspense, type ReactNode } from "react";
import { getTranslations } from "next-intl/server";

export const AdminPageBoundary = async ({ children }: { children: ReactNode }) => {
  const t = await getTranslations("admin");

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">{t("loading")}</div>
      }
    >
      {children}
    </Suspense>
  );
};
