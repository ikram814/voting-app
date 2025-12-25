import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from "../../context/AuthContext.jsx";
import { useNavigate } from 'react-router-dom';
import imageurl from '../../assets/images/image.png';

export function SignUpForm() {
  const navigate = useNavigate();
  const { register, login, user, loading } = useContext(AuthContext);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [avatar, setAvatar] = useState(null); // base64 de l'image
  const [avatarPreview, setAvatarPreview] = useState(null); // pour prévisualisation

  useEffect(() => {
    if (!loading && user) {
      navigate('/Home', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 6) strength++;
      if (password.length >= 10) strength++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      if (/[^a-zA-Z0-9]/.test(password)) strength++;
      return strength;
    };
    setPasswordStrength(calculateStrength(form.password));
  }, [form.password]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (form.username.length > 30) {
      newErrors.username = 'Username must be less than 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = 'Username can only contain letters, numbers and underscores';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (form.password.length > 100) {
      newErrors.password = 'Password is too long';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, avatar: 'Image must be less than 2MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result); // base64
        setAvatarPreview(reader.result);
        setErrors({ ...errors, avatar: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Enregistrement avec l'image
      await register({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        image: avatar // Envoyer l'image en base64
      });

      // Connexion automatique
      await login({
        username: form.username.trim(),
        password: form.password
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      
      if (errorMessage.includes('email') || errorMessage.includes('duplicate')) {
        setErrors({ email: 'This email is already registered' });
      } else if (errorMessage.includes('username')) {
        setErrors({ username: 'This username is already taken' });
      } else {
        setErrors({ general: errorMessage || 'Registration failed. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (!form.password) return '';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
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
      {/* Fond noir avec reflets dorés */}
      <div className="absolute inset-0 bg-black"></div>
      <div className="absolute top-0 left-1/5 w-96 h-96 bg-yellow-500 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-1/6 right-1/4 w-96 h-96 bg-amber-400 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-yellow-400 rounded-full opacity-20 blur-3xl"></div>

      {/* Formulaire */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-lg">
          <div className="backdrop-blur-xl bg-black/60 rounded-3xl p-10 shadow-2xl border-2 border-yellow-500/50 shadow-yellow-500/40">
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-5">
              <label className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center cursor-pointer overflow-hidden shadow-xl hover:scale-105 transition-transform duration-300">
                
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar Preview" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <svg 
                    className="w-10 h-10 text-black/80" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth={2}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                )}

                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
              <p className="mt-2 text-sm text-yellow-100/60 text-center">
                {avatarPreview ? "Image sélectionnée" : "Cliquez pour ajouter votre photo"}
              </p>
              {errors.avatar && (
                <p className="text-red-400 text-xs mt-1">{errors.avatar}</p>
              )}
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              {/* General Error */}
              {errors.general && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <svg className="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errors.general}
                </div>
              )}

              {/* Username */}
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={e => {
                    setForm({ ...form, username: e.target.value });
                    setErrors({ ...errors, username: null });
                  }}
                  disabled={isSubmitting}
                  className={`w-full pl-4 pr-4 py-4 bg-black/60 border-2 ${
                    errors.username ? 'border-red-500/50' : 'border-yellow-500/50'
                  } rounded-xl text-yellow-50 placeholder-yellow-600/40 focus:outline-none focus:border-yellow-400 focus:bg-black/80 hover:border-yellow-400/50 transition-all duration-300 shadow-lg disabled:opacity-50`}
                  autoComplete="username"
                />
                {errors.username && (
                  <p className="text-red-400 text-xs mt-1 ml-1">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={e => {
                    setForm({ ...form, email: e.target.value });
                    setErrors({ ...errors, email: null });
                  }}
                  disabled={isSubmitting}
                  className={`w-full pl-4 pr-4 py-4 bg-black/60 border-2 ${
                    errors.email ? 'border-red-500/50' : 'border-yellow-500/50'
                  } rounded-xl text-yellow-50 placeholder-yellow-600/40 focus:outline-none focus:border-yellow-400 focus:bg-black/80 hover:border-yellow-400/50 transition-all duration-300 shadow-lg disabled:opacity-50`}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={e => {
                      setForm({ ...form, password: e.target.value });
                      setErrors({ ...errors, password: null });
                    }}
                    disabled={isSubmitting}
                    className={`w-full pl-4 pr-12 py-4 bg-black/60 border-2 ${
                      errors.password ? 'border-red-500/50' : 'border-yellow-500/50'
                    } rounded-xl text-yellow-50 placeholder-yellow-600/40 focus:outline-none focus:border-yellow-400 focus:bg-black/80 hover:border-yellow-400/50 transition-all duration-300 shadow-lg disabled:opacity-50`}
                    autoComplete="new-password"
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
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1 ml-1">{errors.password}</p>
                )}
                {form.password && !errors.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-yellow-400">{getPasswordStrengthText()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={e => {
                      setForm({ ...form, confirmPassword: e.target.value });
                      setErrors({ ...errors, confirmPassword: null });
                    }}
                    disabled={isSubmitting}
                    className={`w-full pl-4 pr-12 py-4 bg-black/60 border-2 ${
                      errors.confirmPassword ? 'border-red-500/50' : 'border-yellow-500/50'
                    } rounded-xl text-yellow-50 placeholder-yellow-600/40 focus:outline-none focus:border-yellow-400 focus:bg-black/80 hover:border-yellow-400/50 transition-all duration-300 shadow-lg disabled:opacity-50`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-yellow-500 hover:text-yellow-400 transition-colors"
                  >
                    {showConfirmPassword ? (
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
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1 ml-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative w-full py-4 px-4 bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 hover:from-yellow-400 hover:via-yellow-500 hover:to-amber-500 text-black font-bold text-lg rounded-xl shadow-2xl shadow-yellow-600/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus:outline-none overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="relative z-10">
                  {isSubmitting ? 'CREATING ACCOUNT...' : 'REGISTER'}
                </span>
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center text-yellow-100/60 text-sm pt-2">
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => navigate('/login')} 
                  className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors duration-300 hover:underline"
                  disabled={isSubmitting}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Image 3D */}
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