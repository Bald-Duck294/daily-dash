import { Shield, Building, Clock } from "lucide-react";

export default function RoleMeta({ user }) {

    const ROLE_LABEL_MAP = {
        1: "Superadmin",
        2: "Admin",
        3: "Supervisor",
        4: "User",
        5: "Cleaner",
    };

    return (
        <div className="bg-[var(--background)] border rounded-lg p-6 grid md:grid-cols-2 gap-6">
            <Meta
                label="Role"
                value={
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full
      text-xs font-medium bg-blue-100 text-blue-700">
                        {ROLE_LABEL_MAP[user.role_id] || "Unknown"}
                    </span>
                }
                icon={<Shield size={16} />}
            />
            <Meta label="Company" value={user.company_id || "—"} icon={<Building size={16} />} />
            <Meta label="Created" value={format(user.created_at)} icon={<Clock size={16} />} />
            <Meta label="Updated" value={format(user.updated_at)} icon={<Clock size={16} />} />
        </div>
    );
}

const format = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : "—";

function Meta({ label, value, icon }) {
    return (
        <div>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">{label}</p>
            <div className="flex items-center gap-2">
                {icon}
                <span>{value}</span>
            </div>
        </div>
    );
}
