import React from 'react';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-message">Oops! The page you are looking for does not exist.</p>
      <p className="not-found-suggestion">Maybe try one of the links below or go back home.</p>
      <div className="not-found-links">
        <a href="/" className="home-link">Go to Home</a>
        <a href="/contact" className="contact-link">Contact Support</a>
      </div>
    </div>
  );
};

export default NotFoundPage;
