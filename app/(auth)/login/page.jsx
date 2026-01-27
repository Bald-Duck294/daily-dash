"use client";

import { useState } from "react";
import { ShieldCheck, Phone, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthApi } from "@/features/auth/auth.api";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/features/auth/auth.slice";

export default function LoginPage() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await AuthApi.login(phone, password);

        setLoading(false);

        if (!result.success) {
            alert(result.error);
            return;
        }

        const user = result.data.user;
        const token = user.token;

        localStorage.setItem("accessToken", token);

        dispatch(
            loginSuccess({
                user,
                token,
            })
        );

        router.replace("/dashboard");
    };



    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
            <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-8 shadow-xl">
                {/* Icon */}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                    <ShieldCheck className="h-7 w-7 text-blue-600" />
                </div>

                {/* Title */}
                <h1 className="text-center text-xl font-semibold text-black">
                    SAFAI PORTAL
                </h1>
                <p className="mt-1 text-center text-sm text-gray-500">
                    Initialize an encrypted session to manage your workspace.
                </p>

                {/* Success message */}
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Account created. Please sign in to verify.
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {/* Phone */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Identification Number
                        </label>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <input
                                inputMode="numeric"
                                placeholder="Enter Mobile Number"
                                value={phone}
                                onChange={(e) =>
                                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                                }
                                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">
                                Access Key
                            </label>
                            <a
                                href="/forgot-password"
                                className="text-xs font-medium text-blue-600 hover:underline"
                            >
                                Forgot Key?
                            </a>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                            <Lock className="h-4 w-4 text-gray-400" />
                            <input
                                type="password"
                                placeholder="Enter Access Key"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                    >
                        <Lock className="h-4 w-4" />
                        {loading ? "Authenticating..." : "Authenticate Session"}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 border-t pt-4 text-center text-xs text-gray-500">
                    New administrator?{" "}
                    <a
                        href="/register"
                        className="font-semibold text-blue-600 hover:underline"
                    >
                        Request Portal Access
                    </a>
                </div>
            </div>
        </div>
    );
}
