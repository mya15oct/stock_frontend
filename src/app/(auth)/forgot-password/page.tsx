"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (!email.includes("@")) {
                throw new Error("Please enter a valid email address");
            }

            await authService.requestPasswordReset(email);

            setSuccess("OTP sent to your email!");

            // Redirect to Reset Password page after delay
            setTimeout(() => {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 1000);

        } catch (err: any) {
            setError(err.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
                    Forgot Password
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Enter your email address to receive an OTP code.
                </p>
            </div>

            {success && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    {success}
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300"
                        placeholder="your@email.com"
                        required
                    />
                </div>

                <Button className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    href="/sign-in"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-white transition-colors"
                >
                    &larr; Back to Log in
                </Link>
            </div>
        </Card>
    );
}
