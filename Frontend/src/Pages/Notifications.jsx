import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const Notifications = () => {
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const navigate = useNavigate();

  const fetchNotificationData = async () => {
    try {
      // Fetch user info for sidebar
      const userRes = await axios.get("http://localhost:5000/api/userDetails", {
        withCredentials: true,
      });
      setUser(userRes.data);

      // Fetch logs
      const logsRes = await axios.get(
        "http://localhost:5000/api/notifications/logs",
        {
          withCredentials: true,
        },
      );
      setLogs(logsRes.data.logs);
      setLoading(false);
    } catch (error) {
      console.error("Error loading notification logs:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    fetchNotificationData();
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

  const handleTriggerCron = async () => {
    try {
      setTriggering(true);
      const res = await axios.post(
        "http://localhost:5000/api/notifications/trigger",
        {},
        {
          withCredentials: true,
        },
      );

      const { processedCount, sentCount, messagesSent } = res.data.results;

      // Update logs list
      await fetchNotificationData();

      alert(
        `Automated check completed!\n` +
          `- Processed: ${processedCount} active student(s)\n` +
          `- Alerts Sent: ${sentCount} new notification(s)`,
      );
    } catch (error) {
      alert("Failed to run automated reminder check.");
    } finally {
      setTriggering(false);
    }
  };

  const getBadgeStyles = (type) => {
    switch (type) {
      case "registration":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "no_fees_3_days":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "expiry_3_days_before":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "expiry_day":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "expiry_overdue_3_days":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getReadableType = (type) => {
    switch (type) {
      case "registration":
        return "Welcome registration";
      case "no_fees_3_days":
        return "Unpaid Fees (3 Days)";
      case "expiry_3_days_before":
        return "Expiry Warning (3 Days Before)";
      case "expiry_day":
        return "Plan Expired Day Alert";
      case "expiry_overdue_3_days":
        return "Overdue Fees Notice";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4">
            Loading notification timeline...
          </p>
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
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-200 via-violet-200 to-pink-200 bg-clip-text text-transparent">
                Notification Logs
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                View logs of welcome messages, upcoming plan expiration alerts,
                and overdue reminders sent to students.
              </p>
            </div>
          </div>

          {/* Logs List Container */}
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              {logs.length === 0 ? (
                <div className="text-center py-16 text-slate-500 flex flex-col items-center justify-center gap-3">
                  <span className="text-4xl">🔔</span>
                  <span>
                    No notifications generated yet. Register a new student or
                    run reminder checks.
                  </span>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Alert Type</th>
                      <th className="py-3.5 px-4">Message Body</th>
                      <th className="py-3.5 px-4">Time Logged</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {logs.map((log) => (
                      <tr
                        key={log._id}
                        className="hover:bg-slate-800/20 transition-all duration-150"
                      >
                        <td className="py-4 px-4 font-bold text-slate-200">
                          {log.studentId ? (
                            log.studentId.name
                          ) : (
                            <span className="text-slate-500 italic">
                              Deleted Student
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-400">
                          {log.studentId ? log.studentId.mobile : "—"}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block border capitalize ${getBadgeStyles(log.type)}`}
                          >
                            {getReadableType(log.type)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-300 max-w-[400px] leading-normal font-sans">
                          {log.message}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-400">
                          {new Date(log.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          {new Date(log.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {log.studentId && (
                            <a
                              href={`https://wa.me/91${log.studentId.mobile}?text=${encodeURIComponent(log.message)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 bg-emerald-650 hover:bg-emerald-600 border border-emerald-500/20 text-white text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-all duration-200 font-semibold shadow-md active:scale-95"
                            >
                              💬 WhatsApp
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
