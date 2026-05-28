import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchUser();
  }, [navigate]);
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
    <>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex w-full relative overflow-hidden font-sans">
        <Sidebar user={user} handleLogout={handleLogout} />
        {/* Main Content Area */}
        <main className=" w-full mx-auto px-4 sm:px-4 lg:px-8 py-6 relative z-10">
          {/* Welcome Banner */}
          <div className="bg-linear-to-r from-indigo-950/30 via-violet-950/20 to-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-indigo-500/20">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <span className="text-8xl">🏢</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-ight bg-linear-to-r from-indigo-200 via-violet-200 to-pink-200 bg-clip-text text-transparent">
              Welcome back, {user.OName}!
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base">
              Your library hub dashboard is active. Seamlessly manage library
              resources, capacity, and student details.
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
