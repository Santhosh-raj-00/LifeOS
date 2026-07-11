import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Phone, Calendar, Flame, Award, 
  Key, ShieldAlert, Sparkles, CheckSquare2, Star
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password change fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile');
      setProfile(response.data);
      setName(response.data.name || '');
      setEmail(response.data.email || '');
      setPhone(response.data.phone || '');
    } catch (err) {
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.put('/api/profile', {
        name,
        email: email.trim() || null,
        phone: phone.trim() || null
      });
      setSuccess('Profile updated successfully!');
      
      // Update global user context
      updateUser({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone
      });
      fetchProfile();
    } catch (err) {
      setError(err.response?.data || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword.length < 8) {
      setPassError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    try {
      await axios.put('/api/profile/password', {
        oldPassword,
        newPassword
      });
      setPassSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPassError(err.response?.data || 'Failed to change password.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-8">
        <User className="w-8 h-8 text-indigo-500" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">User Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your details, review unlocked badges, and change security credentials.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading profile workspace...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Stats & achievements */}
          <div className="space-y-6 lg:col-span-1">
            {/* Summary details card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-3xl mb-4 border border-indigo-500/20">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{profile.name}</h3>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-1">LEVEL {profile.level} CONSISTENT</p>
              
              <div className="grid grid-cols-2 gap-4 w-full mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs font-bold text-slate-400">
                <div className="border-r border-slate-100 dark:border-slate-800">
                  <p className="text-slate-500 font-medium">XP points</p>
                  <p className="text-lg text-slate-800 dark:text-slate-200 mt-0.5">{profile.xp} XP</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Streak 🔥</p>
                  <p className="text-lg text-slate-800 dark:text-slate-200 mt-0.5">{profile.currentStreak} Days</p>
                </div>
              </div>

              <div className="w-full flex items-center text-xs font-semibold text-slate-400 gap-1.5 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 justify-center">
                <Calendar className="w-4 h-4" />
                <span>Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'June 2026'}</span>
              </div>
            </div>

            {/* Achievements panel */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-1.5">
                <Award className="w-5 h-5 text-amber-500" />
                Unlocked Achievements ({profile.achievements.length})
              </h4>

              {profile.achievements.length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic text-xs">
                  No achievements unlocked yet. Complete tasks on time to earn badges!
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40 rounded-xl flex items-start space-x-2.5"
                    >
                      <Star className="w-5 h-5 text-amber-500 shrink-0 fill-amber-500 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{achievement.title}</h5>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Update profile and update password */}
          <div className="lg:col-span-2 space-y-6">
            {/* Update Profile Details */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Edit Profile Information
              </h4>

              {error && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3.5 rounded-xl text-sm mb-4">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3.5 rounded-xl text-sm mb-4">
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  Save Updates
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                <Key className="w-5 h-5 text-indigo-500" />
                Change Password
              </h4>

              {passError && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3.5 rounded-xl text-sm mb-4">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3.5 rounded-xl text-sm mb-4">
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">New Password (Min. 8 char)</label>
                    <input
                      type="password"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
