"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { UsersApi } from "@/features/users/users.api";
import { CompanyApi } from "@/features/companies/api/companies.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

import EditRoleForm from "@/features/roles/components/EditRoleForm.jsx";

const ROLE_TITLE_MAP = {
    superadmin: "Superadmin",
    admin: "Admin",
    supervisor: "Supervisor",
    cleaner: "Cleaner",
};

export default function EditRoleContainer() {
    const { role, id } = useParams();
    const router = useRouter();
    const { companyId } = useCompanyId();
    useRequirePermission({
        module: MODULES.ROLES,
        action: "update",
    });
    const title = ROLE_TITLE_MAP[role] ?? "User";

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        company_id: "",
        age: "",
        password: "",
        confirmPassword: "",
    });

    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;

        Promise.all([
            CompanyApi.getAllCompanies(),
            UsersApi.getUserById(id),
        ])
            .then(([cRes, uRes]) => {
                if (cRes.success) setCompanies(cRes.data ?? []);
                if (uRes.success) {
                    const u = uRes.data;
                    setFormData({
                        name: u.name ?? "",
                        phone: u.phone ?? "",
                        company_id: u.company_id ?? "",
                        age: u.age ?? "",
                        password: "",
                        confirmPassword: "",
                    });
                }
            })
            .catch(() => toast.error("Failed to load data"))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async () => {
        if (!formData.name.trim()) return toast.error("Name is required");
        if (
            formData.password &&
            formData.password !== formData.confirmPassword
        ) {
            return toast.error("Passwords do not match");
        }

        setSaving(true);
        try {
            const payload = { ...formData };
            delete payload.confirmPassword;

            const res = await UsersApi.updateUser(id, payload);
            if (res.success) {
                toast.success(`${title} updated successfully`);
                router.push(
                    `/roles/${role}/${id}${companyId ? `?companyId=${companyId}` : ""}`
                );
            } else {
                toast.error(res.error);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-[var(--muted-foreground)]">
                Loading…
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <EditRoleForm
                title={title}
                formData={formData}
                setFormData={setFormData}
                companies={companies}
                saving={saving}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
            />
        </div>
    );
}
