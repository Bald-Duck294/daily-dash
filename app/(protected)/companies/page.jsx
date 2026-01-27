/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";

import Loader from "@/components/ui/Loader";
import { useCompanyId } from "@/providers/CompanyProvider";

import {
    useCompanies,
    useDeleteCompany,
    useToggleCompanyStatus,
} from "@/features/companies/queries/companies.queries";

import CompaniesHeader from "@/features/companies/components/CompaniesHeader";
import CompaniesToolbar from "@/features/companies/components/CompaniesToolbar";
import CompaniesTable from "@/features/companies/components/CompaniesTable";
import CompaniesCards from "@/features/companies/components/CompaniesCards";

export default function CompaniesPage() {
    const router = useRouter();
    const { setCompanyId } = useCompanyId();

    /* ------------------ QUERY ------------------ */
    const {
        data,
        isLoading,
        isError,
    } = useCompanies();

    const companies = data ?? [];
    console.log("companies from API:", data);

    const deleteCompany = useDeleteCompany();
    const toggleStatus = useToggleCompanyStatus();

    /* ------------------ UI STATE ------------------ */
    const [search, setSearch] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    /* ------------------ DERIVED DATA ------------------ */
    const filteredCompanies = useMemo(() => {
        const q = search.toLowerCase();

        return companies.filter(
            (c) =>
                c.name?.toLowerCase().includes(q) ||
                c.contact_email?.toLowerCase().includes(q)
        );
    }, [companies, search]);

    // ⚠️ This is still client-side slicing (not real pagination)
    const visibleCompanies = filteredCompanies.slice(0, entriesPerPage);

    /* ------------------ HANDLERS ------------------ */
    const handleDelete = (id) => {
        deleteCompany.mutate(id);
    };

    const handleStatusToggle = (id, status) => {
        toggleStatus.mutate({ id, status: !status });
    };

    const handleViewCompany = (id) => {
        setCompanyId(String(id));
        router.push(`/clientDashboard/${id}`);
    };

    /* ------------------ STATES ------------------ */
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="large" message="Loading organizations..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-600">
                Failed to load companies.
            </div>
        );
    }

    /* ------------------ RENDER ------------------ */
    return (
        <>
            <Toaster position="top-center" />

            <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <CompaniesHeader />

                    <CompaniesToolbar
                        search={search}
                        onSearch={setSearch}
                        companies={filteredCompanies}
                        entriesPerPage={entriesPerPage}
                        onEntriesChange={setEntriesPerPage}
                    />

                    {/* Desktop */}
                    <div className="hidden md:block">
                        <CompaniesTable
                            companies={visibleCompanies}
                            onDelete={handleDelete}
                            onToggleStatus={handleStatusToggle}
                            onView={handleViewCompany}
                        />
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden">
                        <CompaniesCards
                            companies={visibleCompanies}
                            onDelete={handleDelete}
                            onToggleStatus={handleStatusToggle}
                            onView={handleViewCompany}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
