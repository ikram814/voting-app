// pages/Dashboard/RoomDetail.jsx
import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { roomsAPI } from '../../api';
import { ArrowLeft, Plus, Trash2, Users, Clock, BarChart2, X, Play, Square, TrendingUp } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

export const RoomDetail = () => {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [polls, setPolls] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [visibleOptions, setVisibleOptions] = useState(2);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    duration_minutes: 60
  });

  const showToast = (message, type = 'info', duration = 3500) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
  };

  // Fetch room details
  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const [roomRes, pollsRes] = await Promise.all([
        roomsAPI.getRoom(roomId),
        roomsAPI.getRoomPolls(roomId)
      ]);

      setRoom(roomRes.data.room);
      setMembers(roomRes.data.members || []);
      setPolls(pollsRes.data.polls || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading room');
      showToast('Error loading room', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available users when modal opens
  useEffect(() => {
    if (showAddMember) {
      fetchAvailableUsers();
    }
  }, [showAddMember]);

  const fetchAvailableUsers = async () => {
    try {
      const response = await roomsAPI.getAvailableUsers(roomId);
      setAvailableUsers(response.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading users');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      await roomsAPI.addMember(roomId, parseInt(selectedUserId));
      setSelectedUserId('');
      setShowAddMember(false);
      showToast('Member added successfully!', 'success');
      fetchRoomDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding member', 'error');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;

    try {
      await roomsAPI.removeMember(roomId, memberId);
      showToast('Member removed successfully!', 'success');
      fetchRoomDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error removing member', 'error');
    }
  };

  const addOption = () => {
    if (visibleOptions < 4) {
      setVisibleOptions(visibleOptions + 1);
    }
  };

  const removeOption = (optionNumber) => {
    if (visibleOptions > 2) {
      setNewPoll({ ...newPoll, [`option${optionNumber}`]: "" });
      const newForm = { ...newPoll };
      for (let i = optionNumber; i < 4; i++) {
        newForm[`option${i}`] = newPoll[`option${i + 1}`] || "";
      }
      newForm.option4 = "";
      setNewPoll(newForm);
      setVisibleOptions(visibleOptions - 1);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!newPoll.question || !newPoll.option1 || !newPoll.option2) {
      showToast('Question and at least 2 options required', 'error');
      return;
    }

    try {
      await roomsAPI.createRoomPoll(roomId, newPoll);
      setNewPoll({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        duration_minutes: 60
      });
      setVisibleOptions(2);
      setShowCreatePoll(false);
      showToast('Poll created successfully!', 'success');
      fetchRoomDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating poll', 'error');
    }
  };

  const handleStartPoll = async (pollId) => {
    try {
      await roomsAPI.startPoll(roomId, pollId);
      showToast('Poll started!', 'success');
      fetchRoomDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error starting poll', 'error');
    }
  };

  const handleClosePoll = async (pollId) => {
    try {
      await roomsAPI.closePoll(roomId, pollId);
      showToast('Poll closed!', 'success');
      fetchRoomDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error closing poll', 'error');
    }
  };

  const handleDeleteRoom = async () => {
    try {
      setIsDeleting(true);
      await roomsAPI.deleteRoom(roomId);
      showToast('Room deleted successfully!', 'success');
      setTimeout(() => navigate('/rooms'), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting room', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isRoomAdmin = user?.id === room?.created_by;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <p className="text-xl text-amber-400">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <p className="text-red-400 text-lg">Room not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 overflow-y-auto relative">
        {/* Toast */}
        {toast.visible && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
            <div className={`max-w-sm w-full backdrop-blur-xl rounded-xl px-4 py-3 border ${toast.type === 'success' ? 'bg-green-500/20 border-green-400/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.2)]' : toast.type === 'error' ? 'bg-red-500/20 border-red-400/30 shadow-[0_8px_32px_0_rgba(239,68,68,0.2)]' : 'bg-yellow-500/20 border-yellow-400/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.2)]'}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="text-sm text-yellow-50">{toast.message}</div>
                </div>
                <button className="text-yellow-300 hover:text-yellow-100 transition-colors" onClick={() => setToast((t) => ({ ...t, visible: false }))}>✕</button>
              </div>
            </div>
          </div>
        )}

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
          <div className="mb-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/rooms')}
                className="p-2 hover:bg-amber-400/20 rounded-lg transition-all hover:shadow-lg hover:shadow-amber-400/30"
              >
                <ArrowLeft size={24} className="text-amber-400" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-amber-400">{room.name}</h1>
                {room.description && <p className="text-amber-300/60">{room.description}</p>}
              </div>
            </div>
            {isRoomAdmin && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all border border-red-400/30 hover:border-red-400/50"
                title="Delete room"
              >
                <Trash2 size={24} className="text-red-400" />
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Members Section */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-yellow-500/10 via-black/30 to-amber-600/10 rounded-3xl p-8 border border-yellow-500/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.25)] relative overflow-hidden">
                <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                    <Users size={24} />
                    Members
                  </h2>
                  {isRoomAdmin && (
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="p-2 hover:bg-amber-400/20 rounded-lg transition-all hover:shadow-lg hover:shadow-amber-400/30"
                    >
                      <Plus size={20} className="text-amber-400" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto relative z-10">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex justify-between items-center backdrop-blur-xl bg-yellow-500/10 border border-yellow-400/20 p-3 rounded-lg hover:bg-yellow-500/15 transition-all"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-50">{member.username}</p>
                        <p className="text-xs text-amber-400/60 uppercase tracking-wider font-semibold">
                          {member.role}
                        </p>
                      </div>
                      {isRoomAdmin && member.role !== 'admin' && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Polls Section */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                  <BarChart2 size={24} />
                  Polls
                </h2>
                {isRoomAdmin && (
                  <button
                    onClick={() => setShowCreatePoll(true)}
                    className="flex items-center gap-2 bg-amber-400 text-black px-4 py-2 rounded-lg hover:bg-amber-500 transition-all font-semibold shadow-lg shadow-amber-400/50"
                  >
                    <Plus size={18} />
                    Create Poll
                  </button>
                )}
              </div>

              {polls.length === 0 ? (
                <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-black/40 to-amber-600/10 rounded-3xl p-12 border border-yellow-500/30 text-center shadow-[0_8px_32px_0_rgba(234,179,8,0.2)]">
                  <BarChart2 size={48} className="mx-auto text-amber-400/50 mb-4" />
                  <p className="text-amber-400/70">No polls yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {polls.map((poll) => (
                    <div
                      key={poll.id}
                      className="backdrop-blur-2xl bg-gradient-to-br from-yellow-500/10 via-black/30 to-amber-600/10 rounded-2xl p-6 border border-yellow-500/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.15)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.25)] transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none"></div>

                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-amber-400 mb-2">
                              {poll.question}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <span className="flex items-center gap-1 text-amber-300/80">
                                <Clock size={14} />
                                {poll.duration_minutes}m
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                poll.poll_status === 'active'
                                  ? 'bg-green-500/20 border border-green-400/30 text-green-400'
                                  : poll.poll_status === 'closed'
                                  ? 'bg-red-500/20 border border-red-400/30 text-red-400'
                                  : 'bg-yellow-500/20 border border-yellow-400/30 text-yellow-400'
                              }`}>
                                {poll.poll_status || 'pending'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isRoomAdmin ? (
                              <>
                                {poll.poll_status === 'pending' && (
                                  <button
                                    onClick={() => handleStartPoll(poll.id)}
                                    className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg transition-all flex items-center gap-1 text-green-400 text-sm font-semibold"
                                    title="Start poll"
                                  >
                                    <Play size={16} />
                                    Start
                                  </button>
                                )}
                                {poll.poll_status === 'active' && (
                                  <button
                                    onClick={() => handleClosePoll(poll.id)}
                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg transition-all flex items-center gap-1 text-red-400 text-sm font-semibold"
                                    title="Close poll"
                                  >
                                    <Square size={16} />
                                    Close
                                  </button>
                                )}
                                {poll.poll_status === 'closed' && (
                                  <button
                                    onClick={() => navigate(`/rooms/${roomId}/poll/${poll.id}/results`)}
                                    className="p-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 rounded-lg transition-all flex items-center gap-1 text-amber-400 text-sm font-semibold"
                                    title="View chart"
                                  >
                                    <TrendingUp size={16} />
                                    View Chart
                                  </button>
                                )}
                                <button
                                  onClick={() => navigate(`/rooms/${roomId}/poll/${poll.id}`)}
                                  className="px-3 py-2 bg-amber-400 text-black rounded-lg hover:bg-amber-500 transition-all text-sm font-semibold"
                                >
                                  View
                                </button>
                              </>
                            ) : (
                              <>
                                {poll.poll_status === 'active' && (
                                  <button
                                    onClick={() => navigate(`/rooms/${roomId}/poll/${poll.id}`)}
                                    className="px-4 py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-2 bg-amber-400 text-black hover:bg-amber-500 shadow-lg shadow-amber-400/50"
                                  >
                                    Vote Now
                                  </button>
                                )}
                                {poll.poll_status === 'closed' && (
                                  <button
                                    onClick={() => navigate(`/rooms/${roomId}/poll/${poll.id}/results`)}
                                    className="px-4 py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-400"
                                  >
                                    <TrendingUp size={16} />
                                    View Chart
                                  </button>
                                )}
                                {poll.poll_status === 'pending' && (
                                  <button
                                    disabled
                                    className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 bg-gray-600 text-gray-300 cursor-not-allowed opacity-60"
                                  >
                                    Pending
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Vote results */}
                        <div className="space-y-2 mt-4">
                          {['option1', 'option2', 'option3', 'option4'].map((opt) => {
                            const label = poll[opt];
                            if (!label) return null;
                            const count = poll[`${opt}_count`] || 0;
                            const percentage =
                              poll.total_votes > 0
                                ? Math.round((count / poll.total_votes) * 100)
                                : 0;

                            return (
                              <div key={opt}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-amber-200">{label}</span>
                                  <span className="text-amber-400 font-semibold">
                                    {count} ({percentage}%)
                                  </span>
                                </div>
                                <div className="w-full bg-black/40 rounded-full h-2 border border-amber-400/20">
                                  <div
                                    className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <p className="text-xs text-amber-400/60 mt-3 font-semibold">
                          Total votes: {poll.total_votes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="backdrop-blur-2xl bg-gradient-to-br from-yellow-500/10 via-black/40 to-amber-600/10 rounded-3xl p-8 border border-yellow-500/30 max-w-md w-full shadow-[0_8px_32px_0_rgba(234,179,8,0.25)]">
              <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none"></div>

              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-amber-400 mb-6">Add Member</h2>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="block text-amber-300 mb-2 font-semibold">Select User</label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full bg-black border-2 border-amber-400/30 text-white px-4 py-2 rounded-lg focus:border-amber-400 focus:shadow-lg focus:shadow-amber-400/30 outline-none transition-all"
                    >
                      <option value="">Choose a user...</option>
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-400 text-black py-2 rounded-lg hover:bg-amber-500 transition-all font-semibold shadow-lg shadow-amber-400/50"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="flex-1 bg-amber-400/20 border-2 border-amber-400 text-amber-300 py-2 rounded-lg hover:bg-amber-400/30 transition-all font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Create Poll Modal */}
        {showCreatePoll && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className="backdrop-blur-2xl bg-gradient-to-br from-yellow-500/10 via-black/40 to-amber-600/10 rounded-3xl p-10 border-2 border-yellow-500/30 max-w-3xl w-full min-h-[600px] shadow-[0_8px_32px_0_rgba(234,179,8,0.25)] my-8">
              <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none"></div>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-amber-400 mb-8">Create Poll</h2>
                <form onSubmit={handleCreatePoll} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                  <div>
                    <label className="block text-amber-300 mb-3 font-semibold text-lg">Question</label>
                    <textarea
                      value={newPoll.question}
                      onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                      className="w-full bg-black border-2 border-amber-400/30 text-white px-5 py-3 rounded-lg focus:border-amber-400 focus:shadow-lg focus:shadow-amber-400/30 outline-none transition-all h-28 text-lg resize-none"
                      placeholder="Enter question"
                      required
                    />
                  </div>

                  {[...Array(visibleOptions)].map((_, i) => {
                    const optionNum = i + 1;
                    return (
                      <div key={optionNum}>
                        <label className="block text-amber-300 mb-3 font-semibold text-lg">Option {optionNum}</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newPoll[`option${optionNum}`]}
                            onChange={(e) => setNewPoll({ ...newPoll, [`option${optionNum}`]: e.target.value })}
                            className="flex-1 bg-black border-2 border-amber-400/30 text-white px-5 py-3 rounded-lg focus:border-amber-400 focus:shadow-lg focus:shadow-amber-400/30 outline-none transition-all text-lg"
                            placeholder={`Enter option ${optionNum}`}
                            required={optionNum <= 2}
                          />
                          {visibleOptions > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(optionNum)}
                              className="p-3 hover:bg-red-500/20 rounded-lg transition-all"
                            >
                              <X size={20} className="text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {visibleOptions < 4 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="w-full py-3 border-2 border-amber-400/30 text-amber-400 rounded-lg hover:bg-amber-400/10 transition-all font-semibold text-base"
                    >
                      + Add Option
                    </button>
                  )}

                  <div>
                    <label className="block text-amber-300 mb-3 font-semibold text-lg">Duration (minutes)</label>
                    <input
                      type="number"
                      value={newPoll.duration_minutes}
                      onChange={(e) => setNewPoll({ ...newPoll, duration_minutes: parseInt(e.target.value) })}
                      min="1"
                      max="1440"
                      className="w-full bg-black border-2 border-amber-400/30 text-white px-5 py-3 rounded-lg focus:border-amber-400 focus:shadow-lg focus:shadow-amber-400/30 outline-none transition-all text-lg"
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-400 text-black py-4 rounded-lg hover:bg-amber-500 transition-all font-semibold shadow-lg shadow-amber-400/50 text-lg"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreatePoll(false);
                        setVisibleOptions(2);
                        setNewPoll({
                          question: '',
                          option1: '',
                          option2: '',
                          option3: '',
                          option4: '',
                          duration_minutes: 60
                        });
                      }}
                      className="flex-1 bg-amber-400/20 border-2 border-amber-400 text-amber-300 py-4 rounded-lg hover:bg-amber-400/30 transition-all font-semibold text-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Room Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="backdrop-blur-2xl bg-gradient-to-br from-red-500/20 via-black/40 to-red-600/20 rounded-3xl p-8 border border-red-500/30 shadow-[0_8px_32px_0_rgba(239,68,68,0.3)] max-w-md w-full relative overflow-hidden">
              <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4 border border-red-400/30">
                    <Trash2 size={32} className="text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-50 mb-2">Delete Room?</h3>
                  <p className="text-red-100/60">This action cannot be undone. All polls and votes will be permanently deleted.</p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 py-3 backdrop-blur-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-xl transition-all duration-300 font-semibold text-white border border-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteRoom}
                    disabled={isDeleting}
                    className="flex-1 py-3 backdrop-blur-xl bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500/90 hover:to-red-600/90 disabled:opacity-50 rounded-xl transition-all duration-300 font-semibold text-white shadow-[0_4px_16px_0_rgba(239,68,68,0.4)] hover:shadow-[0_4px_20px_0_rgba(239,68,68,0.6)] border border-red-400/40"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Room'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetail;
