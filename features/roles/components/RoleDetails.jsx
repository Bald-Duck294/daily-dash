import { User, Mail, Phone } from "lucide-react";

export default function RoleDetails({ user }) {
  return (
    <div className="bg-[var(--background)] border rounded-lg p-6 grid md:grid-cols-2 gap-6">
      <Info label="Name" value={user.name} icon={<User size={16} />} />
      <Info label="Email" value={user.email || "N/A"} icon={<Mail size={16} />} />
      <Info label="Phone" value={user.phone || "—"} icon={<Phone size={16} />} />
      <Info label="User ID" value={`#${user.id}`} mono />
    </div>
  );
}

function Info({ label, value, icon, mono }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted-foreground)] mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {icon}
        <span className={mono ? "font-mono" : ""}>{value}</span>
      </div>
    </div>
  );
}
