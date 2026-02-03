"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ArrowLeft,
  Briefcase,
  Activity,
  Navigation,
  Users as UsersIcon,
  CheckCircle2,
  Clock
} from "lucide-react";
import { UsersApi } from "@/features/users/users.api";
import { AssignmentsApi } from "@/features/assignments/assignments.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";

export default function SupervisorViewPage() {
  const [supervisorData, setSupervisorData] = useState(null);
  const [assignedLocations, setAssignedLocations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const router = useRouter();
  const { companyId } = useCompanyId();

  const cleanerUserId = params.id;

  useEffect(() => {
    if (!cleanerUserId || !companyId) {
      setLoading(false);
      return;
    }
    fetchSupervisorDetails();
  }, [cleanerUserId, companyId]);

  const fetchSupervisorDetails = async () => {
    setLoading(true);
    try {
      const userRes = await UsersApi.getUserById(cleanerUserId, companyId);

      if (userRes.success) {
        setSupervisorData(userRes.data);

        const assignmentsRes = await AssignmentsApi.getAssignmentsByCleanerId(cleanerUserId, companyId);
        if (assignmentsRes.success) {
          setAssignedLocations(assignmentsRes.data);
        }

        setStats({
          total_assignments: assignmentsRes.data?.length || 0,
          active_locations: assignmentsRes.data?.filter((a) => a.status === "assigned").length || 0,
        });
      } else {
        toast.error("Supervisor not found");
      }
    } catch (error) {
      toast.error("Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  const handleViewLocation = (lat, lng) => {
    if (lat && lng) {
      window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50"><Loader size="large" color="#6366f1" /></div>;

  if (!supervisorData) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 font-medium mb-4">Supervisor not found</p>
          <button onClick={() => router.back()} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-slate-800">Supervisor Profile</h1>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl font-bold text-indigo-600 border border-indigo-100">
                        {supervisorData.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{supervisorData.name}</h2>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5"><Briefcase size={14}/> {supervisorData.role?.name || "Supervisor"}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="flex items-center gap-1.5"><Calendar size={14}/> Joined {new Date(supervisorData.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Briefcase size={18}/></div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Assignments</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">{stats.total_assignments}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle2 size={18}/></div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Locations</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">{stats.active_locations}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><UsersIcon size={18}/></div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Type</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800 capitalize">{supervisorData.role?.name || "N/A"}</p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left: Contact Info */}
              <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2"><User size={16}/> Contact Details</h3>
                      <div className="space-y-5">
                          <div>
                              <label className="text-xs font-medium text-slate-400 block mb-1">Email Address</label>
                              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                  <Mail size={16} className="text-slate-400"/> {supervisorData.email || "N/A"}
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-medium text-slate-400 block mb-1">Phone Number</label>
                              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                  <Phone size={16} className="text-slate-400"/> {supervisorData.phone || "N/A"}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Right: Assignments List */}
              <div className="lg:col-span-2">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
                      <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                              <MapPin size={16} className="text-indigo-500"/> Assigned Locations <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-2">{assignedLocations.length}</span>
                          </h3>
                      </div>

                      <div className="space-y-3">
                          {assignedLocations.length === 0 ? (
                              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                  <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                  <p className="text-slate-500 text-sm">No locations assigned yet.</p>
                              </div>
                          ) : (
                              assignedLocations.map((assignment) => (
                                  <div key={assignment.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-white hover:shadow-md transition-all group">
                                      <div className="flex justify-between items-start">
                                          <div>
                                              <h4 className="font-bold text-slate-800 text-sm mb-1">{assignment.locations?.name || "Unknown Location"}</h4>
                                              <p className="text-xs text-slate-500 flex items-start gap-1"><MapPin size={12} className="mt-0.5 shrink-0"/> {assignment.locations?.address || "No address"}</p>
                                          </div>
                                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${assignment.status === 'assigned' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                                              {assignment.status === 'assigned' ? 'Active' : 'Inactive'}
                                          </span>
                                      </div>
                                      
                                      <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                                          <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                                              <Clock size={12}/> Assigned {new Date(assignment.created_at).toLocaleDateString()}
                                          </div>
                                          {assignment.locations?.latitude && assignment.locations?.longitude && (
                                              <button 
                                                  onClick={() => handleViewLocation(assignment.locations.latitude, assignment.locations.longitude)}
                                                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                                              >
                                                  <Navigation size={12}/> View Map
                                              </button>
                                          )}
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}