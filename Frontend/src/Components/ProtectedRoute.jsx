import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ProtectedRoute = ({ element: Element }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/userDetails`,
          { withCredentials: true }
        );
        const user = res.data;

        // Super Admin accounts are redirected to the admin verification console
        if (user.isSuperAdmin) {
          navigate("/admin/subscriptions");
          return;
        }

        const trialDuration = 15 * 24 * 60 * 60 * 1000; // 15 days in ms
        const registrationTime = new Date(user.createdAt).getTime();
        const isTrialValid = (Date.now() - registrationTime) <= trialDuration;

        const isSubscribed = user.subscriptionStatus === "Active";

        if (!isTrialValid && !isSubscribed) {
          navigate("/subscription");
          return;
        }

        setAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error("Auth protection check failed:", error);
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4">Validating session...</p>
        </div>
      </div>
    );
  }

  return authorized ? <Element /> : null;
};

export const AdminRoute = ({ element: Element }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/userDetails`,
          { withCredentials: true }
        );
        const user = res.data;

        if (user.isSuperAdmin) {
          setAuthorized(true);
          setLoading(false);
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Admin verification check failed:", error);
        navigate("/");
      }
    };

    checkAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  return authorized ? <Element /> : null;
};
