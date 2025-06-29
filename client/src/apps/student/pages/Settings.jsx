import { useEffect, useState } from "react";
import api from "../api"
import { toast } from "react-toastify";

const Settings = () => {
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/settings/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        dob: res.data.dob ? res.data.dob.substring(0, 10) : "", // ISO date to yyyy-mm-dd
      });
    };

    fetchProfile();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    await api.put("/api/settings/me", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Profile updated successfully!");
  };

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
      await api.put(
        "/auth/change-password",
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
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2">Profile & Settings</h1>
        <p className="text-gray-500 mb-6">
          Manage your account settings and preferences
        </p>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center p-6 border-b">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl text-blue-500 font-bold">
              {form.name?.charAt(0)}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">{form.name}</h2>
              <p className="text-sm text-gray-500">{form.email}</p>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Student
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 text-center font-semibold ${
                tab === "profile"
                  ? "bg-gray-100 border-b-2 border-blue-600"
                  : "bg-white"
              }`}
              onClick={() => setTab("profile")}
            >
              Profile
            </button>
            <button
              className={`flex-1 py-3 text-center font-semibold ${
                tab === "password"
                  ? "bg-gray-100 border-b-2 border-blue-600"
                  : "bg-white"
              }`}
              onClick={() => setTab("password")}
            >
              Password
            </button>
          </div>

          {/* Profile Tab */}
          {tab === "profile" && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                  disabled
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full mt-1 border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <input
                    disabled
                    name="email"
                    value={form.email}
                    className="w-full mt-1 border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full mt-1 border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    className="w-full mt-1 border rounded px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full mt-1 border rounded px-3 py-2"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Save Profile
              </button>
            </div>
          )}

          {/* Password Tab (unchanged) */}
          {tab === "password" && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
