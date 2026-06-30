import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Landing = () => {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Interactive Seat Demo state
  const [demoSeats, setDemoSeats] = useState([
    { id: 1, status: "booked", student: "Aman S." },
    { id: 2, status: "available", student: null },
    { id: 3, status: "booked", student: "Rohan K." },
    { id: 4, status: "available", student: null },
    { id: 5, status: "available", student: null },
    { id: 6, status: "booked", student: "Priya M." },
    { id: 7, status: "available", student: null },
    { id: 8, status: "available", student: null },
    { id: 9, status: "booked", student: "Vijay R." },
  ]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/userDetails`,
          { withCredentials: true }
        );
        setUser(res.data);
      } catch (error) {
        // Not authenticated
        setUser(null);
      } finally {
        setAuthChecking(false);
      }
    };
    checkUserAuth();
  }, []);

  const handleSeatClick = (seat) => {
    if (seat.status === "booked") {
      setSelectedSeat(seat);
    } else {
      setDemoSeats((prev) =>
        prev.map((s) => {
          if (s.id === seat.id) {
            const nextStatus = s.status === "available" ? "selected" : "available";
            return { ...s, status: nextStatus };
          }
          return s;
        })
      );
      setSelectedSeat(null);
    }
  };

  const faqs = [
    {
      q: "How does the 7-day free trial work?",
      a: "When you register your library, you automatically start on our 7-day free trial. There are no restrictions—you get access to all features including interactive seating plans, fee collections, expense trackers, and reports. After 7 days, you can choose to subscribe to our Premium Plan to keep accessing the system.",
    },
    {
      q: "What is included in the Premium Annual Plan?",
      a: "The Premium Annual Plan costs ₹2,999 per year (normally ₹6,999) and gives you 1 year of unlimited access to manage your library. It includes customizable seating configurations, digital fee collection receipts, complete income/expense ledgers, automatic system notifications, priority support on WhatsApp/Email, and regular updates.",
    },
    {
      q: "How is payment verified for the Premium plan?",
      a: "We support instant UPI payments. Simply scan the QR code in your Subscription console, make the transaction, and upload the sender name, transaction ID, and payment screenshot. Our admin team will verify and activate your premium membership within 1-2 hours.",
    },
    {
      q: "Can I customize the seat count and shift timings?",
      a: "Yes! In the Settings section of the dashboard, you can define your library's total seat count, configure different shifts (e.g. Morning, Evening, Full Day), and adjust layout spacing. The seating map updates instantly based on your inputs.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans scroll-smooth">
      {/* Decorative Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full bg-pink-900/5 blur-[120px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-900 px-4 sm:px-8 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="text-2xl">🏢</span>
          <span className="text-xl font-extrabold tracking-tight bg-linear-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
            Library Hub
          </span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-white transition-colors">Support</a>
        </nav>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-4">
          {authChecking ? (
            <div className="w-5 h-5 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          ) : user ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all duration-200"
            >
              Dashboard ➔
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all duration-200 active:scale-[0.98]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto z-10">
        {/* Promotion tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-6 animate-pulse">
          🚀 7-Day Free Trial Available • No Credit Card Required
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Modern Seating & Operations for{" "}
          <span className="bg-linear-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
            Smart Libraries
          </span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Manage seat allocation, shift timings, student registrations, fee status records, and library administrative expenses from a unified dashboard. Stop using manual registers. Upgrade your library operations.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 hover:opacity-95 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 transition-all duration-200 transform hover:scale-[1.01] text-center"
              >
                Go to Dashboard ➔
              </Link>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900/60 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl transition-all duration-200 text-center"
              >
                Open Seating Grid 💻
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 hover:opacity-95 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 transition-all duration-200 transform hover:scale-[1.01] text-center"
              >
                Start Your Free Trial Now
              </Link>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900/60 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl transition-all duration-200 text-center"
              >
                Try Seating Demo 🎯
              </a>
            </>
          )}
        </div>

        {/* Dashboard Glass Mockup */}
        <div className="mt-16 relative rounded-2xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-xl p-4 sm:p-6 shadow-2xl overflow-hidden group hover:border-indigo-500/20 transition-all duration-500">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 opacity-60" />
          {/* Mockup Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <span className="ml-2 font-mono text-[10px] tracking-wider uppercase text-slate-400">LibraryHubConsole_v1.0.1</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/50 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-medium text-slate-400">Library Server Status: Live</span>
            </div>
          </div>
          {/* Mockup grids */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-left">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">CAPACITY</span>
              <h3 className="text-2xl font-black text-white">48 / 60 Seats</h3>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-500 h-full w-[80%]" />
              </div>
              <span className="text-[10px] text-slate-500 block mt-2">80% occupancy rate in the current shift</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-left">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">FEES MONTHLY</span>
              <h3 className="text-2xl font-black text-white">₹32,500 Collected</h3>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full w-[90%]" />
              </div>
              <span className="text-[10px] text-slate-500 block mt-2">Only 2 subscriptions pending dues</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-left">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block mb-1">EXPENSES LOG</span>
              <h3 className="text-2xl font-black text-white">₹8,400 Recorded</h3>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-pink-500 h-full w-[35%]" />
              </div>
              <span className="text-[10px] text-slate-500 block mt-2">Maintenance, WiFi, and electricity billing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-slate-950 border-t border-slate-900 px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Power Packed Features for Library Admins
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Everything you need to automate daily administration chores and run your library seating system efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/40 border border-slate-800 hover:border-indigo-500/20 p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-2px] group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl text-indigo-400 mb-5 group-hover:bg-indigo-500/20 transition-all">
                💺
              </div>
              <h3 className="text-lg font-bold text-slate-200">Interactive Seating Grid</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Render interactive seating layouts. Set custom counts, assign shifts, check seating statuses (available, booked, inactive) instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 border border-slate-800 hover:border-violet-500/20 p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-2px] group">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-xl text-violet-400 mb-5 group-hover:bg-violet-500/20 transition-all">
                👥
              </div>
              <h3 className="text-lg font-bold text-slate-200">Student Enrollment</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Add profiles for your library students. Search profiles, log contact numbers, assign specific seat numbers, and track registration timings.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 border border-slate-800 hover:border-emerald-500/20 p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-2px] group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl text-emerald-400 mb-5 group-hover:bg-emerald-500/20 transition-all">
                💳
              </div>
              <h3 className="text-lg font-bold text-slate-200">Fee Collections Tracker</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Track payments, register due dates, generate digital invoices, and filter accounts with pending dues instantly. Never miss a collections cycle.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/40 border border-slate-800 hover:border-pink-500/20 p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-2px] group">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-xl text-pink-400 mb-5 group-hover:bg-pink-500/20 transition-all">
                💸
              </div>
              <h3 className="text-lg font-bold text-slate-200">Administrative Expense Ledger</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Log day-to-day administrative expenses. Categorize them under utility bills, staff salary, rent, or maintenance for accurate profit analysis.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900/40 border border-slate-800 hover:border-amber-500/20 p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-2px] group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl text-amber-400 mb-5 group-hover:bg-amber-500/20 transition-all">
                📈
              </div>
              <h3 className="text-lg font-bold text-slate-200">Live Reports & Statistics</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Observe core stats such as occupancy rate, collections totals, and net logs directly from the dashboard. Analyze charts of income vs. expenses.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900/40 border border-slate-800 hover:border-cyan-500/20 p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-2px] group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-xl text-cyan-400 mb-5 group-hover:bg-cyan-500/20 transition-all">
                🔔
              </div>
              <h3 className="text-lg font-bold text-slate-200">Smart Alerts</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Get notified when shifts change, seats are vacant, or when student fees expire soon. Stay updated with in-app alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Seating Plan Mockup Section */}
      <section id="demo" className="py-20 bg-slate-900/20 border-t border-slate-900 px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-white">Try It Yourself</h2>
            <p className="mt-3 text-slate-400">
              Interactive seating is the core of Library Hub. Click on any seat below to test the allocation console.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900/40 p-6 sm:p-8 rounded-2xl border border-slate-800">
            {/* Interactive Grid */}
            <div>
              <div className="flex justify-between items-center mb-4 text-xs font-bold text-slate-400">
                <span>FRONT DESK 💻</span>
                <span>CAPACITY GRID</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {demoSeats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className={`cursor-pointer h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-200 relative group select-none ${
                      seat.status === "booked"
                        ? "bg-indigo-600/30 border border-indigo-500/45 text-indigo-300 hover:bg-indigo-600/40"
                        : seat.status === "selected"
                        ? "bg-emerald-500/20 border border-emerald-400 text-emerald-400"
                        : "bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-sm font-bold">Seat {seat.id}</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5 opacity-70">
                      {seat.status === "booked" ? "Booked" : seat.status === "selected" ? "Available" : "Empty"}
                    </span>
                  </button>
                ))}
              </div>
              {/* Grid Legend */}
              <div className="flex justify-center gap-4 mt-6 text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-950 border border-slate-800 inline-block" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-600/30 border border-indigo-500/45 inline-block" /> Booked</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-400 inline-block" /> Clicked</span>
              </div>
            </div>

            {/* Interactive Preview Sidebar Console */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 h-full flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3">Live Console</h4>
                {selectedSeat ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Assigned Seat</span>
                      <span className="text-sm font-bold text-slate-200">Seat {selectedSeat.id}</span>
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Student Name</span>
                      <span className="text-sm font-bold text-slate-200">{selectedSeat.student}</span>
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Active Shift</span>
                      <span className="text-xs font-bold text-indigo-300">Shift 1 (8:00 AM - 2:00 PM)</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Click any <strong className="text-indigo-400">Booked</strong> seat to pull student allocation metadata, or click an <strong className="text-slate-300">Empty</strong> seat to toggle seat reservation status.
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-900 mt-6">
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="block text-center w-full px-4 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 text-indigo-300 text-xs font-bold rounded-lg transition-all"
                >
                  Configure Seating Layout ➔
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Subscription Section */}
      <section id="pricing" className="py-20 bg-slate-950 border-t border-slate-900 px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Simple, Transparent Pricing Plan
            </h2>
            <p className="mt-4 text-slate-400 max-w-lg mx-auto">
              Start management operations with a 7-day free trial. Upgrade to premium for annual access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {/* Tier 1: Free Trial */}
            <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all duration-300">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-200">7-Day Free Trial</h3>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">Trial</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">Perfect for evaluation and onboarding.</p>
                
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">₹0</span>
                  <span className="text-slate-400 text-sm"> / 7 days</span>
                </div>

                <ul className="space-y-3 text-sm text-slate-300 border-t border-slate-900 pt-6">
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">✓</span> Full access to all features
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">✓</span> Seating maps configuration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">✓</span> Student & shifts profiles
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">✓</span> Income/Expense ledgers
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="block text-center w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold rounded-xl transition-all"
                >
                  {user ? "Go to Dashboard" : "Start Free Evaluation"}
                </Link>
              </div>
            </div>

            {/* Tier 2: Premium Annual */}
            <div className="bg-slate-900/60 border border-indigo-500/30 p-8 rounded-2xl flex flex-col justify-between relative shadow-xl shadow-indigo-950/20 group hover:border-indigo-500/50 transition-all duration-300">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-indigo-500 to-violet-500 text-white text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full shadow-md">
                Highly Recommended
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">Premium Annual Access</h3>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded-full">Premium</span>
                </div>
                <p className="text-sm text-indigo-350 mt-2">Unlimited operations and premium security console.</p>
                
                <div className="my-6 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 line-through text-xs font-semibold">₹6,999</span>
                    <span className="text-xs text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-md">57% OFF</span>
                  </div>
                  <div>
                    <span className="text-4xl font-black text-white">₹2,999</span>
                    <span className="text-slate-400 text-sm"> / year</span>
                  </div>
                  <span className="text-[11px] text-indigo-300 font-medium">✨ Lock in this launch discount today!</span>
                </div>

                <ul className="space-y-3 text-sm text-slate-300 border-t border-slate-800 pt-6">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> 1 Year Unlimited Membership
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Automatic Dues Alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Print/Save Receipt Ledgers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Priority WhatsApp & Email Support
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Lifetime software core updates
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="block text-center w-full py-3 bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                >
                  {user ? "Go to Dashboard" : "Get Premium Access"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section id="faq" className="py-20 bg-slate-900/20 border-t border-slate-900 px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="mt-3 text-slate-400">Have questions about setting up your library? Read our answers below.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="cursor-pointer w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg text-slate-400 ml-4">
                    {activeFaq === index ? "−" : "+"}
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-slate-950/40 bg-slate-950/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-950 border-t border-slate-900 px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-16">
        <div className="max-w-4xl mx-auto bg-linear-to-r from-indigo-950/25 via-violet-950/20 to-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 sm:p-12 rounded-3xl relative overflow-hidden text-center group hover:border-indigo-500/25 transition-all duration-300">
          <div className="absolute top-[-40%] right-[-40%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
          
          <h2 className="text-3xl font-black tracking-tight text-white mb-4">Have Questions or Need Integration Help?</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Our support desk is active. Reach out to get your queries resolved or request custom layout support.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* WhatsApp */}
            <a
              href="https://wa.me/918386835945"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-sm transition-all duration-200"
            >
              <span>💬</span> WhatsApp support: +91 8386835945
            </a>
            {/* Email */}
            <a
              href="mailto:jainritik0021@gmail.com"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded-xl text-sm transition-all duration-200"
            >
              <span>✉️</span> Email support: jainritik0021@gmail.com
            </a>
          </div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Library Hub Seating & Operations Console. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-slate-300">Features</a>
            <a href="#pricing" className="hover:text-slate-300">Pricing</a>
            <a href="mailto:jainritik0021@gmail.com" className="hover:text-slate-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
