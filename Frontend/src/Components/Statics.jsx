import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChair,
  faCoins,
  faWallet,
  faChartLine,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

const Statics = ({ stats }) => {
  // Seating capacity calculation
  const totalSeats = stats?.totalSeats || 0;
  const occupiedSeats = stats?.occupiedSeats || 0;
  const availableSeats = stats?.availableSeats || 0;

  // Financial calculation
  const feesCollected = stats?.feesCollected || 0;
  const expenses = stats?.totalExpenses || 0;
  const profit = stats?.netProfit || 0;
  const margin = feesCollected > 0 ? ((profit / feesCollected) * 100).toFixed(1) : "0.0";

  // Due fees calculation
  const dueFeesCount = stats?.dueFeesCount || 0;

  const staticsData = [
    {
      icon: faChair,
      title: "Available Seats",
      value: `${availableSeats} / ${totalSeats}`,
      themeClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      subtext: `${occupiedSeats} slots booked`,
    },
    {
      icon: faCoins,
      title: "Fees Collected",
      value: `₹ ${feesCollected.toLocaleString()}`,
      themeClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      subtext: "Gross revenue",
    },
    {
      icon: faWallet,
      title: "Total Expenses",
      value: `₹ ${expenses.toLocaleString()}`,
      themeClass: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      subtext: "Rent & utilities",
    },
    {
      icon: faChartLine,
      title: "Net Profit",
      value: `₹ ${profit.toLocaleString()}`,
      themeClass: "bg-violet-500/10 border-violet-500/20 text-violet-400",
      subtext: `Margin: ${margin}%`,
    },
    {
      icon: faExclamationTriangle,
      title: "Overdue Fees",
      value: `${dueFeesCount} Student${dueFeesCount !== 1 ? "s" : ""}`,
      themeClass: dueFeesCount > 0 
        ? "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)] animate-pulse" 
        : "bg-slate-500/10 border-slate-500/20 text-slate-400",
      subtext: dueFeesCount > 0 ? "Alerts pending" : "All clear",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 w-full">
        {staticsData.map((stat, index) => {
          return (
            <div
              key={index}
              className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-xl p-5 hover:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Icon Wrapper */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${stat.themeClass}`}
                >
                  <FontAwesomeIcon icon={stat.icon} className="text-lg" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider truncate">
                    {stat.title}
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-100 tracking-tight truncate">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {stat.subtext}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Statics;
