import React from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

/**
 * Test1Page component renders a Google Map using the @react-google-maps/api library.
 *
 * This component is part of the '/test-1' route in the Prime Cars application.
 * Ensure that the Google Maps API key is set in the environment variables.
 */
const Test1Page: React.FC = () => {
  // Define map container style
  const containerStyle = {
    width: '100%',
    height: '400px',
  };

  // Set initial center of the map
  const center = {
    lat: -3.745,
    lng: -38.523,
  };

  // Retrieve the Google Maps API key from environment variables
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    console.error('Google Maps API key is not set. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
    return <div>Error: Google Maps API key is missing.</div>;
  }

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
      >
        {/* Additional map components can be added here */}
      </GoogleMap>
    </LoadScript>
  );
};

export default Test1Page;
