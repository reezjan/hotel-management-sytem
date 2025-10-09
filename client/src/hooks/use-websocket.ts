import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';

type WebSocketEventHandler = (data: any) => void;

interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: string;
}

export function useWebSocket() {
  const { user } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const eventHandlers = useRef<Map<string, Set<WebSocketEventHandler>>>(new Map());
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  const connect = useCallback(() => {
    if (!user?.id || !user?.hotelId || !user?.role?.name) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?hotelId=${user.hotelId}&userId=${user.id}&role=${user.role.name}`;

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;

        // Send ping every 30 seconds to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000);
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Ignore pong messages
          if (message.event === 'pong') return;

          // Call all registered handlers for this event
          const handlers = eventHandlers.current.get(message.event);
          if (handlers) {
            handlers.forEach(handler => handler(message.data));
          }

          // Also call wildcard handlers (for debugging)
          const wildcardHandlers = eventHandlers.current.get('*');
          if (wildcardHandlers) {
            wildcardHandlers.forEach(handler => handler(message));
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [user?.id, user?.hotelId, user?.role?.name]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const on = useCallback((event: string, handler: WebSocketEventHandler) => {
    if (!eventHandlers.current.has(event)) {
      eventHandlers.current.set(event, new Set());
    }
    eventHandlers.current.get(event)!.add(handler);

    // Return cleanup function
    return () => {
      const handlers = eventHandlers.current.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlers.current.delete(event);
        }
      }
    };
  }, []);

  const off = useCallback((event: string, handler?: WebSocketEventHandler) => {
    if (!handler) {
      eventHandlers.current.delete(event);
    } else {
      const handlers = eventHandlers.current.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlers.current.delete(event);
        }
      }
    }
  }, []);

  return { on, off };
}
