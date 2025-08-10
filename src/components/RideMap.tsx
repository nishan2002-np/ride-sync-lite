import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLng, Driver } from '@/types/ride';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createIcon = (color: string, iconClass: string = '') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          font-size: 16px;
          color: white;
          font-weight: bold;
        ">${iconClass}</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const pickupIcon = createIcon('hsl(210, 100%, 45%)', 'P');
const dropoffIcon = createIcon('hsl(142, 76%, 36%)', 'D');
const driverIcon = createIcon('hsl(262, 83%, 58%)', '🚗');

interface RideMapProps {
  pickup?: LatLng & { address: string };
  dropoff?: LatLng & { address: string };
  driver?: Driver;
  className?: string;
  center?: LatLng;
  zoom?: number;
}

// Component to fit bounds when locations change
const MapController: React.FC<{
  pickup?: LatLng;
  dropoff?: LatLng;
  driver?: Driver;
  center?: LatLng;
}> = ({ pickup, dropoff, driver, center }) => {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([]);
    let hasPoints = false;

    if (pickup) {
      bounds.extend([pickup.lat, pickup.lng]);
      hasPoints = true;
    }
    
    if (dropoff) {
      bounds.extend([dropoff.lat, dropoff.lng]);
      hasPoints = true;
    }
    
    if (driver?.location) {
      bounds.extend([driver.location.lat, driver.location.lng]);
      hasPoints = true;
    }

    if (hasPoints) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      map.setView([center.lat, center.lng], 13);
    }
  }, [map, pickup, dropoff, driver, center]);

  return null;
};

export const RideMap: React.FC<RideMapProps> = ({
  pickup,
  dropoff,
  driver,
  className = '',
  center = { lat: 28.6139, lng: 77.2090 }, // Delhi default
  zoom = 13,
}) => {
  const mapRef = useRef<any>(null);

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        ref={mapRef}
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="h-full w-full rounded-lg z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController
          pickup={pickup}
          dropoff={dropoff}
          driver={driver}
          center={center}
        />

        {pickup && (
          <Marker
            position={[pickup.lat, pickup.lng]}
            icon={pickupIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Pickup Location</strong>
                <br />
                {pickup.address}
              </div>
            </Popup>
          </Marker>
        )}

        {dropoff && (
          <Marker
            position={[dropoff.lat, dropoff.lng]}
            icon={dropoffIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Drop-off Location</strong>
                <br />
                {dropoff.address}
              </div>
            </Popup>
          </Marker>
        )}

        {driver?.location && (
          <Marker
            position={[driver.location.lat, driver.location.lng]}
            icon={driverIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>{driver.name}</strong>
                <br />
                {driver.vehicleModel} - {driver.plateNumber}
                <br />
                Rating: {driver.rating}/5 ⭐
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Map controls overlay */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => mapRef.current?.setZoom(mapRef.current?.getZoom() + 1)}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm border border-border rounded-lg shadow-md hover:bg-white transition-colors flex items-center justify-center"
        >
          <span className="text-lg font-bold text-foreground">+</span>
        </button>
        <button
          onClick={() => mapRef.current?.setZoom(mapRef.current?.getZoom() - 1)}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm border border-border rounded-lg shadow-md hover:bg-white transition-colors flex items-center justify-center"
        >
          <span className="text-lg font-bold text-foreground">−</span>
        </button>
      </div>
    </div>
  );
};