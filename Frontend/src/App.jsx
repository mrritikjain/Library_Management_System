import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Routes>
          {/* Map / to Login page */}
          <Route path="/" element={<Login />} />
          {/* Map /register to Register page */}
          <Route path="/register" element={<Register />} />
          {/* Map /dashboard to Dashboard page */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
