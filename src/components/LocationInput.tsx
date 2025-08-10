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
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-20 bg-card border-border focus:ring-2 focus:ring-primary focus:border-transparent"
          onFocus={() => value.length >= 3 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearInput}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          
          {showCurrentLocation && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCurrentLocation}
              disabled={geoLoading}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <Navigation className={cn("w-3 h-3", geoLoading && "animate-pulse")} />
            </Button>
          )}
        </div>
      </div>

      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="w-4 h-4 animate-pulse mx-auto mb-2" />
              Searching...
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-muted border-b border-border last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground leading-relaxed">
                    {suggestion.display_name}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};