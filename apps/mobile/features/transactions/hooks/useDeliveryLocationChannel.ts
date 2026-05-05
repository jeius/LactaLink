import { useCurrentCoordinates } from '@/lib/stores/locationStore';
import { supabase } from '@/lib/supabase';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import { RNLatLng as LatLng } from 'react-native-google-maps-plus';

const LOCATION_EVENT = 'location';

type LocationPayload = {
  userId: string;
  lat: number;
  lng: number;
};

/**
 * Supabase Realtime hook for sharing live location during delivery execution.
 *
 * @description
 * - Subscribes to the `location:transaction:{transactionId}` broadcast channel.
 * - Broadcasts the current user's coordinates every `broadcastIntervalMs` milliseconds
 *   while the hook is mounted.
 * - Returns the other party's last known coordinates, or `null` if not yet received.
 *
 * Location sharing is opt-in: pass `enabled = false` to disable it (e.g., for terminal
 * transaction states or when no delivery detail is present).
 *
 * @param transactionId - The transaction ID used to namespace the channel
 * @param myUserId - The current user's ID (used to filter out self-broadcasts)
 * @param enabled - Whether to start broadcasting/subscribing (default: true)
 * @param broadcastIntervalMs - How often to broadcast own location in ms (default: 5000)
 * @returns The other party's last known coordinates, or `null`
 */
export function useDeliveryLocationChannel(
  transactionId: string | undefined,
  myUserId: string,
  enabled = true,
  broadcastIntervalMs = 5000
): LatLng | null {
  const currentCoords = useCurrentCoordinates();
  const [otherPartyLocation, setOtherPartyLocation] = useState<LatLng | null>(null);

  // Store refs to avoid stale closures in the interval
  const currentCoordsRef = useRef(currentCoords);

  useEffect(() => {
    currentCoordsRef.current = currentCoords;
  }, [currentCoords]);

  useEffect(() => {
    if (!enabled || !transactionId) return;

    const channelName = `location:transaction:${transactionId}`;
    const channel = supabase.channel(channelName);

    channel.on<LocationPayload>('broadcast', { event: LOCATION_EVENT }, ({ payload }) => {
      // Ignore own broadcasts
      if (payload.userId === myUserId) return;
      setOtherPartyLocation({ latitude: payload.lat, longitude: payload.lng });
    });

    const cleanup = { intervalId: null as number | null };

    channel.subscribe((status) => {
      if (status !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) return;

      // Start broadcasting own location at regular intervals
      const intervalId = setInterval(() => {
        const coords = currentCoordsRef.current;
        if (!coords) return;

        channel.send({
          type: 'broadcast',
          event: LOCATION_EVENT,
          payload: { userId: myUserId, lat: coords.latitude, lng: coords.longitude },
        });
      }, broadcastIntervalMs);

      // Store interval ID on the channel object for cleanup access
      cleanup.intervalId = intervalId;
    });

    return () => {
      const { intervalId } = cleanup;
      if (intervalId) clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [transactionId, myUserId, enabled, broadcastIntervalMs]);

  return otherPartyLocation;
}
