import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { rideService } from '@/services/api';
import { Ride } from '@/types/ride';
import { cn } from '@/lib/utils';

const History: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRideHistory = async () => {
      try {
        setLoading(true);
        const history = await rideService.getRideHistory();
        setRides(history);
      } catch (err) {
        setError('Failed to load ride history');
        console.error('Error fetching ride history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRideHistory();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      case 'on_trip':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Ride History</h1>
          </div>

          {/* Loading skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24" />
                      <div className="h-3 bg-muted rounded w-32" />
                    </div>
                    <div className="h-6 bg-muted rounded w-16" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Ride History</h1>
          </div>

          <Card className="p-6 text-center">
            <div className="text-destructive mb-4">
              <Clock className="w-12 h-12 mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Failed to Load History
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Ride History</h1>
        </div>

        {/* Content */}
        {rides.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No rides yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Your completed rides will appear here
            </p>
            <Link to="/">
              <Button>Book Your First Ride</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => {
              const { date, time } = formatDate(ride.createdAt);
              
              return (
                <Card key={ride.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {date}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {time}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            'text-xs capitalize',
                            getStatusColor(ride.status)
                          )}
                        >
                          {ride.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(ride.fare.total, ride.fare.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">
                            {ride.pickup.address.split(',')[0]}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Pickup location
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">
                            {ride.dropoff.address.split(',')[0]}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Drop-off location
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{ride.fare.distanceKm} km</span>
                        <span>{ride.fare.durationMin} min</span>
                        <span className="capitalize">{ride.vehicleType}</span>
                      </div>
                      
                      {ride.driver && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {ride.driver.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;