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
  const [formData, setFormData] = useState({
    studentId: "",
    amountPaid: "",
    paymentDate: new Date().toISOString().split("T")[0],
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

  // Submit recorded payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fees/record`, formData, {
        withCredentials: true,
      });

      setIsRecordModalOpen(false);
      setFormData({
        studentId: "",
        amountPaid: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMode: "UPI",
        remarks: "",
      });
      await fetchData();
      alert("Payment recorded successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to record payment.");
    }
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
    setFormData((prev) => ({
      ...prev,
      studentId,
      amountPaid: student ? student.feeAmount : "",
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex w-full relative overflow-hidden font-sans">
      {/* Decorative glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      <Sidebar user={user} handleLogout={handleLogout} />

      <main className="flex-1 p-6 sm:p-8 relative z-10 overflow-y-auto max-h-screen">
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
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="cursor-pointer bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-500/15 text-center"
            >
              💵 Record Payment
            </button>
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, amountPaid: e.target.value }))}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={formData.paymentDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paymentDate: e.target.value }))}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

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
                  className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Confirm Entry
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
