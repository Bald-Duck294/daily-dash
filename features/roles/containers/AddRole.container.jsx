"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { UsersApi } from "@/features/users/users.api";
import { CompanyApi } from "@/features/companies/api/companies.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import AddRoleForm from "@/features/roles/components/AddRoleForm.jsx";
import { MODULES } from "@/shared/constants/permissions";
/* ================= Constants ================= */

const ROLE_ID_MAP = {
    superadmin: 1,
    admin: 2,
    supervisor: 3,
    user: 4,
    cleaner: 5,
};

const ROLE_TITLE_MAP = {
    superadmin: "Superadmin",
    admin: "Admin",
    supervisor: "Supervisor",
    user: "User",
    cleaner: "Cleaner",
};

export default function AddRoleContainer() {
    const { role } = useParams();
    const router = useRouter();
    const { companyId: currentCompanyId } = useCompanyId();

    /* ================= Permission ================= */
    useRequirePermission({
        module: MODULES.ROLES,
        action: "create",
    });

    /* ================= Derived ================= */
    const roleId = role ? ROLE_ID_MAP[role] : null;
    const title = role ? ROLE_TITLE_MAP[role] : "";

    /* ================= Guard ================= */
    useEffect(() => {
        if (role === undefined) return; // wait for params

        if (!ROLE_ID_MAP[role]) {
            toast.error("Invalid role");
            router.replace("/dashboard");
        }
    }, [role, router]);

    /* ================= State ================= */
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
        company_id: "",
        role_id: roleId,
        age: "",
    });

    /* ================= Sync role_id ================= */
    useEffect(() => {
        if (roleId) {
            setFormData((p) => ({ ...p, role_id: roleId }));
        }
    }, [roleId]);

    /* ================= Fetch companies ================= */
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await CompanyApi.getAllCompanies();
                if (res.success) {
                    setCompanies(res.data ?? []);

                    if (currentCompanyId) {
                        setFormData((p) => ({
                            ...p,
                            company_id: currentCompanyId,
                        }));
                    }
                }
            } catch {
                toast.error("Failed to fetch companies");
            }
        };

        fetchCompanies();
    }, [currentCompanyId]);

    /* ================= Submit ================= */
    const handleSubmit = async () => {
        if (!formData.name.trim())
            return toast.error("Name is required");

        if (!formData.phone || formData.phone.length !== 10)
            return toast.error("Phone must be exactly 10 digits");

        if (!formData.password || formData.password.length < 6)
            return toast.error("Password must be at least 6 characters");

        if (formData.password !== formData.confirm_password)
            return toast.error("Passwords do not match");

        if (!formData.company_id)
            return toast.error("Company is required");

        setLoading(true);

        try {
            const payload = { ...formData };
            delete payload.confirm_password;

            const res = await UsersApi.createUser(payload, payload.company_id);

            if (res.success) {
                toast.success(`${title} created successfully`);
                router.push(
                    `/roles/${role}${currentCompanyId ? `?companyId=${currentCompanyId}` : ""}`
                );
            } else {
                toast.error(res.error || "Failed to create user");
            }
        } catch {
            toast.error("Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    /* ================= Loading UI ================= */
    if (role === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-sm text-muted-foreground">
                    Loading add role page...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6">
            {/* ================= Header ================= */}
            <div className="mb-6 rounded-lg border p-4 sm:p-6 flex items-center gap-3 bg-[var(--surface)] border-[var(--border)]">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-md transition hover:bg-[var(--muted)] text-[var(--foreground)]"
                >
                    <ArrowLeft size={20} />
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">
                        Add New {title}
                    </h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Create a new {title.toLowerCase()} account
                    </p>
                </div>
            </div>

            {/* ================= Form ================= */}
            <AddRoleForm
                title={title}
                formData={formData}
                setFormData={setFormData}
                companies={companies}
                loading={loading}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
            />
        </div>
    );
}
