import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { roomsAPI } from '../../api';
import { Users, Lock, LogIn, BarChart3 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

export const JoinRoom = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserRooms();
  }, []);

  const fetchUserRooms = async () => {
    try {
      setLoading(true);
      const response = await roomsAPI.getRooms();
      setRooms(response.data.rooms || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading rooms');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <p className="text-xl text-amber-400">Loading your rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 overflow-y-auto">
        {/* Background effects */}
        <div className="fixed inset-0 ml-64 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-yellow-400/5 rounded-full blur-3xl"></div>
          
          <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-yellow-300 rounded-full opacity-30 animate-[ping_3.5s_linear_infinite]"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-amber-200 rounded-full opacity-25 animate-[ping_4s_linear_infinite]" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-yellow-400 rounded-full opacity-30 animate-[ping_4.5s_linear_infinite]" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-amber-300 rounded-full opacity-20 animate-[ping_5s_linear_infinite]" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-block relative">
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 mb-3 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                Your Private Rooms
              </h1>
              <div className="flex items-center justify-center gap-2 text-yellow-100/60 text-sm">
                <span>Access and participate in exclusive polls</span>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* No Rooms */}
          {rooms.length === 0 ? (
            <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-black/40 to-amber-600/10 rounded-3xl p-16 border border-yellow-500/30 text-center shadow-[0_8px_32px_0_rgba(234,179,8,0.2)]">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-2 border-yellow-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(234,179,8,0.3)]">
                  <Lock size={56} className="text-yellow-400" />
                </div>
              </div>
              <h3 className="text-yellow-50 text-2xl font-bold mb-2">No Rooms Available</h3>
              <p className="text-yellow-100/60 mb-2">You haven't been added to any private rooms yet</p>
              <p className="text-yellow-100/50 text-sm">Ask an admin to invite you to a room to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="backdrop-blur-2xl bg-gradient-to-br from-yellow-500/10 via-black/30 to-amber-600/10 rounded-3xl p-8 border border-yellow-500/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.25),inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.35)] transition-all duration-500 relative overflow-hidden group"
                >
                  {/* Border effect */}
                  <div className="absolute inset-0 rounded-3xl border border-white/5 shadow-xl shadow-yellow-200/20 pointer-events-none"></div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-amber-400 mb-2 flex items-center gap-2">
                          <Lock size={24} className="text-amber-400" />
                          {room.name}
                        </h3>
                        {room.description && (
                          <p className="text-amber-300/70 text-sm mb-4">{room.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <div className="flex items-center gap-2 text-amber-300/80 text-sm">
                        <Users size={16} />
                        <span>{room.member_count || 0} members</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/rooms/${room.id}`)}
                      className="w-full bg-amber-400 text-black py-3 rounded-lg hover:bg-amber-500 transition-all font-semibold shadow-lg shadow-amber-400/50 flex items-center justify-center gap-2 hover:scale-105 duration-300"
                    >
                      <LogIn size={18} />
                      Enter Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
