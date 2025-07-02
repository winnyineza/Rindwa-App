
import { useState, useEffect } from 'react';

interface LocationData {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

export function useAutoLocation() {
  const [location, setLocation] = useState<LocationData>({
    address: 'Getting your location...',
    coordinates: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocoding using a free service
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        
        if (response.ok) {
          const data = await response.json();
          const address = data.locality 
            ? `${data.locality}, ${data.principalSubdivision}` 
            : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          setLocation({
            address,
            coordinates: { latitude, longitude }
          });
        } else {
          throw new Error('Geocoding service unavailable');
        }
      } catch (geocodingError) {
        // Fallback to coordinates if geocoding fails
        setLocation({
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          coordinates: { latitude, longitude }
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      setLocation({
        address: 'Location unavailable',
        coordinates: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
    
    // Update location every 5 minutes
    const interval = setInterval(getCurrentLocation, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    location,
    isLoading,
    error,
    refreshLocation: getCurrentLocation
  };
}
