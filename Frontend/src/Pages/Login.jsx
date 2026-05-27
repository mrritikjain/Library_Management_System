import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const submitCall = async (data) => {
    console.log("Login Data Submitted:", data);
    try {
      const res = await axios.post("http://localhost:5000/api/login", data, {
        withCredentials: true,
      });
      if (res.status === 200) {
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
        alert("Login failed. Please check if your server is running.");
      }
    }
    reset();
  };

  return (
    <div className="flex-1 min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Glowing background details */}
      <div className="absolute top-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-violet-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-indigo-900/10 blur-[130px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/85 rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-indigo-500/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Enter your library email and password to log in.
          </p>
        </div>

        <form onSubmit={handleSubmit(submitCall)} className="space-y-6">
          {/* Email input */}
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
              {...register("email", { required: "Email is required" })}
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

          {/* Password input */}
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
              {...register("password", { required: "Password is required" })}
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
            Log In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Don't have a library account?{" "}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
