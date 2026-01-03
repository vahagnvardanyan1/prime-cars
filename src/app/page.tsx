import { redirect } from "next/navigation";

import { defaultLocale } from "@/i18n/config";

const Page = () => {
  redirect(`/${defaultLocale}`);
};

export default Page;


