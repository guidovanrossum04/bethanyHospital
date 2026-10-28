import React, { useState } from 'react';
import { UserRole } from '../../types';

interface LoginViewProps {
  onLoginSuccess: (role: UserRole) => void;
  currentTheme: 'bethany' | 'carepulse';
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, currentTheme }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const [username, setUsername] = useState('dr.jenkins@bethanycare.com');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'doctor') {
      setUsername('dr.jenkins@bethanycare.com');
    } else if (role === 'receptionist') {
      setUsername('reception@bethanycare.com');
    } else {
      setUsername('admin@bethanycare.com');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(selectedRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edf7f0] via-[#f7fbf8] to-[#def2e4] text-slate-800 flex items-center justify-center p-4 sm:p-8">
      {/* Container card */}
      <div className="max-w-[1020px] w-full mx-auto bg-white rounded-2xl overflow-hidden shadow-[0px_8px_30px_rgba(6,78,59,0.08)] border border-emerald-900/10 flex flex-col md:flex-row min-h-[640px]">
        {/* Left Image Section */}
        <div className="hidden md:block md:w-1/2 relative bg-emerald-950 overflow-hidden">
          <img
            src="/assets/aistudio/Image_13_12d18a73.jpeg"
            alt="Bethany Nature Care Veranda & Gardens"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/40 to-transparent flex flex-col justify-end p-8 text-white z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-semibold w-fit mb-3">
              <span className="material-symbols-outlined text-sm">spa</span>
              <span>Ayurvedic Wellness & Panchakarma</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 leading-tight text-emerald-50">
              Natural Healing.<br />Holistic Care.
            </h2>
            <p className="text-sm text-white/85 leading-relaxed max-w-sm">
              Streamlined clinical data management for authentic Ayurvedic and holistic wellness environments.
            </p>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Logo */}
            <div className="mb-6 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-2xl">spa</span>
              </div>
              <span className="text-xl font-extrabold text-emerald-950 tracking-tight">
                Bethany Nature Care
              </span>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-emerald-950">Welcome Back</h1>
              <p className="text-sm text-slate-500 mt-1">
                Please log in to access the clinical management system.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Select Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`md-btn md-btn-sm w-full transition-all ${
                      selectedRole === 'admin'
                        ? 'bg-emerald-800 text-white font-bold shadow-xs'
                        : 'bg-emerald-50/70 border border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('receptionist')}
                    className={`md-btn md-btn-sm w-full transition-all ${
                      selectedRole === 'receptionist'
                        ? 'bg-emerald-800 text-white font-bold shadow-xs'
                        : 'bg-emerald-50/70 border border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                    }`}
                  >
                    Receptionist
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('doctor')}
                    className={`md-btn md-btn-sm w-full transition-all ${
                      selectedRole === 'doctor'
                        ? 'bg-emerald-800 text-white font-bold shadow-xs'
                        : 'bg-emerald-50/70 border border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                    }`}
                  >
                    Doctor
                  </button>
                </div>
              </div>

              {/* Email / Username */}
              <div>
                <label className="block text-xs font-semibold text-forest-deep mb-1.5" htmlFor="username">
                  Email or Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter your credentials"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                  />
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-600 border-slate-300"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to registered email.')}
                  className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="md-btn md-btn-filled w-full mt-4 cursor-pointer py-3"
              >
                <span>Login as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-sage-wash/40 text-center text-[11px] text-outline">
            © 2024 Bethany Nature Care Management System. Restricted Clinical Access.
          </div>
        </div>
      </div>
    </div>
  );
};
