// context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinPollRoom = (roomId, pollId, userId, userName) => {
    if (socket) {
      socket.emit('join-poll-room', { roomId, pollId, userId, userName });
    }
  };

  const leavePollRoom = (roomId, pollId) => {
    if (socket) {
      socket.emit('leave-poll-room', { roomId, pollId });
    }
  };

  const castVote = (roomId, pollId, userId, voteData) => {
    if (socket) {
      socket.emit('vote-cast', { roomId, pollId, userId, ...voteData });
    }
  };

  const startPoll = (roomId, pollId) => {
    if (socket) {
      socket.emit('poll-started', { roomId, pollId });
    }
  };

  const closePoll = (roomId, pollId) => {
    if (socket) {
      socket.emit('poll-closed', { roomId, pollId });
    }
  };

  const onVoteUpdate = (callback) => {
    if (socket) {
      socket.on('vote-updated', callback);
    }
  };

  const onPollStatusChange = (callback) => {
    if (socket) {
      socket.on('poll-status-changed', callback);
    }
  };

  const onUserJoined = (callback) => {
    if (socket) {
      socket.on('user-joined', callback);
    }
  };

  const offVoteUpdate = () => {
    if (socket) {
      socket.off('vote-updated');
    }
  };

  const offPollStatusChange = () => {
    if (socket) {
      socket.off('poll-status-changed');
    }
  };

  const offUserJoined = () => {
    if (socket) {
      socket.off('user-joined');
    }
  };

  const value = {
    socket,
    isConnected,
    joinPollRoom,
    leavePollRoom,
    castVote,
    startPoll,
    closePoll,
    onVoteUpdate,
    onPollStatusChange,
    onUserJoined,
    offVoteUpdate,
    offPollStatusChange,
    offUserJoined
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
