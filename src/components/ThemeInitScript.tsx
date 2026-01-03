import { themeInitScript } from "@/lib/theme/themeInitScript";

export const ThemeInitScript = () => {
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />;
};


