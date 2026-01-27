"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CompanyApi } from "@/features/companies/api/companies.api";
import { UsersApi } from "@/features/users/users.api";
import {
    Building,
    Shield,
    UserCog,
    Users,
    UserCheck,
} from "lucide-react";

function StatCard({ label, value, href, loading, accent, icon: Icon }) {
    const router = useRouter();

    return (
        <button
            disabled={loading || !href}
            onClick={() => href && router.push(href)}
            className={`
        group relative w-full overflow-hidden rounded-2xl
        border border-[var(--sidebar-border)]
        bg-[var(--background)]
        p-5 text-left
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl
        disabled:opacity-60 disabled:cursor-not-allowed
      `}
        >
            {/* Accent gradient strip */}
            <div
                className={`absolute inset-x-0 top-0 h-1 ${accent}`}
            />

            {/* Soft glow on hover */}
            <div
                className={`pointer-events-none absolute inset-0 opacity-0
        group-hover:opacity-100 transition duration-300
        ${accent} blur-2xl`}
            />

            {loading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="h-8 w-8 rounded-lg bg-gray-300/40" />
                    <div className="h-7 w-12 rounded bg-gray-300/40" />
                    <div className="h-4 w-24 rounded bg-gray-300/40" />
                </div>
            ) : (
                <div className="relative z-10 flex items-start gap-4">
                    {/* Icon */}
                    <div
                        className={`
              flex h-10 w-10 items-center justify-center rounded-xl
              ${accent} text-white
            `}
                    >
                        <Icon size={20} />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col">
                        <span className="text-3xl font-semibold text-[var(--foreground)] leading-none">
                            {value}
                        </span>
                        <span className="mt-1 text-sm font-medium text-[var(--sidebar-muted)]">
                            {label}
                        </span>
                    </div>
                </div>
            )}
        </button>
    );
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({
        companies: 0,
        superadmin: 0,
        admin: 0,
        supervisor: 0,
        cleaner: 0,
    });

    useEffect(() => {
        async function load() {
            try {
                const [companiesRes, usersRes] = await Promise.all([
                    CompanyApi.getAllCompanies(),
                    UsersApi.getAllUsers(),
                ]);

                const users = usersRes?.data || [];

                setCounts({
                    companies: companiesRes?.data?.length || 0,
                    superadmin: users.filter(u => u.role_id === 1).length,
                    admin: users.filter(u => u.role_id === 2).length,
                    supervisor: users.filter(u => u.role_id === 3).length,
                    cleaner: users.filter(u => u.role_id === 5).length,
                });
            } catch (err) {
                console.error("Dashboard load failed", err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const cards = [
        {
            label: "Organizations",
            value: counts.companies,
            href: "/companies",
            accent: "bg-gradient-to-r from-blue-500 to-blue-400",
            icon: Building,
        },
        {
            label: "Super Admins",
            value: counts.superadmin,
            href: "/roles/superadmin",
            accent: "bg-gradient-to-r from-purple-500 to-fuchsia-500",
            icon: Shield,
        },
        {
            label: "Admins",
            value: counts.admin,
            href: "/roles/admin",
            accent: "bg-gradient-to-r from-green-500 to-emerald-400",
            icon: UserCog,
        },
        {
            label: "Supervisors",
            value: counts.supervisor,
            href: "/roles/supervisor",
            accent: "bg-gradient-to-r from-yellow-500 to-amber-400",
            icon: UserCheck,
        },
        {
            label: "Cleaners",
            value: counts.cleaner,
            href: "/roles/cleaner",
            accent: "bg-gradient-to-r from-pink-500 to-rose-400",
            icon: Users,
        },
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-xl font-semibold text-[var(--foreground)]">
                    Dashboard Overview
                </h1>
                <p className="mt-1 text-sm text-[var(--sidebar-muted)]">
                    High-level snapshot of system activity
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">

                {cards.map(card => (
                    <StatCard
                        key={card.label}
                        {...card}
                        loading={loading}
                    />
                ))}
            </div>

            {/* Company Statistics */}
            <section className="
  rounded-xl border border-[var(--sidebar-border)]
  bg-[var(--background)]
  p-4 sm:p-6
">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    Company Statistics
                </h2>
                <p className="mt-1 text-sm text-[var(--sidebar-muted)]">
                    Detailed analytics and trends will appear here.
                </p>

                <div className="mt-4 h-32 flex items-center justify-center rounded-lg border border-dashed border-[var(--sidebar-border)] text-sm text-[var(--sidebar-muted)]">
                    Coming soon
                </div>
            </section>
        </div>
    );
}
