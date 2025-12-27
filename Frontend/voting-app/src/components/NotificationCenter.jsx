// components/NotificationCenter.jsx
import { useContext, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { X, Bell } from 'lucide-react';

export const NotificationCenter = () => {
  const { onVoteUpdate, onPollStatusChange, onUserJoined } = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for vote updates
    onVoteUpdate((data) => {
      addNotification(`Poll updated: ${data.totalVotes} votes`, 'info');
    });

    // Listen for poll status changes
    onPollStatusChange((data) => {
      if (data.status === 'closed') {
        addNotification('Poll has ended', 'warning');
      }
    });

    // Listen for users joining
    onUserJoined((data) => {
      addNotification(`${data.userName} joined the poll`, 'success');
    });
  }, []);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-6 right-6 z-40 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-start gap-3 p-4 rounded-lg shadow-lg animate-in fade-in slide-in-from-top
            ${
              notification.type === 'success'
                ? 'bg-green-500/20 border border-green-500 text-green-400'
                : notification.type === 'warning'
                  ? 'bg-amber-500/20 border border-amber-500 text-amber-400'
                  : 'bg-blue-500/20 border border-blue-500 text-blue-400'
            }
          `}
        >
          <Bell size={18} className="flex-shrink-0 mt-0.5" />
          <span className="flex-1 text-sm">{notification.message}</span>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 hover:opacity-75 transition-opacity"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
