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

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Persistent Sidebar Layout Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/seats" element={<Seats />} />
          <Route path="/students" element={<Students />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
