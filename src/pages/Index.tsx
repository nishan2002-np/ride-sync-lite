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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <h1 className="text-xl font-bold text-foreground">Your Ride</h1>
            <Link to="/history">
              <Button variant="ghost" size="sm">
                <HistoryIcon className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-4 max-w-md mx-auto space-y-4">
          {/* Map */}
          <div className="h-64">
            <RideMap
              pickup={currentRide.pickup}
              dropoff={currentRide.dropoff}
              driver={currentRide.driver}
              className="h-full"
            />
          </div>

          {/* Ride Status */}
          <RideStatus
            ride={currentRide}
            onCancel={handleCancelRide}
          />

          {/* Actions */}
          {['completed', 'cancelled'].includes(currentRide.status) && (
            <div className="space-y-2">
              <Button 
                onClick={resetBooking}
                className="w-full"
                size="lg"
              >
                Book Another Ride
              </Button>
              <Link to="/history" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  View Ride History
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-xl font-bold text-foreground">RideSync</h1>
          <Link to="/history">
            <Button variant="ghost" size="sm">
              <HistoryIcon className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Location Inputs */}
        <Card className="p-4 space-y-4">
          <h2 className="font-semibold text-foreground">Where to?</h2>
          
          <LocationInput
            value={pickupInput}
            onChange={setPickupInput}
            onLocationSelect={handlePickupSelect}
            placeholder="Pickup location"
            showCurrentLocation
          />
          
          <LocationInput
            value={dropoffInput}
            onChange={setDropoffInput}
            onLocationSelect={handleDropoffSelect}
            placeholder="Where are you going?"
          />
        </Card>

        {/* Map */}
        {(pickup || dropoff) && (
          <div className="h-64">
            <RideMap
              pickup={pickup}
              dropoff={dropoff}
              className="h-full"
            />
          </div>
        )}

        {/* Vehicle Selection */}
        {pickup && dropoff && (
          <Card className="p-4 space-y-4">
            <h2 className="font-semibold text-foreground">Choose a ride</h2>
            
            <VehicleSelector
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
              fareEstimates={fareEstimates}
              loading={fareLoading}
            />

            <Button
              onClick={handleRequestRide}
              disabled={bookingLoading || !fareEstimates[selectedVehicle]}
              className="w-full"
              size="lg"
            >
              {bookingLoading ? 'Requesting...' : 'Request Ride'}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
