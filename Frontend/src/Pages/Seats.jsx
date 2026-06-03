import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const Seats = () => {
  const [seats, setSeats] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user details for Sidebar display
        const userRes = await axios.get(
          "http://localhost:5000/api/userDetails",
          {
            withCredentials: true,
          },
        );
        setUser(userRes.data);

        // Fetch seat list from the backend
        const res = await axios.get("http://localhost:5000/api/seats/all", {
          withCredentials: true,
        });
        setSeats(res.data.seats);
        setLoading(false);
      } catch (error) {
        console.error(
          "❌ Seat Map Load Error details:",
          error.response?.data || error.message,
        );
        navigate("/");
      }
    };
    fetchData();
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

  // Determine availability status coloring
  const getSeatColorState = (seatItem) => {
    if (seatItem.fullDay?.isOccupied) return "full";
    if (seatItem.morning?.isOccupied && seatItem.evening?.isOccupied)
      return "full";
    if (seatItem.morning?.isOccupied) return "morning";
    if (seatItem.evening?.isOccupied) return "evening";
    return "available";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4">Loading seat layout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex w-full relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      <Sidebar user={user} handleLogout={handleLogout} />

      <main className="flex-1 p-6 sm:p-8 relative z-10 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-200 via-violet-200 to-pink-200 bg-clip-text text-transparent">
              Visual Seat Map
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Live capacity visualization of library seats.
            </p>
          </div>

          {/* Seating Layout Map Card */}
          <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(70px,1fr))] gap-3 justify-center">
              {seats.map((seatItem) => {
                const state = getSeatColorState(seatItem);
                let colorClasses = "";
                let indicatorDot = null;

                if (state === "available") {
                  colorClasses =
                    "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                  indicatorDot = (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  );
                } else if (state === "morning") {
                  colorClasses =
                    "bg-amber-500/10 border-amber-500/20 text-amber-400";
                  indicatorDot = (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  );
                } else if (state === "evening") {
                  colorClasses = "bg-sky-500/10 border-sky-500/20 text-sky-400";
                  indicatorDot = (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-sky-400" />
                  );
                } else if (state === "full") {
                  colorClasses =
                    "bg-rose-500/10 border-rose-500/20 text-rose-400";
                  indicatorDot = (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-400" />
                  );
                }

                return (
                  <div
                    key={seatItem._id}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all duration-300 relative ${colorClasses}`}
                  >
                    {indicatorDot}
                    <span className="text-[10px] font-bold opacity-45 uppercase tracking-wider">
                      Seat
                    </span>
                    <span className="text-xl font-black font-mono leading-none">
                      {String(seatItem.seatNumber).padStart(2, "0")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Seats;
