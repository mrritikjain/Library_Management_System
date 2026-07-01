import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals & Form
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    amountPaid: "",
    paymentDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    allocationMode: "backlog",
    paymentMode: "UPI",
    remarks: "",
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // User Info
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/userDetails`, {
        withCredentials: true,
      });
      setUser(userRes.data);

      // Fees ledger
      const feesRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fees/all`, {
        withCredentials: true,
      });
      setFees(feesRes.data.fees);

      // Active students list for dropdown
      const studentsRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/students/all`, {
        withCredentials: true,
      });
      setStudents(studentsRes.data.students.filter((s) => s.status === "Active"));

      setLoading(false);
    } catch (error) {
      console.error("Error loading fees data:", error);
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

  // Helper to map plan names to days
  const getPlanDays = (planName) => {
    switch (planName) {
      case "Weekly": return 7;
      case "15 Days": return 15;
      case "Monthly": return 30;
      case "Quarterly": return 90;
      case "Half-Yearly": return 180;
      case "Yearly": return 365;
      default: return 30;
    }
  };

  // Helper to dynamically compute proportional due date based on payment inputs
  const updatePaymentDueDate = (amount, payDate, allocationMode, studentObj) => {
    if (!studentObj) return "";
    const paid = parseFloat(amount) || 0;
    const plan = studentObj.plan || "Monthly";
    const planDays = getPlanDays(plan);
    const totalFee = studentObj.feeAmount || 1000;
    const proportionalDays = totalFee > 0 ? (paid / totalFee) * planDays : planDays;

    const basePayDate = payDate ? new Date(payDate) : new Date();
    let startDate = basePayDate;
    
    // Check if we are covering the backlog or starting fresh
    if (allocationMode === "backlog") {
      if (studentObj.expiryDate) {
        startDate = new Date(studentObj.expiryDate);
      } else if (studentObj.joiningDate) {
        startDate = new Date(studentObj.joiningDate);
      }
    }

    const calculated = new Date(startDate.getTime() + proportionalDays * 24 * 60 * 60 * 1000);
    return calculated.toISOString().split("T")[0];
  };

  // Helper to calculate student backlog stats
  const getBacklogInfo = (studentObj, payDate) => {
    if (!studentObj) return null;
    const expiry = studentObj.expiryDate ? new Date(studentObj.expiryDate) : new Date(studentObj.joiningDate);
    const today = payDate ? new Date(payDate) : new Date();
    
    // Normalize hours to compare calendar dates safely
    const d1 = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
    const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      const plan = studentObj.plan || "Monthly";
      const planDays = getPlanDays(plan);
      const totalFee = studentObj.feeAmount || 1000;
      const backlogAmount = Math.round((diffDays / planDays) * totalFee);
      return {
        days: diffDays,
        amount: backlogAmount,
        expiryDateStr: expiry.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
      };
    }
    return null;
  };

  // Submit recorded payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fees/record`, formData, {
        withCredentials: true,
      });

      setIsRecordModalOpen(false);
      setFormData({
        studentId: "",
        amountPaid: "",
        paymentDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        allocationMode: "backlog",
        paymentMode: "UPI",
        remarks: "",
      });
      await fetchData();
      alert("Payment recorded successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV helper
  const handleExportCSV = (range) => {
    let filteredFees = [...fees];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    if (range === "this_month") {
      filteredFees = fees.filter((fee) => {
        const d = new Date(fee.paymentDate);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
    } else if (range === "last_month") {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      filteredFees = fees.filter((fee) => {
        const d = new Date(fee.paymentDate);
        return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
      });
    } else if (range === "this_year") {
      filteredFees = fees.filter((fee) => {
        const d = new Date(fee.paymentDate);
        return d.getFullYear() === currentYear;
      });
    }

    const headers = ["Student Name", "Mobile", "Plan", "Amount Paid", "Payment Date", "Due Date", "Payment Mode", "Remarks"];
    const rows = filteredFees.map((fee) => [
      fee.studentId ? fee.studentId.name : "Deleted Student",
      fee.studentId ? fee.studentId.mobile : "—",
      fee.studentId ? fee.studentId.plan : "—",
      fee.amountPaid,
      new Date(fee.paymentDate).toISOString().split("T")[0],
      fee.dueDate ? new Date(fee.dueDate).toISOString().split("T")[0] : "—",
      fee.paymentMode,
      (fee.remarks || "").replace(/"/g, '""'),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fees_report_${range}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete payment record
  const handleDeletePayment = async (feeId) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) {
      return;
    }
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fees/${feeId}`, {
        withCredentials: true,
      });
      await fetchData();
      alert("Payment record deleted successfully.");
    } catch (error) {
      alert("Failed to delete record.");
    }
  };

  // Populate student standard fee on dropdown select
  const handleStudentSelect = (studentId) => {
    const student = students.find((s) => s._id === studentId);
    const amount = student ? student.feeAmount : "";
    const computedDueDate = student ? updatePaymentDueDate(amount, formData.paymentDate, "backlog", student) : "";
    
    setFormData((prev) => ({
      ...prev,
      studentId,
      amountPaid: amount,
      dueDate: computedDueDate,
      allocationMode: "backlog",
    }));
  };

  // Total Fees Collected in ledger
  const totalCollected = fees.reduce((sum, item) => sum + item.amountPaid, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4">Loading fees ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row w-full relative overflow-hidden font-sans">
      {/* Decorative glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      <Sidebar user={user} handleLogout={handleLogout} />

      <main className="flex-1 p-6 pt-20 md:pt-8 sm:p-8 relative z-10 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-200 via-violet-200 to-pink-200 bg-clip-text text-transparent">
                Fees Ledger
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Track library subscription billing history, payments, and financial ledgers.
              </p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className="cursor-pointer bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-205 font-semibold text-sm px-4 py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
                >
                  📥 Export Ledger <span className="text-[10px] text-slate-500">▼</span>
                </button>
                {isExportDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1 overflow-hidden backdrop-blur-xl">
                    <button
                      onClick={() => {
                        handleExportCSV("this_month");
                        setIsExportDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                    >
                      📅 This Month's Collections
                    </button>
                    <button
                      onClick={() => {
                        handleExportCSV("last_month");
                        setIsExportDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                    >
                      📅 Last Month's Collections
                    </button>
                    <button
                      onClick={() => {
                        handleExportCSV("this_year");
                        setIsExportDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                    >
                      🗓️ This Year's Collections
                    </button>
                    <button
                      onClick={() => {
                        handleExportCSV("all");
                        setIsExportDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                    >
                      📊 All-Time Collections
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsRecordModalOpen(true)}
                className="cursor-pointer bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-500/15 text-center"
              >
                💵 Record Payment
              </button>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-xl p-5 hover:border-indigo-500/15 transition-all duration-300">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Collection</p>
              <p className="mt-1.5 text-3xl font-black text-indigo-400 tracking-tight">
                ₹ {totalCollected.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Sum of all recorded payments</p>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-xl p-5 hover:border-indigo-500/15 transition-all duration-300">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Transactions Count</p>
              <p className="mt-1.5 text-3xl font-black text-emerald-400 tracking-tight">{fees.length}</p>
              <p className="text-[10px] text-slate-500 mt-1">Successful ledger items</p>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-xl p-5 hover:border-indigo-500/15 transition-all duration-300">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Students</p>
              <p className="mt-1.5 text-3xl font-black text-violet-400 tracking-tight">{students.length}</p>
              <p className="text-[10px] text-slate-500 mt-1">Members currently active</p>
            </div>
          </div>

          {/* Fees Table */}
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              {fees.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No payment records found. Click "Record Payment" to log one.
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Payment Date</th>
                      <th className="py-3.5 px-4">Amount Paid</th>
                      <th className="py-3.5 px-4">Mode</th>
                      <th className="py-3.5 px-4">Remarks</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {fees.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-800/20 transition-all duration-150">
                        <td className="py-4 px-4 font-bold text-slate-200">
                          {item.studentId ? (
                            <div>
                              <span>{item.studentId.name}</span>
                              <span className="text-[10px] ml-2 bg-slate-850 px-2 py-0.5 rounded text-slate-400 font-normal">
                                {item.studentId.plan}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-550 italic font-normal text-xs">Deleted Student</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-400">
                          {new Date(item.paymentDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-4 font-black text-slate-200">₹{item.amountPaid.toLocaleString()}</td>
                        <td className="py-4 px-4 text-xs">
                          <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded border border-indigo-500/15 uppercase font-bold">
                            {item.paymentMode}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-400 max-w-[200px] truncate">{item.remarks || "—"}</td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDeletePayment(item._id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
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

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-200">Record Fee Payment</h3>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Select Student</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Choose Student...</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} (Plan: {s.plan} - ₹{s.feeAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.amountPaid}
                  onChange={(e) => {
                    const val = e.target.value;
                    const student = students.find((s) => s._id === formData.studentId);
                    setFormData((prev) => ({
                      ...prev,
                      amountPaid: val,
                      dueDate: student ? updatePaymentDueDate(val, prev.paymentDate, prev.allocationMode, student) : prev.dueDate,
                    }));
                  }}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={formData.paymentDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    const student = students.find((s) => s._id === formData.studentId);
                    setFormData((prev) => ({
                      ...prev,
                      paymentDate: val,
                      dueDate: student ? updatePaymentDueDate(prev.amountPaid, val, prev.allocationMode, student) : prev.dueDate,
                    }));
                  }}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {formData.studentId && students.find((s) => s._id === formData.studentId) && getBacklogInfo(students.find((s) => s._id === formData.studentId), formData.paymentDate) && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-300 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>⚠️</span>
                    <span>Backlog Dues Detected</span>
                  </div>
                  <p className="text-slate-400">
                    This student's subscription expired on <strong className="text-slate-200">{getBacklogInfo(students.find((s) => s._id === formData.studentId), formData.paymentDate).expiryDateStr}</strong> ({getBacklogInfo(students.find((s) => s._id === formData.studentId), formData.paymentDate).days} days ago).
                  </p>
                  <p className="text-slate-400">
                    Calculated backlog dues: <strong className="text-amber-400">₹{getBacklogInfo(students.find((s) => s._id === formData.studentId), formData.paymentDate).amount.toLocaleString()}</strong>.
                  </p>
                  
                  <div className="pt-2 border-t border-amber-500/10 space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Fee Allocation Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`flex flex-col p-2.5 rounded-lg border cursor-pointer transition-all ${
                        formData.allocationMode === "backlog"
                          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
                      }`}>
                        <input
                          type="radio"
                          name="allocationMode"
                          value="backlog"
                          checked={formData.allocationMode === "backlog"}
                          onChange={() => {
                            const student = students.find((s) => s._id === formData.studentId);
                            setFormData((prev) => ({
                              ...prev,
                              allocationMode: "backlog",
                              dueDate: student ? updatePaymentDueDate(prev.amountPaid, prev.paymentDate, "backlog", student) : prev.dueDate,
                            }));
                          }}
                          className="sr-only"
                        />
                        <span className="font-bold text-[11px]">Cover Backlog</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">Extend from previous expiry</span>
                      </label>

                      <label className={`flex flex-col p-2.5 rounded-lg border cursor-pointer transition-all ${
                        formData.allocationMode === "fresh"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
                      }`}>
                        <input
                          type="radio"
                          name="allocationMode"
                          value="fresh"
                          checked={formData.allocationMode === "fresh"}
                          onChange={() => {
                            const student = students.find((s) => s._id === formData.studentId);
                            setFormData((prev) => ({
                              ...prev,
                              allocationMode: "fresh",
                              dueDate: student ? updatePaymentDueDate(prev.amountPaid, prev.paymentDate, "fresh", student) : prev.dueDate,
                            }));
                          }}
                          className="sr-only"
                        />
                        <span className="font-bold text-[11px]">Start Fresh</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">Forgive dues, start from today</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Payment Mode</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paymentMode: e.target.value }))}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="NetBanking">Net Banking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Due Date / Expiry Date (Manual Override)</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Remarks</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                  placeholder="e.g. June subscription"
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving Entry..." : "Confirm Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
