import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const Reports = () => {
  const [students, setStudents] = useState([]);
  const [seats, setSeats] = useState([]);
  const [fees, setFees] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // User Info
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/userDetails`, {
        withCredentials: true,
      });
      setUser(userRes.data);

      // Seats info
      const seatsRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/seats/all`, {
        withCredentials: true,
      });
      setSeats(seatsRes.data.seats);

      // Students info
      const studentsRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/students/all`, {
        withCredentials: true,
      });
      setStudents(studentsRes.data.students);

      // Fees info
      const feesRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fees/all`, {
        withCredentials: true,
      });
      setFees(feesRes.data.fees);

      // Expenses info
      const expensesRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/expenses/all`, {
        withCredentials: true,
      });
      setExpenses(expensesRes.data.expenses);

      setLoading(false);
    } catch (error) {
      console.error("Error loading reports data:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/logout`, {}, { withCredentials: true });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Seating stats
  const totalSeatsCount = seats.length;
  let morningBookings = 0;
  let eveningBookings = 0;
  let fullDayBookings = 0;
  let freeSeats = 0;

  seats.forEach((s) => {
    if (s.fullDay?.isOccupied) {
      fullDayBookings++;
    } else if (s.morning?.isOccupied && s.evening?.isOccupied) {
      fullDayBookings++; // double booked behaves like fullDay occupancy
    } else if (s.morning?.isOccupied) {
      morningBookings++;
    } else if (s.evening?.isOccupied) {
      eveningBookings++;
    } else {
      freeSeats++;
    }
  });

  // Financial totals
  const totalRevenue = fees.reduce((sum, item) => sum + item.amountPaid, 0);
  const totalExpenditure = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netEarnings = totalRevenue - totalExpenditure;

  // Expense categories breakdown
  const categorySummary = {
    Rent: 0,
    Electricity: 0,
    Wifi: 0,
    Maintenance: 0,
    Salaries: 0,
    Water: 0,
    Miscellaneous: 0,
  };

  expenses.forEach((exp) => {
    if (categorySummary[exp.category] !== undefined) {
      categorySummary[exp.category] += exp.amount;
    } else {
      categorySummary["Miscellaneous"] += exp.amount;
    }
  });

  // Sort categories by expenditure
  const sortedCategories = Object.entries(categorySummary).sort((a, b) => b[1] - a[1]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4">Generating visual reports...</p>
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
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-200 via-violet-200 to-pink-200 bg-clip-text text-transparent">
              Reports & Insights
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Visual data analysis of seating logistics, category expenditures, and monthly cash flow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seating Occupancy Chart */}
            <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1 text-slate-200">🪑 Seating Logistics</h3>
                <p className="text-xs text-slate-400 mb-6">Distribution of seat slots allocation.</p>

                {/* Segmented Progress Bar */}
                <div className="space-y-4">
                  <div className="h-6 w-full rounded-full bg-slate-800 overflow-hidden flex">
                    {fullDayBookings > 0 && (
                      <div
                        className="bg-rose-500 h-full"
                        style={{ width: `${(fullDayBookings / totalSeatsCount) * 100}%` }}
                        title={`Full Day: ${fullDayBookings}`}
                      />
                    )}
                    {morningBookings > 0 && (
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${(morningBookings / totalSeatsCount) * 100}%` }}
                        title={`Morning: ${morningBookings}`}
                      />
                    )}
                    {eveningBookings > 0 && (
                      <div
                        className="bg-sky-500 h-full"
                        style={{ width: `${(eveningBookings / totalSeatsCount) * 100}%` }}
                        title={`Evening: ${eveningBookings}`}
                      />
                    )}
                    {freeSeats > 0 && (
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${(freeSeats / totalSeatsCount) * 100}%` }}
                        title={`Available: ${freeSeats}`}
                      />
                    )}
                  </div>

                  {/* Legend Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                    <div className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                        Available Desks
                      </span>
                      <strong className="text-emerald-400">{freeSeats}</strong>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
                        Full Day Slots
                      </span>
                      <strong className="text-rose-450">{fullDayBookings}</strong>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                        Morning Slots
                      </span>
                      <strong className="text-amber-400">{morningBookings}</strong>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block" />
                        Evening Slots
                      </span>
                      <strong className="text-sky-400">{eveningBookings}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-950/30 border border-slate-800/80 rounded-xl text-xs text-slate-400 text-center">
                📊 Library Seating Occupancy Rate:{" "}
                <strong className="text-indigo-400">
                  {totalSeatsCount > 0 ? (((totalSeatsCount - freeSeats) / totalSeatsCount) * 100).toFixed(1) : "0.0"}%
                </strong>
              </div>
            </div>

            {/* Income vs Expenses Cashflow */}
            <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1 text-slate-200">📈 Ledger Cashflow</h3>
                <p className="text-xs text-slate-400 mb-6">Comparison of total revenue and expenditures.</p>

                {/* SVG Column Chart */}
                <div className="flex items-end justify-center gap-12 h-48 border-b border-slate-800 pb-2 relative">
                  {/* Revenue Bar */}
                  <div className="flex flex-col items-center gap-2 w-16">
                    <span className="text-[10px] text-indigo-400 font-bold">₹{totalRevenue.toLocaleString()}</span>
                    <div
                      className="bg-indigo-500/80 hover:bg-indigo-500 w-full rounded-t-lg transition-all duration-300"
                      style={{
                        height: `${totalRevenue + totalExpenditure > 0 ? (totalRevenue / Math.max(totalRevenue, totalExpenditure)) * 140 : 10}px`,
                      }}
                    />
                    <span className="text-xs text-slate-400">Revenue</span>
                  </div>

                  {/* Expenses Bar */}
                  <div className="flex flex-col items-center gap-2 w-16">
                    <span className="text-[10px] text-rose-450 font-bold">₹{totalExpenditure.toLocaleString()}</span>
                    <div
                      className="bg-rose-500/80 hover:bg-rose-500 w-full rounded-t-lg transition-all duration-300"
                      style={{
                        height: `${totalRevenue + totalExpenditure > 0 ? (totalExpenditure / Math.max(totalRevenue, totalExpenditure)) * 140 : 10}px`,
                      }}
                    />
                    <span className="text-xs text-slate-400">Expenses</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center bg-slate-950/45 p-4 rounded-xl border border-slate-800/50">
                <span className="text-xs text-slate-400">Computed Net Profit margin:</span>
                <span className={`text-sm font-black ${netEarnings >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  ₹ {netEarnings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Expense Category Breakdown */}
          <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-1 text-slate-200">📉 Expenditures by Category</h3>
            <p className="text-xs text-slate-400 mb-6">Breakdown of operational spendings across utility classifications.</p>

            <div className="space-y-4">
              {sortedCategories.map(([category, amount]) => {
                const percentage = totalExpenditure > 0 ? ((amount / totalExpenditure) * 100).toFixed(1) : "0.0";
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-350">{category}</span>
                      <span className="text-slate-400">
                        ₹ {amount.toLocaleString()} <span className="text-[10px] ml-1 bg-slate-850 px-1.5 py-0.5 rounded text-indigo-400">{percentage}%</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
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

export default Reports;
