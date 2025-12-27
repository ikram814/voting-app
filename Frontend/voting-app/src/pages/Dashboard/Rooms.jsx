// pages/Dashboard/Rooms.jsx
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { roomsAPI } from '../../api';
import { Plus, Edit2, Trash2, Users, Lock } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

export const Rooms = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  const [deletingRoomId, setDeletingRoomId] = useState(null);

  // Fetch rooms
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomsAPI.getRooms();
      setRooms(response.data.rooms || []);
      setError(''); // Clear any previous errors
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.name.trim()) {
      setError('Room name is required');
      return;
    }

    try {
      await roomsAPI.createRoom(newRoom);
      setNewRoom({ name: '', description: '' });
      setShowCreateModal(false);
      setError(''); // Clear any previous errors
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating room');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? All members and data will be removed.')) return;

    try {
      setDeletingRoomId(roomId);
      setError(''); // Clear any previous errors
      
      await roomsAPI.deleteRoom(roomId);
      
      // Remove the room from state immediately for better UX
      setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
      
      // Optionally refresh the list to ensure sync
      await fetchRooms();
    } catch (err) {
      console.error('Delete room error:', err);
      setError(err.response?.data?.message || err.message || 'Error deleting room');
    } finally {
      setDeletingRoomId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <p className="text-xl text-amber-400">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-amber-400">
            {user?.isAdmin ? 'Manage Rooms' : 'Your Private Rooms'}
          </h1>
          {user?.isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-amber-400 text-black px-6 py-3 rounded-lg hover:bg-amber-500 transition-all duration-300 font-semibold shadow-lg shadow-amber-400/50"
            >
              <Plus size={24} />
              Create Room
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-300 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-black border-2 border-amber-400 rounded-lg p-8 max-w-md w-full shadow-xl shadow-amber-400/30">
              <h2 className="text-2xl font-bold text-amber-400 mb-6">Create New Room</h2>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-amber-300 mb-2 font-semibold">Room Name</label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    className="w-full bg-black border-2 border-amber-400/30 text-white px-4 py-2 rounded-lg focus:border-amber-400 focus:shadow-lg focus:shadow-amber-400/30 outline-none transition-all"
                    placeholder="Enter room name"
                  />
                </div>
                <div>
                  <label className="block text-amber-300 mb-2 font-semibold">Description (optional)</label>
                  <textarea
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    className="w-full bg-black border-2 border-amber-400/30 text-white px-4 py-2 rounded-lg focus:border-amber-400 focus:shadow-lg focus:shadow-amber-400/30 outline-none transition-all h-24 resize-none"
                    placeholder="Enter room description"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-amber-400 text-black py-2 rounded-lg hover:bg-amber-500 transition-all font-semibold shadow-lg shadow-amber-400/50"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-amber-400/20 border-2 border-amber-400 text-amber-300 py-2 rounded-lg hover:bg-amber-400/30 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <Lock size={48} className="mx-auto text-amber-400/50 mb-4" />
            <p className="text-amber-400/70 text-lg">No rooms yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`bg-gradient-to-br from-black to-gray-950 border-2 border-amber-400/30 rounded-lg p-6 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-400/40 transition-all duration-300 ${
                  deletingRoomId === room.id ? 'opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-amber-400 flex-1">{room.name}</h3>
                  {user?.isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/rooms/${room.id}`)}
                        className="p-2 hover:bg-amber-400/20 rounded-lg transition-all hover:shadow-lg hover:shadow-amber-400/30"
                        title="Edit room"
                        disabled={deletingRoomId === room.id}
                      >
                        <Edit2 size={18} className="text-amber-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Delete room"
                        disabled={deletingRoomId === room.id}
                      >
                        {deletingRoomId === room.id ? (
                          <div className="w-[18px] h-[18px] border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={18} className="text-red-400" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {room.description && (
                  <p className="text-amber-300/70 mb-4 text-sm">{room.description}</p>
                )}

                <div className="flex items-center gap-2 text-amber-300/80 mb-4 text-sm">
                  <Users size={16} />
                  <span>{room.member_count || 0} members</span>
                </div>

                <button
                  onClick={() => navigate(`/rooms/${room.id}`)}
                  className="w-full bg-amber-400 text-black py-2 rounded-lg hover:bg-amber-500 transition-all font-semibold shadow-lg shadow-amber-400/50"
                  disabled={deletingRoomId === room.id}
                >
                  {user?.isAdmin ? 'Manage Room' : 'Enter Room'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;