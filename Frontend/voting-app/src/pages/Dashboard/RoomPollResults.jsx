// pages/Dashboard/RoomPollResults.jsx
import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { roomsAPI } from '../../api';
import { ArrowLeft, BarChart2, Users, Clock, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

export const RoomPollResults = () => {
  const { roomId, pollId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [roomId, pollId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [roomRes, pollsRes] = await Promise.all([
        roomsAPI.getRoom(roomId),
        roomsAPI.getRoomPolls(roomId)
      ]);

      setRoom(roomRes.data.room);
      const foundPoll = pollsRes.data.polls.find((p) => p.id === parseInt(pollId));
      
      if (foundPoll) {
        setPoll(foundPoll);
      } else {
        setError('Poll not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const getTotalVotes = () => {
    if (!poll) return 0;
    return (
      (poll.option1_count || 0) +
      (poll.option2_count || 0) +
      (poll.option3_count || 0) +
      (poll.option4_count || 0)
    );
  };

  const buildOptions = () => {
    if (!poll) return [];
    return [
      { label: poll.option1, votes: poll.option1_count || 0, index: 1 },
      { label: poll.option2, votes: poll.option2_count || 0, index: 2 },
      poll.option3 && { label: poll.option3, votes: poll.option3_count || 0, index: 3 },
      poll.option4 && { label: poll.option4, votes: poll.option4_count || 0, index: 4 },
    ].filter(Boolean);
  };

  const totalVotes = getTotalVotes();
  const options = buildOptions();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-black/40 to-amber-600/10 rounded-3xl p-10 border border-yellow-500/30">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center p-8">
          <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/10 via-black/40 to-red-600/10 rounded-3xl p-10 border border-red-500/40 text-center shadow-[0_8px_32px_0_rgba(239,68,68,0.25)] max-w-md">
            <p className="text-red-400 text-lg font-semibold mb-2">{error || 'Poll not found'}</p>
            <button
              onClick={() => navigate(`/rooms/${roomId}`)}
              className="mt-4 px-4 py-2 bg-amber-400 text-black rounded-lg hover:bg-amber-500 transition-all font-semibold"
            >
              Back to Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 overflow-y-auto relative">
        {/* Background effects */}
        <div className="fixed inset-0 ml-64 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-yellow-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => navigate(`/rooms/${roomId}`)}
              className="p-2 hover:bg-amber-400/20 rounded-lg transition-all hover:shadow-lg hover:shadow-amber-400/30"
            >
              <ArrowLeft size={24} className="text-amber-400" />
            </button>
            <div className="flex items-center gap-3 text-yellow-200/80 text-sm">
              <BarChart2 size={18} />
              <span>Poll Results</span>
            </div>
          </div>

          {/* Room Info */}
          {room && (
            <div className="mb-6 backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-black/30 to-amber-600/10 rounded-2xl p-4 border border-yellow-500/30">
              <h2 className="text-xl font-bold text-amber-400">{room.name}</h2>
              {room.description && <p className="text-amber-300/60 text-sm mt-1">{room.description}</p>}
            </div>
          )}

          {/* Poll Card */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-yellow-500/10 via-black/30 to-amber-600/10 rounded-3xl p-8 border border-yellow-500/30 shadow-[0_10px_40px_0_rgba(234,179,8,0.35)] relative overflow-hidden mb-8">
            <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.35),_transparent_60%)] opacity-70 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(245,158,11,0.25),_transparent_60%)] opacity-70 pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              {/* Poll Meta */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-yellow-500/25 pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-amber-300/80">
                    <Clock size={16} />
                    <span className="text-sm">{poll.duration_minutes}m duration</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    poll.poll_status === 'active'
                      ? 'bg-green-500/20 border border-green-400/30 text-green-400'
                      : poll.poll_status === 'closed'
                      ? 'bg-red-500/20 border border-red-400/30 text-red-400'
                      : 'bg-yellow-500/20 border border-yellow-400/30 text-yellow-400'
                  }`}>
                    {poll.poll_status || 'pending'}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-yellow-200/70">
                    Created: {poll.created_at ? new Date(poll.created_at).toLocaleString() : '-'}
                  </p>
                  {poll.closed_at && (
                    <p className="text-xs text-yellow-200/70">
                      Closed: {new Date(poll.closed_at).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-yellow-300 mt-1">
                    Total votes: <span className="font-semibold">{totalVotes}</span>
                  </p>
                </div>
              </div>

              {/* Question */}
              <div>
                <h1 className="text-3xl font-bold text-yellow-50 mb-3">
                  {poll.question}
                </h1>
                <p className="text-yellow-100/60 text-sm">
                  Detailed visualization of poll results.
                </p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl p-8 border border-yellow-500/40 shadow-[0_12px_50px_0_rgba(234,179,8,0.45)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 via-transparent to-amber-600/25 pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-yellow-50 flex items-center gap-2">
                  <BarChart2 size={20} className="text-yellow-400" />
                  Poll Results
                </h2>
                <p className="text-xs text-yellow-100/60">
                  Overall view + detail by option.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Donut Chart */}
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48 rounded-full flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                      {totalVotes > 0 && options.map((opt, idx) => {
                        const colors = ['rgb(249, 115, 22)', 'rgb(250, 204, 21)', 'rgb(234, 179, 8)', 'rgb(245, 158, 11)'];
                        const prevPercent = options.slice(0, idx).reduce((sum, o) => sum + (o.votes / totalVotes) * 100, 0);
                        const percent = (opt.votes / totalVotes) * 100;
                        const startAngle = (prevPercent / 100) * 360;
                        const endAngle = ((prevPercent + percent) / 100) * 360;
                        const largeArcFlag = percent > 50 ? 1 : 0;
                        const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                        const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                        const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                        const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
                        const pathData = [
                          `M 100 100`,
                          `L ${x1} ${y1}`,
                          `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          `Z`
                        ].join(' ');
                        return (
                          <path
                            key={opt.index}
                            d={pathData}
                            fill={colors[idx % colors.length]}
                            opacity={0.8}
                          />
                        );
                      })}
                      {totalVotes === 0 && (
                        <circle cx="100" cy="100" r="80" fill="rgba(24,24,27,1)" />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-36 h-36 rounded-full bg-zinc-950 flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.45)]">
                        <div className="text-center">
                          <div className="text-xs uppercase tracking-[0.25em] text-yellow-500/70 mb-1">
                            Votes
                          </div>
                          <div className="text-3xl font-extrabold text-yellow-50">
                            {totalVotes}
                          </div>
                          <div className="text-xs text-yellow-100/60 mt-1">
                            total participants
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vertical Bars Chart */}
                <div className="space-y-6">
                  <div className="text-sm text-yellow-100/70">
                    Vote distribution by option.
                  </div>

                  <div className="relative h-64 flex items-end gap-4">
                    {/* Grid lines */}
                    <div className="absolute inset-0 -z-10">
                      <div className="h-full w-full border-l border-b border-yellow-500/20 rounded-xl relative overflow-hidden">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="absolute inset-x-0 border-t border-yellow-500/10"
                            style={{ top: `${(i * 25)}%` }}
                          ></div>
                        ))}
                      </div>
                    </div>

                    {options.map((opt) => {
                      const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                      const isUserChoice = poll.user_voted && poll.user_vote === opt.index;

                      return (
                        <div
                          key={opt.index}
                          className="flex-1 flex flex-col items-center justify-end gap-2"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className="text-xs text-yellow-100/70">
                              {opt.votes} votes
                            </div>
                            <div className="text-sm font-bold text-yellow-300">
                              {percent}%
                            </div>
                          </div>

                          <div className="w-full h-40 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-end justify-center overflow-hidden">
                            <div
                              className="w-3/4 rounded-xl bg-gradient-to-t from-amber-500 via-yellow-400 to-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.7)] transition-all duration-700"
                              style={{ height: `${percent || 3}%` }}
                            >
                              <div className="w-full h-4 rounded-t-xl bg-yellow-100/90"></div>
                            </div>
                          </div>

                          <div className="text-xs text-center text-yellow-100/80 px-2 truncate max-w-[5rem]">
                            {opt.label}
                          </div>

                          {isUserChoice && (
                            <div className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                              <CheckCircle size={10} />
                              Your choice
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {options.length === 0 && (
                      <div className="w-full text-center text-yellow-100/70 text-sm">
                        No valid options found for this poll.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Options List */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-bold text-yellow-50 flex items-center gap-2">
                  <Users size={18} />
                  Detailed Results
                </h3>
                <div className="space-y-3">
                  {options.map((opt) => {
                    const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                    const isUserChoice = poll.user_voted && poll.user_vote === opt.index;

                    return (
                      <div
                        key={opt.index}
                        className="backdrop-blur-xl bg-gradient-to-r from-yellow-500/10 via-black/20 to-amber-600/10 rounded-xl p-4 border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-black shadow-[0_4px_16px_0_rgba(234,179,8,0.3)]">
                              {opt.index}
                            </div>
                            <span className="text-yellow-50 font-semibold">{opt.label}</span>
                            {isUserChoice && (
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <CheckCircle size={12} />
                                Your vote
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-yellow-400 font-bold text-lg">{percent}%</div>
                            <div className="text-yellow-100/70 text-xs">{opt.votes} {opt.votes === 1 ? 'vote' : 'votes'}</div>
                          </div>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-2 border border-amber-400/20">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPollResults;

