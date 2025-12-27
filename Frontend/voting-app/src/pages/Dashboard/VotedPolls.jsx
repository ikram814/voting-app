import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { User, BarChart3 } from "lucide-react";
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
            <div className="flex flex-col gap-8 w-full">
              {votedPolls.map((poll) => (
                <div
                  key={poll.id}
                  onClick={() => navigate(`/poll-stats/${poll.id}`)}
                  className="group cursor-pointer backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-black/30 to-amber-600/10 rounded-3xl border-2 border-yellow-500/25 shadow-[0_8px_32px_0_rgba(234,179,8,0.25)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.35)] hover:border-yellow-500/40 transition-all duration-500 relative overflow-hidden w-full min-h-[140px]"
                >
                  {/* Border inner */}
                  <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none"></div>

                  <div className="p-8 flex flex-row items-center gap-8 relative z-10 w-full">
                    {/* Creator info - Left side */}
                    <div className="flex items-center gap-5 flex-shrink-0">
                      <div className="relative flex-shrink-0">
                        {poll.creator_image ? (
                          <img
                            src={poll.creator_image}
                            alt={poll.creator_username}
                            className="w-20 h-20 rounded-full border-[3px] border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.3)] object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-[3px] border-yellow-500/60 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.4)]">
                            <User size={40} className="text-black" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-yellow-100 font-bold text-lg">
                          {poll.creator_username}
                        </div>
                        <div className="text-yellow-50/60 text-sm">
                          Créateur du poll
                        </div>
                      </div>
                    </div>

                    {/* Poll content - Middle section */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-yellow-50 mb-3 group-hover:text-yellow-100 transition-colors line-clamp-2">
                        {poll.question}
                      </h3>
                      <p className="text-sm text-yellow-100/80">
                        <span className="text-yellow-400/70 font-medium">Créé le:</span>{" "}
                        {poll.created_at
                          ? new Date(poll.created_at).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                        {" • "}
                        <span className="text-yellow-400/70 font-medium">Terminé le:</span>{" "}
                        {poll.end_time
                          ? new Date(poll.end_time).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </p>
                    </div>

                    {/* Action button - Right side */}
                    <div className="flex-shrink-0">
                      <span className="inline-block px-8 py-4 rounded-full border-2 border-yellow-400/40 bg-gradient-to-r from-yellow-600/25 to-yellow-400/25 text-yellow-100 text-base font-bold tracking-wider group-hover:shadow-lg group-hover:text-yellow-300 group-hover:border-yellow-400/60 group-hover:from-yellow-600/35 group-hover:to-yellow-400/35 transition-all duration-300 whitespace-nowrap">
                        Voir les résultats →
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
                <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-2 border-yellow-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(234,179,8,0.3)]">
                  <BarChart3 size={56} className="text-yellow-400" />
                </div>
                </div>
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

