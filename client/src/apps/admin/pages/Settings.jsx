import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const Settings = () => {
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    specialisation: [],
  });
  const [newSkill, setNewSkill] = useState("");

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
      const res = await axios.get("http://localhost:5002/api/settings/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm(res.data);
    };

    fetchProfile();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    await axios.put("http://localhost:5002/api/settings/me", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Profile updated successfully!");
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;

    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://localhost:5002/api/settings/add-skill",
        { skill: newSkill.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm((prev) => ({
        ...prev,
        specialisation: res.data.specialisation,
      }));
      setNewSkill("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add skill");
    }
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
    <div className="p-4 flex h-[100vh] bg-gray-50">
      <div className="flex-1 p-0 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2">Profile & Settings</h1>
        <p className="text-gray-500 mb-6">
          Manage your account settings and preferences
        </p>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center h-25 p-6 border-b">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl text-blue-500 font-bold">
              {form.name?.charAt(0)}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">{form.name}</h2>
              <p className="text-sm text-gray-500">{form.email}</p>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Lecturer
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
                  <label className="text-sm font-medium">Department</label>
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full mt-1 border rounded px-3 py-2"
                  />
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <label className="text-sm font-medium">Skills</label>
                <div className="flex flex-wrap mt-2 gap-2">
                  {form.specialisation?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex mt-4 gap-2">
                  <input
                    type="text"
                    className="border rounded px-3 py-2 flex-1"
                    placeholder="Add new skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                  />
                  <button
                    onClick={addSkill}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
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

          {/* Password Tab */}
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
