"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { Mail, ShieldCheck, ArrowRight, RefreshCw, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function VerifyOtpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { login } = useAuth();

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (element.value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                // If empty and backspace, move previous
                inputRefs.current[index - 1]?.focus();
            } else {
                // Clear current
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split("").forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length !== 6) {
            setError("Please enter all 6 digits");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (!email) throw new Error("Email is missing");
            const response = await authService.verifyOtp(email, otpString);

            setSuccess("Verification successful! Redirecting...");

            // Short delay to show success animation
            setTimeout(() => {
                if (response && response.access_token) {
                    const userData = response.user || { email, id: "unknown" };
                    login(response.access_token, userData);
                    // router.push("/"); // Handled by login usually
                }
            }, 1000);

        } catch (err: any) {
            console.error("Verification error:", err);
            setError(err.message || "Invalid OTP code. Please try again.");
            // Shake effect or clear inputs could go here
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend || !email) return;

        try {
            await authService.resendOtp(email);
            setTimer(30);
            setCanResend(false);
            setSuccess("New code sent to your email.");
            setTimeout(() => setSuccess(null), 3000);
        } catch (e: any) {
            setError(e.message || "Failed to resend code");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4">
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 backdrop-blur-sm relative">

                {/* Decorative Top Accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <div className="p-8 md:p-12 space-y-8">

                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-2 animate-bounce-slow">
                            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>

                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Verify Your Account
                        </h1>

                        <div className="flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                            <p>We sent a 6-digit code to</p>
                            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-full text-sm font-medium text-gray-900 dark:text-gray-200">
                                <Mail className="w-4 h-4" />
                                {email || "your email"}
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 text-sm text-red-800 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800/50 animate-shake">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-3 p-4 text-sm text-green-800 bg-green-50 dark:bg-green-900/30 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800/50">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            {success}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center gap-2 sm:gap-4">
                                {otp.map((data, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength={1}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        value={data}
                                        onChange={(e) => handleChange(e.target, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        onPaste={handlePaste}
                                        className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200
                                            ${data
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-center mt-3 text-xs text-gray-400">
                                Paste code efficiently by pressing Ctrl+V
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Button
                                className="w-full h-12 text-lg font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300"
                                disabled={isLoading || otp.join("").length !== 6}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Verifying...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Verify Email <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>

                            <div className="flex flex-col items-center justify-center gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={!canResend}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors
                                        ${canResend
                                            ? "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                                            : "text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    {canResend ? (
                                        <>
                                            <RefreshCw className="w-4 h-4" /> Resend Code
                                        </>
                                    ) : (
                                        <span>Resend code in {timer}s</span>
                                    )}
                                </button>

                                <Link
                                    href="/sign-in"
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Login
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
