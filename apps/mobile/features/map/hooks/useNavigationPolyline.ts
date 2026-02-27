import { Coordinates, Polyline } from '@lactalink/types';
import { trimPolyline } from '@lactalink/utilities/geo-utils';
import { useEffect, useRef, useState } from 'react';

/** Distance in metres beyond which the user is considered off-route. */
const OFF_ROUTE_THRESHOLD = 150;

type NavigationPolylineResult = {
  /** The polyline with passed segments removed (starts at snapped user position). */
  trimmedPolyline: Polyline | undefined;
  /** The user's position snapped onto the polyline. */
  snappedPosition: Coordinates | undefined;
  /** Distance (m) of the user's actual position from the route. */
  distanceFromRoute: number;
  /** `true` when the user has deviated more than the off-route threshold. */
  isOffRoute: boolean;
};

/**
 * Reactively trims a route polyline based on the user's live GPS position.
 *
 * As the user moves along the route, points they have already passed are
 * removed so the rendered polyline "shrinks" behind them — giving a real
 * navigation feel **without** re-fetching directions from the Google Routes API.
 *
 * A forward-biased segment search prevents backward snapping on overlapping
 * or looping routes. The last matched segment index is persisted across
 * renders via a ref.
 *
 * @param polyline - The full route polyline from the directions response.
 * @param isActive - Whether navigation mode is currently active.
 */
export function useNavigationPolyline(
  polyline: Polyline | undefined,
  userCoords: Coordinates | undefined | null,
  isActive: boolean
): NavigationPolylineResult {
  const lastSegmentIndexRef = useRef(0);

  // Reset the forward-search anchor whenever the source polyline changes
  // (e.g. new route, travel mode change) or navigation is deactivated.
  const polylineRef = useRef(polyline);

  const [result, setResult] = useState<NavigationPolylineResult>({
    trimmedPolyline: polyline,
    snappedPosition: undefined,
    distanceFromRoute: 0,
    isOffRoute: false,
  });

  useEffect(() => {
    if (polylineRef.current !== polyline || !isActive) {
      polylineRef.current = polyline;
      lastSegmentIndexRef.current = 0;
    }

    if (!isActive || !polyline || polyline.length < 2 || !userCoords) {
      return;
    }

    const trimmed = trimPolyline(
      polyline,
      { ...userCoords, latitude: userCoords.latitude },
      lastSegmentIndexRef.current
    );
    if (!trimmed) return;

    // Persist the segment index for the next update's forward-biased search.
    lastSegmentIndexRef.current = trimmed.segmentIndex;

    setResult({
      trimmedPolyline: trimmed.trimmed,
      snappedPosition: trimmed.snappedPosition,
      distanceFromRoute: trimmed.distanceFromRoute,
      isOffRoute: trimmed.distanceFromRoute > OFF_ROUTE_THRESHOLD,
    });
  }, [polyline, isActive, userCoords]);

  return result;
}
