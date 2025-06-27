import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import logo from "../assets/logo.JPG";
import sideImage from "../assets/login-side.JPG";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await API.post("/auth/login", { email, password });
    const { accessToken, refreshToken, role } = res.data;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("role", role);
    localStorage.setItem("email", email);

    // Redirect to appropriate server based on role
    if (role === "superadmin") {
      window.location.href = `http://localhost:5173/superadmin?token=${accessToken}&role=${role}`;
    } else if (role === "admin") {
      window.location.href = `http://localhost:5173/admin?token=${accessToken}&role=${role}`;
    } else if (role === "student") {
      window.location.href = `http://localhost:5173/student?token=${accessToken}&role=${role}`;
    }
    else {
      setError("Unknown user role");
    }

  } catch (err) {
    setError(err.response?.data?.error || "Login failed.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Company Logo" className="h-10" />
          </div>
          <h2 className="text-2xl font-bold text-center">Sign in</h2>
          <p className="text-sm text-center text-gray-500">
            Please login to continue to your account.
          </p>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Sign in"}
          </button>
        </form>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden md:block md:w-1/2">
        <img src={sideImage} alt="Side Visual" className="object-cover mt-12" />
      </div>
    </div>
  );
};

export default Login;
