import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import '../LoginPage'; // Assumes the component is default exporting the HTML structure

// Mock alert for testing because it's used in the JS file
window.alert = jest.fn();

// Test suite for the Login Page

describe('Login Page UI and Interactions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should render login page with all elements', () => {
    renderLoginPage();
    expect(screen.getByRole('heading', { name: /welcome back!/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password\?/i)).toBeVisible();
  });

  it('should show an alert on login attempt with correct message', () => {
    renderLoginPage();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' }});
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' }});
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(window.alert).toHaveBeenCalledWith('Login attempt for testuser');
  });

  it('should show login success for correct credentials', () => {
    renderLoginPage();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' }});
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin' }});
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(window.alert).toHaveBeenCalledWith('Login successful');
  });

  it('should show login failure for incorrect credentials', () => {
    renderLoginPage();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'wronguser' }});
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' }});
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(window.alert).toHaveBeenCalledWith('Login failed. Please check your credentials and try again.');
  });

  function renderLoginPage() {
    render(
      <div className="login-container">
        <form className="login-form">
          <h1 className="login-title">Welcome Back!</h1>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="btn-login">Login</button>
          <p className="forgot-password"><a href="#">Forgot Password?</a></p>
        </form>
      </div>
    );
  }
});
