import { Edit, Trash2 } from "lucide-react";
import { formatDate } from "../utils/formatDate";

export default function CompaniesTable({ companies, onDelete }) {
  return (
    <table className="w-full bg-white rounded-lg shadow">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-3 text-left">#</th>
          <th className="p-3 text-left">Name</th>
          <th className="p-3 text-left">Email</th>
          <th className="p-3 text-left">Status</th>
          <th className="p-3 text-left">Created</th>
          <th className="p-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {companies.map((c, i) => (
          <tr key={c.id} className="border-t hover:bg-gray-50">
            <td className="p-3">{i + 1}</td>
            <td className="p-3 font-medium">{c.name}</td>
            <td className="p-3">{c.contact_email}</td>
            <td className="p-3">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  c.status
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {c.status ? "Active" : "Inactive"}
              </span>
            </td>
            <td className="p-3 text-sm text-gray-500">
              {formatDate(c.created_at)}
            </td>
            <td className="p-3 flex gap-2">
              <Edit size={16} />
              <Trash2
                size={16}
                className="text-red-500 cursor-pointer"
                onClick={() => onDelete(c.id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
