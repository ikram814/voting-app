import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, BarChart2 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import api from "../../api";
import { AuthContext } from "../../context/AuthContext";

export const PollStats = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/polls/${pollId}`);
        setPoll(res.data);
      } catch (err) {
        const msg =
          err.response?.data?.message || "Error loading poll.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (pollId) {
      fetchPoll();
    }
  }, [pollId]);

  const getTotalVotes = (p) => {
    if (!p) return 0;
    return (
      (p.votes_option1 || 0) +
      (p.votes_option2 || 0) +
      (p.votes_option3 || 0) +
      (p.votes_option4 || 0)
    );
  };

  const buildOptions = (p) => {
    if (!p) return [];
    return [
      { label: p.option1, votes: p.votes_option1 || 0, index: 1 },
      { label: p.option2, votes: p.votes_option2 || 0, index: 2 },
      p.option3 && { label: p.option3, votes: p.votes_option3 || 0, index: 3 },
      p.option4 && { label: p.option4, votes: p.votes_option4 || 0, index: 4 },
    ].filter(Boolean);
  };

  const totalVotes = getTotalVotes(poll);
  const options = buildOptions(poll);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <div className="flex-1 ml-64 relative flex flex-col p-8 overflow-y-auto">
        {/* Header + Back */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-200 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex items-center gap-3 text-yellow-200/80 text-sm">
            <BarChart2 size={18} />
            <span>Poll Statistics</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-black/40 to-amber-600/10 rounded-3xl p-10 border border-yellow-500/30">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
            </div>
          </div>
        ) : error ? (
          <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/10 via-black/40 to-red-600/10 rounded-3xl p-10 border border-red-500/40 text-center shadow-[0_8px_32px_0_rgba(239,68,68,0.25)]">
            <p className="text-red-400 text-lg font-semibold mb-2">{error}</p>
            <p className="text-red-200/70 text-sm">
              Make sure the poll is completed and you have access to it.
            </p>
          </div>
        ) : !poll ? (
          <div className="text-yellow-100/70 text-center py-20">
            No data available for this poll.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Poll card */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-yellow-500/10 via-black/30 to-amber-600/10 rounded-3xl p-8 border border-yellow-500/30 shadow-[0_10px_40px_0_rgba(234,179,8,0.35)] relative overflow-hidden">
              {/* Background glows */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.35),_transparent_60%)] opacity-70 pointer-events-none"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(245,158,11,0.25),_transparent_60%)] opacity-70 pointer-events-none"></div>

              <div className="relative z-10 space-y-6">
                {/* Creator + meta */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-yellow-500/25 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {poll.creator_image ? (
                        <img
                          src={poll.creator_image}
                          alt={poll.creator_username}
                          className="w-12 h-12 rounded-full border-2 border-yellow-500/60 shadow-[0_0_12px_rgba(234,179,8,0.4)] object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-yellow-500/60 flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.4)]">
                          <User size={24} className="text-black" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-yellow-50 font-semibold">
                        {poll.creator_username || "Unknown"}
                      </p>
                      <p className="text-yellow-100/60 text-xs">
                        {poll.creator_email || "No email"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-yellow-200/70">
                      Created at{" "}
                      {poll.created_at
                        ? new Date(poll.created_at).toLocaleString()
                        : "-"}
                    </p>
                    <p className="text-xs text-yellow-200/70">
                      Ended at{" "}
                      {poll.end_time
                        ? new Date(poll.end_time).toLocaleString()
                        : "-"}
                    </p>
                    <p className="text-xs text-yellow-300 mt-1">
                      Total votes:{" "}
                      <span className="font-semibold">{totalVotes}</span>
                    </p>
                  </div>
                </div>

                {/* Question */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-yellow-50 mb-3">
                    {poll.question}
                  </h1>
                  <p className="text-yellow-100/60 text-sm">
                    Detailed visualization of your poll results.
                  </p>
                </div>
              </div>
            </div>

            {/* Chart section - donut + vertical bars côte à côte */}
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
                  {/* Donut chart style */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-48 h-48 rounded-full flex items-center justify-center">
                      {/* Anneau violet/or type donut */}
                      <div
                        className="w-full h-full rounded-full"
                        style={{
                          background:
                            "conic-gradient(rgb(249 115 22) 0deg, rgb(250 204 21) 220deg, rgba(24,24,27,1) 220deg)",
                          padding: "12px",
                        }}
                      >
                        <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.45)]">
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

                  {/* Vertical bars chart style */}
                  <div className="space-y-6">
                    <div className="text-sm text-yellow-100/70">
                      Vote distribution by option.
                    </div>

                    <div className="relative h-64 flex items-end gap-4">
                      {/* Lignes de fond */}
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
                        const percent =
                          totalVotes === 0
                            ? 0
                            : Math.round((opt.votes / totalVotes) * 100);
                        const isUserChoice =
                          poll.user_vote && poll.user_vote === opt.index;

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
                                className={`w-3/4 rounded-xl bg-gradient-to-t from-amber-500 via-yellow-400 to-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.7)] transition-all duration-700`}
                                style={{ height: `${percent || 3}%` }}
                              >
                                <div className="w-full h-4 rounded-t-xl bg-yellow-100/90"></div>
                              </div>
                            </div>

                            <div className="text-xs text-center text-yellow-100/80 px-2 truncate max-w-[5rem]">
                              {opt.label}
                            </div>

                            {isUserChoice && (
                              <div className="text-[10px] text-green-400 mt-1">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


