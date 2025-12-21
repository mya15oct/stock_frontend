"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";


function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered");
  const isVerified = searchParams.get("verified");

  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setLoginSuccess("");

    try {
      const response = await authService.login({
        email: email,
        password: password,
      });

      if (response?.access_token) {
        setLoginSuccess("Login successful! Redirecting...");
        console.log("LOGIN SUCCESS - SERVER TOKEN:", response.access_token); // DEBUG
        login(response.access_token, response.user);
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "facebook", token: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await authService.loginWithOAuth(provider, token);

      if (response?.access_token) {
        login(response.access_token, response.user);
      }
    } catch (err: any) {
      console.error("OAuth Error:", err);
      setError("OAuth login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // tokenResponse.access_token is what backend needs
      handleOAuthLogin("google", tokenResponse.access_token);
    },
    onError: () => setError("Google login failed"),
  });



  return (
    <div className="w-full max-w-sm bg-[#34344A] rounded-xl shadow-2xl p-6 border border-gray-700">
      <div className="text-center mb-5">
        <h1 className="text-xl font-bold text-white tracking-widest uppercase mb-2">
          SNOWBALL
        </h1>
        <h2 className="text-lg font-semibold text-white mb-1">Log in</h2>
      </div>

      {isVerified && (
        <div className="mb-5 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <p className="text-xs text-green-500">
            Email verified successfully! You can now sign in.
          </p>
        </div>
      )}

      <form onSubmit={handleManualLogin} className="space-y-3">
        {loginSuccess && (
          <div className="p-3 bg-green-500/10 border border-green-500/50 rounded text-green-400 text-xs text-center flex justify-center items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {loginSuccess}
          </div>
        )}
        {error && (
          <div className="p-2 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-400 ml-1">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#3F3F56] border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Type your email"
            required
          />
        </div>

        <div className="relative space-y-1">
          <span className="text-xs font-medium text-gray-400 ml-1">Password</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#3F3F56] border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
              placeholder="Type your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <Link
            href="/forgot-password"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-[#34344A] text-gray-400">or</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Google Login */}
        <button
          onClick={() => googleLogin()}
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 text-sm font-medium rounded-lg transition-colors border border-gray-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Log in with Google
        </button>

        {/* Facebook Login (Disabled) */}
        <button
          onClick={() => alert("This feature is under development")}
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-[#1877F2] hover:bg-[#155EC2] text-white text-sm font-medium rounded-lg transition-colors border border-transparent opacity-80"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Log in with Facebook
        </button>
      </div>

      <div className="mt-5 text-center">
        <p className="text-gray-400 text-xs">
          Don't have an account yet?{" "}
          <Link
            href="/sign-up"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Register!
          </Link>
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-700 flex justify-between text-[10px] text-gray-500">
        <Link href="#" className="hover:text-gray-300">Terms and conditions</Link>
        <Link href="#" className="hover:text-gray-300">Privacy policy</Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}
