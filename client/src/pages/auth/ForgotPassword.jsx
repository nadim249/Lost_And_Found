import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/auth.api";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await authApi.forgot(email);
      setSubmitted(true);
      toast.success("Check your inbox for password instructions");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit request");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#f5f5f7]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0066cc] hover:text-[#0044b3] mb-6 transition-colors duration-200 uppercase tracking-wider"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Login</span>
        </Link>
        <div className="flex justify-center mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d1d1f]">
            <span className="text-[12px] font-bold tracking-wider text-white">
              LF
            </span>
          </div>
        </div>
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-[#1d1d1f]">
          Reset password
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-semibold">
          We will send you instructions to reset your account credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="card-pad py-8 px-6 sm:px-10 border border-[#e8e8ed] shadow-none bg-white">
          {submitted ? (
            <div className="rounded-2xl bg-[#eafaf1] border border-[#c6f0d7] p-5 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#1b7a43] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[#1b7a43]">
                  Check your inbox
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#1b7a43]">
                  If that email is registered on our site, we have sent
                  instructions to reset your password.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    className="input pl-10"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button className="btn-primary w-full py-2.5">
                Send reset link
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
