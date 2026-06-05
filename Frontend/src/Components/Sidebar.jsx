import { useState } from "react";
import { NavLink } from "react-router-dom";

const Sidebar = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Seats", path: "/seats", icon: "🪑" },
    { name: "Students", path: "/students", icon: "👥" },
    { name: "Fees", path: "/fees", icon: "💵" },
    { name: "Expenses", path: "/expenses", icon: "📉" },
    { name: "Reports", path: "/reports", icon: "📈" },
    { name: "Notifications", path: "/notifications", icon: "🔔" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  if (!props.user) return null;

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 flex items-center justify-between z-30">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="text-lg font-extrabold tracking-tight bg-linear-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent truncate max-w-[150px]">
            {props.user.LName.charAt(0).toUpperCase() + props.user.LName.slice(1)}
          </span>
        </div>

        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 uppercase">
          {props.user.OName.charAt(0)}
        </div>
      </header>


      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 md:bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/80 p-6 flex flex-col justify-between shrink-0 transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo / Library Name & Mobile Close Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">📚</span>
              <span className="text-2xl font-extrabold tracking-tight bg-linear-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent truncate max-w-[140px]">
                {props.user.LName.charAt(0).toUpperCase() + props.user.LName.slice(1)}
              </span>
            </div>
            
            {/* Close Button on Mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 cursor-pointer"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {sidebarLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)} // close drawer on nav link click
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-300 border-l-2 border-indigo-500"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="flex flex-col gap-4 border-t border-slate-800/80 pt-6">
          <div className="flex flex-col gap-1 text-center bg-slate-950/45 p-3.5 rounded-xl border border-slate-800/50">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Logged in as
            </span>
            <span className="text-sm font-semibold text-indigo-300 truncate max-w-[180px]">
              {props.user.OName}
            </span>
          </div>
          <button
            onClick={props.handleLogout}
            className="cursor-pointer w-full flex items-center justify-center gap-2 bg-slate-850 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/30 text-slate-350 hover:text-rose-400 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
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
      </aside>
    </>
  );
};

export default Sidebar;
