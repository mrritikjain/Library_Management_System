import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [seats, setSeats] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    plan: "Monthly",
    feeAmount: 1000,
    seatNumber: "",
    slot: "none",
    joiningDate: new Date().toISOString().split("T")[0],
    status: "Active",
    aadharCard: "",
  });

  const [aadharFile, setAadharFile] = useState(null);

  const [paymentData, setPaymentData] = useState({
    amountPaid: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "UPI",
    remarks: "",
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // User info
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/userDetails`, {
        withCredentials: true,
      });
      setUser(userRes.data);

      // Students info
      const studentsRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/students/all`, {
        withCredentials: true,
      });
      setStudents(studentsRes.data.students);

      // Seats info for picker
      const seatsRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/seats/all`, {
        withCredentials: true,
      });
      setSeats(seatsRes.data.seats);

      setLoading(false);
    } catch (error) {
      console.error("Error loading roster data:", error);
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

  // Set default fee based on plan
  const handlePlanChange = (planName) => {
    let fee = 1000;
    if (planName === "Quarterly") fee = 2800;
    else if (planName === "Half-Yearly") fee = 5200;
    else if (planName === "Yearly") fee = 10000;
    setFormData((prev) => ({ ...prev, plan: planName, feeAmount: fee }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setAadharFile(e.target.files[0]);
    }
  };

  // Submit Register Student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("mobile", formData.mobile);
      data.append("plan", formData.plan);
      data.append("feeAmount", formData.feeAmount);
      data.append("seatNumber", formData.seatNumber);
      data.append("slot", formData.slot);
      data.append("joiningDate", formData.joiningDate);
      data.append("status", formData.status);
      if (aadharFile) {
        data.append("aadharCard", aadharFile);
      }

      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/students/register`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setIsAddModalOpen(false);
      resetForm();
      await fetchData();
      alert("Student registered successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to register student.");
    }
  };

  // Submit Edit Student
  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("mobile", formData.mobile);
      data.append("plan", formData.plan);
      data.append("feeAmount", formData.feeAmount);
      data.append("seatNumber", formData.seatNumber);
      data.append("slot", formData.slot);
      data.append("joiningDate", formData.joiningDate);
      data.append("status", formData.status);
      if (aadharFile) {
        data.append("aadharCard", aadharFile);
      }

      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/students/${selectedStudent._id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setIsEditModalOpen(false);
      setSelectedStudent(null);
      resetForm();
      await fetchData();
      alert("Student updated successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update student.");
    }
  };

  // Delete Student
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student? All seat reservations and document records will be deleted.")) {
      return;
    }
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/students/${studentId}`, {
        withCredentials: true,
      });
      await fetchData();
      alert("Student deleted successfully.");
    } catch (error) {
      alert("Failed to delete student.");
    }
  };

  // Submit Payment Record
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        studentId: selectedStudent._id,
        ...paymentData,
      };

      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fees/record`, payload, {
        withCredentials: true,
      });

      setIsPaymentModalOpen(false);
      setSelectedStudent(null);
      setPaymentData({
        amountPaid: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMode: "UPI",
        remarks: "",
      });
      alert("Fee payment recorded successfully.");
    } catch (error) {
      alert("Failed to record fee payment.");
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      mobile: student.mobile,
      plan: student.plan,
      feeAmount: student.feeAmount,
      seatNumber: student.seatNumber || "",
      slot: student.slot || "none",
      joiningDate: student.joiningDate ? new Date(student.joiningDate).toISOString().split("T")[0] : "",
      status: student.status,
      aadharCard: student.aadharCard || "",
    });
    setAadharFile(null);
    setIsEditModalOpen(true);
  };

  const openPaymentModal = (student) => {
    setSelectedStudent(student);
    setPaymentData((prev) => ({ ...prev, amountPaid: student.feeAmount }));
    setIsPaymentModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      mobile: "",
      plan: "Monthly",
      feeAmount: 1000,
      seatNumber: "",
      slot: "none",
      joiningDate: new Date().toISOString().split("T")[0],
      status: "Active",
      aadharCard: "",
    });
    setAadharFile(null);
  };

  // Filtering
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.mobile.includes(searchTerm);

    let matchesStatus = true;
    if (statusFilter === "Active") {
      matchesStatus = s.status === "Active";
    } else if (statusFilter === "Inactive") {
      matchesStatus = s.status === "Inactive";
    } else if (statusFilter === "Due") {
      matchesStatus = s.status === "Active" && s.isDue;
    }

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4">Loading student roster...</p>
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
                Student Roster
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage library student subscriptions, seat reservations, and document uploads.
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="cursor-pointer bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-500/15 text-center"
            >
              ➕ Register Student
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/20 backdrop-blur-xl border border-slate-800/80 p-4 rounded-xl">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-250 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Due">⚠️ Fees Due / Expired</option>
                <option value="Inactive">Inactive (Left Library)</option>
              </select>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No students found matching filters.
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Contact & Verification</th>
                      <th className="py-3.5 px-4">Plan / Fee</th>
                      <th className="py-3.5 px-4">Joining Date</th>
                      <th className="py-3.5 px-4">Seat Assignment</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-800/20 transition-all duration-150">
                        <td className="py-4 px-4 font-bold text-slate-200">{student.name}</td>
                        <td className="py-4 px-4 text-xs text-slate-400">
                          <div>💬 WhatsApp: {student.mobile}</div>
                          {student.aadharCard && (
                            <div className="mt-1">
                              <a
                                href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${student.aadharCard}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold hover:underline flex items-center gap-1"
                              >
                                📄 View Aadhar Doc
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-300">{student.plan}</span>
                            {student.status === "Active" && student.isDue && (
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase animate-pulse ${
                                student.isExpired
                                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              }`}>
                                {student.isExpired ? "Expired" : "Due"}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">₹{student.feeAmount.toLocaleString()}</div>
                          {student.expiryDate && student.status === "Active" && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Exp: {new Date(student.expiryDate).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-400">
                          {new Date(student.joiningDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-4">
                          {student.seatNumber ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-indigo-400 font-mono text-xs">
                                Desk-{String(student.seatNumber).padStart(2, "0")}
                              </span>
                              <span className="text-[10px] text-slate-500 capitalize">{student.slot} Shift</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-550 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block border ${
                              student.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-500/10 text-slate-450 border-slate-500/20"
                            }`}
                          >
                            {student.status === "Active" ? "Active" : "Inactive (Left)"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => openPaymentModal(student)}
                            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
                            title="Record Payment"
                          >
                            💵 Pay
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student._id)}
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

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-5 text-slate-200">
              {isAddModalOpen ? "Register Student Card" : "Modify Student Card"}
            </h3>

            <form onSubmit={isAddModalOpen ? handleAddStudent : handleEditStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Rahul Sharma"
                    className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
                    placeholder="WhatsApp Number (e.g. 9876543210)"
                    className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Upload Aadhar card document</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-350 text-xs focus:outline-none focus:border-indigo-500 file:bg-slate-800 file:border-0 file:text-slate-200 file:px-2.5 file:py-1 file:rounded-md file:text-xs file:font-semibold file:cursor-pointer hover:file:bg-slate-700"
                />
                {isEditModalOpen && formData.aadharCard && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Current file:{" "}
                    <a
                      href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${formData.aadharCard}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:underline"
                    >
                      {formData.aadharCard}
                    </a>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Subscription Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Fee Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.feeAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, feeAmount: e.target.value }))}
                    className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Assign Seat</label>
                  <select
                    value={formData.seatNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seatNumber: e.target.value }))}
                    disabled={formData.status === "Inactive"}
                    className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-40"
                  >
                    <option value="">Unassigned</option>
                    {seats.map((seatItem) => (
                      <option key={seatItem._id} value={seatItem.seatNumber}>
                        Seat-{String(seatItem.seatNumber).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Shift / Slot</label>
                  <select
                    value={formData.slot}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slot: e.target.value }))}
                    disabled={!formData.seatNumber || formData.status === "Inactive"}
                    className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-40"
                  >
                    <option value="none">None</option>
                    <option value="morning">Morning Only</option>
                    <option value="evening">Evening Only</option>
                    <option value="fullDay">Full Day</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, joiningDate: e.target.value }))}
                    className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {isEditModalOpen && (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          status: newStatus,
                          // clear seat/slot if marking as inactive
                          seatNumber: newStatus === "Inactive" ? "" : prev.seatNumber,
                          slot: newStatus === "Inactive" ? "none" : prev.slot,
                        }));
                      }}
                      className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive (Left Library)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  {isAddModalOpen ? "Register" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Quick Modal */}
      {isPaymentModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-200 flex items-center gap-1.5">
              <span>💵</span> Record Fee Payment
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Recording a transaction for <strong className="text-indigo-400">{selectedStudent.name}</strong>.
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  required
                  value={paymentData.amountPaid}
                  onChange={(e) => setPaymentData((prev) => ({ ...prev, amountPaid: e.target.value }))}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData((prev) => ({ ...prev, paymentDate: e.target.value }))}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Payment Mode</label>
                <select
                  value={paymentData.paymentMode}
                  onChange={(e) => setPaymentData((prev) => ({ ...prev, paymentMode: e.target.value }))}
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
                  value={paymentData.remarks}
                  onChange={(e) => setPaymentData((prev) => ({ ...prev, remarks: e.target.value }))}
                  placeholder="e.g. June fees paid"
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
