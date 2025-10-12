import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { log } from './vite';

interface WebSocketClient extends WebSocket {
  hotelId?: string;
  userId?: string;
  role?: string;
}

let wss: WebSocketServer;
const clients = new Map<string, WebSocketClient>();

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ 
    server,
    path: '/ws'
  });

  wss.on('connection', (ws: WebSocketClient, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const hotelId = url.searchParams.get('hotelId');
    const userId = url.searchParams.get('userId');
    const role = url.searchParams.get('role');

    if (hotelId && userId) {
      ws.hotelId = hotelId;
      ws.userId = userId;
      ws.role = role || undefined;
      clients.set(userId, ws);
      log(`WebSocket client connected: user ${userId}, role ${role}, hotel ${hotelId}`);
    }

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle ping/pong for connection keep-alive
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        log(`WebSocket client disconnected: user ${userId}`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

// Broadcast to all clients in a hotel
export function broadcastToHotel(hotelId: string, event: string, data: any) {
  if (!wss) return;

  const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  
  clients.forEach((client, userId) => {
    if (client.hotelId === hotelId && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Broadcast to specific roles in a hotel
export function broadcastToRole(hotelId: string, roles: string[], event: string, data: any) {
  if (!wss) return;

  const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  
  clients.forEach((client, userId) => {
    if (
      client.hotelId === hotelId && 
      client.role && 
      roles.includes(client.role) && 
      client.readyState === WebSocket.OPEN
    ) {
      client.send(message);
    }
  });
}

// Broadcast to a specific user
export function broadcastToUser(userId: string, event: string, data: any) {
  const client = clients.get(userId);
  
  if (client && client.readyState === WebSocket.OPEN) {
    const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
    client.send(message);
  }
}

// Broadcast real-time events
export const wsEvents = {
  // Task updates
  taskCreated: (hotelId: string, task: any) => 
    broadcastToHotel(hotelId, 'task:created', task),
  
  taskUpdated: (hotelId: string, task: any) => 
    broadcastToHotel(hotelId, 'task:updated', task),
  
  taskDeleted: (hotelId: string, taskId: string) => 
    broadcastToHotel(hotelId, 'task:deleted', { taskId }),

  // Attendance updates
  attendanceUpdated: (hotelId: string, attendance: any) => 
    broadcastToHotel(hotelId, 'attendance:updated', attendance),

  // KOT order updates
  kotOrderCreated: (hotelId: string, order: any) => 
    broadcastToRole(hotelId, ['kitchen_staff', 'bartender', 'barista', 'waiter', 'restaurant_bar_manager'], 'kot:created', order),
  
  kotOrderUpdated: (hotelId: string, order: any) => 
    broadcastToRole(hotelId, ['kitchen_staff', 'bartender', 'barista', 'waiter', 'restaurant_bar_manager'], 'kot:updated', order),

  // Room status updates
  roomStatusUpdated: (hotelId: string, room: any) => 
    broadcastToRole(hotelId, ['housekeeping_supervisor', 'housekeeping_staff', 'front_desk', 'manager'], 'room:updated', room),

  // Stock/Inventory updates
  stockUpdated: (hotelId: string, item: any) => 
    broadcastToRole(hotelId, ['storekeeper', 'manager', 'restaurant_bar_manager', 'housekeeping_supervisor'], 'stock:updated', item),

  // Stock request updates
  stockRequestCreated: (hotelId: string, request: any) => 
    broadcastToRole(hotelId, ['storekeeper', 'manager', 'owner'], 'stock-request:created', request),

  stockRequestUpdated: (hotelId: string, request: any) => 
    broadcastToRole(hotelId, ['storekeeper', 'manager', 'owner'], 'stock-request:updated', request),

  // Leave request updates
  leaveRequestCreated: (hotelId: string, leaveRequest: any) => 
    broadcastToHotel(hotelId, 'leave:created', leaveRequest),

  leaveRequestUpdated: (hotelId: string, leaveRequest: any) => 
    broadcastToHotel(hotelId, 'leave:updated', leaveRequest),

  // Service updates
  serviceCreated: (hotelId: string, service: any) => 
    broadcastToRole(hotelId, ['front_desk', 'manager', 'owner'], 'service:created', service),

  serviceUpdated: (hotelId: string, service: any) => 
    broadcastToRole(hotelId, ['front_desk', 'manager', 'owner'], 'service:updated', service),

  // Transaction updates
  transactionCreated: (hotelId: string, transaction: any) => 
    broadcastToRole(hotelId, ['finance', 'cashier', 'manager', 'owner'], 'transaction:created', transaction),
  
  transactionUpdated: (hotelId: string, transaction: any) => 
    broadcastToRole(hotelId, ['finance', 'cashier', 'manager', 'owner'], 'transaction:updated', transaction),

  // Maintenance request updates
  maintenanceUpdated: (hotelId: string, request: any) => 
    broadcastToHotel(hotelId, 'maintenance:updated', request),

  // Vehicle log updates
  vehicleLogUpdated: (hotelId: string, log: any) => 
    broadcastToRole(hotelId, ['surveillance_officer', 'security_head', 'security_guard'], 'vehicle:updated', log),

  // Guest updates
  guestCreated: (hotelId: string, guest: any) => 
    broadcastToRole(hotelId, ['front_desk', 'manager', 'owner'], 'guest:created', guest),
  
  guestUpdated: (hotelId: string, guest: any) => 
    broadcastToRole(hotelId, ['front_desk', 'manager', 'owner'], 'guest:updated', guest),

  // Room service charge updates
  roomServiceChargeCreated: (hotelId: string, charge: any) => 
    broadcastToRole(hotelId, ['front_desk', 'manager', 'owner'], 'room-service-charge:created', charge),
  
  roomServiceChargeDeleted: (hotelId: string, chargeId: string) => 
    broadcastToRole(hotelId, ['front_desk', 'manager', 'owner'], 'room-service-charge:deleted', { chargeId }),

  // Reservation updates
  reservationCreated: (hotelId: string, reservation: any) => 
    broadcastToRole(hotelId, ['front_desk', 'manager', 'owner'], 'reservation:created', reservation),
  
  reservationUpdated: (hotelId: string, reservation: any) => 
    broadcastToRole(hotelId, ['front_desk', 'manager', 'owner'], 'reservation:updated', reservation),

  // Hall booking updates
  hallBookingCreated: (hotelId: string, booking: any) => 
    broadcastToRole(hotelId, ['front_desk', 'manager', 'owner'], 'hall-booking:created', booking),
  
  hallBookingUpdated: (hotelId: string, booking: any) => 
    broadcastToRole(hotelId, ['front_desk', 'manager', 'owner'], 'hall-booking:updated', booking),

  // Payment updates
  paymentCreated: (hotelId: string, payment: any) => 
    broadcastToRole(hotelId, ['finance', 'cashier', 'manager', 'owner', 'front_desk'], 'payment:created', payment),
  
  paymentUpdated: (hotelId: string, payment: any) => 
    broadcastToRole(hotelId, ['finance', 'cashier', 'manager', 'owner', 'front_desk'], 'payment:updated', payment),

  // Inventory updates
  inventoryCreated: (hotelId: string, item: any) => 
    broadcastToRole(hotelId, ['storekeeper', 'manager', 'owner'], 'inventory:created', item),
  
  inventoryUpdated: (hotelId: string, item: any) => 
    broadcastToRole(hotelId, ['storekeeper', 'manager', 'owner'], 'inventory:updated', item),
  
  inventoryDeleted: (hotelId: string, itemId: string) => 
    broadcastToRole(hotelId, ['storekeeper', 'manager', 'owner'], 'inventory:deleted', { itemId }),

  // Inventory transaction updates
  inventoryTransactionCreated: (hotelId: string, transaction: any) => 
    broadcastToRole(hotelId, ['storekeeper', 'manager', 'owner'], 'inventory-transaction:created', transaction),

  // Wastage updates
  wastageCreated: (hotelId: string, wastage: any) => 
    broadcastToRole(hotelId, ['storekeeper', 'manager', 'owner', 'restaurant_bar_manager'], 'wastage:created', wastage),
  
  wastageUpdated: (hotelId: string, wastage: any) => 
    broadcastToRole(hotelId, ['storekeeper', 'manager', 'owner', 'restaurant_bar_manager'], 'wastage:updated', wastage),

  // User/Staff updates
  userCreated: (hotelId: string, user: any) => 
    broadcastToRole(hotelId, ['manager', 'owner'], 'user:created', user),
  
  userUpdated: (hotelId: string, user: any) => 
    broadcastToRole(hotelId, ['manager', 'owner'], 'user:updated', user),

  // Room and amenity updates
  roomCreated: (hotelId: string, room: any) => 
    broadcastToRole(hotelId, ['front_desk', 'manager', 'owner'], 'room:created', room),
  
  amenityUpdated: (hotelId: string, amenity: any) => 
    broadcastToRole(hotelId, ['manager', 'owner'], 'amenity:updated', amenity),

  // General notification
  notification: (userId: string, notification: any) => 
    broadcastToUser(userId, 'notification', notification),
};
