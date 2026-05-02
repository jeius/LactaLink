import { useDirectionActions } from '@/features/directions/components/DirectionsProvider';
import { USER_MARKER_ID } from '@/lib/constants';
import { produce } from 'immer';
import isEqual from 'lodash/isEqual';
import { RefObject, useEffect, useRef } from 'react';
import {
  GoogleMapsViewRef,
  RNLocation,
  RNMapPadding,
  RNPolyline,
} from 'react-native-google-maps-plus';

interface UseMapNavigationParams {
  mapRef: RefObject<GoogleMapsViewRef | null>;
  isOffRoute: boolean;
  isDirectionMode: boolean;
  locationUpdates: RNLocation | null;
  routePolylines: RNPolyline | null;
  isLoadingDirections: boolean;
  start: string | undefined;
  dest: string | undefined;
  mapPadding: RNMapPadding;
  hideMarkerInfoWindow: () => void;
}

/**
 * Handles camera positioning for direction mode and off-route rerouting.
 *
 * Fits the map camera to the current route whenever the route or its endpoints
 * change. When the user deviates beyond the off-route threshold, the origin is
 * updated to their current position to trigger a fresh route fetch.
 *
 * @param params.mapRef - Ref to the `GoogleMapsView` instance.
 * @param params.isOffRoute - Whether the user has deviated from the planned route.
 * @param params.isDirectionMode - Whether direction mode is currently active.
 * @param params.locationUpdates - Latest location update from the map.
 * @param params.routePolylines - The current rendered route polyline, or null.
 * @param params.isLoadingDirections - Whether a directions request is in flight.
 * @param params.start - Start endpoint query param.
 * @param params.dest - Destination endpoint query param.
 * @param params.mapPadding - Current map padding to offset the camera bounds.
 * @param params.hideMarkerInfoWindow - Callback to close any open info window.
 */
export function useMapNavigation({
  mapRef,
  isOffRoute,
  isDirectionMode,
  locationUpdates,
  routePolylines,
  isLoadingDirections,
  start,
  dest,
  mapPadding,
  hideMarkerInfoWindow,
}: UseMapNavigationParams) {
  const alreadyFittedRef = useRef(false);
  const prevEndpointsRef = useRef({ start, dest });
  const hasReRoutedRef = useRef(false);

  const { setInputs } = useDirectionActions();

  // When the user goes off-route, update the origin to the current position to trigger a re-route.
  useEffect(() => {
    if (!isOffRoute) {
      hasReRoutedRef.current = false;
      return;
    }

    if (!locationUpdates?.center || hasReRoutedRef.current) return;

    hasReRoutedRef.current = true;
    // Reset camera fit so it refits after the new route resolves.
    alreadyFittedRef.current = false;
    setInputs({
      origin: {
        coordinates: locationUpdates.center,
        name: 'Your Location',
        markerID: USER_MARKER_ID,
      },
    });
  }, [isOffRoute, locationUpdates, setInputs]);

  // When in direction mode, fit the camera to the route polyline.
  useEffect(() => {
    if (!isDirectionMode) {
      alreadyFittedRef.current = false;
      return;
    }

    if (!routePolylines) return;

    const currentEndpoints = { start, dest };
    const prevEndpoints = prevEndpointsRef.current;
    const endpointsChanged = !isEqual(currentEndpoints, prevEndpoints);

    if (isLoadingDirections && endpointsChanged) {
      alreadyFittedRef.current = false;
      return;
    }

    if (!alreadyFittedRef.current) {
      hideMarkerInfoWindow();
      // Add extra padding to ensure markers aren't too close to edges.
      const padding = produce(mapPadding, (draft) => {
        for (const [key, value] of Object.entries(mapPadding)) {
          draft[key as keyof RNMapPadding] = value + 40;
        }
      });
      mapRef.current?.setCameraToCoordinates(routePolylines.coordinates, padding, true, 500);
      alreadyFittedRef.current = true;
      prevEndpointsRef.current = { start, dest };
    }
  }, [
    dest,
    hideMarkerInfoWindow,
    isDirectionMode,
    isLoadingDirections,
    mapPadding,
    mapRef,
    routePolylines,
    start,
  ]);
}
