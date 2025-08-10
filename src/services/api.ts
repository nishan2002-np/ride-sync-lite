import { FareEstimate, Ride, RideRequest, LocationSuggestion } from '@/types/ride';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Location Services using Nominatim API (free)
export const locationService = {
  async searchLocations(query: string): Promise<LocationSuggestion[]> {
    if (!query || query.length < 3) return [];
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      return data.map((item: any) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        place_id: item.place_id,
      }));
    } catch (error) {
      console.error('Location search failed:', error);
      return [];
    }
  },

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  },
};

// Mock API service (replace with real backend calls)
export const rideService = {
  async getFareEstimate(request: RideRequest): Promise<FareEstimate> {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const distance = calculateDistance(request.pickup, request.dropoff);
    const duration = Math.max(5, Math.round(distance * 2.5)); // rough estimate
    
    let baseRate = 0;
    let perKmRate = 0;
    
    switch (request.vehicleType) {
      case 'bike':
        baseRate = 25;
        perKmRate = 8;
        break;
      case 'car':
        baseRate = 50;
        perKmRate = 15;
        break;
      case 'xl':
        baseRate = 75;
        perKmRate = 20;
        break;
    }
    
    const total = baseRate + (distance * perKmRate);
    
    return {
      distanceKm: Number(distance.toFixed(1)),
      durationMin: duration,
      total: Number(total.toFixed(2)),
      currency: 'INR',
    };
  },

  async requestRide(request: RideRequest): Promise<Ride> {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fare = await this.getFareEstimate(request);
    
    return {
      id: `ride_${Date.now()}`,
      pickup: request.pickup,
      dropoff: request.dropoff,
      vehicleType: request.vehicleType,
      status: 'requested',
      fare,
      createdAt: new Date().toISOString(),
      estimatedArrival: new Date(Date.now() + 8 * 60 * 1000).toISOString(), // 8 minutes
    };
  },

  async getRide(rideId: string): Promise<Ride> {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // This would normally fetch from your backend
    throw new Error('Ride not found');
  },

  async cancelRide(rideId: string): Promise<boolean> {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  },

  async getRideHistory(): Promise<Ride[]> {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock ride history
    return [
      {
        id: 'ride_1',
        pickup: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi' },
        dropoff: { lat: 28.5355, lng: 77.3910, address: 'Noida Sector 18' },
        vehicleType: 'car',
        status: 'completed',
        fare: { distanceKm: 25.3, durationMin: 45, total: 430.50, currency: 'INR' },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        driver: {
          id: 'driver_1',
          name: 'Rajesh Kumar',
          vehicleType: 'car',
          location: { lat: 28.5355, lng: 77.3910 },
          rating: 4.8,
          plateNumber: 'DL01AB1234',
          vehicleModel: 'Maruti Swift',
        },
      },
      {
        id: 'ride_2',
        pickup: { lat: 28.7041, lng: 77.1025, address: 'Rohini Sector 10' },
        dropoff: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi' },
        vehicleType: 'bike',
        status: 'completed',
        fare: { distanceKm: 18.2, durationMin: 35, total: 170.60, currency: 'INR' },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        driver: {
          id: 'driver_2',
          name: 'Amit Singh',
          vehicleType: 'bike',
          location: { lat: 28.6139, lng: 77.2090 },
          rating: 4.6,
          plateNumber: 'DL05CD5678',
          vehicleModel: 'Honda Activa',
        },
      },
    ];
  },
};

// Utility function to calculate distance between two points
function calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}