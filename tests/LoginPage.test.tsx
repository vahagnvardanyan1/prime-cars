import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import LoginPage from '../src/components/LoginPage';

// Functional Correctness Tests
describe('LoginPage Component', () => {
  test('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('should allow entering email and password', () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('should handle form submission', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button'));

    expect(consoleSpy).toHaveBeenCalledWith('Logging in with', 'test@example.com', 'password123');
  });
});

// Responsiveness and UI Tests
describe('LoginPage Responsiveness', () => {
  test('should render correctly on different screen sizes', () => {
    const { container } = render(<LoginPage />);

    // Default mobile view
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 320 });
    window.dispatchEvent(new Event('resize'));
    expect(container.firstChild).toHaveStyle('max-width: 100vw');

    // Tablet view
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 768 });
    window.dispatchEvent(new Event('resize'));
    expect(container.firstChild).toHaveStyle('max-width: 100vw');

    // Desktop view
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    window.dispatchEvent(new Event('resize'));
    expect(container.firstChild).toHaveStyle('max-width: 100vw');
  });
});

// Edge Cases
describe('LoginPage Edge Cases', () => {
  test('should show validation messages for empty inputs on submit', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByLabelText(/email/i)).toBeInvalid();
    expect(screen.getByLabelText(/password/i)).toBeInvalid();
  });

  test('should not allow invalid email format', () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    fireEvent.click(screen.getByRole('button'));
    expect(emailInput).toBeInvalid();
  });
});
