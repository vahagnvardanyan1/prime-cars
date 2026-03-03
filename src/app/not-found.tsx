import Link from "next/link";
import { defaultLocale } from "@/i18n/config";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex flex-col justify-center items-center px-6 py-24 text-white">
      <div className="max-w-xl text-center">
        <div className="text-9xl font-extrabold drop-shadow-lg">404</div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight drop-shadow-md">
          Oops! Page Not Found
        </h1>
        <p className="mt-3 text-lg text-gray-200">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href={`/${defaultLocale}`}
            className="rounded-xl bg-white px-6 py-3 text-lg font-semibold text-purple-700 shadow-lg hover:bg-purple-100 transition"
          >
            Go to Home
          </Link>
          <Link
            href={`/${defaultLocale}/contact`}
            className="rounded-xl border border-white px-6 py-3 text-lg font-semibold hover:bg-white hover:text-purple-700 transition"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
