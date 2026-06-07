import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAppDispatch, useAuth } from '.';
import { addNotification } from '../store/slices/notificationSlice';
import type { Notification } from '../types';

export default function useSocket() {
  const dispatch = useAppDispatch();
  const { accessToken, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = io('/', {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socket.emit('authenticate', accessToken);
    socket.on('notification', (notification: Notification) => {
      dispatch(addNotification(notification));
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, dispatch, isAuthenticated]);
}
