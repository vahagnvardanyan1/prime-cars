import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './AnimatedUI.module.css';

/**
 * AnimatedUI Component
 * This component displays an animated UI and redirects to '/page' after the animation.
 *
 * @component
 */
const AnimatedUI: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/page');
    }, 3000); // Redirect after 3 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={styles.animatedContainer}>
      <div className={styles.animatedBox}>
        <h1 className={styles.animatedText}>Welcome to Prime Cars!</h1>
      </div>
    </div>
  );
};

export default AnimatedUI;
