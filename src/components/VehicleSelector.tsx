import React from 'react';
import { Bike, Car, Truck } from 'lucide-react';
import { VehicleType, FareEstimate } from '@/types/ride';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface VehicleSelectorProps {
  selectedVehicle: VehicleType;
  onVehicleSelect: (vehicle: VehicleType) => void;
  fareEstimates: Record<VehicleType, FareEstimate | null>;
  loading: boolean;
  className?: string;
}

const vehicleInfo = {
  bike: {
    name: 'Bike',
    icon: Bike,
    description: 'Quick & affordable',
    capacity: '1-2 people',
  },
  car: {
    name: 'Car',
    icon: Car,
    description: 'Comfortable ride',
    capacity: '1-4 people',
  },
  xl: {
    name: 'XL',
    icon: Truck,
    description: 'Extra space',
    capacity: '1-6 people',
  },
};

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  selectedVehicle,
  onVehicleSelect,
  fareEstimates,
  loading,
  className,
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {(Object.keys(vehicleInfo) as VehicleType[]).map((vehicleType) => {
        const vehicle = vehicleInfo[vehicleType];
        const fare = fareEstimates[vehicleType];
        const isSelected = selectedVehicle === vehicleType;
        const Icon = vehicle.icon;

        return (
          <Card
            key={vehicleType}
            className={cn(
              'p-4 cursor-pointer transition-all duration-200 border-2',
              'hover:shadow-md hover:scale-[1.02]',
              isSelected
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-primary/50'
            )}
            onClick={() => onVehicleSelect(vehicleType)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                  <p className="text-xs text-muted-foreground">{vehicle.capacity}</p>
                </div>
              </div>

              <div className="text-right">
                {loading ? (
                  <div className="flex flex-col items-end gap-1">
                    <div className="w-16 h-4 bg-muted animate-pulse rounded" />
                    <div className="w-12 h-3 bg-muted animate-pulse rounded" />
                  </div>
                ) : fare ? (
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-lg text-foreground">
                      {formatCurrency(fare.total, fare.currency)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {fare.durationMin} min • {fare.distanceKm} km
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Select locations
                  </span>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};