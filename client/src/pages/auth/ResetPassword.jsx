import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/auth.api";
import {
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      setSubmitting(true);
      await authApi.reset(token.trim(), password);
      setSuccess(true);
      toast.success("Password reset successful!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
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
          Create new password
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-semibold">
          Enter your email verification token to update credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="card-pad py-8 px-6 sm:px-10 border border-[#e8e8ed] shadow-none bg-white">
          {success ? (
            <div className="rounded-2xl bg-[#eafaf1] border border-[#c6f0d7] p-5 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#1b7a43] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[#1b7a43]">Success</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#1b7a43]">
                  Your password has been successfully updated. Redirecting to
                  login...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {!searchParams.has("token") && (
                <div>
                  <label className="label">Reset Token</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <ShieldCheck className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      className="input pl-10 font-mono text-xs"
                      placeholder="Paste token from email..."
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">New Password</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyRound className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    className="input pl-10 pr-10"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyRound className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    className="input pl-10 pr-10"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                className="btn-primary w-full mt-4 py-2.5"
                disabled={submitting}
              >
                {submitting ? "Updating password..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
