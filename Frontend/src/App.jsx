import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "./Components/ProtectedRoute";
import PremiumLoader from "./Components/PremiumLoader";

// Lazy loaded page components
const Register = lazy(() => import("./Pages/Register"));
const Login = lazy(() => import("./Pages/Login"));
const Landing = lazy(() => import("./Pages/Landing"));
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const Seats = lazy(() => import("./Pages/Seats"));
const Students = lazy(() => import("./Pages/Students"));
const Fees = lazy(() => import("./Pages/Fees"));
const Expenses = lazy(() => import("./Pages/Expenses"));
const Reports = lazy(() => import("./Pages/Reports"));
const Settings = lazy(() => import("./Pages/Settings"));
const Notifications = lazy(() => import("./Pages/Notifications"));
const Subscription = lazy(() => import("./Pages/Subscription"));
const AdminSubscriptions = lazy(() => import("./Pages/AdminSubscriptions"));

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Suspense fallback={<PremiumLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/subscription" element={<Subscription />} />

            {/* Protected Sidebar Layout Routes */}
            <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
            <Route path="/seats" element={<ProtectedRoute element={Seats} />} />
            <Route path="/students" element={<ProtectedRoute element={Students} />} />
            <Route path="/fees" element={<ProtectedRoute element={Fees} />} />
            <Route path="/expenses" element={<ProtectedRoute element={Expenses} />} />
            <Route path="/reports" element={<ProtectedRoute element={Reports} />} />
            <Route path="/settings" element={<ProtectedRoute element={Settings} />} />
            <Route path="/notifications" element={<ProtectedRoute element={Notifications} />} />

            {/* Super Admin Routes */}
            <Route path="/admin/subscriptions" element={<AdminRoute element={AdminSubscriptions} />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;
