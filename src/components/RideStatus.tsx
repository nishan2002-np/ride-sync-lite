import React from 'react';
import { Clock, User, Star, Phone, MessageCircle, X } from 'lucide-react';
import { Ride, RideStatus as RideStatusType } from '@/types/ride';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RideStatusProps {
  ride: Ride;
  onCancel?: () => void;
  className?: string;
}

const statusInfo: Record<RideStatusType, { label: string; description: string; color: string }> = {
  requested: {
    label: 'Finding Driver',
    description: 'Looking for a nearby driver...',
    color: 'hsl(var(--status-requested))',
  },
  assigned: {
    label: 'Driver Assigned',
    description: 'Driver is on the way to pickup',
    color: 'hsl(var(--status-assigned))',
  },
  accepted: {
    label: 'Driver Accepted',
    description: 'Driver has accepted your ride',
    color: 'hsl(var(--status-accepted))',
  },
  on_trip: {
    label: 'On Trip',
    description: 'You are on your way to destination',
    color: 'hsl(var(--status-on-trip))',
  },
  completed: {
    label: 'Completed',
    description: 'You have reached your destination',
    color: 'hsl(var(--status-completed))',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Your ride has been cancelled',
    color: 'hsl(var(--status-cancelled))',
  },
};

export const RideStatus: React.FC<RideStatusProps> = ({
  ride,
  onCancel,
  className,
}) => {
  const status = statusInfo[ride.status];
  const canCancel = ['requested', 'assigned', 'accepted'].includes(ride.status);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstimatedArrival = () => {
    if (ride.estimatedArrival) {
      const eta = new Date(ride.estimatedArrival);
      const now = new Date();
      const diffMinutes = Math.max(0, Math.floor((eta.getTime() - now.getTime()) / 60000));
      return diffMinutes;
    }
    return null;
  };

  const etaMinutes = getEstimatedArrival();

  return (
    <Card className={cn('p-6 space-y-6 card-elevated', className)}>
      {/* Enhanced Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={cn("status-indicator w-4 h-4", `status-${ride.status}`)}
            />
            <div
              className={cn("status-indicator w-6 h-6 absolute -top-1 -left-1 opacity-30", `status-${ride.status}`)}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{status.label}</h2>
            <p className="text-sm text-muted-foreground font-medium">{status.description}</p>
          </div>
        </div>
        
        {canCancel && onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive border-destructive/30 hover:border-destructive"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>

      {/* Enhanced ETA */}
      {etaMinutes !== null && (
        <div className="flex items-center gap-3 p-4 bg-gradient-accent rounded-xl border border-accent/20 animate-pulse-slow">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-lg">
              Arriving in {etaMinutes} minutes
            </span>
            <p className="text-white/80 text-sm">Driver is on the way</p>
          </div>
        </div>
      )}

      {/* Driver Info */}
      {ride.driver && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{ride.driver.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {ride.driver.vehicleModel}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {ride.driver.plateNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">
                    {ride.driver.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Details */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Pickup</span>
          <span className="text-sm text-foreground font-medium">
            {ride.pickup.address}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Destination</span>
          <span className="text-sm text-foreground font-medium">
            {ride.dropoff.address}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Distance</span>
          <span className="text-sm text-foreground font-medium">
            {ride.fare.distanceKm} km
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Estimated Fare</span>
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(ride.fare.total, ride.fare.currency)}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Booked at</span>
          <span className="text-muted-foreground">
            {formatTime(ride.createdAt)}
          </span>
        </div>
      </div>
    </Card>
  );
};