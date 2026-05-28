import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/userDetails",
        { withCredentials: true },
      );
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch user error:", error);
      navigate("/");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/logout",
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[70%] rounded-full bg-violet-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[80%] h-[70%] rounded-full bg-indigo-900/10 blur-[130px] pointer-events-none" />

      {/* Glassmorphic Top Navbar */}
      <nav className="bg-slate-900/40 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-extrabold tracking-tight bg-linear-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                {user.LName.charAt(0).toUpperCase() + user.LName.slice(1)}
              </span>
            </div>

            {/* User Profile Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs text-slate-400 font-medium">
                  Logged in as
                </span>
                <span className="text-sm font-semibold text-indigo-300">
                  {user.OName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="cursor-pointer flex items-center gap-2 bg-slate-850 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-950/30 via-violet-950/20 to-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-indigo-500/20">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <span className="text-8xl">🏢</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-linear-to-r from-indigo-200 via-violet-200 to-pink-200 bg-clip-text text-transparent">
            Welcome back, {user.OName}!
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base">
            Your library hub dashboard is active. Seamlessly manage library
            resources, capacity, and student details.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
