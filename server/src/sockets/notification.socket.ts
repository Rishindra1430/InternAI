import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken, DecodedAccessToken } from '../utils/jwt.utils.js';
import { logger } from '../config/logger.js';

let notificationServer: SocketIOServer | null = null;

export function setNotificationServer(io: SocketIOServer): void {
  notificationServer = io;
}

export interface NotificationPayload {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  title?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Authenticate an incoming socket connection via JWT.
 * The token can be provided as `auth.token` or as a `token` query parameter.
 */
function authenticateSocket(socket: Socket): DecodedAccessToken {
  const token =
    (socket.handshake.auth as Record<string, unknown>)?.token as
      | string
      | undefined ??
    (socket.handshake.query?.token as string | undefined);

  if (!token) {
    throw new Error('Authentication error: no token provided');
  }

  const decoded = verifyAccessToken(token);

  if (!decoded.userId || !decoded.role) {
    throw new Error('Authentication error: invalid or expired token');
  }

  return decoded;
}

/**
 * Set up Socket.io namespace for real-time notifications.
 * - Authenticates connections via JWT
 * - Joins authenticated sockets to `user:{userId}` rooms
 * - Handles disconnect with logging
 */
export function setupNotificationSocket(io: SocketIOServer): void {
  setNotificationServer(io);

  io.use((socket, next) => {
    try {
      const user = authenticateSocket(socket);
      // Attach user data to the socket for downstream handlers
      (socket.data as Record<string, unknown>).user = user;
      next();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Authentication error';
      logger.warn(`Socket authentication failed: ${message}`);
      next(new Error(message));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as DecodedAccessToken;
    const room = `user:${user.userId}`;

    socket.join(room);
    logger.info(
      `Socket connected: ${socket.id} | user: ${user.userId} | room: ${room}`
    );

    socket.on('disconnect', (reason: string) => {
      logger.info(
        `Socket disconnected: ${socket.id} | user: ${user.userId} | reason: ${reason}`
      );
    });
  });

  logger.info('Notification socket handler initialized');
}

/**
 * Emit a notification event to a specific user's room.
 *
 * @param io   - The Socket.io server instance
 * @param userId - The target user ID
 * @param notification - The notification payload to emit
 */
export function emitNotification(
  userId: string,
  notification: NotificationPayload
): void {
  if (!notificationServer) {
    logger.warn('Notification server not initialized; skipping emit');
    return;
  }

  const room = `user:${userId}`;
  notificationServer.to(room).emit('notification', notification);
  logger.debug(
    `Notification emitted to ${room}: type=${notification.type}`
  );
}
