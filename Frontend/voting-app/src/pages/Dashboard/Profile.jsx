import React, { useState, useContext, useEffect } from 'react';
import { User, Mail, Edit2, Check, X, BarChart2, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import api from '../../api';

export default function ProfilePage() {
  const { user, updateUser } = useContext(AuthContext);

  // Toast notification local au composant (remplace alert)
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  const showToast = (message, type = 'info', duration = 3500) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
  };

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  
  const [tempUsername, setTempUsername] = useState(user?.username || '');
  const [tempEmail, setTempEmail] = useState(user?.email || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.image || null);
  const [imageError, setImageError] = useState(false);
  
  // Password states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [pollsCreatedCount, setPollsCreatedCount] = useState(0);

  // Synchroniser avec le user du context
  useEffect(() => {
    if (user) {
      setTempUsername(user.username || '');
      setTempEmail(user.email || '');
      setAvatarPreview(user.image || null);
    }
  }, [user]);

  // Récupérer le nombre de polls créés par l'utilisateur
  useEffect(() => {
    const fetchPollsCreated = async () => {
      try {
        const res = await api.get("/polls/my-polls");
        setPollsCreatedCount(res.data.length || 0);
      } catch (err) {
        console.error('Error fetching polls created:', err);
        setPollsCreatedCount(0);
      }
    };

    if (user) {
      fetchPollsCreated();
    }
  }, [user]);

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
    setPasswordStrength(calculateStrength(passwordForm.newPassword));
  }, [passwordForm.newPassword]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image must be less than 2MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const newImage = reader.result;
        
        try {
          if (updateUser) {
            await updateUser({ image: newImage });
            setImageError(false);
            showToast('Avatar updated successfully!', 'success');
          }
        } catch (error) {
          console.error('Error updating avatar:', error);
          showToast('Failed to update avatar: ' + (error.response?.data?.message || error.message), 'error');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUsername = async () => {
    if (!tempUsername.trim()) {
      showToast('Username cannot be empty', 'error');
      return;
    }

    if (tempUsername === user?.username) {
      setIsEditingUsername(false);
      return;
    }

    if (tempUsername.length < 3) {
      showToast('Username must be at least 3 characters', 'error');
      return;
    }

    if (tempUsername.length > 30) {
      showToast('Username must be less than 30 characters', 'error');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(tempUsername)) {
      showToast('Username can only contain letters, numbers and underscores', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (updateUser) {
        await updateUser({ username: tempUsername });
        showToast('Username updated successfully!', 'success');
        setIsEditingUsername(false);
      }
    } catch (error) {
      console.error('Error updating username:', error);
      showToast('Failed to update username: ' + (error.response?.data?.message || error.message), 'error');
      setTempUsername(user?.username || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!tempEmail.trim()) {
      showToast('Email cannot be empty', 'error');
      return;
    }

    if (tempEmail === user?.email) {
      setIsEditingEmail(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempEmail)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (updateUser) {
        await updateUser({ email: tempEmail.toLowerCase() });
        showToast('Email updated successfully!', 'success');
        setIsEditingEmail(false);
      }
    } catch (error) {
      console.error('Error updating email:', error);
      showToast('Failed to update email: ' + (error.response?.data?.message || error.message), 'error');
      setTempEmail(user?.email || '');
    } finally {
      setIsSaving(false);
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    } else if (passwordForm.newPassword.length > 100) {
      errors.newPassword = 'Password is too long';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePassword = async () => {
    if (!validatePasswordForm()) return;

    setIsSaving(true);
    try {
      if (updateUser) {
        await updateUser({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        });
        
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
        setIsEditingPassword(false);
        showToast('Password updated successfully! Redirecting to login...', 'success');
        // Rediriger vers login après court délai pour laisser voir la notification
        setTimeout(() => { window.location.href = '/login'; }, 1400);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setPasswordErrors({ 
        currentPassword: errorMessage.includes('current') || errorMessage.includes('incorrect') 
          ? 'Current password is incorrect' 
          : errorMessage
      });
      showToast('Failed to update password: ' + errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelUsername = () => {
    setTempUsername(user?.username || '');
    setIsEditingUsername(false);
  };

  const handleCancelEmail = () => {
    setTempEmail(user?.email || '');
    setIsEditingEmail(false);
  };

  const handleCancelPassword = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsEditingPassword(false);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (!passwordForm.newPassword) return '';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Toast container (top-right) */}
      {toast.visible && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`max-w-sm w-full rounded-lg px-4 py-3 shadow-lg border-l-4 ${toast.type === 'success' ? 'bg-green-800 border-green-400' : toast.type === 'error' ? 'bg-red-800 border-red-400' : 'bg-black/80 border-yellow-400'}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-sm text-yellow-50">{toast.message}</div>
              </div>
              <button className="text-yellow-300" onClick={() => setToast((t) => ({ ...t, visible: false }))}>✕</button>
            </div>
          </div>
        </div>
      )}
      <Sidebar />
      
      {/* Zone de contenu - À DROITE de la sidebar */}
      <div className="flex-1 ml-64 relative flex items-center justify-center p-8 overflow-hidden">
        {/* Fond avec reflets dorés */}
        <div className="absolute top-0 left-1/5 w-96 h-96 bg-yellow-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/6 right-1/4 w-96 h-96 bg-amber-400 rounded-full opacity-25 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-yellow-400 rounded-full opacity-20 blur-3xl"></div>

        {/* Contenu principal */}
        <div className="relative z-10 w-full max-w-6xl">
          <div className="backdrop-blur-xl bg-black/60 rounded-3xl p-10 shadow-2xl border-2 border-yellow-500/50 shadow-yellow-500/40">
            
            {/* Section supérieure - Avatar et infos de base */}
            <div className="mb-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <label className="relative w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-4 border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.8),0_0_50px_rgba(234,179,8,0.5)] flex items-center justify-center cursor-pointer overflow-hidden hover:shadow-[0_0_35px_rgba(234,179,8,0.9),0_0_70px_rgba(234,179,8,0.7)] hover:scale-105 transition-all duration-300 group">
                    
                    {avatarPreview && !imageError ? (
                      <img 
                        src={avatarPreview} 
                        alt="avatar" 
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <User size={50} className="text-black/80" />
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Edit2 size={24} className="text-yellow-400" />
                    </div>

                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>
                  
                  <p className="mt-3 text-sm text-yellow-100/60">
                    Cliquez pour changer la photo
                  </p>
                </div>

                {/* Username */}
                <div className="bg-black/40 rounded-xl p-5 pr-12 border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 relative">
                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-3 flex-1">
                      <User size={22} className="text-amber-400" />
                      
                      {isEditingUsername ? (
                        <input
                          type="text"
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          className="w-20 md:w-64 bg-transparent border-b border-yellow-500 text-yellow-50 text-lg font-semibold focus:outline-none focus:border-yellow-400 transition-colors"
                          autoFocus
                          disabled={isSaving}
                        />
                      ) : (
                        <div className="w-48 md:w-64">
                          <p className="text-yellow-100/60 text-sm">Username</p>
                          <p className="text-yellow-50 text-lg font-semibold truncate">{user.username}</p>
                        </div>
                      )}
                    </div>

                    <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 flex gap-2">
                      {isEditingUsername ? (
                        <>
                          <button
                            onClick={handleSaveUsername}
                            disabled={isSaving}
                            className="p-2 bg-yellow-600/50 hover:bg-yellow-600/70 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check size={18} className="text-yellow-400" />
                          </button>
                          <button
                            onClick={handleCancelUsername}
                            disabled={isSaving}
                            className="pl-2 pr-2 py-2 bg-yellow-600/30 hover:bg-yellow-600/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X size={18} className="text-yellow-400" />
                          </button>
                        </>
                      ) : (
                          <button
                            onClick={() => setIsEditingUsername(true)}
                            className="p-2 bg-yellow-600/30 hover:bg-yellow-600/50 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} className="text-yellow-400" />
                          </button>
                      )}
                      </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-black/40 rounded-xl p-5 pr-12 border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 relative">
                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-3 flex-1">
                      <Mail size={22} className="text-amber-400" />
                      
                      {isEditingEmail ? (
                        <input
                          type="email"
                          value={tempEmail}
                          onChange={(e) => setTempEmail(e.target.value)}
                          className="w-44 md:w-64 bg-transparent border-b border-yellow-500 text-yellow-50 text-lg font-semibold focus:outline-none focus:border-yellow-400 transition-colors"
                          autoFocus
                          disabled={isSaving}
                        />
                      ) : (
                        <div className="w-48 md:w-64">
                          <p className="text-yellow-100/60 text-sm">Email</p>
                          <p className="text-yellow-50 text-lg font-semibold truncate">{user.email}</p>
                        </div>
                      )}
                    </div>

                    <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 flex gap-2">
                      {isEditingEmail ? (
                        <>
                          <button
                            onClick={handleSaveEmail}
                            disabled={isSaving}
                            className="p-2 bg-yellow-600/50 hover:bg-yellow-600/70 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check size={18} className="text-yellow-400" />
                          </button>
                          <button
                            onClick={handleCancelEmail}
                            disabled={isSaving}
                            className="pl-2 pr-2 py-2 bg-yellow-600/30 hover:bg-yellow-600/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X size={18} className="text-yellow-400" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditingEmail(true)}
                          className="p-2 bg-yellow-600/30 hover:bg-yellow-600/50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} className="text-yellow-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section de changement de mot de passe */}
            <div className="mb-10">
              <div className="bg-black/40 rounded-xl p-6 border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Lock size={22} className="text-amber-400" />
                    <div>
                      <p className="text-yellow-100/60 text-sm">Password</p>
                      <p className="text-yellow-50 text-lg font-semibold">••••••••</p>
                    </div>
                  </div>

                  {!isEditingPassword && (
                    <button
                      onClick={() => setIsEditingPassword(true)}
                      className="p-2 bg-yellow-600/30 hover:bg-yellow-600/50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} className="text-yellow-400" />
                    </button>
                  )}
                </div>

                {isEditingPassword && (
                  <div className="space-y-4 mt-6">
                    {/* Current Password */}
                    <div>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Current Password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => {
                            setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                            setPasswordErrors({ ...passwordErrors, currentPassword: null });
                          }}
                          disabled={isSaving}
                          className={`w-full pl-4 pr-12 py-3 bg-black/60 border-2 ${
                            passwordErrors.currentPassword ? 'border-red-500/50' : 'border-yellow-500/50'
                          } rounded-xl text-yellow-50 placeholder-yellow-600/40 focus:outline-none focus:border-yellow-400 transition-all duration-300 disabled:opacity-50`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-yellow-500 hover:text-yellow-400 transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-red-400 text-xs mt-1 ml-1">{passwordErrors.currentPassword}</p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="New Password"
                          value={passwordForm.newPassword}
                          onChange={(e) => {
                            setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                            setPasswordErrors({ ...passwordErrors, newPassword: null });
                          }}
                          disabled={isSaving}
                          className={`w-full pl-4 pr-12 py-3 bg-black/60 border-2 ${
                            passwordErrors.newPassword ? 'border-red-500/50' : 'border-yellow-500/50'
                          } rounded-xl text-yellow-50 placeholder-yellow-600/40 focus:outline-none focus:border-yellow-400 transition-all duration-300 disabled:opacity-50`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-yellow-500 hover:text-yellow-400 transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-red-400 text-xs mt-1 ml-1">{passwordErrors.newPassword}</p>
                      )}
                      {passwordForm.newPassword && !passwordErrors.newPassword && (
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
                          placeholder="Confirm New Password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => {
                            setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                            setPasswordErrors({ ...passwordErrors, confirmPassword: null });
                          }}
                          disabled={isSaving}
                          className={`w-full pl-4 pr-12 py-3 bg-black/60 border-2 ${
                            passwordErrors.confirmPassword ? 'border-red-500/50' : 'border-yellow-500/50'
                          } rounded-xl text-yellow-50 placeholder-yellow-600/40 focus:outline-none focus:border-yellow-400 transition-all duration-300 disabled:opacity-50`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-yellow-500 hover:text-yellow-400 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-red-400 text-xs mt-1 ml-1">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSavePassword}
                        disabled={isSaving}
                        className="flex-1 py-3 bg-yellow-600/50 hover:bg-yellow-600/70 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        
                        {isSaving ? 'Saving...' : 'Save Password'}
                      </button>
                      <button
                        onClick={handleCancelPassword}
                        disabled={isSaving}
                        className="flex-1 py-3 bg-yellow-600/30 hover:bg-yellow-600/50 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section inférieure - Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Polls Created */}
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-2xl p-8 border-2 border-yellow-500/40 hover:border-yellow-500/60 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-yellow-500/40">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mb-4 shadow-xl">
                    <BarChart2 size={32} className="text-black" />
                  </div>
                  <p className="text-yellow-100/70 text-sm mb-2 font-medium">Polls Created</p>
                  <p className="text-5xl font-bold text-yellow-400 mb-1">{pollsCreatedCount}</p>
                  <p className="text-yellow-100/50 text-xs">Total created</p>
                </div>
              </div>

              {/* Polls Voted */}
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-2xl p-8 border-2 border-yellow-500/40 hover:border-yellow-500/60 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-yellow-500/40">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mb-4 shadow-xl">
                    <CheckCircle size={32} className="text-black" />
                  </div>
                  <p className="text-yellow-100/70 text-sm mb-2 font-medium">Polls Voted</p>
                  <p className="text-5xl font-bold text-yellow-400 mb-1">{user.pollsVoted || 0}</p>
                  <p className="text-yellow-100/50 text-xs">Total voted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}