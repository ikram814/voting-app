import React, { useEffect, useState, useContext } from "react";
import { CheckCircle, Clock, TrendingUp, Users, BarChart3, Sparkles, Trash2, User } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

export function PollList() {
  const { user } = useContext(AuthContext);
  const [polls, setPolls] = useState([]);
  const [votedPolls, setVotedPolls] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const showToast = (message, type = 'info', duration = 3500) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
  };

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await api.get("/polls/my-polls");
      setPolls(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load your polls', 'error');
    } finally {
      setLoading(false);
    }
  };

  const vote = async (pollId, option) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { option_selected: option });
      showToast('Vote recorded successfully!', 'success');
      setVotedPolls({ ...votedPolls, [pollId]: option });
      fetchPolls(); // Refresh to get updated vote counts
    } catch (err) {
      showToast(err.response?.data?.message || 'Error voting', 'error');
    }
  };

  const deletePoll = async (pollId) => {
    try {
      await api.delete(`/polls/${pollId}`);
      showToast('Poll deleted successfully!', 'success');
      setDeleteConfirm(null);
      fetchPolls(); // Refresh the list
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting poll', 'error');
    }
  };

  const getTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Poll Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getTotalVotes = (poll) => {
    return (poll.votes_option1 || 0) + (poll.votes_option2 || 0) + 
           (poll.votes_option3 || 0) + (poll.votes_option4 || 0);
  };

  const getVotePercentage = (votes, total) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const hasVoted = (pollId) => {
    return votedPolls[pollId] !== undefined;
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      
      {/* Toast */}
      {toast.visible && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
          <div className={`max-w-sm w-full backdrop-blur-xl rounded-xl px-4 py-3 border ${
            toast.type === 'success' 
              ? 'bg-green-500/20 border-green-400/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.2)]' 
              : toast.type === 'error' 
              ? 'bg-red-500/20 border-red-400/30 shadow-[0_8px_32px_0_rgba(239,68,68,0.2)]' 
              : 'bg-yellow-500/20 border-yellow-400/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.2)]'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-sm text-yellow-50">{toast.message}</div>
              </div>
              <button 
                className="text-yellow-300 hover:text-yellow-100 transition-colors" 
                onClick={() => setToast((t) => ({ ...t, visible: false }))}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-red-500/20 via-black/40 to-red-600/20 rounded-3xl p-8 border border-red-500/30 shadow-[0_8px_32px_0_rgba(239,68,68,0.3)] max-w-md w-full relative overflow-hidden">
            {/* Border effect */}
            <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4 border border-red-400/30">
                  <Trash2 size={32} className="text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-red-50 mb-2">Delete Poll?</h3>
                <p className="text-red-100/60">This action cannot be undone. All votes will be permanently deleted.</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 font-semibold text-white border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deletePoll(deleteConfirm)}
                  className="flex-1 py-3 backdrop-blur-xl bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500/90 hover:to-red-600/90 rounded-xl transition-all duration-300 font-semibold text-white shadow-[0_4px_16px_0_rgba(239,68,68,0.4)] hover:shadow-[0_4px_20px_0_rgba(239,68,68,0.6)] border border-red-400/40"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Sidebar />
      
      {/* Content Area */}
      <div className="flex-1 ml-64 relative p-8 overflow-y-auto">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient léger */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-yellow-400/5 rounded-full blur-3xl"></div>
          
          {/* Particules dorées */}
          <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-yellow-300 rounded-full opacity-30 animate-[ping_3.5s_linear_infinite]"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-amber-200 rounded-full opacity-25 animate-[ping_4s_linear_infinite]" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-yellow-400 rounded-full opacity-30 animate-[ping_4.5s_linear_infinite]" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-amber-300 rounded-full opacity-20 animate-[ping_5s_linear_infinite]" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-block relative">
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 mb-3 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                My Polls
              </h1>
              <div className="flex items-center justify-center gap-2 text-yellow-100/60 text-sm">
                <span>Manage and view your created polls</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-black/40 to-amber-600/10 rounded-3xl p-10 border border-yellow-500/30">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
              </div>
            </div>
          )}

          {/* No Polls */}
          {!loading && polls.length === 0 && (
            <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-black/40 to-amber-600/10 rounded-3xl p-16 border border-yellow-500/30 text-center shadow-[0_8px_32px_0_rgba(234,179,8,0.2)]">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-2 border-yellow-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(234,179,8,0.3)]">
                  <BarChart3 size={56} className="text-yellow-400" />
                </div>
              </div>
              <h3 className="text-yellow-50 text-2xl font-bold mb-2">No Polls Yet</h3>
              <p className="text-yellow-100/60">You haven't created any polls yet. Create your first poll to get started!</p>
            </div>
          )}

          {/* Polls Grid */}
          <div className="space-y-6">
            {polls.map((poll) => {
              const totalVotes = getTotalVotes(poll);
              const voted = hasVoted(poll.id);
              const isCreator = user && poll.created_by === user.id;
              const canVote = !voted && !isCreator; // In MyPolls, all polls are created by user, so canVote will always be false
              const options = [
                { text: poll.option1, votes: poll.votes_option1 || 0, index: 1 },
                { text: poll.option2, votes: poll.votes_option2 || 0, index: 2 },
                { text: poll.option3, votes: poll.votes_option3 || 0, index: 3 },
                { text: poll.option4, votes: poll.votes_option4 || 0, index: 4 },
              ].filter(opt => opt.text);

              return (
                <div 
                  key={poll.id}
                  className="backdrop-blur-2xl bg-gradient-to-br from-yellow-500/10 via-black/30 to-amber-600/10 rounded-3xl p-8 border border-yellow-500/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.25),inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.35)] transition-all duration-500 relative overflow-hidden group"
                >
                  {/* Border effect */}
                  <div className="absolute inset-0 rounded-3xl border border-white/5 shadow-xl shadow-yellow-200/20 pointer-events-none"></div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </div>

                  {/* Poll Header */}
                  <div className="mb-6 relative z-10">
                    {/* Creator Info */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-yellow-500/20">
                      <div className="relative">
                        {poll.creator_image ? (
                          <img 
                            src={poll.creator_image} 
                            alt={poll.creator_username}
                            className="w-12 h-12 rounded-full border-2 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.4)] object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center justify-center"
                          style={{ display: poll.creator_image ? 'none' : 'flex' }}
                        >
                          <User size={24} className="text-black" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-yellow-50 font-semibold">{poll.creator_username || 'Unknown'}</p>
                        <p className="text-yellow-100/50 text-sm">{poll.creator_email || 'No email'}</p>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-yellow-50 flex-1">
                        {poll.question}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {voted && (
                          <div className="flex items-center gap-2 px-3 py-1 backdrop-blur-xl bg-green-500/20 border border-green-400/30 rounded-full">
                            <CheckCircle size={16} className="text-green-400" />
                            <span className="text-green-400 text-sm font-semibold">Voted</span>
                          </div>
                        )}
                        {/* Allow deletion if user is admin OR if user created the poll */}
                        {(user?.isAdmin || poll.created_by === user?.id) && (
                          <button
                            onClick={() => setDeleteConfirm(poll.id)}
                            className="p-2 backdrop-blur-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg transition-all duration-300 hover:scale-110 shadow-[0_4px_16px_0_rgba(239,68,68,0.15)] hover:shadow-[0_4px_20px_0_rgba(239,68,68,0.3)] group-delete"
                            title="Delete poll"
                          >
                            <Trash2 size={18} className="text-red-400 group-delete-hover:text-red-300" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-yellow-100/60 text-sm">
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{totalVotes} votes</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 backdrop-blur-xl bg-yellow-500/10 border border-yellow-400/20 rounded-full">
                        <Clock size={16} className="text-yellow-400" />
                        <span className="text-yellow-100 font-medium">{getTimeRemaining(poll.end_time)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 relative z-10">
                    {options.map((option) => {
                      const percentage = getVotePercentage(option.votes, totalVotes);
                      const isSelected = voted && votedPolls[poll.id] === option.index;
                      
                      return (
                        <button
                          key={option.index}
                          onClick={() => canVote && vote(poll.id, option.index)}
                          disabled={!canVote}
                          className={`w-full relative backdrop-blur-xl rounded-xl p-4 border transition-all duration-300 ${
                            !canVote
                              ? 'cursor-not-allowed opacity-60'
                              : 'hover:scale-[1.02] cursor-pointer'
                          } ${
                            isSelected
                              ? 'bg-amber-500/30 border-amber-400/50 shadow-[0_4px_20px_0_rgba(251,191,36,0.3)]'
                              : 'bg-yellow-500/15 border-yellow-500/30 hover:bg-yellow-500/20'
                          }`}
                        >
                          {/* Progress bar background */}
                          {voted && (
                            <div 
                              className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          )}
                          
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                isSelected
                                  ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-black shadow-[0_4px_16px_0_rgba(234,179,8,0.4)]'
                                  : 'bg-gradient-to-br from-yellow-500/40 to-amber-600/40 text-yellow-100'
                              }`}>
                                {isSelected ? '✓' : option.index}
                              </div>
                              <span className="text-yellow-50 font-semibold text-left">{option.text}</span>
                            </div>
                            
                            {voted && (
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-yellow-100/60 text-sm">{option.votes} votes</span>
                                <span className="text-yellow-400 font-bold text-lg min-w-[3rem] text-right">
                                  {percentage}%
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Vote prompt */}
                  {!voted && (
                    <div className="mt-4 text-center relative z-10">
                      <p className="text-yellow-100/40 text-sm flex items-center justify-center gap-2">
                        <Sparkles size={14} />
                        Click an option to cast your vote
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PollList;