import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Menu, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocationInput } from '@/components/LocationInput';
import { RideMap } from '@/components/RideMap';
import { VehicleSelector } from '@/components/VehicleSelector';
import { RideStatus } from '@/components/RideStatus';
import { rideService } from '@/services/api';
import { useRideStatus } from '@/hooks/useRideStatus';
import { toast } from '@/hooks/use-toast';
import { LatLng, VehicleType, FareEstimate, Ride, RideRequest } from '@/types/ride';

const Index = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<(LatLng & { address: string }) | null>(null);
  const [dropoff, setDropoff] = useState<(LatLng & { address: string }) | null>(null);
  const [pickupInput, setPickupInput] = useState('');
  const [dropoffInput, setDropoffInput] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('car');
  const [fareEstimates, setFareEstimates] = useState<Record<VehicleType, FareEstimate | null>>({
    bike: null,
    car: null,
    xl: null,
  });
  const [fareLoading, setFareLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  
  const { ride: liveRide, updateRide } = useRideStatus(currentRide?.id || null);

  // Update current ride with live updates
  useEffect(() => {
    if (liveRide) {
      setCurrentRide(liveRide);
    }
  }, [liveRide]);

  // Get fare estimates when locations change
  useEffect(() => {
    const getFareEstimates = async () => {
      if (!pickup || !dropoff) {
        setFareEstimates({ bike: null, car: null, xl: null });
        return;
      }

      setFareLoading(true);
      const estimates: Record<VehicleType, FareEstimate | null> = {
        bike: null,
        car: null,
        xl: null,
      };

      try {
        await Promise.all(
          (['bike', 'car', 'xl'] as VehicleType[]).map(async (vehicleType) => {
            try {
              const estimate = await rideService.getFareEstimate({
                pickup,
                dropoff,
                vehicleType,
              });
              estimates[vehicleType] = estimate;
            } catch (error) {
              console.error(`Failed to get fare estimate for ${vehicleType}:`, error);
            }
          })
        );

        setFareEstimates(estimates);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to get fare estimates',
          variant: 'destructive',
        });
      } finally {
        setFareLoading(false);
      }
    };

    getFareEstimates();
  }, [pickup, dropoff]);

  const handlePickupSelect = (location: LatLng & { address: string }) => {
    setPickup(location);
  };

  const handleDropoffSelect = (location: LatLng & { address: string }) => {
    setDropoff(location);
  };

  const handleRequestRide = async () => {
    if (!pickup || !dropoff) {
      toast({
        title: 'Error',
        description: 'Please select pickup and drop-off locations',
        variant: 'destructive',
      });
      return;
    }

    const request: RideRequest = {
      pickup,
      dropoff,
      vehicleType: selectedVehicle,
    };

    setBookingLoading(true);
    try {
      const ride = await rideService.requestRide(request);
      setCurrentRide(ride);
      updateRide(ride);
      
      toast({
        title: 'Ride Requested',
        description: 'Looking for a nearby driver...',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to request ride. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelRide = async () => {
    if (!currentRide) return;

    try {
      await rideService.cancelRide(currentRide.id);
      setCurrentRide(null);
      
      toast({
        title: 'Ride Cancelled',
        description: 'Your ride has been cancelled successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel ride',
        variant: 'destructive',
      });
    }
  };

  const resetBooking = () => {
    setCurrentRide(null);
    setPickup(null);
    setDropoff(null);
    setPickupInput('');
    setDropoffInput('');
    setFareEstimates({ bike: null, car: null, xl: null });
  };

  if (currentRide) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        {/* Enhanced Header with gradient */}
        <div className="relative bg-gradient-hero text-white p-6 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-sm font-bold">🚗</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Your Ride</h1>
                <p className="text-white/80 text-sm">Track your journey</p>
              </div>
            </div>
            <Link to="/history">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <HistoryIcon className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-4 max-w-md mx-auto space-y-6">
          {/* Enhanced Map with floating style */}
          <div className="h-72 card-floating rounded-2xl overflow-hidden animate-fade-in-up">
            <RideMap
              pickup={currentRide.pickup}
              dropoff={currentRide.dropoff}
              driver={currentRide.driver}
              className="h-full"
            />
          </div>

          {/* Enhanced Ride Status */}
          <div className="animate-slide-up">
            <RideStatus
              ride={currentRide}
              onCancel={handleCancelRide}
              className="card-elevated"
            />
          </div>

          {/* Enhanced Actions */}
          {['completed', 'cancelled'].includes(currentRide.status) && (
            <div className="space-y-3 animate-bounce-in">
              <Button 
                onClick={resetBooking}
                className="w-full btn-ride-primary text-lg py-6 rounded-xl"
                size="lg"
              >
                🚀 Book Another Ride
              </Button>
              <Link to="/history" className="block">
                <Button variant="outline" className="w-full border-2 border-primary/20 hover:border-primary/40 py-6 rounded-xl text-lg" size="lg">
                  📊 View Ride History
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Enhanced Header with gradient and ride-sharing theme */}
      <div className="relative bg-gradient-hero text-white p-6 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-float">
              <span className="text-2xl">🚗</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">RideSync</h1>
              <p className="text-white/80 text-sm">Your reliable ride partner</p>
            </div>
          </div>
          <Link to="/history">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-xl p-3">
              <HistoryIcon className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Enhanced Location Inputs */}
        <div className="card-elevated p-6 space-y-6 animate-fade-in-up rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📍</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">Where to?</h2>
          </div>
          
          <LocationInput
            value={pickupInput}
            onChange={setPickupInput}
            onLocationSelect={handlePickupSelect}
            placeholder="🚩 Pickup location"
            showCurrentLocation
            className="animate-scale-in"
          />
          
          <LocationInput
            value={dropoffInput}
            onChange={setDropoffInput}
            onLocationSelect={handleDropoffSelect}
            placeholder="🏁 Where are you going?"
            className="animate-scale-in"
          />
        </div>

        {/* Enhanced Map */}
        {(pickup || dropoff) && (
          <div className="h-80 card-floating rounded-2xl overflow-hidden animate-slide-up">
            <RideMap
              pickup={pickup}
              dropoff={dropoff}
              className="h-full"
            />
          </div>
        )}

        {/* Enhanced Vehicle Selection */}
        {pickup && dropoff && (
          <div className="card-elevated p-6 space-y-6 animate-bounce-in rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🚙</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">Choose your ride</h2>
            </div>
            
            <VehicleSelector
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
              fareEstimates={fareEstimates}
              loading={fareLoading}
            />

            <Button
              onClick={handleRequestRide}
              disabled={bookingLoading || !fareEstimates[selectedVehicle]}
              className="w-full btn-ride-primary text-lg py-6 rounded-xl interactive-scale"
              size="lg"
            >
              {bookingLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Requesting...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  🚀 Request Ride
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
