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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
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
    dueDate: "",
    allocationMode: "backlog",
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

  // Helper to map plan names to days
  const getPlanDays = (planName) => {
    switch (planName) {
      case "Weekly": return 7;
      case "15 Days": return 15;
      case "Monthly": return 30;
      case "Quarterly": return 90;
      case "Half-Yearly": return 180;
      case "Yearly": return 365;
      default: return 30;
    }
  };

  // Helper to dynamically compute proportional due date based on payment inputs
  const updatePaymentDueDate = (amount, payDate, allocationMode, studentObj) => {
    if (!studentObj) return "";
    const paid = parseFloat(amount) || 0;
    const plan = studentObj.plan || "Monthly";
    const planDays = getPlanDays(plan);
    const totalFee = studentObj.feeAmount || 1000;
    const proportionalDays = totalFee > 0 ? (paid / totalFee) * planDays : planDays;

    const basePayDate = payDate ? new Date(payDate) : new Date();
    let startDate = basePayDate;
    
    // Check if student has paid any fee before
    if (!studentObj.hasPaidFee) {
      // First payment ever for this student! Start from joiningDate
      startDate = studentObj.joiningDate ? new Date(studentObj.joiningDate) : basePayDate;
    } else if (allocationMode === "backlog") {
      if (studentObj.expiryDate) {
        startDate = new Date(studentObj.expiryDate);
      } else if (studentObj.joiningDate) {
        startDate = new Date(studentObj.joiningDate);
      }
    }

    const calculated = new Date(startDate.getTime() + proportionalDays * 24 * 60 * 60 * 1000);
    return calculated.toISOString().split("T")[0];
  };

  // Helper to calculate student backlog stats
  const getBacklogInfo = (studentObj, payDate) => {
    if (!studentObj) return null;
    const expiry = studentObj.expiryDate ? new Date(studentObj.expiryDate) : new Date(studentObj.joiningDate);
    const today = payDate ? new Date(payDate) : new Date();
    
    // Normalize hours to compare calendar dates safely
    const d1 = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
    const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      const plan = studentObj.plan || "Monthly";
      const planDays = getPlanDays(plan);
      const totalFee = studentObj.feeAmount || 1000;
      const backlogAmount = Math.round((diffDays / planDays) * totalFee);
      return {
        days: diffDays,
        amount: backlogAmount,
        expiryDateStr: expiry.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
      };
    }
    return null;
  };

  // Set default fee based on plan
  const handlePlanChange = (planName) => {
    let fee = 1000;
    if (planName === "Weekly") fee = 250;
    else if (planName === "15 Days") fee = 500;
    else if (planName === "Quarterly") fee = 2800;
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
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("mobile", formData.mobile);
      data.append("address", formData.address || "");
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Student
  const handleEditStudent = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("mobile", formData.mobile);
      data.append("address", formData.address || "");
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
    } finally {
      setIsSubmitting(false);
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
    if (isSubmitting) return;
    setIsSubmitting(true);
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
        dueDate: "",
        paymentMode: "UPI",
        remarks: "",
      });
      await fetchData(); // Crucial: Refresh table records to update Expiration UI badges!
      alert("Fee payment recorded successfully.");
    } catch (error) {
      alert("Failed to record fee payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      mobile: student.mobile,
      address: student.address || "",
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
    const amount = student.feeAmount;
    const today = new Date().toISOString().split("T")[0];
    const computedDueDate = updatePaymentDueDate(amount, today, "backlog", student);

    setPaymentData({
      amountPaid: amount,
      paymentDate: today,
      dueDate: computedDueDate,
      allocationMode: "backlog",
      paymentMode: "UPI",
      remarks: "",
    });
    setIsPaymentModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      mobile: "",
      address: "",
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
      s.mobile.includes(searchTerm) ||
      (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()));

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
                          <div>💬 {student.mobile}</div>
                          {student.address && (
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-start gap-1">
                              <span>📍</span>
                              <span className="truncate max-w-[180px]" title={student.address}>{student.address}</span>
                            </div>
                          )}
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
                            {student.status === "Active" && (
                              student.isDue ? (
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase animate-pulse ${
                                  student.isExpired
                                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                }`}>
                                  {student.isExpired ? "🚨 Expired" : "⚠️ Fee Due"}
                                </span>
                              ) : (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                                  ✓ Paid
                                </span>
                              )
                            )}
                          </div>
                          <div className="text-xs text-slate-500">₹{student.feeAmount.toLocaleString()}</div>
                          {student.expiryDate && student.status === "Active" && (
                            <div className={`text-[10px] mt-0.5 ${!student.isDue ? "text-emerald-400/80 font-medium" : "text-slate-500"}`}>
                              {!student.isDue ? "Valid till: " : "Due: "} 
                              {new Date(student.expiryDate).toLocaleDateString("en-IN", {
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
                            className={`text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-all ${
                              student.isDue
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20"
                                : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20"
                            }`}
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
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Student Location / Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. House No. 42, Green Park, New Delhi"
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
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
                    <option value="Weekly">Weekly</option>
                    <option value="15 Days">15 Days</option>
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
                  disabled={isSubmitting}
                  className="bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (isAddModalOpen ? "Registering..." : "Saving...") : (isAddModalOpen ? "Register" : "Save Changes")}
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaymentData((prev) => ({
                      ...prev,
                      amountPaid: val,
                      dueDate: updatePaymentDueDate(val, prev.paymentDate, prev.allocationMode, selectedStudent),
                    }));
                  }}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={paymentData.paymentDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaymentData((prev) => ({
                      ...prev,
                      paymentDate: val,
                      dueDate: updatePaymentDueDate(prev.amountPaid, val, prev.allocationMode, selectedStudent),
                    }));
                  }}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {getBacklogInfo(selectedStudent, paymentData.paymentDate) && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-300 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>⚠️</span>
                    <span>Backlog Dues Detected</span>
                  </div>
                  <p className="text-slate-400">
                    This student's subscription expired on <strong className="text-slate-200">{getBacklogInfo(selectedStudent, paymentData.paymentDate).expiryDateStr}</strong> ({getBacklogInfo(selectedStudent, paymentData.paymentDate).days} days ago).
                  </p>
                  <p className="text-slate-400">
                    Calculated backlog dues: <strong className="text-amber-400">₹{getBacklogInfo(selectedStudent, paymentData.paymentDate).amount.toLocaleString()}</strong>.
                  </p>
                  
                  <div className="pt-2 border-t border-amber-500/10 space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Fee Allocation Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`flex flex-col p-2.5 rounded-lg border cursor-pointer transition-all ${
                        paymentData.allocationMode === "backlog"
                          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
                      }`}>
                        <input
                          type="radio"
                          name="allocationMode"
                          value="backlog"
                          checked={paymentData.allocationMode === "backlog"}
                          onChange={() => {
                            setPaymentData((prev) => ({
                              ...prev,
                              allocationMode: "backlog",
                              dueDate: updatePaymentDueDate(prev.amountPaid, prev.paymentDate, "backlog", selectedStudent),
                            }));
                          }}
                          className="sr-only"
                        />
                        <span className="font-bold text-[11px]">Cover Backlog</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">Extend from previous expiry</span>
                      </label>

                      <label className={`flex flex-col p-2.5 rounded-lg border cursor-pointer transition-all ${
                        paymentData.allocationMode === "fresh"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
                      }`}>
                        <input
                          type="radio"
                          name="allocationMode"
                          value="fresh"
                          checked={paymentData.allocationMode === "fresh"}
                          onChange={() => {
                            setPaymentData((prev) => ({
                              ...prev,
                              allocationMode: "fresh",
                              dueDate: updatePaymentDueDate(prev.amountPaid, prev.paymentDate, "fresh", selectedStudent),
                            }));
                          }}
                          className="sr-only"
                        />
                        <span className="font-bold text-[11px]">Start Fresh</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">Forgive dues, start from today</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

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
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Due Date / Expiry Date (Manual Override)</label>
                <input
                  type="date"
                  required
                  value={paymentData.dueDate}
                  onChange={(e) => setPaymentData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full bg-slate-950/65 border border-slate-850 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
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
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Confirm Payment"}
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
