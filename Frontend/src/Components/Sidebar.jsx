import { NavLink } from "react-router-dom";

const Sidebar = (props) => {
  const sidebarLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Seats", path: "/seats", icon: "🪑" },
    { name: "Students", path: "/students", icon: "👥" },
    { name: "Fees", path: "/fees", icon: "💵" },
    { name: "Expenses", path: "/expenses", icon: "📉" },
    { name: "Reports", path: "/reports", icon: "📈" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  if (!props.user) return null;

  return (
    <aside className="w-64 min-h-screen bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/80 p-6 flex flex-col justify-between shrink-0 transition-all duration-300">
      <div className="flex flex-col gap-8">
        {/* Logo / Library Name */}
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">📚</span>
          <span className="text-2xl font-extrabold tracking-tight bg-linear-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent truncate">
            {props.user.LName.charAt(0).toUpperCase() +
              props.user.LName.slice(1)}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {sidebarLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
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
  );
};

export default Sidebar;
