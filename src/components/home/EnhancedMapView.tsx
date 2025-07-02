import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Settings, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MapViewProps {
  coordinates: {lat: number, lon: number} | null;
  incidents: Array<{
    id: string;
    latitude: number | null;
    longitude: number | null;
    title: string;
    category: string;
  }>;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function EnhancedMapView({ coordinates, incidents }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fire': return '🔥';
      case 'medical': return '🚑';
      case 'accident': return '🚗';
      case 'security': return '🚔';
      default: return '📍';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fire': return '#dc2626';
      case 'medical': return '#2563eb';
      case 'accident': return '#ea580c';
      case 'security': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  useEffect(() => {
    // Check if Google Maps API key is available from storage
    const storedApiKey = localStorage.getItem('google_maps_api_key');
    if (storedApiKey) {
      setGoogleMapsApiKey(storedApiKey);
      loadGoogleMaps(storedApiKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  const loadGoogleMaps = (apiKey: string) => {
    if (window.google) {
      initializeMap();
      return;
    }

    window.initMap = initializeMap;
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    const mapOptions = {
      center: coordinates || { lat: -1.2921, lng: 36.8219 }, // Default to Nairobi
      zoom: 13,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);
    setIsMapLoaded(true);

    // Add user location marker if available
    if (coordinates) {
      new window.google.maps.Marker({
        position: { lat: coordinates.lat, lng: coordinates.lon },
        map: newMap,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
        }
      });
    }
  };

  useEffect(() => {
    if (map && isMapLoaded && incidents.length > 0) {
      // Clear existing markers (you might want to keep track of them)
      // Add incident markers
      incidents.filter(incident => incident.latitude && incident.longitude).forEach((incident) => {
        const marker = new window.google.maps.Marker({
          position: { lat: incident.latitude!, lng: incident.longitude! },
          map: map,
          title: incident.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="${getCategoryColor(incident.category)}" stroke="#ffffff" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" font-size="12" fill="#ffffff">${getCategoryIcon(incident.category)}</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 4px 0; font-weight: bold;">${incident.title}</h4>
              <p style="margin: 0; color: #666; text-transform: capitalize;">${incident.category}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
    }
  }, [map, isMapLoaded, incidents]);

  const handleApiKeySubmit = () => {
    if (googleMapsApiKey) {
      localStorage.setItem('google_maps_api_key', googleMapsApiKey);
      setShowApiKeyInput(false);
      loadGoogleMaps(googleMapsApiKey);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-red-600 mr-2" />
            Incident Map
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Layers className="h-4 w-4 mr-1" />
              Layers
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowApiKeyInput(!showApiKeyInput)}>
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showApiKeyInput && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-2">Google Maps Configuration</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              To enable real map functionality, please enter your Google Maps API key. 
              Get one at <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>
            </p>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="AIzaSyBdVl-cTICSwYKpe92581l0X5n7..."
                value={googleMapsApiKey}
                onChange={(e) => setGoogleMapsApiKey(e.target.value)}
              />
              <Button onClick={handleApiKeySubmit}>Save</Button>
            </div>
          </div>
        )}

        <div 
          ref={mapRef} 
          className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 relative overflow-hidden"
        >
          {!isMapLoaded && !showApiKeyInput && googleMapsApiKey && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 flex items-center justify-center">
              <div className="text-white text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                <p className="text-sm">Loading Google Maps...</p>
              </div>
            </div>
          )}
          
          {!googleMapsApiKey && !showApiKeyInput && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Google Maps will show here</p>
              <p className="text-xs">
                {coordinates 
                  ? `Your location: ${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`
                  : 'Location not available'
                }
              </p>
              <p className="text-xs mt-1">
                {incidents.filter(i => i.latitude && i.longitude).length} incidents with location data
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>Fire</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>Medical</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span>Accident</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
            <span>Security</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
