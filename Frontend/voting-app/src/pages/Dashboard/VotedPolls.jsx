import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import api from "../../api";

export const VotedPolls = () => {
  const navigate = useNavigate();
  const [votedPolls, setVotedPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/polls/finished");
        setVotedPolls(res.data);
      } catch (err) {
        setError("Erreur lors du chargement des sondages terminés.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      {/* Content Area */}
      <div className="flex-1 ml-64 relative flex flex-col p-8 overflow-y-auto">
        <h2 className="text-3xl font-bold text-yellow-50 mb-7">
          Sondages terminés / Notifications
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-black/40 to-amber-600/10 rounded-3xl p-10 border border-yellow-500/30">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-red-400 text-lg py-10 text-center">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {votedPolls.map((poll) => (
                <div
                  key={poll.id}
                  onClick={() => navigate(`/poll-stats/${poll.id}`)}
                  className="group cursor-pointer backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-black/30 to-amber-600/10 rounded-2xl border border-yellow-500/25 shadow-[0_8px_32px_0_rgba(234,179,8,0.25)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.35)] transition-all duration-500 relative overflow-hidden"
                >
                  {/* Border inner */}
                  <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none"></div>

                  <div className="p-7 flex flex-col gap-3 relative z-10">
                    {/* Creator info */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative flex-shrink-0">
                        {poll.creator_image ? (
                          <img
                            src={poll.creator_image}
                            alt={poll.creator_username}
                            className="w-12 h-12 rounded-full border-2 border-yellow-500/60 shadow-[0_0_10px_rgba(234,179,8,0.22)] object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-yellow-500/60 flex items-center justify-center shadow-[0_0_7px_rgba(234,179,8,0.33)]">
                            <User size={28} className="text-black" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-yellow-100 font-bold text-base">
                          {poll.creator_username}
                        </div>
                        <div className="text-yellow-50/60 text-xs">
                          Créateur du poll
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-yellow-50 mb-2 line-clamp-2 group-hover:text-yellow-100 transition-colors">
                        {poll.question}
                      </h3>
                      <p className="text-xs text-yellow-100/80">
                        Créé le{" "}
                        {poll.created_at
                          ? new Date(poll.created_at).toLocaleString()
                          : "-"}
                        {" "}• Terminé le{" "}
                        {poll.end_time
                          ? new Date(poll.end_time).toLocaleString()
                          : "-"}
                      </p>
                    </div>

                    <div className="mt-2 flex justify-end">
                      <span className="inline-block px-5 py-2 rounded-full border border-yellow-400/40 bg-gradient-to-r from-yellow-600/25 to-yellow-400/25 text-yellow-100 text-xs font-bold tracking-wider group-hover:shadow-md group-hover:text-yellow-300 transition-all duration-300">
                        Voir les résultats
                      </span>
                    </div>
                  </div>

                  {/* Hover effect gradient */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* No polls state */}
            {votedPolls.length === 0 && (
              <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-black/40 to-amber-600/10 rounded-3xl p-16 border border-yellow-500/30 text-center shadow-[0_8px_32px_0_rgba(234,179,8,0.18)]">
                <div className="text-yellow-400 text-4xl mb-4">📊</div>
                <h3 className="text-yellow-50 text-xl font-bold mb-2">
                  Aucun sondage terminé
                </h3>
                <p className="text-yellow-100/60">
                  Vous n'avez pas encore participé à de sondages terminés.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

