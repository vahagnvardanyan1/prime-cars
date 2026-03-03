import React from 'react';
import Calculator from '../components/Calculator';

/**
 * The Flan page component which includes the Calculator component.
 * This page is accessible via the '/flan' route.
 *
 * @returns {JSX.Element} The rendered Flan page component.
 */
const FlanPage: React.FC = () => {
  return (
    <div className="flan-page">
      <h1>Flan Page</h1>
      <Calculator />
    </div>
  );
};

export default FlanPage;
