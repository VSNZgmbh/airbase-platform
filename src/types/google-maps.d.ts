// Minimal Google Maps type declarations for use with @googlemaps/js-api-loader.
// Replace with @types/google.maps once network access allows npm install.

declare namespace google {
  namespace maps {
    class Map {
      constructor(element: Element, options?: MapOptions);
      setCenter(latlng: LatLngLiteral): void;
      setZoom(zoom: number): void;
      panTo(latLng: LatLngLiteral): void;
      addListener(eventName: string, handler: (e: MapMouseEvent) => void): void;
    }

    class Marker {
      constructor(options?: MarkerOptions);
      setPosition(latlng: LatLngLiteral): void;
      getPosition(): LatLng | null;
      addListener(eventName: string, handler: () => void): void;
    }

    class Geocoder {
      geocode(request: { location: LatLngLiteral }): Promise<{ results: GeocoderResult[] }>;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapMouseEvent {
      latLng: LatLng | null;
    }

    interface MapOptions {
      center?: LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }

    interface MarkerOptions {
      position?: LatLngLiteral;
      map?: Map;
      draggable?: boolean;
      title?: string;
    }

    interface GeocoderResult {
      formatted_address: string;
    }

    namespace marker {
      class AdvancedMarkerElement {
        position: LatLngLiteral | null;
      }
    }

    namespace places {
      class Autocomplete {
        constructor(input: HTMLInputElement, options?: AutocompleteOptions);
        addListener(eventName: string, handler: () => void): void;
        getPlace(): PlaceResult;
      }

      interface AutocompleteOptions {
        componentRestrictions?: { country: string | string[] };
        fields?: string[];
      }

      interface PlaceResult {
        formatted_address?: string;
        geometry?: {
          location: LatLng;
        };
      }
    }
  }
}
