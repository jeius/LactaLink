import { RefObject, useCallback, useEffect, useRef } from 'react';
import { GoogleMapsViewRef } from 'react-native-google-maps-plus';

/**
 * Manages the visibility of map marker info windows.
 *
 * Automatically shows or hides the info window whenever {@link selectedMarkerID}
 * changes, and exposes stable imperative callbacks for manual control.
 *
 * @param mapRef - Ref to the `GoogleMapsView` instance.
 * @param selectedMarkerID - The currently selected marker ID, or undefined when
 *   no marker is selected.
 * @returns Stable callbacks for imperatively showing and hiding info windows.
 */
export function useMarkerInfoWindow(
  mapRef: RefObject<GoogleMapsViewRef | null>,
  selectedMarkerID: string | undefined
) {
  const prevMarkerIDRef = useRef<string>(null);

  const showMarkerInfoWindow = useCallback(
    (id: string) => {
      mapRef.current?.showMarkerInfoWindow(id);
      prevMarkerIDRef.current = id;
    },
    [mapRef]
  );

  const hideMarkerInfoWindow = useCallback(() => {
    if (prevMarkerIDRef.current) {
      mapRef.current?.hideMarkerInfoWindow(prevMarkerIDRef.current);
      prevMarkerIDRef.current = null;
    }
  }, [mapRef]);

  // When the selected marker changes, show its info window (or hide if null).
  useEffect(() => {
    if (selectedMarkerID) showMarkerInfoWindow(selectedMarkerID);
    else hideMarkerInfoWindow();
  }, [hideMarkerInfoWindow, selectedMarkerID, showMarkerInfoWindow]);

  return { showMarkerInfoWindow, hideMarkerInfoWindow };
}
