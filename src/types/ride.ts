export interface LatLng {
  lat: number;
  lng: number;
}

export interface FareEstimate {
  distanceKm: number;
  durationMin: number;
  total: number;
  currency: string;
}

export interface Driver {
  id: string;
  name: string;
  vehicleType: 'bike' | 'car' | 'xl';
  location: LatLng;
  rating: number;
  plateNumber: string;
  vehicleModel: string;
  profileImage?: string;
}

export interface Ride {
  id: string;
  pickup: LatLng & { address: string };
  dropoff: LatLng & { address: string };
  vehicleType: 'bike' | 'car' | 'xl';
  status: 'requested' | 'assigned' | 'accepted' | 'on_trip' | 'completed' | 'cancelled';
  fare: FareEstimate;
  driver?: Driver;
  createdAt: string;
  estimatedArrival?: string;
}

export interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

export interface RideRequest {
  pickup: LatLng & { address: string };
  dropoff: LatLng & { address: string };
  vehicleType: 'bike' | 'car' | 'xl';
}

export type VehicleType = 'bike' | 'car' | 'xl';

export type RideStatus = 'requested' | 'assigned' | 'accepted' | 'on_trip' | 'completed' | 'cancelled';