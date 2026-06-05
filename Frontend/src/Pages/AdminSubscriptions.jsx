import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const AdminSubscriptions = () => {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // Modal state for full image preview
  
  const navigate = useNavigate();

  const fetchAdminData = async () => {
    try {
      // Fetch user details to verify super admin authority
      const userRes = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/userDetails`,
        { withCredentials: true }
      );
      
      if (!userRes.data.isSuperAdmin) {
        // Redirection block for unauthorized users
        alert("Access Denied: Super-Admin authorization required.");
        navigate("/dashboard");
        return;
      }
      
      setUser(userRes.data);

      // Fetch pending subscription requests
      const pendingRes = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/subscriptions/pending`,
        { withCredentials: true }
      );
      setRequests(pendingRes.data.requests);
      setLoading(false);
    } catch (error) {
      console.error("Admin dashboard fetch error:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this subscription? This will activate their membership for 1 year.")) {
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/subscriptions/approve/${id}`,
        {},
        { withCredentials: true }
      );
      alert("Subscription request approved successfully.");
      await fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve subscription.");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this subscription receipt? The user's account will be set to Expired.")) {
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/subscriptions/reject/${id}`,
        {},
        { withCredentials: true }
      );
      alert("Subscription request rejected.");
      await fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject subscription.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4">Loading Admin Control console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row w-full relative overflow-hidden font-sans">
      {/* Decorative Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      <Sidebar user={user} handleLogout={handleLogout} />

      <main className="flex-1 p-6 pt-20 md:pt-8 sm:p-8 relative z-10 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-200 via-violet-200 to-pink-200 bg-clip-text text-transparent">
              Subscription Requests
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Verify UTR/Transaction IDs and payment screenshots manually to approve library owners' memberships.
            </p>
          </div>

          {/* Verification Table */}
          <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              {requests.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No pending subscription requests found. All clear! 🎉
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-3.5 px-4">Library Owner</th>
                      <th className="py-3.5 px-4">Sender Name</th>
                      <th className="py-3.5 px-4">Transaction UTR</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Receipt</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {requests.map((reqItem) => (
                      <tr key={reqItem._id} className="hover:bg-slate-800/20 transition-all duration-150">
                        {/* Library Info */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-200">{reqItem.user?.LName || "Unknown Library"}</span>
                            <span className="text-xs text-slate-450">{reqItem.user?.OName} ({reqItem.user?.email})</span>
                          </div>
                        </td>

                        {/* Paid Name */}
                        <td className="py-4 px-4 text-slate-300 font-medium">{reqItem.name}</td>

                        {/* Transaction ID */}
                        <td className="py-4 px-4 text-indigo-400 font-bold select-all">{reqItem.transactionId}</td>

                        {/* Date */}
                        <td className="py-4 px-4 text-xs text-slate-400">
                          {new Date(reqItem.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* Screenshot Thumbnail */}
                        <td className="py-4 px-4">
                          {reqItem.screenshot ? (
                            <button
                              onClick={() => setSelectedImage(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${reqItem.screenshot}`)}
                              className="cursor-pointer border border-slate-700 p-1 rounded-md bg-slate-950 hover:border-indigo-500 transition-colors"
                            >
                              <img
                                src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${reqItem.screenshot}`}
                                alt="Receipt Thumbnail"
                                className="w-12 h-12 object-contain"
                              />
                            </button>
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}
                        </td>

                        {/* Approve / Reject buttons */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handleApprove(reqItem._id)}
                              className="bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-450 border border-emerald-500/30 text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(reqItem._id)}
                              className="bg-rose-500/10 hover:bg-rose-500/25 text-rose-450 border border-rose-500/30 text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors"
                            >
                              Reject
                            </button>
                          </div>
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

      {/* Full Screenshot Modal Preview */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-800 p-2 rounded-xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white rounded-full p-1.5 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={selectedImage} alt="Payment Proof Full" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
