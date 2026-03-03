import React from 'react';
import Image from 'next/image';

/**
 * Custom 404 Not Found page for the Prime Cars application.
 * This page is displayed when a user navigates to a route that does not exist.
 */
const Custom404: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <div className="max-w-md">
        <Image
          src="/images/404.svg"
          alt="404 Not Found"
          width={300}
          height={300}
          className="mb-8"
        />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-6">
          Sorry, the page you are looking for does not exist.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default Custom404;
