import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Seats from "./Pages/Seats";
import Students from "./Pages/Students";
import Fees from "./Pages/Fees";
import Expenses from "./Pages/Expenses";
import Reports from "./Pages/Reports";
import Settings from "./Pages/Settings";
import Notifications from "./Pages/Notifications";
import Subscription from "./Pages/Subscription";
import AdminSubscriptions from "./Pages/AdminSubscriptions";
import { ProtectedRoute, AdminRoute } from "./Components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
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
      </div>
    </Router>
  );
};

export default App;
