// pages/Dashboard/RoomVoting.jsx
import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { roomsAPI } from '../../api';
import { ArrowLeft, Users, Clock, CheckCircle, Sparkles } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

export const RoomVoting = () => {
  const { roomId, pollId } = useParams();
  const { user } = useContext(AuthContext);
  const { joinPollRoom, leavePollRoom, castVote, onVoteUpdate, onPollStatusChange } = useSocket();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [room, setRoom] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voteCounts, setVoteCounts] = useState({
    option1: 0,
    option2: 0,
    option3: 0,
    option4: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [roomId, pollId]);

  // Timer for remaining time
  useEffect(() => {
    if (!poll) return;

    const timer = setInterval(async () => {
      if (poll.poll_status !== 'active' || !poll.started_at) {
        setTimeRemaining(poll.poll_status === 'closed' ? 'Poll Ended' : 'Not started');
        return;
      }

      const now = new Date();
      const startedAt = new Date(poll.started_at);
      const durationMinutes = poll.duration_minutes || 60;
      const endTime = new Date(startedAt.getTime() + durationMinutes * 60000);
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeRemaining('Poll Ended');
        clearInterval(timer);
        if (poll.poll_status === 'active') {
          try {
            await roomsAPI.closePoll(roomId, poll.id);
            setPoll(prev => ({ ...prev, poll_status: 'closed' }));
          } catch (e) {
            console.error('Error closing poll:', e);
          }
        }
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeRemaining(`${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining(`${seconds}s`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [poll, roomId]);

  // Socket.IO listeners - AVEC L'ANCIEN CONTEXTE
  useEffect(() => {
    if (!poll || !room || !user) return;

    console.log('🔌 Setting up socket listeners for poll:', pollId);

    // Join poll room
    joinPollRoom(roomId, pollId, user.id, user.username);

    // Listen for vote updates
    onVoteUpdate((data) => {
      console.log('📊 Vote update received:', data);
      
      if (data.pollId === parseInt(pollId)) {
        console.log('✅ Updating vote counts');
        setVoteCounts({
          option1: parseInt(data.option1_count) || 0,
          option2: parseInt(data.option2_count) || 0,
          option3: parseInt(data.option3_count) || 0,
          option4: parseInt(data.option4_count) || 0
        });
      }
    });

    // Listen for poll status changes
    onPollStatusChange((data) => {
      console.log('📢 Poll status change:', data);
      
      if (data.pollId === parseInt(pollId)) {
        setPoll(prev => ({ ...prev, poll_status: data.status }));
        if (data.status === 'closed') {
          setError('Poll has been closed');
        }
      }
    });

    // Cleanup - pas besoin de retourner une fonction car on n'a pas de références
    return () => {
      console.log('🧹 Cleaning up');
      leavePollRoom(roomId, pollId);
    };
  }, [poll, room, user, pollId, roomId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [roomRes, pollsRes] = await Promise.all([
        roomsAPI.getRoom(roomId),
        roomsAPI.getRoomPolls(roomId)
      ]);

      setRoom(roomRes.data.room);
      const foundPoll = pollsRes.data.polls.find(p => p.id === parseInt(pollId));

      if (!foundPoll) {
        setError('Poll not found');
        return;
      }

      setPoll(foundPoll);
      setHasVoted(foundPoll.user_voted || false);
      
      // Initialize vote counts
      setVoteCounts({
        option1: parseInt(foundPoll.option1_count) || 0,
        option2: parseInt(foundPoll.option2_count) || 0,
        option3: parseInt(foundPoll.option3_count) || 0,
        option4: parseInt(foundPoll.option4_count) || 0
      });

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Error loading poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (option) => {
    if (hasVoted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Vote in backend
      await roomsAPI.voteInRoom(roomId, pollId, { option_selected: option });
      
      // Update local state
      setHasVoted(true);
      setSelectedOption(option);

      // Calculate new counts
      const newCounts = {
        option1: voteCounts.option1 + (option === 1 ? 1 : 0),
        option2: voteCounts.option2 + (option === 2 ? 1 : 0),
        option3: voteCounts.option3 + (option === 3 ? 1 : 0),
        option4: voteCounts.option4 + (option === 4 ? 1 : 0)
      };

      setVoteCounts(newCounts);

      // Emit via Socket.IO
      const totalVotes = Object.values(newCounts).reduce((a, b) => a + b, 0);
      
      console.log('🗳️ Emitting vote:', {
        totalVotes,
        option1_count: newCounts.option1,
        option2_count: newCounts.option2,
        option3_count: newCounts.option3,
        option4_count: newCounts.option4
      });

      castVote(roomId, pollId, user?.id, {
        totalVotes,
        option1_count: newCounts.option1,
        option2_count: newCounts.option2,
        option3_count: newCounts.option3,
        option4_count: newCounts.option4
      });
      
    } catch (err) {
      console.error('Vote error:', err);
      setHasVoted(false);
      setError(err.response?.data?.message || 'Error voting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalVotes = () => {
    return Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
  };

  const getPercentage = (count) => {
    const total = getTotalVotes();
    return total === 0 ? 0 : Math.round((count / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <p className="text-xl text-amber-400">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!poll || !room) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <p className="text-red-400 text-lg">Poll not found</p>
        </div>
      </div>
    );
  }

  const options = [
    { text: poll.option1, votes: voteCounts.option1, index: 1 },
    { text: poll.option2, votes: voteCounts.option2, index: 2 },
    { text: poll.option3, votes: voteCounts.option3, index: 3 },
    { text: poll.option4, votes: voteCounts.option4, index: 4 },
  ].filter(opt => opt.text);

  const canVote = poll.poll_status === 'active' && !hasVoted;
  const totalVotes = getTotalVotes();

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="ml-64 flex-1 p-10 overflow-y-auto relative">
        {/* Background effects */}
        <div className="fixed inset-0 ml-64 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-yellow-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate(`/rooms/${roomId}`)}
              className="p-2 hover:bg-amber-400/20 rounded-lg transition-all hover:shadow-lg hover:shadow-amber-400/30"
            >
              <ArrowLeft size={24} className="text-amber-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-amber-400">{room.name}</h1>
              {room.description && (
                <p className="text-amber-300/60 text-sm mt-1">{room.description}</p>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Poll Card */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-yellow-500/10 via-black/30 to-amber-600/10 rounded-3xl p-10 border-2 border-yellow-500/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.25)] transition-all duration-500 relative overflow-hidden">
            
            <div className="absolute inset-0 rounded-3xl border border-white/5 shadow-xl shadow-yellow-200/20 pointer-events-none"></div>
            
            {/* Poll Header */}
            <div className="mb-6 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 flex-1 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)] pr-4">
                  {poll.question}
                </h2>
                <div className={`flex items-center gap-2 px-5 py-3 rounded-full backdrop-blur-xl border ${
                  poll.poll_status === 'active'
                    ? 'bg-green-500/20 border-green-400/30 text-green-400'
                    : poll.poll_status === 'closed'
                      ? 'bg-red-500/20 border-red-400/30 text-red-400'
                      : 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400'
                }`}>
                  <span className={`w-3 h-3 rounded-full ${poll.poll_status === 'active' ? 'bg-green-400 animate-pulse' : ''}`}></span>
                  <span className="font-semibold text-base">
                    {poll.poll_status === 'active' ? 'Active' : poll.poll_status === 'closed' ? 'Closed' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-yellow-100/60 text-base">
                {totalVotes > 0 && (
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
                  </div>
                )}
                {poll.poll_status === 'active' && timeRemaining && (
                  <div className="flex items-center gap-2 px-3 py-1 backdrop-blur-xl bg-yellow-500/10 border border-yellow-400/20 rounded-full">
                    <Clock size={16} className="text-yellow-400 animate-pulse" />
                    <span className="text-yellow-100 font-medium">{timeRemaining}</span>
                  </div>
                )}
                {poll.poll_status === 'closed' && (
                  <div className="flex items-center gap-2 px-3 py-1 backdrop-blur-xl bg-red-500/10 border border-red-400/20 rounded-full">
                    <Clock size={16} className="text-red-400" />
                    <span className="text-red-100 font-medium">Poll Ended</span>
                  </div>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-6 relative z-10">
              {options.map((option) => {
                const percentage = getPercentage(option.votes);
                const isSelected = selectedOption === option.index;
                
                return (
                  <button
                    key={option.index}
                    onClick={() => canVote && handleVote(option.index)}
                    disabled={!canVote || isSubmitting}
                    className={`w-full relative backdrop-blur-xl rounded-xl p-5 border-2 transition-all duration-300 ${
                      !canVote || isSubmitting ? 'cursor-not-allowed opacity-60' : 'hover:scale-[1.02] cursor-pointer'
                    } ${
                      isSelected
                        ? 'bg-amber-500/30 border-amber-400/50 shadow-[0_4px_20px_0_rgba(251,191,36,0.3)]'
                        : 'bg-yellow-500/15 border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500/50'
                    }`}
                  >
                    {hasVoted && totalVotes > 0 && percentage > 0 && (
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-5 flex-1">
                        <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-black shadow-[0_4px_16px_0_rgba(234,179,8,0.3)] transition-all duration-300 relative ${isSelected ? 'scale-110' : ''}`}>
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent opacity-50"></div>
                          <span className="relative z-10 text-xl">{isSelected ? '✓' : option.index}</span>
                        </div>
                        <span className="text-yellow-50 font-semibold text-xl text-left flex-1">{option.text}</span>
                      </div>
                      
                      {hasVoted && totalVotes > 0 && (
                        <div className="flex items-center gap-5 flex-shrink-0">
                          {option.votes > 0 ? (
                            <>
                              <span className="text-yellow-100/70 text-base font-medium">{option.votes} {option.votes === 1 ? 'vote' : 'votes'}</span>
                              {percentage > 0 && (
                                <span className="text-yellow-400 font-bold text-2xl min-w-[5rem] text-right">{percentage}%</span>
                              )}
                            </>
                          ) : (
                            <span className="text-yellow-100/40 text-base">No votes</span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Status message */}
            <div className="relative z-10 text-center space-y-4">
              {hasVoted && (
                <div className="bg-green-500/20 border-2 border-green-400/30 text-green-400 p-5 rounded-lg flex items-center justify-center gap-3">
                  <CheckCircle size={20} />
                  <span className="font-semibold text-lg">Your vote has been recorded</span>
                </div>
              )}
              {!canVote && !hasVoted && poll.poll_status === 'closed' && (
                <button
                  className="bg-amber-500/20 border-2 border-amber-500/30 text-amber-400 p-5 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 mx-auto hover:bg-amber-500/30 hover:border-amber-400 transition-all"
                  onClick={() => navigate(`/rooms/${roomId}/poll/${pollId}/results`)}
                >
                  <Sparkles size={20} />
                  View Chart
                </button>
              )}
              {!canVote && !hasVoted && poll.poll_status !== 'closed' && (
                <div className="bg-amber-500/20 border-2 border-amber-500/30 text-amber-400 p-5 rounded-lg">
                  <span className="font-semibold text-lg">Voting is not available for this poll</span>
                </div>
              )}
              {canVote && (
                <div className="text-yellow-100/60 text-base flex items-center justify-center gap-2">
                  <Sparkles size={16} />
                  Vote now
                </div>
              )}
            </div>
          </div>

          {/* Real-time indicator */}
          <div className="mt-8 flex justify-center">
            <div className="text-xs text-yellow-400/60 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Real-time updates enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomVoting;