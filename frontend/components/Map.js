import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Map() {
  const [buildings, setBuildings] = useState([]);
  const position = [51.505, -0.09]; // Example coordinates

  useEffect(() => {
    fetch('http://localhost:3001/buildings')
      .then(response => response.json())
      .then(data => setBuildings(data));
  }, []);

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {buildings.map(building => (
        <Marker key={building.id} position={[building.lat, building.lng]}>
          <Popup>
            {building.name}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Map;
