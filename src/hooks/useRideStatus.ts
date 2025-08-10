import { useState, useEffect, useRef } from 'react';
import { Ride, RideStatus } from '@/types/ride';

interface RideStatusUpdate {
  rideId: string;
  status: RideStatus;
  driverLocation?: { lat: number; lng: number };
  estimatedArrival?: string;
  driver?: any;
}

export const useRideStatus = (rideId: string | null) => {
  const [ride, setRide] = useState<Ride | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!rideId) return;

    // Mock WebSocket connection for demo
    // Replace with actual WebSocket URL in production
    const connectWebSocket = () => {
      try {
        // Mock connection - in production, use your WebSocket server
        setConnected(true);
        
        // Simulate real-time updates for demo
        const mockUpdates = [
          { status: 'assigned' as RideStatus, delay: 3000 },
          { status: 'accepted' as RideStatus, delay: 8000 },
          { status: 'on_trip' as RideStatus, delay: 15000 },
        ];

        mockUpdates.forEach(({ status, delay }) => {
          setTimeout(() => {
            setRide(prev => prev ? { ...prev, status } : null);
          }, delay);
        });

        // Mock driver location updates
        const mockDriverMovement = () => {
          if (ride?.driver) {
            setRide(prev => {
              if (!prev?.driver) return prev;
              
              // Simulate driver moving towards pickup/destination
              const newLat = prev.driver.location.lat + (Math.random() - 0.5) * 0.001;
              const newLng = prev.driver.location.lng + (Math.random() - 0.5) * 0.001;
              
              return {
                ...prev,
                driver: {
                  ...prev.driver,
                  location: { lat: newLat, lng: newLng },
                },
              };
            });
          }
        };

        const driverLocationInterval = setInterval(mockDriverMovement, 5000);

        return () => {
          clearInterval(driverLocationInterval);
        };
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setConnected(false);
      }
    };

    const cleanup = connectWebSocket();

    return () => {
      if (cleanup) cleanup();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [rideId, ride?.driver]);

  const updateRideWithDriver = (rideData: Ride) => {
    // Mock driver assignment for demo
    if (rideData.status === 'assigned' && !rideData.driver) {
      const mockDriver = {
        id: 'driver_mock',
        name: 'Ravi Sharma',
        vehicleType: rideData.vehicleType,
        location: {
          lat: rideData.pickup.lat + (Math.random() - 0.5) * 0.01,
          lng: rideData.pickup.lng + (Math.random() - 0.5) * 0.01,
        },
        rating: 4.7,
        plateNumber: 'DL08XY9876',
        vehicleModel: rideData.vehicleType === 'bike' ? 'Honda Activa' : 
                      rideData.vehicleType === 'car' ? 'Maruti Swift' : 'Toyota Innova',
      };
      
      setRide({ ...rideData, driver: mockDriver });
    } else {
      setRide(rideData);
    }
  };

  return {
    ride,
    connected,
    updateRide: updateRideWithDriver,
  };
};