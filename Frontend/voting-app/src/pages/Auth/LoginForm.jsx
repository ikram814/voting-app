import React, { useState, useContext, useEffect } from 'react';
import imageurl from '../../assets/images/image.png';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, user, loading } = useContext(AuthContext);
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!loading && user) {
      navigate('/Home', { replace: true });
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    if (!creds.username.trim()) {
      setError('Username or email is required');
      return false;
    }
    if (!creds.password) {
      setError('Password is required');
      return false;
    }
    if (creds.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await login(creds);
      // La redirection sera gérée par useEffect
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-yellow-500 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Fond noir très foncé */}
      <div className="absolute inset-0 bg-black"></div>

      {/* Reflets dorés principaux */}
      <div className="absolute top-0 left-1/5 w-96 h-96 bg-yellow-500 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-1/6 right-1/4 w-96 h-96 bg-amber-400 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-yellow-400 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-amber-300 rounded-full opacity-15 blur-3xl"></div>

      {/* Reflets dorés dans les coins */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-400 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-400 rounded-full opacity-15 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-amber-300 rounded-full opacity-15 blur-3xl"></div>

      {/* Petites particules dorées dispersées */}
      {[...Array(25)].map((_, i) => {
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const size = 5 + Math.random() * 15;
        const opacity = 10 + Math.random() * 15;
        return (
          <div
            key={i}
            className="absolute rounded-full blur-xl bg-yellow-400"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity / 100
            }}
          ></div>
        );
      })}

      {/* Partie gauche - Formulaire */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-lg">
          <div className="backdrop-blur-xl bg-black/60 rounded-3xl p-10 shadow-2xl border-2 border-yellow-500/50 shadow-yellow-500/40">
            {/* Avatar */}
            <div className="flex justify-center mb-10">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-700 flex items-center justify-center shadow-2xl shadow-yellow-600/50 border-2 border-yellow-400/30">
                  <svg className="w-14 h-14 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              {/* Email Input */}
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-yellow-500 group-focus-within:text-yellow-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Username or Email"
                    value={creds.username}
                    onChange={e => {
                      setCreds({ ...creds, username: e.target.value });
                      setError(null);
                    }}
                    disabled={isSubmitting}
                    className="w-full pl-12 pr-4 py-4 bg-black/60 border-2 border-yellow-600/30 rounded-xl text-yellow-50 placeholder-yellow-600/40 focus:outline-none focus:border-yellow-500 focus:bg-black/80 hover:border-yellow-500/50 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-yellow-500 group-focus-within:text-yellow-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={creds.password}
                    onChange={e => {
                      setCreds({ ...creds, password: e.target.value });
                      setError(null);
                    }}
                    disabled={isSubmitting}
                    className="w-full pl-12 pr-12 py-4 bg-black/60 border-2 border-yellow-600/30 rounded-xl text-yellow-50 placeholder-yellow-600/40 focus:outline-none focus:border-yellow-500 focus:bg-black/80 hover:border-yellow-500/50 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-yellow-500 hover:text-yellow-400 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg p-3 animate-pulse">
                  <svg className="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative w-full py-4 px-4 bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 hover:from-yellow-400 hover:via-yellow-500 hover:to-amber-500 text-black font-bold text-lg rounded-xl shadow-2xl shadow-yellow-600/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus:outline-none overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="relative z-10">
                  {isSubmitting ? 'LOGGING IN...' : 'LOGIN'}
                </span>
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                )}
              </button>

              {/* Register Link */}
              <div className="text-center text-yellow-100/60 text-sm pt-2">
                Don't have an account?{' '}
                <button 
                  type="button"
                  onClick={() => navigate('/SignUpForm')} 
                  className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors duration-300 hover:underline"
                  disabled={isSubmitting}
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Partie droite - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-4 pr-24 z-10">
        <img
          src={imageurl}
          alt="illustration"
          className="w-full h-auto transform"
          style={{
            animation: "float 2s ease-in-out infinite alternate",
            marginTop: '100px'
          }}
        />
        <style>
          {`
            @keyframes float {
              0% { transform: translateY(5px) scale(1.4); }
              50% { transform: translateY(-10px) scale(1.42); }
              100% { transform: translateY(5px) scale(1.4); }
            }
          `}
        </style>
      </div>
    </div>
  );
}