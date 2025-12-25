import React, { useEffect, useState, useContext, useRef } from "react";
import { CheckCircle, Clock, Users, User, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

export function ViewPolls() {
  const { user } = useContext(AuthContext);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  const [searchParams] = useSearchParams();
  const pollRefs = useRef({});

  useEffect(() => {
    fetchActivePolls();
  }, []);

  useEffect(() => {
    if (!loading && polls.length > 0) {
      const pollId = searchParams.get('pollId');
      if (pollId) {
        setTimeout(() => {
          const pollElement = pollRefs.current[pollId];
          if (pollElement) {
            pollElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the poll briefly
            pollElement.style.transition = 'box-shadow 0.3s';
            pollElement.style.boxShadow = '0_8px_48px_0_rgba(234,179,8,0.6)';
            setTimeout(() => {
              pollElement.style.boxShadow = '';
            }, 2000);
          }
        }, 100);
      }
    }
  }, [loading, polls, searchParams]);

  const showToast = (message, type = 'info', duration = 3500) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
  };

  const fetchActivePolls = async () => {
    try {
      setLoading(true);
      // Récupérer TOUS les polls actifs (non expirés)
      const res = await api.get("/polls/active");
      console.log('Active polls:', res.data);
      setPolls(res.data);
    } catch (err) {
      console.error('Error fetching active polls:', err);
      showToast('Failed to load active polls', 'error');
    } finally {
      setLoading(false);
    }
  };

  const vote = async (pollId, option) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { option_selected: option });
      showToast('Vote recorded successfully!', 'success');
      fetchActivePolls(); // Refresh to get updated vote counts
    } catch (err) {
      showToast(err.response?.data?.message || 'Error voting', 'error');
    }
  };

  const getTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTotalVotes = (poll) => {
    return (poll.votes_option1 || 0) + (poll.votes_option2 || 0) + 
           (poll.votes_option3 || 0) + (poll.votes_option4 || 0);
  };

  const getVotePercentage = (votes, total) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const hasVoted = (poll) => {
    return poll.user_vote !== null && poll.user_vote !== undefined;
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

      <Sidebar />
      
      {/* Content Area */}
      <div className="flex-1 ml-64 relative p-8 overflow-y-auto">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-yellow-400/5 rounded-full blur-3xl"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 mb-3 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
              Active Polls
            </h1>
            <p className="text-yellow-100/60 text-lg">Vote on the latest community polls</p>
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
              <div className="text-yellow-400 text-6xl mb-4">📊</div>
              <h3 className="text-yellow-50 text-2xl font-bold mb-2">No Active Polls</h3>
              <p className="text-yellow-100/60">There are no active polls at the moment. Check back later!</p>
            </div>
          )}

          {/* Polls Grid */}
          <div className="space-y-6">
            {polls.map((poll) => {
              const totalVotes = getTotalVotes(poll);
              const voted = hasVoted(poll);
              const options = [
                { text: poll.option1, votes: poll.votes_option1 || 0, index: 1 },
                { text: poll.option2, votes: poll.votes_option2 || 0, index: 2 },
                { text: poll.option3, votes: poll.votes_option3 || 0, index: 3 },
                { text: poll.option4, votes: poll.votes_option4 || 0, index: 4 },
              ].filter(opt => opt.text);

              return (
                <div 
                  key={poll.id}
                  ref={(el) => (pollRefs.current[poll.id] = el)}
                  className="backdrop-blur-2xl bg-gradient-to-br from-yellow-500/10 via-black/30 to-amber-600/10 rounded-3xl p-8 border border-yellow-500/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.25)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.35)] transition-all duration-500 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none"></div>

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
                      {voted && (
                        <div className="flex items-center gap-2 px-3 py-1 backdrop-blur-xl bg-green-500/20 border border-green-400/30 rounded-full">
                          <CheckCircle size={16} className="text-green-400" />
                          <span className="text-green-400 text-sm font-semibold">Voted</span>
                        </div>
                      )}
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
                      const isSelected = voted && poll.user_vote === option.index;
                      
                      return (
                        <button
                          key={option.index}
                          onClick={() => !voted && vote(poll.id, option.index)}
                          disabled={voted}
                          className={`w-full relative backdrop-blur-xl rounded-xl p-4 border transition-all duration-300 ${
                            voted
                              ? 'cursor-default'
                              : 'hover:scale-[1.02] cursor-pointer'
                          } ${
                            isSelected
                              ? 'bg-amber-500/30 border-amber-400/50 shadow-[0_4px_20px_0_rgba(251,191,36,0.3)]'
                              : 'bg-yellow-500/15 border-yellow-500/30 hover:bg-yellow-500/20'
                          }`}
                        >
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

export default ViewPolls;