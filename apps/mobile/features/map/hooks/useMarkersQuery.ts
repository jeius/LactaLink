import { QUERY_KEYS } from '@/lib/constants';
import { DataFromCollectionSlug } from '@lactalink/types/payload-types';
import { useQueries, UseQueryResult } from '@tanstack/react-query';
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { fetchMarkers } from '../lib/fetchMarkers';
import { DataMarker, DataMarkerSlug } from '../lib/types';
import { createDataMarkerFromDoc } from '../lib/utils/markerUtils';

/** Number of documents processed per chunk before yielding to the JS event loop. */
const CHUNK_SIZE = 50;

type RawResult = UseQueryResult<DataFromCollectionSlug<DataMarkerSlug>[], Error>;

function markersReducer(
  prev: Map<string, DataMarker>,
  newMap: Map<string, DataMarker>
): Map<string, DataMarker> {
  const next = new Map(prev);
  newMap.forEach((value, key) => next.set(key, value));
  return next;
}

export function useMarkersQuery(
  slugs: DataMarkerSlug[] = ['donations', 'requests', 'hospitals', 'milkBanks']
) {
  const [markersMap, updateMarkers] = useReducer(markersReducer, new Map<string, DataMarker>());
  const [isProcessing, setIsProcessing] = useState(false);

  const markers = useMemo(
    () => Array.from(markersMap.values()).map((dm) => dm.marker),
    [markersMap]
  );

  // Tracks the last-seen data reference per slug to detect genuine changes.
  const seenDataRef = useRef<Map<DataMarkerSlug, DataFromCollectionSlug<DataMarkerSlug>[]>>(
    new Map()
  );

  // combine only aggregates status and passes raw results through — no transforms.
  const combineResults = useCallback(
    (results: RawResult[]) => ({
      rawResults: results,
      isPending: results.some((r) => r.status === 'pending'),
      isError: results.some((r) => r.status === 'error'),
      isSuccess: results.every((r) => r.status === 'success'),
      errors: results.filter((r) => r.status === 'error').map((r) => r.error),
    }),
    []
  );

  const { rawResults, isPending, isError, isSuccess, errors } = useQueries({
    subscribed: true,
    queries: slugs.map((slug) => ({
      queryKey: [...QUERY_KEYS.MARKERS, slug],
      queryFn: () => fetchMarkers(slug),
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    })),
    combine: combineResults,
  });

  useEffect(() => {
    // Collect only slugs whose data reference has actually changed since last run.
    const changed: { slug: DataMarkerSlug; data: DataFromCollectionSlug<DataMarkerSlug>[] }[] = [];

    rawResults.forEach((result, idx) => {
      if (result.status !== 'success') return;
      const slug = slugs[idx];
      if (!slug) return;
      if (seenDataRef.current.get(slug) === result.data) return;
      seenDataRef.current.set(slug, result.data);
      changed.push({ slug, data: result.data });
    });

    // Nothing changed — exit cheaply without scheduling any work.
    if (changed.length === 0) return;

    let cancelled = false;
    setIsProcessing(true);

    // Defer heavy work by one frame so the current render can paint first.
    const rafId = requestAnimationFrame(() => {
      void (async () => {
        for (const { data } of changed) {
          if (cancelled) break;

          const dataMarkersMap = new Map<string, DataMarker>();

          // Process in fixed-size chunks, yielding to the event loop between each
          // chunk so animations and touch responses remain unblocked.
          for (let i = 0; i < data.length; i += CHUNK_SIZE) {
            if (cancelled) break;

            data
              .slice(i, i + CHUNK_SIZE)
              .flatMap((doc) => {
                const result = createDataMarkerFromDoc(doc);
                if (!result) return [];
                return Array.isArray(result) ? result : [result];
              })
              .forEach((dm) => dataMarkersMap.set(dm.marker.id, dm));

            // Yield to the JS event loop before the next chunk.
            await new Promise<void>((resolve) => setTimeout(resolve, 0));
          }

          if (!cancelled) {
            // Mark as a non-urgent transition so React can interrupt it for
            // higher-priority updates (touches, animations, etc.).
            startTransition(() => updateMarkers(dataMarkersMap));
          }
        }

        if (!cancelled) setIsProcessing(false);
      })();
    });

    return () => {
      // If new data arrives before processing finishes, cancel the in-flight
      // work to prevent stale chunks from writing to the markers map.
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [rawResults, slugs]);

  return { markersMap, markers, isProcessing, isPending, isError, isSuccess, errors };
}
