import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';

interface UseRealtimeQueryOptions {
  queryKey: string | string[];
  events: string[];
}

/**
 * Hook to automatically invalidate and refetch queries when real-time events occur
 * 
 * @example
 * // Refetch tasks when task events occur
 * useRealtimeQuery({
 *   queryKey: '/api/hotels/current/tasks',
 *   events: ['task:created', 'task:updated', 'task:deleted']
 * });
 * 
 * @example
 * // Refetch KOT orders when order events occur
 * useRealtimeQuery({
 *   queryKey: ['/api/hotels', hotelId, 'kot-orders'],
 *   events: ['kot:created', 'kot:updated']
 * });
 */
export function useRealtimeQuery({ queryKey, events }: UseRealtimeQueryOptions) {
  const { on } = useWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    events.forEach(event => {
      const unsubscribe = on(event, () => {
        // Invalidate the query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
      });
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [on, queryClient, queryKey, events]);
}
