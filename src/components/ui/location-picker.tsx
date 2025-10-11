"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './button';
import { Input } from './input';
import { MapPin, Search, X, Navigation } from 'lucide-react';
import { MAP_CONFIG, isChineseUser } from '@/lib/map-config';
import { useTranslations } from '../../hooks/useTranslations';

// Type definitions for map APIs
interface AMapMap {
  on: (event: string, callback: (e: { lnglat: { lng: number; lat: number } }) => void) => void;
}

interface AMapGeocoder {
  getAddress: (coords: [number, number], callback: (status: string, result: { regeocode: { formattedAddress: string; addressComponent: Record<string, string> } }) => void) => void;
}

interface GoogleMap {
  addListener: (event: string, callback: (e: { latLng: { lat: () => number; lng: () => number } }) => void) => void;
}

interface GoogleGeocoder {
  geocode: (request: { location: { lat: number; lng: number } }, callback: (results: Array<{ formatted_address: string; address_components: Array<{ types: string[]; long_name: string }> }>, status: string) => void) => void;
}

declare global {
  interface Window {
    AMap: {
      Map: new (container: HTMLElement, options: { center: [number, number]; zoom: number; mapStyle: string }) => AMapMap;
      Geocoder: new () => AMapGeocoder;
    };
    google: {
      maps: {
        Map: new (container: HTMLElement, options: { center: { lat: number; lng: number }; zoom: number }) => GoogleMap;
        Geocoder: new () => GoogleGeocoder;
      };
    };
  }
}

interface LocationData {
  latitude: string;
  longitude: string;
  county: string;
  city: string;
  province: string;
  address: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: Partial<LocationData>;
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    formatted: string;
    geometry: { lat: number; lng: number };
    components: Record<string, string>;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    initialLocation ? {
      latitude: initialLocation.latitude || '',
      longitude: initialLocation.longitude || '',
      county: initialLocation.county || '',
      city: initialLocation.city || '',
      province: initialLocation.province || '',
      address: initialLocation.address || '',
    } : null
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(MAP_CONFIG.DEFAULT_CENTER);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [mapMarker, setMapMarker] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  // Get capital city based on user's timezone
  const getCapitalByTimezone = useCallback(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Common timezone to capital mappings
    const timezoneCapitals: Record<string, { lat: number; lng: number }> = {
      'Asia/Shanghai': { lat: 39.9042, lng: 116.4074 }, // Beijing, China
      'Asia/Chongqing': { lat: 29.4316, lng: 106.9123 }, // Chongqing, China
      'Asia/Hong_Kong': { lat: 22.3193, lng: 114.1694 }, // Hong Kong
      'Asia/Taipei': { lat: 25.0330, lng: 121.5654 }, // Taipei, Taiwan
      'Asia/Singapore': { lat: 1.3521, lng: 103.8198 }, // Singapore
      'Asia/Tokyo': { lat: 35.6762, lng: 139.6503 }, // Tokyo, Japan
      'Asia/Seoul': { lat: 37.5665, lng: 126.9780 }, // Seoul, South Korea
      'Asia/Bangkok': { lat: 13.7563, lng: 100.5018 }, // Bangkok, Thailand
      'Asia/Jakarta': { lat: -6.2088, lng: 106.8456 }, // Jakarta, Indonesia
      'Asia/Kuala_Lumpur': { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur, Malaysia
      'Asia/Manila': { lat: 14.5995, lng: 120.9842 }, // Manila, Philippines
      'Asia/Ho_Chi_Minh': { lat: 10.8231, lng: 106.6297 }, // Ho Chi Minh City, Vietnam
      'America/New_York': { lat: 40.7128, lng: -74.0060 }, // New York, USA
      'America/Los_Angeles': { lat: 34.0522, lng: -118.2437 }, // Los Angeles, USA
      'America/Chicago': { lat: 41.8781, lng: -87.6298 }, // Chicago, USA
      'Europe/London': { lat: 51.5074, lng: -0.1278 }, // London, UK
      'Europe/Paris': { lat: 48.8566, lng: 2.3522 }, // Paris, France
      'Europe/Berlin': { lat: 52.5200, lng: 13.4050 }, // Berlin, Germany
      'Europe/Rome': { lat: 41.9028, lng: 12.4964 }, // Rome, Italy
      'Europe/Madrid': { lat: 40.4168, lng: -3.7038 }, // Madrid, Spain
      'Europe/Amsterdam': { lat: 52.3676, lng: 4.9041 }, // Amsterdam, Netherlands
      'Europe/Stockholm': { lat: 59.3293, lng: 18.0686 }, // Stockholm, Sweden
      'Europe/Moscow': { lat: 55.7558, lng: 37.6176 }, // Moscow, Russia
      'Australia/Sydney': { lat: -33.8688, lng: 151.2093 }, // Sydney, Australia
      'Australia/Melbourne': { lat: -37.8136, lng: 144.9631 }, // Melbourne, Australia
      'Pacific/Auckland': { lat: -36.8485, lng: 174.7633 }, // Auckland, New Zealand
      'America/Toronto': { lat: 43.6532, lng: -79.3832 }, // Toronto, Canada
      'America/Vancouver': { lat: 49.2827, lng: -123.1207 }, // Vancouver, Canada
      'America/Sao_Paulo': { lat: -23.5505, lng: -46.6333 }, // São Paulo, Brazil
      'America/Mexico_City': { lat: 19.4326, lng: -99.1332 }, // Mexico City, Mexico
      'Asia/Dubai': { lat: 25.2048, lng: 55.2708 }, // Dubai, UAE
      'Asia/Riyadh': { lat: 24.7136, lng: 46.6753 }, // Riyadh, Saudi Arabia
      'Asia/Tehran': { lat: 35.6892, lng: 51.3890 }, // Tehran, Iran
      'Asia/Kolkata': { lat: 28.6139, lng: 77.2090 }, // New Delhi, India
      'Asia/Karachi': { lat: 24.8607, lng: 67.0011 }, // Karachi, Pakistan
      'Asia/Dhaka': { lat: 23.8103, lng: 90.4125 }, // Dhaka, Bangladesh
      'Africa/Cairo': { lat: 30.0444, lng: 31.2357 }, // Cairo, Egypt
      'Africa/Lagos': { lat: 6.5244, lng: 3.3792 }, // Lagos, Nigeria
      'Africa/Johannesburg': { lat: -26.2041, lng: 28.0473 }, // Johannesburg, South Africa
    };

    return timezoneCapitals[timezone] || MAP_CONFIG.DEFAULT_CENTER;
  }, []);

  // Function to detect user's current location
  const detectUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter({ lat, lng });
          setIsDetectingLocation(false);
        },
        (error) => {
          console.log('Location access denied or failed:', error);
          // Fallback to capital city based on timezone
          const capitalLocation = getCapitalByTimezone();
          setMapCenter(capitalLocation);
          setIsDetectingLocation(false);
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      // Fallback to capital city based on timezone
      const capitalLocation = getCapitalByTimezone();
      setMapCenter(capitalLocation);
    }
  }, [getCapitalByTimezone]);

  // Detect user's current location on component mount
  useEffect(() => {
    detectUserLocation();
  }, [detectUserLocation]);


  // Initialize AMap (AutoNavi Map) for Chinese users
  const initializeAMap = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject('Window not available');
        return;
      }

      // Load AMap script
      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${MAP_CONFIG.AMAP_KEY}`;
      script.onload = () => {
        try {
          if (!mapRef.current) {
            reject('Map container not available');
            return;
          }
          const map = new window.AMap.Map(mapRef.current, {
            center: [mapCenter.lng, mapCenter.lat],
            zoom: 10,
            mapStyle: 'amap://styles/normal'
          });

          // Add click event to map
          map.on('click', (e) => {
            const { lng, lat } = e.lnglat;
            setMapMarker({ lat, lng });
            reverseGeocodeAMap(lat, lng);
          });

          mapInstanceRef.current = map;
          resolve(map);
        } catch (error) {
          reject(error);
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, [mapCenter.lat, mapCenter.lng]);

  // Initialize Google Maps for international users
  const initializeGoogleMap = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject('Window not available');
        return;
      }

      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_CONFIG.GOOGLE_MAPS_KEY}&libraries=places`;
      script.onload = () => {
        try {
          if (!mapRef.current) {
            reject('Map container not available');
            return;
          }
          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: mapCenter.lat, lng: mapCenter.lng },
            zoom: 10
          });

          // Add click event to map
          map.addListener('click', (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMapMarker({ lat, lng });
            reverseGeocodeGoogle(lat, lng);
          });

          mapInstanceRef.current = map;
          resolve(map);
        } catch (error) {
          reject(error);
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, [mapCenter.lat, mapCenter.lng]);

  // Simple coordinate picker fallback
  const initializeSimplePicker = useCallback(() => {
    // This is a fallback when map APIs are not available
    console.log('Using simple coordinate picker - no map APIs configured');
  }, []);

  // Initialize map based on user's location preference
  const initializeMap = useCallback(async () => {
    try {
      const isChina = isChineseUser();

      if (isChina && MAP_CONFIG.AMAP_KEY !== 'YOUR_AMAP_KEY') {
        await initializeAMap();
      } else if (MAP_CONFIG.GOOGLE_MAPS_KEY !== 'YOUR_GOOGLE_MAPS_KEY') {
        await initializeGoogleMap();
      } else {
        // Fallback to simple coordinate picker when no API keys are configured
        initializeSimplePicker();
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      // Fallback to a simple coordinate picker
      initializeSimplePicker();
    }
  }, [initializeAMap, initializeGoogleMap, initializeSimplePicker]);

  // Initialize map when component mounts
  useEffect(() => {
    if (isOpen && mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [isOpen, initializeMap]);

  // Reverse geocoding for AMap
  const reverseGeocodeAMap = async (lat: number, lng: number) => {
    try {
      const geocoder = new window.AMap.Geocoder();
      geocoder.getAddress([lng, lat], (status, result) => {
        if (status === 'complete' && result.regeocode) {
          const address = result.regeocode.formattedAddress;
          const components = result.regeocode.addressComponent;
          
          const locationData: LocationData = {
            latitude: lat.toString(),
            longitude: lng.toString(),
            county: components.district || '',
            city: components.city || components.province || '',
            province: components.province || '',
            address: address
          };
          
          setSelectedLocation(locationData);
        }
      });
    } catch (error) {
      console.error('Error in AMap reverse geocoding:', error);
    }
  };

  // Reverse geocoding for Google Maps
  const reverseGeocodeGoogle = async (lat: number, lng: number) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const result = results[0];
          const address = result.formatted_address;
          
          // Parse address components
          let county = '';
          let city = '';
          let province = '';
          
          result.address_components.forEach((component) => {
            const types = component.types;
            if (types.includes('administrative_area_level_3')) {
              county = component.long_name;
            } else if (types.includes('administrative_area_level_2')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              province = component.long_name;
            }
          });
          
          const locationData: LocationData = {
            latitude: lat.toString(),
            longitude: lng.toString(),
            county,
            city,
            province,
            address
          };
          
          setSelectedLocation(locationData);
        }
      });
    } catch (error) {
      console.error('Error in Google reverse geocoding:', error);
    }
  };

  // Search for locations
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Use a geocoding service to search for locations
      if (MAP_CONFIG.OPENCAGE_KEY === 'YOUR_OPENCAGE_KEY') {
        console.log('OpenCage API key not configured');
        return;
      }
      
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(searchQuery)}&key=${MAP_CONFIG.OPENCAGE_KEY}&limit=5`
      );
      const data = await response.json();
      
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location selection from search results
  const handleLocationSelect = (result: {
    formatted: string;
    geometry: { lat: number; lng: number };
    components: Record<string, string>;
  }) => {
    const { lat, lng } = result.geometry;
    const components = result.components;
    
    const locationData: LocationData = {
      latitude: lat.toString(),
      longitude: lng.toString(),
      county: components.county || components.city_district || '',
      city: components.city || components.town || '',
      province: components.state || components.province || '',
      address: result.formatted
    };
    
    setSelectedLocation(locationData);
    setMapCenter({ lat, lng });
    setMapMarker({ lat, lng });
    setSearchResults([]);
    setSearchQuery('');
  };

  // Confirm location selection
  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      setIsOpen(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter({ lat, lng });
          setMapMarker({ lat, lng });
          
          // Reverse geocode the current location
          const isChina = isChineseUser();
          if (isChina && MAP_CONFIG.AMAP_KEY !== 'YOUR_AMAP_KEY') {
            reverseGeocodeAMap(lat, lng);
          } else if (MAP_CONFIG.GOOGLE_MAPS_KEY !== 'YOUR_GOOGLE_MAPS_KEY') {
            reverseGeocodeGoogle(lat, lng);
          } else {
            // Simple fallback - just set coordinates
            const locationData: LocationData = {
              latitude: lat.toString(),
              longitude: lng.toString(),
              county: '',
              city: '',
              province: '',
              address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            };
            setSelectedLocation(locationData);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Location Display */}
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-white" />
        <span className="text-white text-sm">
          {selectedLocation 
            ? `${selectedLocation.address || `${selectedLocation.city}, ${selectedLocation.province}`}`
            : t("locationPicker.noLocationSelected")
          }
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="ml-auto"
        >
          {selectedLocation ? t("locationPicker.changeLocation") : t("locationPicker.selectLocation")}
        </Button>
      </div>

      {/* Location Picker Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t("locationPicker.selectLocationTitle")}</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px] sm:h-[500px]">
              {/* Search Panel */}
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{t("locationPicker.searchLocation")}</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder={t("locationPicker.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleSearch}
                      disabled={isSearching}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  className="w-full"
                  disabled={isDetectingLocation}
                >
                  {isDetectingLocation ? t("locationPicker.detecting") : t("locationPicker.useCurrentLocation")}
                </Button>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t("locationPicker.searchResults")}</label>
                    <div className="max-h-32 sm:max-h-48 overflow-y-auto space-y-1">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleLocationSelect(result)}
                          className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                        >
                          <div className="truncate">{result.formatted}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Location Details */}
                {selectedLocation && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t("locationPicker.selectedLocation")}</label>
                    <div className="p-3 bg-gray-50 rounded text-sm space-y-1">
                      <div className="break-words"><strong>{t("locationPicker.address")}:</strong> {selectedLocation.address}</div>
                      <div><strong>{t("locationPicker.province")}:</strong> {selectedLocation.province}</div>
                      <div><strong>{t("locationPicker.city")}:</strong> {selectedLocation.city}</div>
                      <div><strong>{t("locationPicker.county")}:</strong> {selectedLocation.county}</div>
                      <div className="text-xs text-gray-600"><strong>{t("locationPicker.coordinates")}:</strong> {selectedLocation.latitude}, {selectedLocation.longitude}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Panel */}
              <div className="border rounded-lg overflow-hidden">
                {MAP_CONFIG.AMAP_KEY === 'YOUR_AMAP_KEY' && MAP_CONFIG.GOOGLE_MAPS_KEY === 'YOUR_GOOGLE_MAPS_KEY' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-4 bg-gray-50">
                    <Navigation className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                    <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base px-2">
                      {t("locationPicker.mapNotConfigured")}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("locationPicker.latitude")}</label>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g., 39.9042"
                          value={mapMarker?.lat || ''}
                          onChange={(e) => {
                            const lat = parseFloat(e.target.value);
                            if (!isNaN(lat)) {
                              setMapMarker(prev => ({ ...prev, lat, lng: prev?.lng || 0 }));
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("locationPicker.longitude")}</label>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g., 116.4074"
                          value={mapMarker?.lng || ''}
                          onChange={(e) => {
                            const lng = parseFloat(e.target.value);
                            if (!isNaN(lng)) {
                              setMapMarker(prev => ({ ...prev, lng, lat: prev?.lat || 0 }));
                            }
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        if (mapMarker) {
                          const locationData: LocationData = {
                            latitude: mapMarker.lat.toString(),
                            longitude: mapMarker.lng.toString(),
                            county: '',
                            city: '',
                            province: '',
                            address: `${mapMarker.lat.toFixed(6)}, ${mapMarker.lng.toFixed(6)}`
                          };
                          setSelectedLocation(locationData);
                        }
                      }}
                      className="mt-3 sm:mt-4 w-full sm:w-auto"
                      disabled={!mapMarker}
                    >
                      {t("locationPicker.setCoordinates")}
                    </Button>
                  </div>
                ) : (
                  <div ref={mapRef} className="w-full h-full" />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto"
              >
                {t("locationPicker.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedLocation}
                className="w-full sm:w-auto"
              >
                {t("locationPicker.confirmLocation")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
