"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { user, login } = useAuth(); // login used to update context user
    const [fullName, setFullName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || "");
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const updates: any = {};
            if (fullName !== user?.full_name) updates.full_name = fullName;
            if (password) {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                updates.password = password;
                if (currentPassword) {
                    updates.current_password = currentPassword;
                }
            }

            if (Object.keys(updates).length === 0) {
                setMessage({ type: 'error', text: "No changes to save" });
                setIsLoading(false);
                return;
            }

            const res = await authService.updateProfile(updates);

            // Update context if name changed
            // Since AuthContext doesn't expose a simple 'updateUser' method, 
            // we might rely on the backend response or refresh.
            // But let's see if we can trigger a reload or utilize a refresh function if available.
            // For now, simple success message.

            setMessage({ type: 'success', text: "Profile updated successfully!" });
            setPassword("");
            setConfirmPassword("");
            setCurrentPassword("");

            // Ideally we should reload user from context here
            window.location.reload();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Failed to update profile" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

            <Card className="bg-[#1E1E2D] p-6 space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        {message && (
                            <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {message.text}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                disabled
                                value={user?.email || ""}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2.5 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2.5 text-white focus:border-blue-500 outline-none transition-colors"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-700">
                            <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2.5 text-white focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Enter current password (if set)"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Required if you have a password set.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2.5 text-white focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Leave blank to keep current password"
                                    />
                                </div>
                                {password && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded p-2.5 text-white focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
}
