import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import axios from 'axios';

function StudentProfile() {
  const { userData, setUserData } = useContext(UserContext);
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    setUserData(null);
    navigate('/');
  };

  const changePassword = async () => {
    try {
      await axios.post('http://localhost:5000/auth/change-password', {
        username: userData.username,
        newPassword,
      });
      alert('Password changed successfully');
    } catch {
      alert('Failed to change password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center md:text-left mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Profile & Settings</h2>
          <p className="text-gray-600 text-sm md:text-base">Manage your account settings and preferences</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg">
                {userData?.name ? userData.name.charAt(0) : 'S'}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{userData?.name || 'Student Name'}</h3>
                <p className="text-gray-600 text-sm md:text-base mt-1">{userData?.email || 'student@example.com'}</p>
                <span className="inline-block mt-3 px-4 py-2 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                  Student
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 md:px-8 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-inner max-w-fit">
              <button className="bg-white text-gray-700 rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 flex items-center space-x-2 border border-gray-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Password</span>
              </button>
            </div>
          </div>

          {/* Password Settings Content */}
          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Password Settings</h4>
              <p className="text-gray-600 text-sm md:text-base">Update your password to keep your account secure</p>
            </div>
            
            <div className="max-w-md mx-auto md:mx-0 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={changePassword}
                  className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-800 hover:shadow-lg transition-all duration-200 text-sm font-semibold transform hover:scale-[1.02]"
                >
                  Change Password
                </button>

                <button
                  onClick={logout}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 text-sm font-semibold transform hover:scale-[1.02]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 md:px-8 py-6 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => navigate('/student/home')}
              className="w-full sm:w-auto bg-white border border-gray-300 px-6 py-3 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 text-sm font-medium text-gray-700"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;