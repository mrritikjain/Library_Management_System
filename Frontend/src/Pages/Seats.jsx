import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const Seats = () => {
  const [seats, setSeats] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected seat for modal detail viewing
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user details for Sidebar display
        const userRes = await axios.get("http://localhost:5000/api/userDetails", {
          withCredentials: true,
        });
        setUser(userRes.data);

        // Fetch seat list from the backend
        const res = await axios.get("http://localhost:5000/api/seats/all", {
          withCredentials: true,
        });
        setSeats(res.data.seats);
        setLoading(false);
      } catch (error) {
        console.error("❌ Seat Map Load Error details:", error.response?.data || error.message);
        navigate("/");
      }
    };
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

  // Determine availability status coloring:
  // - green = available
  // - yellow = morning occupied
  // - blue = evening occupied
  // - red = full day (or both morning and evening)
  const getSeatColorState = (seatItem) => {
    if (seatItem.fullDay?.isOccupied) return "full";
    if (seatItem.morning?.isOccupied && seatItem.evening?.isOccupied) return "full";
    if (seatItem.morning?.isOccupied) return "morning";
    if (seatItem.evening?.isOccupied) return "evening";
    return "available";
  };

  const handleSeatClick = (seatItem) => {
    setSelectedSeat(seatItem);
    setIsModalOpen(true);
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

  // Count availability statistics
  const totalSeats = seats.length;
  let availableCount = 0;
  let morningCount = 0;
  let eveningCount = 0;
  let fullCount = 0;

  seats.forEach((s) => {
    const state = getSeatColorState(s);
    if (state === "available") availableCount++;
    else if (state === "morning") morningCount++;
    else if (state === "evening") eveningCount++;
    else if (state === "full") fullCount++;
  });

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
              Live capacity visualization. Click any seat box to view occupant shifts.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-slate-900/35 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total capacity</span>
              <span className="text-2xl font-extrabold text-slate-200 mt-1">{totalSeats}</span>
            </div>
            <div className="bg-slate-900/35 border border-emerald-500/10 rounded-2xl p-4 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400/80 tracking-wider">Available</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1">{availableCount}</span>
            </div>
            <div className="bg-slate-900/35 border border-amber-500/10 rounded-2xl p-4 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-amber-400/80 tracking-wider">Morning Occupied</span>
              <span className="text-2xl font-extrabold text-amber-455 mt-1">{morningCount}</span>
            </div>
            <div className="bg-slate-900/35 border border-sky-500/10 rounded-2xl p-4 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-sky-400/80 tracking-wider">Evening Occupied</span>
              <span className="text-2xl font-extrabold text-sky-400 mt-1">{eveningCount}</span>
            </div>
            <div className="bg-slate-900/35 border border-rose-500/10 rounded-2xl p-4 flex flex-col justify-center col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-rose-450/80 tracking-wider">Full Booked</span>
              <span className="text-2xl font-extrabold text-rose-400 mt-1">{fullCount}</span>
            </div>
          </div>

          {/* Seating Layout Map Card */}
          <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(70px,1fr))] gap-3 justify-center">
              {seats.map((seatItem) => {
                const state = getSeatColorState(seatItem);
                let colorClasses = "";
                let indicatorDot = null;

                if (state === "available") {
                  colorClasses = "bg-emerald-555/10 hover:bg-emerald-500/15 border-emerald-500/20 text-emerald-400";
                  indicatorDot = <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />;
                } else if (state === "morning") {
                  colorClasses = "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20 text-amber-400";
                  indicatorDot = <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />;
                } else if (state === "evening") {
                  colorClasses = "bg-sky-500/10 hover:bg-sky-500/15 border-sky-500/20 text-sky-400";
                  indicatorDot = <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-sky-400" />;
                } else if (state === "full") {
                  colorClasses = "bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20 text-rose-400";
                  indicatorDot = <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-400" />;
                }

                return (
                  <button
                    key={seatItem._id}
                    onClick={() => handleSeatClick(seatItem)}
                    className={`cursor-pointer aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all duration-300 transform hover:scale-[1.05] relative ${colorClasses}`}
                  >
                    {indicatorDot}
                    <span className="text-[10px] font-bold opacity-45 uppercase tracking-wider">Seat</span>
                    <span className="text-xl font-black font-mono leading-none">{String(seatItem.seatNumber).padStart(2, "0")}</span>
                  </button>
                );
              })}
            </div>

            {/* Guide Map */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-slate-850/60 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 block" />
                Available (Vacant)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-550/10 border border-amber-500/25 block" />
                Morning occupied
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-sky-500/10 border border-sky-500/25 block" />
                Evening occupied
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-rose-550/10 border border-rose-500/25 block" />
                Full Day / Overlap occupied
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Seat Details Modal */}
      {isModalOpen && selectedSeat && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🪑</span>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-200">
                  Seat #{String(selectedSeat.seatNumber).padStart(2, "0")}
                </h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">
                  Shift Occupancy Overview
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              {/* Morning Shift Card */}
              <div className={`p-4 rounded-2xl border transition-all ${selectedSeat.morning?.isOccupied ? "bg-amber-500/5 border-amber-500/20" : "bg-slate-950/40 border-slate-850"}`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border inline-block ${selectedSeat.morning?.isOccupied ? "bg-amber-500/10 text-amber-400 border-amber-500/25" : "bg-slate-800 text-slate-400 border-slate-700/40"}`}>
                    Morning Shift
                  </span>
                  <p className="text-sm font-semibold text-slate-300 mt-2">
                    Status: {selectedSeat.morning?.isOccupied ? "🔴 Occupied" : "🟢 Available"}
                  </p>
                  {selectedSeat.morning?.isOccupied && selectedSeat.morning?.studentId && (
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      Student ID: {typeof selectedSeat.morning.studentId === "object" ? selectedSeat.morning.studentId.name || selectedSeat.morning.studentId._id : selectedSeat.morning.studentId}
                    </p>
                  )}
                </div>
              </div>

              {/* Evening Shift Card */}
              <div className={`p-4 rounded-2xl border transition-all ${selectedSeat.evening?.isOccupied ? "bg-sky-500/5 border-sky-500/20" : "bg-slate-950/40 border-slate-850"}`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border inline-block ${selectedSeat.evening?.isOccupied ? "bg-sky-500/10 text-sky-400 border-sky-500/25" : "bg-slate-800 text-slate-400 border-slate-700/40"}`}>
                    Evening Shift
                  </span>
                  <p className="text-sm font-semibold text-slate-300 mt-2">
                    Status: {selectedSeat.evening?.isOccupied ? "🔴 Occupied" : "🟢 Available"}
                  </p>
                  {selectedSeat.evening?.isOccupied && selectedSeat.evening?.studentId && (
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      Student ID: {typeof selectedSeat.evening.studentId === "object" ? selectedSeat.evening.studentId.name || selectedSeat.evening.studentId._id : selectedSeat.evening.studentId}
                    </p>
                  )}
                </div>
              </div>

              {/* Full Day Shift Card */}
              <div className={`p-4 rounded-2xl border transition-all ${selectedSeat.fullDay?.isOccupied ? "bg-rose-500/5 border-rose-500/20" : "bg-slate-950/40 border-slate-850"}`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border inline-block ${selectedSeat.fullDay?.isOccupied ? "bg-rose-500/10 text-rose-400 border-rose-500/25" : "bg-slate-800 text-slate-400 border-slate-700/40"}`}>
                    Full Day Shift
                  </span>
                  <p className="text-sm font-semibold text-slate-300 mt-2">
                    Status: {selectedSeat.fullDay?.isOccupied ? "🔴 Occupied" : "🟢 Available"}
                  </p>
                  {selectedSeat.fullDay?.isOccupied && selectedSeat.fullDay?.studentId && (
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      Student ID: {typeof selectedSeat.fullDay.studentId === "object" ? selectedSeat.fullDay.studentId.name || selectedSeat.fullDay.studentId._id : selectedSeat.fullDay.studentId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="cursor-pointer w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-350 font-semibold rounded-xl text-sm transition-colors border border-slate-750/30"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seats;
