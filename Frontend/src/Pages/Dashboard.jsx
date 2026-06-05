import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Statics from "../Components/Statics";
import Activity from "../Components/activity";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/userDetails`,
          { withCredentials: true },
        );
        setUser(userResponse.data);

        const statsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/dashboard/stats`,
          { withCredentials: true },
        );
        setStats(statsResponse.data.stats);
        setLoading(false);
      } catch (error) {
        console.error("Fetch dashboard data error:", error);
        navigate("/");
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/logout`,
        {},
        { withCredentials: true },
      );
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative Blur Background Blobs */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

        <div className="flex flex-col items-center z-10">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4 tracking-wider animate-pulse">
            Loading Library Hub...
          </p>
        </div>
      </div>
    );
  }

  // Subscription calculation
  const getSubscriptionBadge = () => {
    if (!user) return null;

    if (user.subscriptionStatus === "Active") {
      const daysLeft = Math.max(0, Math.ceil((new Date(user.subscriptionExpiry).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
      return (
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
          👑 Premium Membership: Active ({daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining)
        </div>
      );
    } else if (user.subscriptionStatus === "Pending") {
      return (
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-400 animate-pulse">
          ⏳ Verification Pending (Admin Review)
        </div>
      );
    } else {
      const trialDuration = 15 * 24 * 60 * 60 * 1000; // 15 days
      const elapsed = Date.now() - new Date(user.createdAt).getTime();
      const trialDaysRemaining = Math.max(0, Math.ceil((trialDuration - elapsed) / (24 * 60 * 60 * 1000)));
      return (
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/25 text-indigo-300">
          🎁 Free Trial: {trialDaysRemaining} day{trialDaysRemaining !== 1 ? "s" : ""} remaining
        </div>
      );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row w-full relative overflow-hidden font-sans">
        <Sidebar user={user} handleLogout={handleLogout} />
        {/* Main Content Area */}
        <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20 md:pt-6 relative z-10 flex flex-col gap-6 md:gap-8 overflow-y-auto max-h-screen">
          {/* Welcome Banner */}
          <div className="shrink-0 bg-linear-to-r from-indigo-950/30 via-violet-950/20 to-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-indigo-500/20">
            <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 pointer-events-none">
              <span className="text-6xl sm:text-8xl">🏢</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-linear-to-r from-indigo-200 via-violet-200 to-pink-200 bg-clip-text text-transparent leading-tight sm:leading-snug py-1">
              Welcome back, {user.OName}!
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-xs sm:text-sm md:text-base">
              Your library hub dashboard is active. Seamlessly manage library
              resources, capacity, and student details.
            </p>
            {getSubscriptionBadge()}
          </div>

          {/* Statics part */}
          <div className="shrink-0 flex flex-col gap-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 flex items-center gap-2">
              <span>📊</span> Live Library Statistics
            </h3>
            <Statics stats={stats} />
          </div>

          {/* Recent Active Cards Table */}
          <Activity activities={stats?.recentActivities} />
        </main>
      </div>
    </>
  );
};

export default Dashboard;
