import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon path issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for start and end
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const startIcon = createCustomIcon('#10b981'); // Emerald Green
const endIcon = createCustomIcon('#ef4444'); // Red

const MapUpdater = ({ coordinates, markers }) => {
  const map = useMap();
  
  useEffect(() => {
    let bounds = null;
    const allPoints = [
      ...(markers.start ? [markers.start] : []),
      ...(coordinates || []),
      ...(markers.end ? [markers.end] : [])
    ];
    
    if (allPoints.length > 0) {
      bounds = L.latLngBounds(allPoints);
    }

    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, markers, map]);

  return null;
};

const MapView = ({ coordinates, markers }) => {
  // Default center (New Delhi roughly based on the mock)
  const defaultCenter = [28.6139, 77.2090];
  
  return (
    <div className="map-container">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {coordinates && coordinates.length > 0 && (
          <Polyline 
            positions={coordinates} 
            color="#2563eb" 
            weight={5} 
            opacity={0.8}
          />
        )}
        
        <MapUpdater coordinates={coordinates} markers={markers} />

        {markers.start && (
          <Marker position={markers.start} icon={startIcon}>
            <Popup>Start Location</Popup>
          </Marker>
        )}
        
        {markers.end && (
          <Marker position={markers.end} icon={endIcon}>
            <Popup>Destination</Popup>
          </Marker>
        )}
        
      </MapContainer>
    </div>
  );
};

export default MapView;
