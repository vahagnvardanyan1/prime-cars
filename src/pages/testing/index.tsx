import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * TestingPage component
 *
 * This component displays an animated UI and redirects to '/page' after a delay.
 *
 * @returns {JSX.Element} The rendered component.
 */
const TestingPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Set a timeout to redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push('/page');
    }, 3000);

    // Cleanup the timer on component unmount
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-center">
        <h1 className="text-4xl font-bold">Redirecting...</h1>
        <p className="mt-4 text-lg">Please wait while we redirect you to the page.</p>
      </div>
    </div>
  );
};

export default TestingPage;
