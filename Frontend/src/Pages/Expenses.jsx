import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals & Form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Miscellaneous",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // User Info
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/userDetails`, {
        withCredentials: true,
      });
      setUser(userRes.data);

      // Expenses ledger
      const expensesRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/expenses/all`, {
        withCredentials: true,
      });
      setExpenses(expensesRes.data.expenses);

      setLoading(false);
    } catch (error) {
      console.error("Error loading expenses data:", error);
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

  // Submit recorded expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/expenses/record`, formData, {
        withCredentials: true,
      });

      setIsAddModalOpen(false);
      setFormData({
        title: "",
        amount: "",
        category: "Miscellaneous",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      await fetchData();
      alert("Expense recorded successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to record expense.");
    }
  };

  // Delete expense record
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) {
      return;
    }
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/expenses/${expenseId}`, {
        withCredentials: true,
      });
      await fetchData();
      alert("Expense record deleted successfully.");
    } catch (error) {
      alert("Failed to delete record.");
    }
  };

  // Category Colors
  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Rent":
        return "bg-rose-500/10 text-rose-450 border-rose-500/20";
      case "Electricity":
        return "bg-amber-500/10 text-amber-450 border-amber-500/20";
      case "Wifi":
        return "bg-sky-500/10 text-sky-450 border-sky-500/20";
      case "Salaries":
        return "bg-violet-500/10 text-violet-450 border-violet-500/20";
      case "Maintenance":
        return "bg-indigo-500/10 text-indigo-450 border-indigo-500/20";
      case "Water":
        return "bg-teal-500/10 text-teal-450 border-teal-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  // Total Expenses
  const totalExpensesSum = expenses.reduce((sum, item) => sum + item.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4">Loading expenses tracker...</p>
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

      <main className="flex-1 p-6 sm:p-8 relative z-10 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-200 via-violet-200 to-pink-200 bg-clip-text text-transparent">
                Expenses Tracker
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Track and log library operational expenses like rent, wifi, electricity, and salaries.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="cursor-pointer bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-500/15 text-center"
            >
              📉 Record Expense
            </button>
          </div>

          {/* Quick Stats Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-xl p-5 hover:border-indigo-500/15 transition-all duration-300">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Expenses</p>
              <p className="mt-1.5 text-3xl font-black text-rose-450 tracking-tight">
                ₹ {totalExpensesSum.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Sum of all expenditures logged</p>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-xl p-5 hover:border-indigo-500/15 transition-all duration-300">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Expenditures Count</p>
              <p className="mt-1.5 text-3xl font-black text-amber-400 tracking-tight">{expenses.length}</p>
              <p className="text-[10px] text-slate-500 mt-1">Bills and operational invoices</p>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              {expenses.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No expenses recorded yet. Click "Record Expense" to add one.
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-3.5 px-4">Title</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Notes</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {expenses.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-800/20 transition-all duration-150">
                        <td className="py-4 px-4 font-bold text-slate-200">{item.title}</td>
                        <td className="py-4 px-4 text-xs text-slate-400">
                          {new Date(item.date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          <span className={`px-2.5 py-0.5 rounded border text-[10px] uppercase font-bold inline-block ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-black text-rose-400">₹{item.amount.toLocaleString()}</td>
                        <td className="py-4 px-4 text-xs text-slate-400 max-w-[200px] truncate">{item.notes || "—"}</td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDeleteExpense(item._id)}
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

      {/* Record Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-200">Record Expense</h3>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. WiFi Recharge / Office Rent"
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Wifi">WiFi</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Water">Water</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional context"
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer"
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

export default Expenses;
