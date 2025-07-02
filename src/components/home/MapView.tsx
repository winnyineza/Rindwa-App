
import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

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

export function MapView({ coordinates, incidents }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // For now, we'll show a placeholder map since we don't have a map service configured
  // In a real implementation, you would integrate with Google Maps, Mapbox, or similar
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <MapPin className="h-5 w-5 text-red-600 mr-2" />
        Incident Map
      </h3>
      <div 
        ref={mapRef} 
        className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
      >
        <div className="text-center text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Map view will show here</p>
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
      </div>
    </div>
  );
}
