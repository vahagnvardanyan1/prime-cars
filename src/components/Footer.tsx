import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} aria-label="Footer">
      <div className={styles.container}>
        <section className={styles.section} aria-labelledby="contact">
          <h2 id="contact" className={styles.heading}>Contact Us</h2>
          <ul className={styles.list}>
            <li>Email: info@company.com</li>
            <li>Phone: (123) 456-7890</li>
          </ul>
        </section>
        <section className={styles.section} aria-labelledby="connect">
          <h2 id="connect" className={styles.heading}>Connect With Us</h2>
          <ul className={styles.socials}>
            <li><a href="https://facebook.com" aria-label="Facebook">Facebook</a></li>
            <li><a href="https://twitter.com" aria-label="Twitter">Twitter</a></li>
            <li><a href="https://instagram.com" aria-label="Instagram">Instagram</a></li>
          </ul>
        </section>
        <section className={styles.section} aria-labelledby="legal">
          <h2 id="legal" className={styles.heading}>Legal</h2>
          <ul className={styles.list}>
            <li><a href="/terms" aria-label="Terms of Service">Terms of Service</a></li>
            <li><a href="/privacy" aria-label="Privacy Policy">Privacy Policy</a></li>
          </ul>
        </section>
      </div>
      <div className={styles.copyright}>
        © 2023 Company Name. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
