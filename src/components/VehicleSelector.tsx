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
              'p-5 cursor-pointer transition-all duration-300 border-2 interactive-scale',
              'hover:shadow-ride-primary hover:scale-[1.02]',
              isSelected
                ? 'border-primary bg-gradient-to-r from-primary/10 to-primary/5 ring-2 ring-primary/30 shadow-ride-primary'
                : 'border-border hover:border-primary/50 card-elevated'
            )}
            onClick={() => onVehicleSelect(vehicleType)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300',
                    isSelected
                      ? 'bg-gradient-primary text-white shadow-ride-primary'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10'
                  )}
                >
                  <Icon className="w-7 h-7" />
                </div>
                
                <div>
                  <h3 className="font-bold text-lg text-foreground">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{vehicle.description}</p>
                  <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md mt-1 inline-block">
                    👥 {vehicle.capacity}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {loading ? (
                  <div className="flex flex-col items-end gap-2">
                    <div className="w-20 h-5 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse rounded-lg" />
                    <div className="w-16 h-3 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse rounded-md" />
                  </div>
                ) : fare ? (
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "font-bold text-xl",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      💰 {formatCurrency(fare.total, fare.currency)}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                      ⏱️ {fare.durationMin} min • 📏 {fare.distanceKm} km
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                    📍 Select locations
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