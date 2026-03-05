import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AboutPage from '@/app/[locale]/about/page';

// Test suite for the About Us Page
describe('About Us Page', () => {
  beforeEach(() => {
    render(<AboutPage />);
  });

  it('should render the main header', () => {
    const mainHeader = screen.getByRole('heading', { level: 1 });
    expect(mainHeader).toHaveTextContent('Welcome to Our Company');
  });

  it('should render the mission statement', () => {
    const missionHeader = screen.getByRole('heading', { level: 2, name: 'Our Mission' });
    expect(missionHeader).toBeInTheDocument();
  });

  it('should render the vision statement', () => {
    const visionHeader = screen.getByRole('heading', { level: 2, name: 'Our Vision' });
    expect(visionHeader).toBeInTheDocument();
  });

  it('should display text content about company mission', () => {
    const missionText = screen.getByText(/Our mission is to innovate and lead in our field, providing unparalleled value to our customers and stakeholders./i);
    expect(missionText).toBeInTheDocument();
  });

  it('should display text content about company vision', () => {
    const visionText = screen.getByText(/We envision a future where our solutions empower businesses worldwide, driving growth and success./i);
    expect(visionText).toBeInTheDocument();
  });

  // Check images and attributes
  it('should render images with appropriate alt text', () => {
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3); // Ensuring that there are indeed three images as per layout
    expect(images[0]).toHaveAttribute('alt', 'Quality');
    expect(images[1]).toHaveAttribute('alt', 'Service');
    expect(images[2]).toHaveAttribute('alt', 'Value');
  });
});