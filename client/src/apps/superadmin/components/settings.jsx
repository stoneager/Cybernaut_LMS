import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const Settings = () => {

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [details,setDetails] = useState({
    name : "",
    email: "",
  })
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      console.log("Token : "+token);
      const res = await axios.get("http://localhost:5001/api/settings/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetails(res.data);
    };

    fetchProfile();
  }, []);



  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const submitPasswordChange = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        "http://localhost:5000/auth/change-password",
        passwordForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-white via-blue-50 to-white h-screen bg-gray-50">
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-500 mb-6">
          Manage your details
        </p>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center p-6 border-b">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl text-blue-500 font-bold">
              {details.name?.charAt(0)}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">{details.name}</h2>
              <p className="text-sm text-gray-500">{details.email}</p>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                CEO
              </span>
            </div>
          </div>

            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Change Password</h2>
              <p className="text-gray-500">
                Update your password to keep your account secure
              </p>

              {["currentPassword", "newPassword", "confirmPassword"].map(
                (field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium">
                      {field === "currentPassword"
                        ? "Current Password"
                        : field === "newPassword"
                        ? "New Password"
                        : "Confirm New Password"}
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showPassword[field] ? "text" : "password"}
                        name={field}
                        value={passwordForm[field]}
                        onChange={handlePasswordChange}
                        className="w-full border px-3 py-2 rounded"
                      />
                      <span
                        onClick={() => toggleVisibility(field)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                      >
                        👁
                      </span>
                    </div>
                  </div>
                )
              )}

              <button
                onClick={submitPasswordChange}
                className="mt-4 bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800"
              >
                Change Password
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
