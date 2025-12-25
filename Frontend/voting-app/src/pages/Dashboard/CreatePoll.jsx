import React, { useState, useContext } from 'react';
import { Plus, X, Clock, HelpCircle, Sparkles, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

export function CreatePoll() {
  const { user } = useContext(AuthContext);
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  
  const [form, setForm] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    end_time: "",
    image: "",
  });

  const [visibleOptions, setVisibleOptions] = useState(2);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const showToast = (message, type = 'info', duration = 3500) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be less than 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setForm({ ...form, image: base64Image });
        setImagePreview(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const addOption = () => {
    if (visibleOptions < 4) {
      setVisibleOptions(visibleOptions + 1);
    } else {
      showToast('Maximum 4 options allowed', 'error');
    }
  };

  const removeOption = (optionNumber) => {
    if (visibleOptions > 2) {
      setForm({ ...form, [`option${optionNumber}`]: "" });
      setErrors({ ...errors, [`option${optionNumber}`]: null });
      
      const newForm = { ...form };
      for (let i = optionNumber; i < 4; i++) {
        newForm[`option${i}`] = form[`option${i + 1}`] || "";
      }
      newForm.option4 = "";
      
      setForm(newForm);
      setVisibleOptions(visibleOptions - 1);
    } else {
      showToast('Minimum 2 options required', 'error');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.question.trim()) {
      newErrors.question = 'Question is required';
    } else if (form.question.length < 10) {
      newErrors.question = 'Question must be at least 10 characters';
    } else if (form.question.length > 200) {
      newErrors.question = 'Question must be less than 200 characters';
    }

    for (let i = 1; i <= visibleOptions; i++) {
      const optionKey = `option${i}`;
      if (!form[optionKey].trim()) {
        newErrors[optionKey] = `Option ${i} is required`;
      } else if (form[optionKey].length > 100) {
        newErrors[optionKey] = 'Option too long';
      }
    }

    const options = [];
    for (let i = 1; i <= visibleOptions; i++) {
      if (form[`option${i}`].trim()) {
        options.push(form[`option${i}`].trim().toLowerCase());
      }
    }
    
    const uniqueOptions = new Set(options);
    if (uniqueOptions.size !== options.length) {
      newErrors.options = 'All options must be unique';
    }

    if (!form.end_time) {
      newErrors.end_time = 'End time is required';
    } else {
      const endDate = new Date(form.end_time);
      const now = new Date();
      if (endDate <= now) {
        newErrors.end_time = 'End time must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validateForm()) {
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/polls", form);
      showToast('Poll created successfully!', 'success');
      
      setTimeout(() => {
        setForm({
          question: "",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          end_time: "",
          image: "",
        });
        setVisibleOptions(2);
        setErrors({});
        setImagePreview(null);
      }, 1000);
    } catch (error) {
      console.error('Error creating poll:', error);
      showToast('Failed to create poll: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-black/40 to-amber-600/10 rounded-3xl p-10 border border-yellow-500/30 text-center shadow-[0_8px_32px_0_rgba(234,179,8,0.2),inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.3)] transition-all duration-500">
          <div className="text-yellow-400 text-6xl mb-4">🔒</div>
          <h3 className="text-yellow-50 text-2xl font-bold mb-2">Access Denied</h3>
          <p className="text-yellow-100/60">Only admins can create polls</p>
        </div>
      </div>
    );
  }

  const allOptions = [
    { name: 'option1', label: 'Option 1' },
    { name: 'option2', label: 'Option 2' },
    { name: 'option3', label: 'Option 3' },
    { name: 'option4', label: 'Option 4' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Toast */}
      {toast.visible && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
          <div className={`max-w-sm w-full backdrop-blur-xl rounded-xl px-4 py-3 border ${toast.type === 'success' ? 'bg-green-500/20 border-green-400/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.2)]' : toast.type === 'error' ? 'bg-red-500/20 border-red-400/30 shadow-[0_8px_32px_0_rgba(239,68,68,0.2)]' : 'bg-yellow-500/20 border-yellow-400/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.2)]'}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-sm text-yellow-50">{toast.message}</div>
              </div>
              <button className="text-yellow-300 hover:text-yellow-100 transition-colors" onClick={() => setToast((t) => ({ ...t, visible: false }))}>✕</button>
            </div>
          </div>
        </div>
      )}

      <Sidebar />
      
      {/* Content Area */}
      <div className="flex-1 ml-64 relative flex items-center justify-center p-8 overflow-y-auto ">
        {/* Background effects */}
       

        {/* Particules dorées très discrètes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-yellow-300 rounded-full opacity-30 animate-[ping_3.5s_linear_infinite]"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-amber-200 rounded-full opacity-25 animate-[ping_4s_linear_infinite]" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-yellow-400 rounded-full opacity-30 animate-[ping_4.5s_linear_infinite]" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-amber-300 rounded-full opacity-20 animate-[ping_5s_linear_infinite]" style={{ animationDelay: '0.5s' }}></div>
        </div>


        {/* Main Content */}
        <div className="relative z-10 w-full max-w-8xl my-4">
<div className="backdrop-blur-2xl bg-gradient-to-br from-yellow-500/10 via-black/30 to-amber-600/10 rounded-3xl p-10 border border-yellow-500/30 
    shadow-[0_8px_32px_0_rgba(234,179,8,0.25),inset_0_1px_0_0_rgba(255,255,255,0.15),0_16px_48px_0_rgba(234,179,8,0.1)]
    hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.35),0_16px_48px_0_rgba(234,179,8,0.15)]
    transition-all duration-500 relative overflow-hidden">
            
            {/* Bordure intérieure lumineuse */}
<div className="absolute inset-0 rounded-3xl border border-white/5 shadow-xl shadow-yellow-200/20 pointer-events-none"></div>
            
            {/* Header */}
            <div className="mb-10 text-center relative">
              <div className="inline-block relative">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 mb-2 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">Create New Poll</h1>
              </div>
            </div>

            {/* Question Section - Glassmorphism */}
            <div className="mb-8">
              <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/15 via-amber-500/10 to-yellow-600/15 rounded-2xl p-6 border border-yellow-500/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.25)] transition-all duration-300 group relative overflow-hidden">
                
                {/* Bordure intérieure */}
                <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none"></div>
                
                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </div>
                
                <div className="flex items-start gap-3 mb-3 relative z-10">
                  <div className="mt-1 relative">
                    <HelpCircle size={24} className="text-amber-400 group-hover:text-yellow-300 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  </div>
                  <div className="flex-1">
                    <label className="text-yellow-100/90 text-sm font-semibold mb-2 block group-hover:text-yellow-50 transition-colors duration-300">Poll Question</label>
                    <textarea
                      name="question"
                      value={form.question}
                      onChange={handleChange}
                      placeholder="What would you like to ask? Make it clear and engaging..."
                      disabled={isSubmitting}
                      rows={3}
                      className={`w-full px-4 py-3 backdrop-blur-xl bg-black/40 border ${
                        errors.question ? 'border-red-500/50' : 'border-yellow-500/30'
                      } rounded-xl text-yellow-50 placeholder-yellow-600/40 focus:outline-none focus:border-yellow-400/60 focus:shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all duration-300 resize-none disabled:opacity-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]`}
                    />
                    {errors.question && (
                      <p className="text-red-400 text-xs mt-2">{errors.question}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-yellow-100/40 text-xs">Min 10 characters</p>
                      <p className={`text-xs ${form.question.length > 200 ? 'text-red-400' : 'text-yellow-100/40'}`}>
                        {form.question.length}/200
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="mb-8">
              <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/15 via-amber-500/10 to-yellow-600/15 rounded-2xl p-6 border border-yellow-500/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.25)] transition-all duration-300 group relative overflow-hidden">
                <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none"></div>
                
                <div className="relative z-10">
                  <label className="text-yellow-100/90 text-sm font-semibold mb-2 block">Poll Image (Optional)</label>
                  <div className="flex flex-col gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                      className="hidden"
                      id="poll-image-upload"
                    />
                    <label
                      htmlFor="poll-image-upload"
                      className="cursor-pointer px-4 py-3 backdrop-blur-xl bg-black/40 border border-yellow-500/30 rounded-xl text-yellow-50 hover:border-yellow-400/60 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all duration-300 disabled:opacity-50 text-center"
                    >
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </label>
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Poll preview"
                          className="w-full h-48 object-cover rounded-xl border border-yellow-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setForm({ ...form, image: "" });
                          }}
                          className="absolute top-2 right-2 p-2 backdrop-blur-xl bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/30"
                        >
                          <X size={16} className="text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Options Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-400 text-lg font-semibold flex items-center gap-2">
                  <CheckCircle size={20} className="drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
                  Poll Options
                </h3>
                <button
                  onClick={addOption}
                  disabled={visibleOptions >= 4 || isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30 rounded-lg transition-all duration-300 text-yellow-400 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border border-yellow-500/30 shadow-[0_4px_16px_0_rgba(234,179,8,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_4px_20px_0_rgba(234,179,8,0.25)] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <Plus size={16} className="relative z-10" />
                  <span className="relative z-10">Add Option</span>
                </button>
              </div>

              <div className="space-y-3">
                {allOptions.slice(0, visibleOptions).map((option, index) => (
                  <div key={option.name} className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/15 via-amber-500/10 to-yellow-600/15 rounded-xl p-4 border border-yellow-500/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.25)] transition-all duration-300 group relative overflow-hidden">
                    
                    {/* Bordure intérieure */}
                    <div className="absolute inset-0 rounded-xl border border-white/5 pointer-events-none"></div>
                    
                    {/* Effet de brillance au hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-black shadow-[0_4px_16px_0_rgba(234,179,8,0.3)] group-hover:shadow-[0_4px_20px_0_rgba(234,179,8,0.5)] group-hover:scale-110 transition-all duration-300 relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent opacity-50"></div>
                        <span className="relative z-10">{index + 1}</span>
                      </div>
                      <input
                        type="text"
                        name={option.name}
                        value={form[option.name]}
                        onChange={handleChange}
                        placeholder={option.label}
                        disabled={isSubmitting}
                        className={`flex-1 px-4 py-3 backdrop-blur-xl bg-black/40 border ${
                          errors[option.name] ? 'border-red-500/50' : 'border-yellow-500/30'
                        } rounded-lg text-yellow-50 placeholder-yellow-600/40 focus:outline-none focus:border-yellow-400/60 focus:shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all duration-300 disabled:opacity-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]`}
                      />
                      {visibleOptions > 2 && (
                        <button
                          onClick={() => removeOption(index + 1)}
                          disabled={isSubmitting}
                          className="flex-shrink-0 p-2 backdrop-blur-xl bg-red-500/20 hover:bg-red-500/30 hover:scale-110 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/30 shadow-[0_4px_16px_0_rgba(239,68,68,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                        >
                          <X size={18} className="text-red-400" />
                        </button>
                      )}
                    </div>
                    {errors[option.name] && (
                      <p className="text-red-400 text-xs mt-2 ml-14">{errors[option.name]}</p>
                    )}
                  </div>
                ))}
              </div>
              {errors.options && (
                <p className="text-red-400 text-xs mt-2">{errors.options}</p>
              )}
              <p className="text-yellow-100/40 text-xs mt-3">
                {visibleOptions < 4 
                  ? `You can add up to ${4 - visibleOptions} more option${4 - visibleOptions > 1 ? 's' : ''}`
                  : 'Maximum 4 options reached'}
              </p>
            </div>

            {/* End Time Section - Glassmorphism */}
            <div className="mb-10">
              <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/15 via-amber-500/10 to-yellow-600/15 rounded-2xl p-6 border border-yellow-500/30 shadow-[0_8px_32px_0_rgba(234,179,8,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.25)] transition-all duration-300 group relative overflow-hidden">
                
                {/* Bordure intérieure */}
                <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none"></div>
                
                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </div>
                
                <div className="flex items-start gap-3 relative z-10">
                  <div className="mt-1 relative">
                    <Clock size={24} className="text-amber-400 group-hover:text-yellow-300 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  </div>
                  <div className="flex-1">
                    <label className="text-yellow-100/90 text-sm font-semibold mb-2 block group-hover:text-yellow-50 transition-colors duration-300">Poll End Time</label>
                    <input
                      type="datetime-local"
                      name="end_time"
                      value={form.end_time}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 backdrop-blur-xl bg-black/40 border ${
                        errors.end_time ? 'border-red-500/50' : 'border-yellow-500/30'
                      } rounded-xl text-yellow-50 focus:outline-none focus:border-yellow-400/60 focus:shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all duration-300 disabled:opacity-50 [color-scheme:dark] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]`}
                      style={{
                        colorScheme: 'dark'
                      }}
                    />
                    {errors.end_time && (
                      <p className="text-red-400 text-xs mt-2">{errors.end_time}</p>
                    )}
                    <p className="text-yellow-100/40 text-xs mt-2">Select when voting should close</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button - Glassmorphism */}
            <div className="flex gap-4">
              <button
                onClick={submit}
                disabled={isSubmitting}
                className="flex-1 py-4 backdrop-blur-xl bg-gradient-to-r from-amber-500/80 via-yellow-500/80 to-amber-600/80 hover:from-amber-500/90 hover:via-yellow-500/90 hover:to-amber-600/90 rounded-xl transition-all duration-300 font-bold text-lg text-black shadow-[0_8px_32px_0_rgba(234,179,8,0.4),inset_0_1px_0_0_rgba(255,255,255,0.3)] hover:shadow-[0_8px_40px_0_rgba(234,179,8,0.6)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 relative overflow-hidden group border border-yellow-400/40"
              >
                {/* Bordure intérieure lumineuse */}
                <div className="absolute inset-0 rounded-xl border border-white/20 pointer-events-none"></div>
                
                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </div>
                
                {/* Overlay lumineux subtil */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-40"></div>
                
                <span className="relative z-10 flex items-center gap-3">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      Creating Poll...
                    </>
                  ) : (
                    <>
                      Create Poll
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CreatePoll;