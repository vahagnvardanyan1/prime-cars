import { FC } from 'react';
import { Container } from '@/components/layouts/Container';
import { SectionHeader } from '@/components/layouts/SectionHeader';

const AboutPage: FC = () => {
  return (
    <Container>
      <SectionHeader title="About Us" />
      <div className="flex flex-col items-center justify-center py-10">
        <h1 className="text-4xl font-bold text-center mb-6">Welcome to Our Company</h1>
        <p className="text-lg text-center max-w-2xl">
          We are committed to providing the best service in the industry. Our team is dedicated to ensuring customer satisfaction and delivering top-notch solutions.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p>
              Our mission is to innovate and lead in our field, providing unparalleled value to our customers and stakeholders.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p>
              We envision a future where our solutions empower businesses worldwide, driving growth and success.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default AboutPage;
