import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [profileData, setProfileData] = useState({
    OName: "",
    LName: "",
    city: "",
    seats: "",
  });

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/userDetails", {
        withCredentials: true,
      });
      setUser(res.data);
      setProfileData({
        OName: res.data.OName,
        LName: res.data.LName,
        city: res.data.city,
        seats: res.data.seats,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error loading settings:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/logout", {}, { withCredentials: true });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Submit Profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const res = await axios.put(
        "http://localhost:5000/api/updateSettings",
        {
          OName: profileData.OName,
          LName: profileData.LName,
          city: profileData.city,
          seats: Number(profileData.seats),
        },
        { withCredentials: true }
      );
      setUser(res.data.user);
      alert("Library settings updated successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Submit Password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      setUpdatingPassword(true);
      await axios.put(
        "http://localhost:5000/api/updateSettings",
        { password: passwordData.password },
        { withCredentials: true }
      );
      setPasswordData({ password: "", confirmPassword: "" });
      alert("Password changed successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to change password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4">Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex w-full relative overflow-hidden font-sans">
      {/* Decorative glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      <Sidebar user={user} handleLogout={handleLogout} />

      <main className="flex-1 p-6 sm:p-8 relative z-10 overflow-y-auto max-h-screen">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-200 via-violet-200 to-pink-200 bg-clip-text text-transparent">
              Library Settings
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure library parameters, seating capacities, and user security settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Settings Card */}
            <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4 text-slate-200 flex items-center gap-2">
                <span>🏢</span> Library Details
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.OName}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, OName: e.target.value }))}
                    className="w-full bg-slate-950/65 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Library Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.LName}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, LName: e.target.value }))}
                    className="w-full bg-slate-950/65 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={profileData.city}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-slate-950/65 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Seating Capacity (Total Desks)
                  </label>
                  <input
                    type="number"
                    required
                    value={profileData.seats}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, seats: e.target.value }))}
                    className="w-full bg-slate-950/65 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Note: Expanding capacity generates new desks. Decreasing is blocked if any higher desk is occupied.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="w-full mt-2 cursor-pointer bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
                >
                  {updatingProfile ? "Saving Details..." : "Save Library Settings"}
                </button>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-4 text-slate-200 flex items-center gap-2">
                  <span>🔐</span> Security Credentials
                </h3>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordData.password}
                      placeholder="••••••••"
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full bg-slate-950/65 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      placeholder="••••••••"
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full bg-slate-950/65 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="w-full mt-2 cursor-pointer bg-linear-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
                  >
                    {updatingPassword ? "Changing..." : "Change Security Password"}
                  </button>
                </form>
              </div>

              {/* Quick Info Box */}
              <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-800/50 mt-6 text-xs text-slate-450 space-y-1">
                <p>👤 <strong className="text-slate-350">Login Email:</strong> {user.email}</p>
                <p>📍 <strong className="text-slate-350">Location:</strong> {user.city}</p>
                <p>📅 <strong className="text-slate-350">Created On:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
