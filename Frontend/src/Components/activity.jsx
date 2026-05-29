import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";

const Activity = () => {
  const recentActivities = [
    {
      name: "Aarav Sharma",
      seat: "Desk-04",
      plan: "Monthly (Premium)",
      status: "Paid",
    },
    { name: "Sneha Patel", seat: "Desk-12", plan: "Quarterly", status: "Paid" },
    {
      name: "Rahul Verma",
      seat: "Desk-02",
      plan: "Monthly (Basic)",
      status: "Pending",
    },
  ];

  return (
    <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-indigo-500/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faBolt} className="text-amber-500 text-sm" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Recent Active Cards
          </h3>
        </div>
        <Link
          to="/students"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
        >
          View Roster →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Seat Assigned</th>
              <th className="py-3 px-4">Plan</th>
              <th className="py-3 px-4">Billing Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {recentActivities.map((activity, index) => (
              <tr
                key={index}
                className="hover:bg-slate-800/20 transition-all duration-200"
              >
                <td className="py-4 px-4 font-bold text-slate-200">
                  {activity.name}
                </td>
                <td className="py-4 px-4 font-medium text-slate-400">
                  {activity.seat}
                </td>
                <td className="py-4 px-4 text-slate-400">{activity.plan}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${
                      activity.status === "Paid"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                    }`}
                  >
                    {activity.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Activity;
