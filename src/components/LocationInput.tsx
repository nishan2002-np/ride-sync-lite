import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { locationService } from '@/services/api';
import { LocationSuggestion, LatLng } from '@/types/ride';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: LatLng & { address: string }) => void;
  placeholder: string;
  showCurrentLocation?: boolean;
  className?: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onLocationSelect,
  placeholder,
  showCurrentLocation = false,
  className,
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getCurrentPosition, position, loading: geoLoading } = useGeolocation();

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (value.length >= 3) {
        setLoading(true);
        const results = await locationService.searchLocations(value);
        setSuggestions(results);
        setShowSuggestions(true);
        setLoading(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  useEffect(() => {
    if (position) {
      locationService.reverseGeocode(position.lat, position.lng).then(address => {
        const location = { ...position, address };
        onLocationSelect(location);
        onChange(address);
      });
    }
  }, [position, onLocationSelect, onChange]);

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const location = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
      address: suggestion.display_name,
    };
    onLocationSelect(location);
    onChange(suggestion.display_name);
    setShowSuggestions(false);
  };

  const handleCurrentLocation = () => {
    getCurrentPosition();
  };

  const clearInput = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
          <MapPin className="text-white w-3 h-3" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-12 pr-20 py-4 text-lg bg-card border-2 border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-300"
          onFocus={() => value.length >= 3 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearInput}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          {showCurrentLocation && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCurrentLocation}
              disabled={geoLoading}
              className="h-8 w-8 p-0 hover:bg-accent/10 hover:text-accent rounded-full"
            >
              <Navigation className={cn("w-4 h-4", geoLoading && "animate-spin text-accent")} />
            </Button>
          )}
        </div>
      </div>

      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border rounded-xl shadow-ride-elevated z-50 max-h-60 overflow-y-auto backdrop-blur-sm animate-fade-in-up">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">🔍 Searching locations...</p>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-5 py-4 hover:bg-primary/5 border-b border-border/50 last:border-b-0 transition-all duration-200 hover:scale-[1.01] group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-foreground leading-relaxed font-medium group-hover:text-primary transition-colors duration-200">
                      {suggestion.display_name}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};