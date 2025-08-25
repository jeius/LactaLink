import { supabase } from '@/lib/supabase';
import { CollectionSlug } from '@lactalink/types';
import { formatKebabToUnderscore } from '@lactalink/utilities';
import { useIsFocused } from '@react-navigation/native';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useRef } from 'react';
import { useRevalidateCollectionQueries } from '../collections/useRevalidateQueries';

type EventType = 'INSERT' | 'UPDATE' | 'DELETE';

export function useLiveCollectionRevalidator(slug: CollectionSlug, events: EventType[] = []) {
  const revalidateQueries = useRevalidateCollectionQueries();
  const isFocused = useIsFocused();
  const broadcastRef = useRef<RealtimeChannel>(null);

  useEffect(() => {
    const changes = supabase.channel(`${slug}-updates`);

    if (events.length === 0) {
      changes.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: formatKebabToUnderscore(slug) },
        () => {
          revalidateQueries(slug);
        }
      );
    } else {
      events.forEach((event) => {
        changes.on(
          'postgres_changes',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { event: event as any, schema: 'public', table: formatKebabToUnderscore(slug) },
          () => {
            revalidateQueries(slug);
          }
        );
      });
    }

    changes.subscribe();

    broadcastRef.current = changes;

    return () => {
      supabase.removeChannel(changes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFocused) {
      broadcastRef.current?.subscribe();
    } else {
      broadcastRef.current?.unsubscribe();
    }
  }, [isFocused]);
}
