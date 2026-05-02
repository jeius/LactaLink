import { parseMarkerID } from '@/lib/utils/markerUtils';
import { isValidCoordinate } from '@lactalink/utilities/geolib';
import { RefObject, useEffect } from 'react';
import { GoogleMapsViewRef, RNLatLng } from 'react-native-google-maps-plus';

interface UseMarkerCameraParams {
  mapRef: RefObject<GoogleMapsViewRef | null>;
  isFocused: boolean;
  isDirectionMode: boolean;
  selectedMarkerID: string | undefined;
  lat: string | undefined;
  lng: string | undefined;
}

/**
 * Moves the map camera to the selected marker or the explicit `lat`/`lng` query
 * params when the screen gains focus and direction mode is inactive.
 *
 * Only runs when the screen is focused to prevent unwanted camera movements
 * when navigating back to the map screen.
 *
 * @param params.mapRef - Ref to the `GoogleMapsView` instance.
 * @param params.isFocused - Whether this screen is currently focused.
 * @param params.isDirectionMode - Whether direction mode is currently active.
 * @param params.selectedMarkerID - The ID of the currently selected marker, or undefined.
 * @param params.lat - Optional latitude query param for explicit camera positioning.
 * @param params.lng - Optional longitude query param for explicit camera positioning.
 */
export function useMarkerCamera({
  mapRef,
  isFocused,
  isDirectionMode,
  selectedMarkerID,
  lat,
  lng,
}: UseMarkerCameraParams) {
  useEffect(() => {
    // Only attempt to move camera if screen is focused to prevent unwanted
    // camera movements when navigating back to the map screen.
    if (!isFocused || isDirectionMode) return;

    function setCamera(coordinates: RNLatLng) {
      mapRef.current?.setCamera({ center: coordinates, zoom: 18 }, true, 500);
    }

    // If a markerID is provided, attempt to find the marker and show its info window.
    if (selectedMarkerID) {
      const { coordinates } = parseMarkerID(selectedMarkerID) ?? {};

      if (coordinates) {
        setCamera(coordinates);
        mapRef.current?.showMarkerInfoWindow(selectedMarkerID);
      }
    }
    // If lat and lng are provided, move the camera to those coordinates.
    else if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      if (isValidCoordinate({ latitude, longitude })) {
        setCamera({ latitude, longitude });
      }
    }
  }, [isDirectionMode, isFocused, lat, lng, mapRef, selectedMarkerID]);
}
