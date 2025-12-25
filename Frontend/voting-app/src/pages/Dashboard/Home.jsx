// src/pages/Home.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Clock, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../api';
import  Image   from '../../assets/images/imgbanner.png';

// Floating bubbles animation
const floatAnimation = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) translateX(0px);
      opacity: 0.4;
    }
    25% {
      transform: translateY(-20px) translateX(10px);
      opacity: 0.6;
    }
    50% {
      transform: translateY(-40px) translateX(-5px);
      opacity: 0.5;
    }
    75% {
      transform: translateY(-20px) translateX(-10px);
      opacity: 0.7;
    }
  }
`;

export const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  const [currentIndex, setCurrentIndex] = useState(0);
  const pollsPerPage = 3;

  useEffect(() => {
    fetchActivePolls();
  }, []);

  const showToast = (message, type = 'info', duration = 3500) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
  };

  const fetchActivePolls = async () => {
    try {
      setLoading(true);
      const res = await api.get("/polls/active");
      setPolls(res.data);
    } catch (err) {
      console.error('Error fetching active polls:', err);
      showToast('Failed to load polls', 'error');
    } finally {
      setLoading(false);
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
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isPollActive = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    return end > now;
  };

  const handlePollClick = (poll) => {
    if (isPollActive(poll.end_time)) {
      navigate(`/view-polls?pollId=${poll.id}`);
    } else {
      showToast('This poll has expired', 'error');
    }
  };

  const nextPolls = () => {
    if (currentIndex + pollsPerPage < polls.length) {
      setCurrentIndex(currentIndex + pollsPerPage);
    }
  };

  const prevPolls = () => {
    if (currentIndex > 0) {
      setCurrentIndex(Math.max(0, currentIndex - pollsPerPage));
    }
  };

  const visiblePolls = polls.slice(currentIndex, currentIndex + pollsPerPage);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Floating bubbles animation styles */}
      <style>{floatAnimation}</style>
      
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
      <div className="flex-1 ml-64 relative flex flex-col p-8 overflow-y-auto">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-yellow-300 rounded-full opacity-30 animate-[ping_3.5s_linear_infinite]"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-amber-200 rounded-full opacity-25 animate-[ping_4s_linear_infinite]" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-yellow-400 rounded-full opacity-30 animate-[ping_4.5s_linear_infinite]" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-amber-300 rounded-full opacity-20 animate-[ping_5s_linear_infinite]" style={{ animationDelay: '0.5s' }}></div>
        </div>

{/* Hero Banner Section */}
<div className="relative z-10 mb-12 mt-8 ">
  <div className="backdrop-blur-2xl bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl p-12 border border-yellow-500/50 shadow-[0_10px_40px_0_rgba(234,179,8,0.6),0_0_100px_0_rgba(245,158,11,0.5),inset_0_2px_0_0_rgba(234,179,8,0.3)] relative overflow-hidden">
    
    {/* Animated luxury shimmer effect */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" 
           style={{
             animation: 'shimmer 3s ease-in-out infinite',
             backgroundSize: '200% 100%'
           }}></div>
    </div>
    
    {/* Luxury metallic gold gradient overlay */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/30 via-amber-600/20 to-transparent"></div>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-700/25 via-yellow-600/15 to-transparent"></div>
    
    {/* Multi-directional luxury gradients */}
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/35 via-transparent via-50% to-amber-600/30"></div>
    <div className="absolute inset-0 bg-gradient-to-tl from-yellow-500/30 via-transparent via-50% to-amber-500/25"></div>
    <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/25 via-transparent to-yellow-400/30"></div>
    
    {/* Premium diffused lights - top-left corner */}
    <div className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full blur-3xl opacity-80" style={{
      background: 'radial-gradient(circle, rgba(234, 179, 8, 0.9) 0%, rgba(245, 158, 11, 0.7) 20%, rgba(234, 179, 8, 0.5) 40%, rgba(217, 119, 6, 0.3) 60%, transparent 80%)'
    }}></div>
    
    {/* Premium diffused lights - bottom-right corner */}
    <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full blur-3xl opacity-80" style={{
      background: 'radial-gradient(circle, rgba(245, 158, 11, 0.8) 0%, rgba(255, 196, 2, 0.6) 25%, rgba(234, 178, 8, 0.88) 50%, transparent 75%)'
    }}></div>
    
    {/* Center spotlight - luxury glow */}
    <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-60" style={{
      background: 'radial-gradient(circle, rgba(234, 178, 8, 0.53) 0%, rgba(245, 202, 11, 0.93) 30%, rgba(217, 185, 6, 1) 50%, transparent 70%)'
    }}></div>
    
    {/* Metallic shine effect - diagonal sweep */}
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 via-transparent via-40% to-amber-400/15 opacity-70"></div>
    <div className="absolute inset-0 bg-gradient-to-tl from-yellow-400/15 via-transparent via-60% to-amber-300/20 opacity-60"></div>
    
    {/* Luxury border glow inner */}
    <div className="absolute inset-0 rounded-3xl" style={{
      background: 'linear-gradient(135deg, rgba(234, 178, 8, 0.4) 0%, transparent 50%, rgba(245, 158, 11, 0.2) 100%)',
      WebkitMaskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      padding: '2px'
    }}></div>
    
    {/* Deep vignette for luxury depth */}
    <div className="absolute inset-0 rounded-3xl" style={{
      background: 'radial-gradient(ellipse at center, transparent 20%, rgba(34, 34, 34, 0.27) 70%, rgba(0, 0, 0, 0.54) 100%)'
    }}></div>
    
    {/* Ambient particles effect */}
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-2/3 left-1/3 w-28 h-28 bg-yellow-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
    
    <div className="relative z-10 flex items-center justify-between gap-12">
      {/* Left content */}
      <div className="flex-1">
        <p className="text-yellow-400 text-sm uppercase tracking-[0.3em] mb-4 font-bold drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] filter brightness-125">
          ONLINE Vote
        </p>
        <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-[0_4px_20px_rgba(234,179,8,0.5),0_0_30px_rgba(245,158,11,0.3)] filter brightness-110 leading-tight">
          Welcome to simple and secure voting. Cast your vote with confidence.
        </h1>
        <button 
          onClick={() => navigate('/view-polls')}
          className="relative flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 via-amber-500 to-amber-600 hover:from-yellow-400 hover:via-amber-400 hover:to-amber-500 rounded-xl text-black font-bold transition-all duration-500 border-2 border-yellow-400/80 hover:border-yellow-300 group shadow-[0_6px_30px_0_rgba(234,179,8,0.7),0_0_40px_0_rgba(245,158,11,0.5),inset_0_1px_0_0_rgba(255,255,255,0.3)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.9),0_0_60px_0_rgba(245,158,11,0.7)] hover:scale-110 transform overflow-hidden"
        >
          {/* Button inner glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 group-hover:via-white/10"></div>
          
          <span className="relative z-10">Join Now</span>
          <div className="relative z-10 w-7 h-7 rounded-full bg-gradient-to-br from-white/40 to-white/20 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-white/50 group-hover:to-white/30 transition-all border-2 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.5)] group-hover:rotate-90 duration-500">
            <span className="text-base text-black font-black drop-shadow-sm">→</span>
          </div>
          
          {/* Button shine animation */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </button>
      </div>
      
      {/* Right image with luxury 3D effect */}
      <div className="relative flex-shrink-0 w-[340px] h-[340px]">
        {/* Premium 3D shadow layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/30 to-amber-800/35 rounded-full blur-3xl transform translate-x-10 translate-y-10 opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/40 to-amber-700/45 rounded-full blur-2xl transform translate-x-6 translate-y-6 opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/35 to-amber-600/40 rounded-full blur-xl transform translate-x-3 translate-y-3 opacity-60"></div>
        
        {/* Luxury glowing halo effect */}
        <div className="absolute inset-0 rounded-full blur-3xl opacity-90 animate-pulse" style={{
          background: 'radial-gradient(circle, rgba(234, 178, 8, 0.59) 0%, rgba(245, 190, 11, 0.55) 40%, transparent 70%)'
        }}></div>
        
        {/* Rotating ambient light */}
        <div className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-spin" style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(234, 179, 8, 0.4), transparent, rgba(245, 171, 11, 0.77), transparent)',
          animationDuration: '8s'
        }}></div>
        
        {/* Image container with premium 3D transform */}
      <div
  className="relative w-full h-full transform scale-125 transition-all duration-700 ease-out"
  style={{ perspective: '1000px' }}
>
  <img
    src={Image}
    alt="Business Innovation Icon"
    className="w-full h-full object-contain transition-all duration-700"
    style={{
      filter:
        'drop-shadow(0 30px 60px rgba(234, 179, 8, 0.8)) drop-shadow(0 15px 40px rgba(245, 158, 11, 0.6)) drop-shadow(0 0 50px rgba(217, 119, 6, 0.5)) brightness(1.15) contrast(1.15) saturate(1.2)',
      transform: 'translateZ(80px)',
    }}
  />
          
          {/* Premium reflection effect */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-yellow-500/15 via-amber-600/8 to-transparent blur-md"></div>
        </div>
        
        {/* Luxury floating sparkles */}
        <div className="absolute top-8 right-8 w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full blur-sm animate-pulse shadow-[0_0_25px_rgba(234,179,8,1),0_0_15px_rgba(245,158,11,0.8)]"></div>
        <div className="absolute bottom-16 left-8 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full blur-sm animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.9),0_0_12px_rgba(245,158,11,0.7)]" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 right-16 w-3.5 h-3.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full blur-sm animate-pulse shadow-[0_0_22px_rgba(245,158,11,0.95),0_0_13px_rgba(217,119,6,0.75)]" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 left-12 w-2.5 h-2.5 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full blur-sm animate-pulse shadow-[0_0_18px_rgba(234,179,8,0.85)]" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  </div>
</div>
        {/* Continue Watching Section */}
        <div className="relative z-10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-yellow-50">Continue Watching</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={prevPolls}
                disabled={currentIndex === 0}
                className="w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={20} className="text-gray-300" />
              </button>
              <button
                onClick={nextPolls}
                disabled={currentIndex + pollsPerPage >= polls.length}
                className="w-10 h-10 rounded-full bg-yellow-600/80 hover:bg-yellow-700/80 border border-yellow-500/50 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_0_rgba(234,179,8,0.3)]"
              >
                <ArrowRight size={20} className="text-yellow-100" />
              </button>
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
              <div className="text-yellow-400 text-6xl mb-4">📊</div>
              <h3 className="text-yellow-50 text-2xl font-bold mb-2">No Active Polls</h3>
              <p className="text-yellow-100/60">There are no active polls at the moment. Check back later!</p>
            </div>
          )}

          {/* Poll Cards Grid */}
          {!loading && visiblePolls.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visiblePolls.map((poll) => {
                const isActive = isPollActive(poll.end_time);
                const categoryColors = [
                  { bg: 'bg-blue-500/20', border: 'border-blue-400/30', text: 'text-blue-300' },
                  { bg: 'bg-purple-500/20', border: 'border-purple-400/30', text: 'text-purple-300' },
                  { bg: 'bg-pink-500/20', border: 'border-pink-400/30', text: 'text-pink-300' },
                ];
                const categoryColor = categoryColors[poll.id % categoryColors.length];

                return (
                  <div
                    key={poll.id}
                    onClick={() => handlePollClick(poll)}
                    className={`backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-black/30 to-amber-600/10 rounded-2xl border border-yellow-500/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.25)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.35)] transition-all duration-500 relative overflow-hidden group cursor-pointer ${
                      !isActive ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    {/* Border inner */}
                    <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none"></div>

                    {/* Image Section */}
                    <div className="relative h-56 overflow-hidden rounded-t-2xl">
                      {poll.image ? (
                        <img
                          src={poll.image}
                          alt={poll.question}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          style={{
                            objectPosition: 'center'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20 flex items-center justify-center">
                          <Sparkles size={48} className="text-yellow-400/50" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-black/60 transition-colors">
                          <Heart size={18} className="text-white" />
                        </div>
                      </div>
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full backdrop-blur-sm border ${categoryColor.bg} ${categoryColor.border} ${categoryColor.text} text-xs font-semibold`}>
                        POLL
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 relative z-10">
                      <h3 className="text-lg font-bold text-yellow-50 mb-3 line-clamp-2 group-hover:text-yellow-100 transition-colors">
                        {poll.question}
                      </h3>

                      {/* Creator Info */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-yellow-500/20">
                        <div className="relative">
                          {poll.creator_image ? (
                            <img
                              src={poll.creator_image}
                              alt={poll.creator_username}
                              className="w-10 h-10 rounded-full border-2 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)] object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)] flex items-center justify-center"
                            style={{ display: poll.creator_image ? 'none' : 'flex' }}
                          >
                            <User size={20} className="text-black" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-yellow-50 font-semibold text-sm truncate">
                            {poll.creator_username || 'Unknown'}
                          </p>
                          <p className="text-yellow-100/50 text-xs truncate">Mentor</p>
                        </div>
                      </div>

                      {/* Time Remaining - Enhanced with effects */}
                      <div className="flex items-center gap-2 relative">
                        <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-amber-500/8 to-yellow-500/10 group/time">
                          {/* Glowing effect */}
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-500/20 via-amber-500/15 to-yellow-500/20 opacity-0 group-hover/time:opacity-100 transition-opacity duration-300 blur-sm"></div>
                          
                          {/* Pulsing glow for active polls */}
                          {isActive && (
                            <div className="absolute inset-0 rounded-lg bg-yellow-500/10 animate-pulse"></div>
                          )}
                          
                          <Clock 
                            size={14} 
                            className={`relative z-10 ${
                              isActive 
                                ? 'text-yellow-400 drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]' 
                                : 'text-red-400'
                            }`}
                          />
                          <span className={`relative z-10 text-xs font-semibold ${
                            isActive 
                              ? 'text-yellow-300 drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]' 
                              : 'text-red-400'
                          }`}>
                            {isActive ? getTimeRemaining(poll.end_time) : 'Expired'}
                          </span>
                          
                          {/* Shimmer effect */}
                          {isActive && (
                            <div className="absolute inset-0 rounded-lg overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent -translate-x-full group-hover/time:translate-x-full transition-transform duration-1000"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
