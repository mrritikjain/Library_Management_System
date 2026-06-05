import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Subscription = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  const handleCopyUPI = () => {
    navigator.clipboard.writeText("jainritik0021@okicici");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchUserData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/userDetails`,
        { withCredentials: true }
      );
      setUser(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch user error on subscription:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    fetchUserData();
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim() || !transactionId.trim()) {
      setErrorMsg("Please fill in all textual fields.");
      return;
    }

    if (!screenshot) {
      setErrorMsg("Please upload a payment confirmation screenshot.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("transactionId", transactionId);
      formData.append("screenshot", screenshot);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/subscriptions/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setSuccessMsg(res.data.message);
      setName("");
      setTransactionId("");
      setScreenshot(null);
      setScreenshotPreview("");
      
      // Reload user details to transition status state
      await fetchUserData();
    } catch (error) {
      console.error("Submit subscription request error:", error);
      setErrorMsg(error.response?.data?.message || "Failed to submit subscription request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4">Verifying access credentials...</p>
        </div>
      </div>
    );
  }

  // Calculate Trial Remaining
  const trialDuration = 15 * 24 * 60 * 60 * 1000; // 15 days in ms
  const elapsed = Date.now() - new Date(user.createdAt).getTime();
  const trialDaysRemaining = Math.max(0, Math.ceil((trialDuration - elapsed) / (24 * 60 * 60 * 1000)));
  const isTrialActive = elapsed <= trialDuration && user.subscriptionStatus === "Trial";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      {/* Floating Logout and Dashboard Links */}
      <div className="absolute top-6 right-6 flex gap-4 z-20">
        {(user.subscriptionStatus === "Active" || isTrialActive) && (
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-indigo-500/15 border border-indigo-500/30 rounded-lg text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25 transition-all duration-200"
          >
            Go to Dashboard ➔
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="cursor-pointer px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs font-semibold text-slate-350 hover:bg-rose-500/15 hover:text-rose-450 hover:border-rose-500/20 transition-all duration-200"
        >
          Logout 🚪
        </button>
      </div>

      <div className="w-full max-w-4xl bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 my-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
            Rudhra Seating Premium
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
            Manage your library seating operations seamlessly. Access requires a single active membership.
          </p>
        </div>

        {/* Status Banners */}
        {user.subscriptionStatus === "Active" && (
          <div className="mb-6 p-4 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-xl text-center font-semibold text-sm">
            🎉 Your subscription is active! Expires on: {new Date(user.subscriptionExpiry).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}.
          </div>
        )}

        {isTrialActive && (
          <div className="mb-6 p-4 bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 rounded-xl text-center font-semibold text-sm">
            ⌛ You are in your free trial! **{trialDaysRemaining} day(s) remaining**. Enjoy full access. You can pay below to extend.
          </div>
        )}

        {user.subscriptionStatus === "Pending" && (
          <div className="mb-6 p-4 bg-amber-500/15 border border-amber-500/25 text-amber-400 rounded-xl text-center font-semibold text-sm">
            <p className="animate-pulse">⏳ Verification in Progress: Your payment confirmation request has been submitted. Our admin is verifying the transaction details.</p>
            <p className="text-xs mt-2 text-slate-300 font-medium">Your subscription will be added within 1-2 hours. For support, email <a href="mailto:jainritik0021@gmail.com" className="text-indigo-400 underline">jainritik0021@gmail.com</a> or WhatsApp at <a href="https://wa.me/918386835945" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">+91 8386835945</a>.</p>
          </div>
        )}

        {user.subscriptionStatus === "Expired" && !isTrialActive && (
          <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/25 text-rose-400 rounded-xl text-center font-semibold text-sm">
            <p>🚫 Trial / Subscription Expired: Access is locked. Please send UPI payment of ₹3,000 and submit verification details below.</p>
            <p className="text-xs mt-2 text-slate-300 font-medium">Once submitted, your subscription will be activated within 1-2 hours. For support, email <a href="mailto:jainritik0021@gmail.com" className="text-indigo-400 underline">jainritik0021@gmail.com</a> or WhatsApp at <a href="https://wa.me/918386835945" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">+91 8386835945</a>.</p>
          </div>
        )}

        {/* Main Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: QR and UPI info */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 flex flex-col items-center text-center relative overflow-hidden group hover:border-indigo-500/35 transition-all duration-300 shadow-lg shadow-indigo-950/10">
            {/* Header border stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500" />
            
            <div className="flex items-center gap-2 mb-4 mt-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Instant UPI Payment</h2>
            </div>
            
            {/* QR Card with Premium design */}
            <div className="relative p-4 rounded-2xl bg-white border border-slate-100 shadow-2xl mb-5 w-56 h-56 flex items-center justify-center group/qr overflow-hidden">
              <img src="/qr_code.png" alt="Payment QR Code" className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover/qr:scale-[1.02]" />
              
              {/* Scan Line effect */}
              <div className="absolute left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_8px_rgba(99,102,241,0.8)] z-20 animate-scan-line pointer-events-none" />
              
              {/* Subtle grid accent inside white card */}
              <div className="absolute inset-0 bg-[radial-gradient(#f0f4ff_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
            </div>

            <p className="text-xs text-slate-400 mb-6 max-w-xs">
              Scan the QR using GPay, PhonePe, Paytm, or any banking app to complete your transaction.
            </p>

            {/* Plan Details & Action List */}
            <div className="w-full space-y-3 pt-4 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-400">Membership Tier</span>
                <span className="font-semibold text-slate-200">1 Year Access</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-400">Plan Amount</span>
                <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full text-xs">₹ 3,000 / year</span>
              </div>
              
              {/* UPI ID Row with Interactive Copy Button */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pt-2 mt-1 bg-slate-950/50 p-2.5 rounded-xl border border-slate-850">
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">UPI ID for payment</span>
                  <span className="text-xs sm:text-sm font-mono text-slate-200 select-all font-semibold">jainritik0021@okicici</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className={`w-full sm:w-auto cursor-pointer flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                    copied 
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy ID
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Submission Form */}
          <div className="bg-slate-950/45 p-6 rounded-2xl border border-slate-800/60">
            <h2 className="text-lg font-bold text-slate-200 mb-4">Submit Payment Verification</h2>
            
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold">
                ✅ {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Sender Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name as seen on your Bank Account / UPI"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Transaction ID / UTR
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="12-digit transaction ID"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Screenshot Upload
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 rounded-lg cursor-pointer bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/30 transition-all duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-xs text-slate-500">
                        {screenshot ? <span className="text-indigo-400 font-semibold">{screenshot.name}</span> : "Click to upload transaction screenshot"}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {screenshotPreview && (
                <div className="mt-2 text-center">
                  <span className="block text-xs text-slate-500 mb-1.5">Screenshot Preview:</span>
                  <div className="inline-block border border-slate-850 p-1.5 rounded-lg bg-slate-950">
                    <img src={screenshotPreview} alt="Screenshot Preview" className="max-h-24 rounded-md object-contain" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 cursor-pointer bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-[0.99] shadow-lg shadow-indigo-500/25"
              >
                {submitting ? "Uploading details..." : "Submit Verification Proof"}
              </button>
            </form>
          </div>
        </div>

        {/* Support Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <p>
            Your subscription will be activated within <strong className="text-indigo-300">1-2 hours</strong> after submission.
          </p>
          <p className="mt-1.5">
            For support or queries, email us at <a href="mailto:jainritik0021@gmail.com" className="text-indigo-400 hover:text-indigo-350 underline">jainritik0021@gmail.com</a> or WhatsApp us at <a href="https://wa.me/918386835945" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-350 underline">+91 8386835945</a>.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Subscription;
