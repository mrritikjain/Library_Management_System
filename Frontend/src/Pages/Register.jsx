import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const submitCall = async (data) => {
    console.log("Form Data Submitted:", data);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/register",
        data,
      );
      if (response.status === 201) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("Registration failed. Please check if your server is running.");
      }
    }
    reset();
  };

  return (
    <div className="flex-1 min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Form Card */}
      <div className="w-full max-w-lg bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-indigo-500/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            Register Library
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Create an account to manage your library seating and members.
          </p>
        </div>

        <form onSubmit={handleSubmit(submitCall)} className="space-y-5">
          {/* Row 1: Owner Name & Library Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="OName"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
              >
                Owner Name
              </label>
              <input
                type="text"
                id="OName"
                placeholder="John Doe"
                {...register("OName", {
                  required: "Name is required",
                  minLength: {
                    value: 3,
                    message: "Name must be at least 3 characters long",
                  },
                })}
                className={`w-full bg-slate-950/60 border rounded-lg px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.OName
                    ? "border-rose-500/50 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500"
                }`}
              />
              {errors.OName && (
                <span className="block text-xs text-rose-400 mt-1">
                  {errors.OName.message}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="LName"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
              >
                Library Name
              </label>
              <input
                type="text"
                id="LName"
                placeholder="Apex Library"
                {...register("LName", {
                  required: "Library name is required",
                  minLength: {
                    value: 3,
                    message: "Library name must be at least 3 characters long",
                  },
                })}
                className={`w-full bg-slate-950/60 border rounded-lg px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.LName
                    ? "border-rose-500/50 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500"
                }`}
              />
              {errors.LName && (
                <span className="block text-xs text-rose-400 mt-1">
                  {errors.LName.message}
                </span>
              )}
            </div>
          </div>

          {/* Row 2: City & Total Seats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                placeholder="New York"
                {...register("city", { required: "City name is required" })}
                className={`w-full bg-slate-950/60 border rounded-lg px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.city
                    ? "border-rose-500/50 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500"
                }`}
              />
              {errors.city && (
                <span className="block text-xs text-rose-400 mt-1">
                  {errors.city.message}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="seats"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
              >
                Total Seats
              </label>
              <input
                type="number"
                id="seats"
                placeholder="50"
                {...register("seats", { required: "Seats are required" })}
                className={`w-full bg-slate-950/60 border rounded-lg px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.seats
                    ? "border-rose-500/50 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500"
                }`}
              />
              {errors.seats && (
                <span className="block text-xs text-rose-400 mt-1">
                  {errors.seats.message}
                </span>
              )}
            </div>
          </div>

          {/* Row 3: Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="owner@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              className={`w-full bg-slate-950/60 border rounded-lg px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.email
                  ? "border-rose-500/50 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500"
              }`}
            />
            {errors.email && (
              <span className="block text-xs text-rose-400 mt-1">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Row 4: Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 7,
                  message: "Password must be at least 7 characters long",
                },
              })}
              className={`w-full bg-slate-950/60 border rounded-lg px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.password
                  ? "border-rose-500/50 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500"
              }`}
            />
            {errors.password && (
              <span className="block text-xs text-rose-400 mt-1">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 cursor-pointer bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white py-3 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-lg shadow-indigo-500/20"
          >
            Register
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already registered?{" "}
          <Link
            to="/"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
