import { QUERY_KEYS } from '@/lib/constants';
import { MapMarkersResult } from '@lactalink/types/api';
import { useQuery } from '@tanstack/react-query';
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { RNMarker } from 'react-native-google-maps-plus';
import { fetchMapMarkers } from '../lib/fetch';
import { BoundarySchema, DataMarker, DataMarkerSlug } from '../lib/types';
import { mapMarkerToRNMarker, markersReducer } from '../lib/utils/markerUtils';

/** Maximum number of viewport keys to track for stale-marker reconciliation. */
const MAX_VIEWPORT_CACHE = 30;

/** Number of markers processed per chunk before yielding to the JS event loop. */
const CHUNK_SIZE = 50;

/**
 * Viewport-aware React Query hook for fetching and processing map markers.
 *
 * Unlike the legacy `useMarkersQuery`, this hook uses a single query against the
 * `/api/map-markers` endpoint (instead of one query per collection slug) and
 * operates on lightweight `MapMarker` payloads rather than full Payload documents.
 *
 * The hook only fetches when a `viewport` is provided. Pass `null` to suppress
 * the query (e.g. while the map is initialising or the camera has not settled).
 *
 * @param viewport - Current visible map region, or `null` to pause fetching.
 * @param types - Which marker types to include. Defaults to all four types.
 * @returns Processed marker state and query status flags.
 */
export function useMarkersQuery(viewport: BoundarySchema | null, types?: DataMarkerSlug[]) {
  const [markersMap, updateMarkers] = useReducer(markersReducer, new Map<string, DataMarker>());
  const [isProcessing, setIsProcessing] = useState(false);

  const markers = useMemo<RNMarker[]>(
    () => Array.from(markersMap.values()).map((dm) => dm.marker),
    [markersMap]
  );

  // Track the last-seen data reference to skip processing when data hasn't changed.
  const seenDataRef = useRef<MapMarkersResult>([]);

  // Per-viewport ID registry used to detect markers that were removed server-side.
  // Maps a serialised viewport+types key → the set of marker IDs returned by the
  // last successful fetch for that viewport.
  // Capped at MAX_VIEWPORT_CACHE entries (LRU eviction — oldest key first).
  const viewportIDsRef = useRef(new Map<string, Set<string>>());

  const queryKey = useMemo(
    () => [...QUERY_KEYS.MARKERS, viewport, types ?? null],
    [viewport, types]
  );

  const { data, isPending, isError, isSuccess, error } = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetchMapMarkers(viewport!, types, { signal }),
    enabled: viewport !== null,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    // Skip processing if the data reference is unchanged.
    if (!data || data === seenDataRef.current) return;
    seenDataRef.current = data;

    let cancelled = false;
    setIsProcessing(true);

    // Defer heavy work by one frame so the current render can paint first.
    const rafId = requestAnimationFrame(() => {
      void (async () => {
        const dataMarkersMap = new Map<string, DataMarker>();

        // Process in fixed-size chunks, yielding to the event loop between each
        // chunk so animations and touch responses remain unblocked.
        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
          if (cancelled) break;

          data.slice(i, i + CHUNK_SIZE).forEach((mapMarker) => {
            const rnMarker = mapMarkerToRNMarker(mapMarker);
            dataMarkersMap.set(rnMarker.id, { marker: rnMarker, data: mapMarker });
          });

          // Yield to the JS event loop before the next chunk.
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }

        if (!cancelled) {
          // Reconcile stale markers: find IDs that were in the previous fetch for
          // this viewport but are absent from the current response (deleted server-side).
          // viewportKey is derived from queryKey (already memoised) to avoid adding
          // viewport/types as extra useEffect dependencies.
          const viewportKey = JSON.stringify(queryKey);
          const prevIDs = viewportIDsRef.current.get(viewportKey) ?? new Set<string>();
          const staleIDs = new Set([...prevIDs].filter((id) => !dataMarkersMap.has(id)));

          // Update the registry with the current result set.
          // Re-inserting after delete moves this key to the most-recent (tail) position.
          viewportIDsRef.current.delete(viewportKey);
          viewportIDsRef.current.set(viewportKey, new Set(dataMarkersMap.keys()));

          // LRU eviction: drop the oldest entry when the cache exceeds the cap.
          if (viewportIDsRef.current.size > MAX_VIEWPORT_CACHE) {
            const oldest = viewportIDsRef.current.keys().next().value;
            if (oldest !== undefined) viewportIDsRef.current.delete(oldest);
          }

          // Mark as a non-urgent transition so React can interrupt it for
          // higher-priority updates (touches, animations, etc.).
          startTransition(() => updateMarkers({ add: dataMarkersMap, remove: staleIDs }));
          setIsProcessing(false);
        }
      })();
    });

    return () => {
      // Cancel in-flight processing if viewport or data changes before it finishes.
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [data, queryKey]);

  const getDataMarker = useCallback(
    (markerID: string): DataMarker | undefined => markersMap.get(markerID),
    [markersMap]
  );

  return { markersMap, markers, getDataMarker, isProcessing, isPending, isError, isSuccess, error };
}
