import type { Coordinates, Polyline } from '@lactalink/types';
import getDistance from 'geolib/es/getDistance';

/**
 * Result of projecting a point onto a polyline segment.
 */
export type SegmentProjection = {
  /** Index of the segment's start point in the polyline array. */
  segmentIndex: number;
  /** The projected (snapped) point on the segment. */
  projectedPoint: Coordinates;
  /** Haversine distance (meters) from the original point to the projected point. */
  distance: number;
};

/**
 * Result of trimming a polyline based on the user's current position.
 */
export type TrimmedPolyline = {
  /** The remaining polyline from the user's snapped position to the end. */
  trimmed: Polyline;
  /** Index of the segment the user is currently on. */
  segmentIndex: number;
  /** The user's position snapped onto the polyline. */
  snappedPosition: Coordinates;
  /** Distance (meters) from the user's actual position to the snapped position. */
  distanceFromRoute: number;
};

/**
 * Projects a point onto a line segment AB and returns the projected point.
 *
 * Uses a local Cartesian approximation (scaled by cos(latitude)) which is
 * accurate for the short segments typical of route polylines (< 500 m).
 *
 * @param point - The point to project.
 * @param segmentStart - Start of the line segment (A).
 * @param segmentEnd - End of the line segment (B).
 * @returns The projected coordinate clamped to the segment bounds.
 */
export function projectPointOnSegment(
  point: Coordinates,
  segmentStart: Coordinates,
  segmentEnd: Coordinates
): Coordinates {
  // Convert to a local Cartesian frame. The cosine factor corrects for
  // longitude convergence at the given latitude.
  const cosLat = Math.cos((point.latitude * Math.PI) / 180);

  const ax = segmentStart.longitude * cosLat;
  const ay = segmentStart.latitude;
  const bx = segmentEnd.longitude * cosLat;
  const by = segmentEnd.latitude;
  const px = point.longitude * cosLat;
  const py = point.latitude;

  const abx = bx - ax;
  const aby = by - ay;

  const dot = abx * abx + aby * aby;

  // Degenerate segment (A == B) — just return A.
  if (dot === 0) return segmentStart;

  // Parameter t ∈ [0, 1] representing where the projection falls on the segment.
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / dot));

  return {
    latitude: ay + t * aby,
    longitude: (ax + t * abx) / cosLat,
  };
}

/**
 * Finds the polyline segment nearest to a given point.
 *
 * Always searches the **entire** polyline so that backtracking is detected
 * immediately (the polyline "grows back" when the user reverses).
 *
 * To prevent jitter on routes with parallel / overlapping segments, a
 * forward-segment preference is applied: when a backward segment's distance
 * is within `forwardBias` metres of the best forward segment, the forward
 * match wins. A backward segment must be **meaningfully** closer to override
 * the current forward position.
 *
 * @param polyline - The full route polyline.
 * @param point - The user's current position.
 * @param lastIndex - The segment index from the previous update (default `0`).
 *   Segments at or after this index are considered "forward".
 * @param forwardBias - Extra metres a backward segment must beat the best
 *   forward segment by in order to be chosen (default `30`).
 * @returns The projection onto the nearest segment, or `null` when the
 *   polyline has fewer than 2 points.
 */
export function findNearestSegmentIndex(
  polyline: Polyline,
  point: Coordinates,
  lastIndex: number = 0,
  forwardBias: number = 30
): SegmentProjection | null {
  if (polyline.length < 2) return null;

  const safeLastIndex = Math.max(0, Math.min(lastIndex, polyline.length - 2));

  let bestForward: SegmentProjection | null = null;
  let bestBackward: SegmentProjection | null = null;

  for (let i = 0; i < polyline.length - 1; i++) {
    const projected = projectPointOnSegment(point, polyline[i]!, polyline[i + 1]!);
    const dist = getDistance(point, projected);
    const candidate: SegmentProjection = {
      segmentIndex: i,
      projectedPoint: projected,
      distance: dist,
    };

    if (i >= safeLastIndex) {
      if (!bestForward || dist < bestForward.distance) bestForward = candidate;
    } else {
      if (!bestBackward || dist < bestBackward.distance) bestBackward = candidate;
    }
  }

  // If only one direction has a result, return it.
  if (!bestForward) return bestBackward;
  if (!bestBackward) return bestForward;

  // Prefer the forward match unless the backward segment is meaningfully
  // closer (by more than forwardBias metres). This prevents jitter on
  // parallel roads while still allowing genuine backtracking.
  if (bestBackward.distance + forwardBias < bestForward.distance) {
    return bestBackward;
  }

  return bestForward;
}

/**
 * Trims a polyline so that only the portion ahead of the user remains.
 *
 * The returned polyline starts at the user's snapped position on the nearest
 * segment and continues through all remaining points to the destination.
 * Points already passed are removed, giving a real-time navigation feel
 * **without** re-fetching directions from the Google Routes API.
 *
 * @param polyline - The full route polyline (from the original directions response).
 * @param userPosition - The user's current GPS coordinates.
 * @param lastSegmentIndex - The segment index from the previous update,
 *   used to bias the search forward and avoid backward snapping.
 * @returns The trimmed result, or `null` when the polyline is too short.
 */
export function trimPolyline(
  polyline: Polyline,
  userPosition: Coordinates,
  lastSegmentIndex: number = 0
): TrimmedPolyline | null {
  const nearest = findNearestSegmentIndex(polyline, userPosition, lastSegmentIndex);
  if (!nearest) return null;

  const { segmentIndex, projectedPoint, distance } = nearest;

  // Build the remaining polyline: snapped point → rest of route.
  const trimmed: Polyline = [projectedPoint, ...polyline.slice(segmentIndex + 1)];

  return {
    trimmed,
    segmentIndex,
    snappedPosition: projectedPoint,
    distanceFromRoute: distance,
  };
}
