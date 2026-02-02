// src/components/RoleSearch.jsx
import { Search } from "lucide-react";

export default function RoleSearch({ value, onChange }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search roles..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}
