import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const Seats = () => {
  const [seats, setSeats] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  const fetchSeatsData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/seats/all`, {
        withCredentials: true,
      });
      setSeats(res.data.seats);
    } catch (error) {
      console.error("Seat Map Load Error:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user details for Sidebar display
        const userRes = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/userDetails`,
          {
            withCredentials: true,
          },
        );
        setUser(userRes.data);

        // Fetch seat list from the backend
        await fetchSeatsData();
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
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/logout`,
        {},
        { withCredentials: true },
      );
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Release student from seat slot
  const handleReleaseStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to release this student from this seat slot?")) {
      return;
    }

    try {
      setActionLoading(true);
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/students/${studentId}`,
        { seatNumber: 0, slot: "none" },
        { withCredentials: true }
      );
      
      // Refresh seat data
      await fetchSeatsData();
      
      // Update selected seat modal state
      if (selectedSeat) {
        const updatedSeat = seats.find(s => s._id === selectedSeat._id);
        if (updatedSeat) {
          // Find updated seat in local array if available or close it
          setSelectedSeat(null);
        } else {
          setSelectedSeat(null);
        }
      }
      alert("Seat slot released successfully.");
    } catch (error) {
      console.error("Error releasing seat slot:", error);
      alert(error.response?.data?.message || "Failed to release seat slot.");
    } finally {
      setActionLoading(false);
      setSelectedSeat(null);
    }
  };

  const hasDueFees = (seatItem) => {
    return (
      (seatItem.morning?.isOccupied && seatItem.morning?.studentId?.isDue) ||
      (seatItem.evening?.isOccupied && seatItem.evening?.studentId?.isDue) ||
      (seatItem.fullDay?.isOccupied && seatItem.fullDay?.studentId?.isDue)
    );
  };

  const getWhatsAppLink = (student) => {
    if (!student) return "";
    const name = student.name;
    const plan = student.plan;
    const fee = student.feeAmount;
    const expiry = student.expiryDate ? new Date(student.expiryDate).toLocaleDateString("en-IN") : "";
    
    let text = "";
    if (student.isExpired) {
      text = `Hello ${name}, your subscription at the library expired on ${expiry}. Please deposit your due fee of ₹${fee} to renew and avoid seat cancellation.`;
    } else {
      text = `Hello ${name}, this is a reminder to deposit your due fee of ₹${fee} for the ${plan} plan at the library. Please submit it as soon as possible.`;
    }
    return `https://wa.me/91${student.mobile}?text=${encodeURIComponent(text)}`;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row w-full relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      <Sidebar user={user} handleLogout={handleLogout} />

      <main className="flex-1 p-6 pt-20 md:pt-8 sm:p-8 relative z-10 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-200 via-violet-200 to-pink-200 bg-clip-text text-transparent">
                Visual Seat Map
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Live capacity visualization of library seats. Click a seat to inspect or release assignments.
              </p>
            </div>
            {/* Legend */}
            <div className="hidden md:flex gap-4 text-xs bg-slate-900/40 border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block"></span>
                <span className="text-slate-350">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40 inline-block"></span>
                <span className="text-slate-350">Morning Only</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-sky-500/20 border border-sky-500/40 inline-block"></span>
                <span className="text-slate-350">Evening Only</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40 inline-block"></span>
                <span className="text-slate-350">Full / Double booked</span>
              </div>
            </div>
          </div>

          {/* Seating Layout Map Card */}
          <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3.5 justify-center">
              {seats.map((seatItem) => {
                const state = getSeatColorState(seatItem);
                const isDue = hasDueFees(seatItem);
                let colorClasses = "";
                let indicatorDot = null;

                if (state === "available") {
                  colorClasses =
                    "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/30";
                  indicatorDot = (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  );
                } else if (state === "morning") {
                  colorClasses =
                    "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/30";
                  indicatorDot = (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  );
                } else if (state === "evening") {
                  colorClasses = "bg-sky-500/10 border-sky-500/20 text-sky-400 hover:bg-sky-500/15 hover:border-sky-500/30";
                  indicatorDot = (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-sky-400" />
                  );
                } else if (state === "full") {
                  colorClasses =
                    "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/30";
                  indicatorDot = (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-400" />
                  );
                }

                if (isDue) {
                  colorClasses += " border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.35)] bg-red-950/15";
                }

                return (
                  <button
                    key={seatItem._id}
                    onClick={() => setSelectedSeat(seatItem)}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all duration-300 relative cursor-pointer ${colorClasses}`}
                  >
                    {isDue && (
                      <div className="absolute top-1 left-1.5 text-[10px] animate-pulse" title="Fees Overdue / Expired">
                        ⚠️
                      </div>
                    )}
                    {indicatorDot}
                    <span className="text-[9px] font-bold opacity-45 uppercase tracking-wider">
                      Seat
                    </span>
                    <span className="text-2xl font-black font-mono leading-none">
                      {String(seatItem.seatNumber).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Seat Inspector Modal Drawer */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative animate-slide-in">
            <div>
              {/* Close button */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <span>🪑</span> Seat {String(selectedSeat.seatNumber).padStart(2, "0")} Info
                </h3>
                <button
                  onClick={() => setSelectedSeat(null)}
                  className="text-slate-400 hover:text-slate-200 cursor-pointer text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Shift Occupancies */}
              <div className="space-y-5 mt-4">
                {/* Morning Slot */}
                <div className={`bg-slate-950/40 border p-4 rounded-xl transition-all duration-200 ${
                  selectedSeat.morning?.isOccupied && selectedSeat.morning?.studentId?.isDue
                    ? "border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.15)] bg-red-950/5"
                    : "border-slate-800/80"
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">☀️ Morning Shift</span>
                      {selectedSeat.morning?.isOccupied && selectedSeat.morning?.studentId?.isDue && (
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase animate-pulse ${
                          selectedSeat.morning.studentId.isExpired
                            ? "bg-red-500/20 border-red-500/40 text-red-400"
                            : "bg-amber-500/20 border-amber-500/40 text-amber-400"
                        }`}>
                          ⚠️ {selectedSeat.morning.studentId.isExpired ? "Plan Expired" : "Fees Due"}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedSeat.morning?.isOccupied
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {selectedSeat.morning?.isOccupied ? "Occupied" : "Available"}
                    </span>
                  </div>
                  {selectedSeat.morning?.isOccupied && selectedSeat.morning?.studentId ? (
                    <div className="text-xs space-y-1.5 text-slate-300">
                      <p><strong className="text-slate-400">Name:</strong> {selectedSeat.morning.studentId.name}</p>
                      <p><strong className="text-slate-400">Mobile:</strong> {selectedSeat.morning.studentId.mobile}</p>
                      {selectedSeat.morning.studentId.email && (
                        <p><strong className="text-slate-400">Email:</strong> {selectedSeat.morning.studentId.email}</p>
                      )}
                      <p><strong className="text-slate-400">Plan:</strong> {selectedSeat.morning.studentId.plan}</p>
                      {selectedSeat.morning.studentId.expiryDate && (
                        <p>
                          <strong className="text-slate-400">Expiry Date:</strong>{" "}
                          <span className={selectedSeat.morning.studentId.isDue ? "text-rose-400 font-bold" : "text-slate-350"}>
                            {new Date(selectedSeat.morning.studentId.expiryDate).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleReleaseStudent(selectedSeat.morning.studentId._id)}
                          className="bg-rose-500/15 border border-rose-500/35 hover:bg-rose-500/25 text-rose-400 font-bold px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 text-[10px]"
                        >
                          Release Student
                        </button>
                        <a
                          href={getWhatsAppLink(selectedSeat.morning.studentId)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center bg-emerald-650 hover:bg-emerald-600 border border-emerald-500/20 text-white text-[10px] px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 font-semibold shadow-md active:scale-95"
                        >
                          💬 WhatsApp Alert
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Slot is currently empty.</p>
                  )}
                </div>

                {/* Evening Slot */}
                <div className={`bg-slate-950/40 border p-4 rounded-xl transition-all duration-200 ${
                  selectedSeat.evening?.isOccupied && selectedSeat.evening?.studentId?.isDue
                    ? "border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.15)] bg-red-950/5"
                    : "border-slate-800/80"
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-400">🌙 Evening Shift</span>
                      {selectedSeat.evening?.isOccupied && selectedSeat.evening?.studentId?.isDue && (
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase animate-pulse ${
                          selectedSeat.evening.studentId.isExpired
                            ? "bg-red-500/20 border-red-500/40 text-red-400"
                            : "bg-amber-500/20 border-amber-500/40 text-amber-400"
                        }`}>
                          ⚠️ {selectedSeat.evening.studentId.isExpired ? "Plan Expired" : "Fees Due"}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedSeat.evening?.isOccupied
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {selectedSeat.evening?.isOccupied ? "Occupied" : "Available"}
                    </span>
                  </div>
                  {selectedSeat.evening?.isOccupied && selectedSeat.evening?.studentId ? (
                    <div className="text-xs space-y-1.5 text-slate-300">
                      <p><strong className="text-slate-400">Name:</strong> {selectedSeat.evening.studentId.name}</p>
                      <p><strong className="text-slate-400">Mobile:</strong> {selectedSeat.evening.studentId.mobile}</p>
                      {selectedSeat.evening.studentId.email && (
                        <p><strong className="text-slate-400">Email:</strong> {selectedSeat.evening.studentId.email}</p>
                      )}
                      <p><strong className="text-slate-400">Plan:</strong> {selectedSeat.evening.studentId.plan}</p>
                      {selectedSeat.evening.studentId.expiryDate && (
                        <p>
                          <strong className="text-slate-400">Expiry Date:</strong>{" "}
                          <span className={selectedSeat.evening.studentId.isDue ? "text-rose-400 font-bold" : "text-slate-350"}>
                            {new Date(selectedSeat.evening.studentId.expiryDate).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleReleaseStudent(selectedSeat.evening.studentId._id)}
                          className="bg-rose-500/15 border border-rose-500/35 hover:bg-rose-500/25 text-rose-400 font-bold px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 text-[10px]"
                        >
                          Release Student
                        </button>
                        <a
                          href={getWhatsAppLink(selectedSeat.evening.studentId)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center bg-emerald-650 hover:bg-emerald-600 border border-emerald-500/20 text-white text-[10px] px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 font-semibold shadow-md active:scale-95"
                        >
                          💬 WhatsApp Alert
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Slot is currently empty.</p>
                  )}
                </div>

                {/* Full Day Slot */}
                <div className={`bg-slate-950/40 border p-4 rounded-xl transition-all duration-200 ${
                  selectedSeat.fullDay?.isOccupied && selectedSeat.fullDay?.studentId?.isDue
                    ? "border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.15)] bg-red-950/5"
                    : "border-slate-800/80"
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-violet-400">📅 Full Day Shift</span>
                      {selectedSeat.fullDay?.isOccupied && selectedSeat.fullDay?.studentId?.isDue && (
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase animate-pulse ${
                          selectedSeat.fullDay.studentId.isExpired
                            ? "bg-red-500/20 border-red-500/40 text-red-400"
                            : "bg-amber-500/20 border-amber-500/40 text-amber-400"
                        }`}>
                          ⚠️ {selectedSeat.fullDay.studentId.isExpired ? "Plan Expired" : "Fees Due"}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedSeat.fullDay?.isOccupied
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {selectedSeat.fullDay?.isOccupied ? "Occupied" : "Available"}
                    </span>
                  </div>
                  {selectedSeat.fullDay?.isOccupied && selectedSeat.fullDay?.studentId ? (
                    <div className="text-xs space-y-1.5 text-slate-300">
                      <p><strong className="text-slate-400">Name:</strong> {selectedSeat.fullDay.studentId.name}</p>
                      <p><strong className="text-slate-400">Mobile:</strong> {selectedSeat.fullDay.studentId.mobile}</p>
                      {selectedSeat.fullDay.studentId.email && (
                        <p><strong className="text-slate-400">Email:</strong> {selectedSeat.fullDay.studentId.email}</p>
                      )}
                      <p><strong className="text-slate-400">Plan:</strong> {selectedSeat.fullDay.studentId.plan}</p>
                      {selectedSeat.fullDay.studentId.expiryDate && (
                        <p>
                          <strong className="text-slate-400">Expiry Date:</strong>{" "}
                          <span className={selectedSeat.fullDay.studentId.isDue ? "text-rose-400 font-bold" : "text-slate-350"}>
                            {new Date(selectedSeat.fullDay.studentId.expiryDate).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleReleaseStudent(selectedSeat.fullDay.studentId._id)}
                          className="bg-rose-500/15 border border-rose-500/35 hover:bg-rose-500/25 text-rose-400 font-bold px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 text-[10px]"
                        >
                          Release Student
                        </button>
                        <a
                          href={getWhatsAppLink(selectedSeat.fullDay.studentId)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center bg-emerald-650 hover:bg-emerald-600 border border-emerald-500/20 text-white text-[10px] px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 font-semibold shadow-md active:scale-95"
                        >
                          💬 WhatsApp Alert
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Slot is currently empty.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 mt-6">
              <button
                onClick={() => setSelectedSeat(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seats;
