"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ArrowLeft,
  Briefcase,
  ClipboardList,
  TrendingUp,
  Clock,
  CheckCircle,
  Activity,
  Building2,
  User,
  Navigation,
} from "lucide-react";
import { AssignmentsApi } from "@/features/assignments/assignments.api";
import { CleanerReviewApi } from "@/features/cleanerReview/cleanerReview.api.js";
import { useCompanyId } from "@/providers/CompanyProvider";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";

export default function CleanerViewPage() {
  const [cleanerData, setCleanerData] = useState(null);
  const [assignedLocations, setAssignedLocations] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cleanerUserId = searchParams.get("assignemtn");
  const { companyId } = useCompanyId();

  const assignmentId = params.id; // This is actually the assignment ID

  useEffect(() => {
    if (!assignmentId || !companyId) {
      console.log("Missing assignmentId or companyId");
      setLoading(false);
      return;
    }

    fetchCleanerDetails();
  }, [assignmentId, companyId]);

  const fetchCleanerDetails = async () => {
    setLoading(true);
    try {
      // First, get the assignment to extract cleaner_user_id
      const allAssignments = await AssignmentsApi.getAllAssignments(companyId);

      console.log(allAssignments, "all assignemtns 22 ");
      if (allAssignments.success) {
        const assignment = allAssignments.data?.data.find(
          (a) => a.id === assignmentId,
        );
        if (!assignment) {
          toast.error("Assignment not found");
          setLoading(false);
          return;
        }
        console.log(assignment, "assignment");

        const cleanerUserId = assignment.cleaner_user_id;
        setCleanerData(assignment.user); // User details from assignment

        // Fetch assigned locations
        const assignmentsRes = await AssignmentsApi.getAssignmentsByCleanerId(
          cleanerUserId,
          companyId,
        );

        console.log(assignmentsRes, "Sing assignment response");

        if (assignmentsRes.success) {
          setAssignedLocations(assignmentsRes.data);
        }

        // Fetch recent activities (cleaner reviews)
        const reviewsRes =
          await CleanerReviewApi.getCleanerReviewsByCleanerId(cleanerUserId);
        console.log(reviewsRes, "res review");

        if (reviewsRes.success) {
          setRecentActivities(reviewsRes.data.reviews.slice(0, 10)); // Last 10 activities
          setStats(reviewsRes.data.stats);
        }
      }
    } catch (error) {
      console.error("Error fetching cleaner details:", error);
      toast.error("Failed to fetch cleaner details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          background: "var(--cleaner-status-active-bg)",
          color: "var(--cleaner-status-active-text)",
        };

      case "ongoing":
        return {
          background: "var(--assignment-accent-bg)",
          color: "var(--assignment-accent-text)",
        };

      case "pending":
        return {
          background: "var(--assignment-warning-bg)",
          color: "var(--assignment-warning-text)",
        };

      default:
        return {
          background: "var(--muted)",
          color: "var(--muted-foreground)",
        };
    }
  };

  const handleViewLocation = (lat, lng) => {
    if (lat && lng) {
      window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        style={{ background: "var(--cleaner-bg)" }}
      >
        <Loader
          size="large"
          color="var(--cleaner-primary-text)"
          message="Loading cleaner details..."
        />
      </div>
    );
  }

  if (!cleanerData) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        style={{ background: "var(--cleaner-bg)" }}
      >
        <div className="text-center">
          <p
            className="mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            Cleaner not found
          </p>

          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              background: "var(--cleaner-primary-bg)",
              color: "var(--cleaner-primary-text)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.filter = "brightness(0.95)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.filter = "none")
            }
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div
        className="min-h-screen p-3 sm:p-4 md:p-6"
        style={{ background: "var(--cleaner-bg)" }}
      >

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div
            className="rounded-xl overflow-hidden mb-6"
            style={{
              background: "var(--cleaner-surface)",
              border: "1px solid var(--cleaner-border)",
              boxShadow: "var(--cleaner-shadow)",
            }}
          >
            <div
              className="px-6 py-6"
              style={{ background: "var(--cleaner-primary-bg)" }}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--cleaner-primary-text)" }}
                  onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(255,255,255,0.12)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="flex-1">
                  <h1
                    className="text-2xl font-bold flex items-center gap-3"
                    style={{ color: "var(--cleaner-primary-text)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.2)" }}
                    >
                      <User className="w-6 h-6" />
                    </div>
                    {cleanerData.name}
                  </h1>

                  <p
                    className="text-sm mt-1"
                    style={{
                      color: "var(--cleaner-primary-text)",
                      opacity: 0.85,
                    }}
                  >
                    Cleaner Profile & Activity
                  </p>

                </div>
              </div>
            </div>
          </div>


          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Total Reviews */}
            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--cleaner-surface)",
                border: "1px solid var(--cleaner-border)",
                boxShadow: "var(--cleaner-shadow)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-lg"
                  style={{ background: "var(--assignment-accent-bg)" }}
                >
                  <Briefcase
                    className="w-5 h-5"
                    style={{ color: "var(--assignment-accent-text)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{ color: "var(--cleaner-subtitle)" }}
                  >
                    Total Reviews
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--cleaner-title)" }}
                  >
                    {stats.total_reviews || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--cleaner-surface)",
                border: "1px solid var(--cleaner-border)",
                boxShadow: "var(--cleaner-shadow)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-lg"
                  style={{ background: "var(--cleaner-status-active-bg)" }}
                >
                  <CheckCircle
                    className="w-5 h-5"
                    style={{ color: "var(--cleaner-status-active-text)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{ color: "var(--cleaner-subtitle)" }}
                  >
                    Completed
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--cleaner-title)" }}
                  >
                    {stats.completed_reviews || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Ongoing */}
            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--cleaner-surface)",
                border: "1px solid var(--cleaner-border)",
                boxShadow: "var(--cleaner-shadow)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-lg"
                  style={{ background: "var(--assignment-warning-bg)" }}
                >
                  <Clock
                    className="w-5 h-5"
                    style={{ color: "var(--assignment-warning-text)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{ color: "var(--cleaner-subtitle)" }}
                  >
                    Ongoing
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--cleaner-title)" }}
                  >
                    {stats.ongoing_reviews || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Today’s Tasks */}
            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--cleaner-surface)",
                border: "1px solid var(--cleaner-border)",
                boxShadow: "var(--cleaner-shadow)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-lg"
                  style={{ background: "var(--stat-green-gradient)" }}
                >
                  <TrendingUp
                    className="w-5 h-5"
                    style={{ color: "var(--trend-up)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{ color: "var(--cleaner-subtitle)" }}
                  >
                    Today&apos;s Tasks
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--cleaner-title)" }}
                  >
                    {stats.total_tasks_today || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Cleaner Info & Assigned Locations */}
            <div className="lg:col-span-1 space-y-6">
              {/* Cleaner Information Card */}
              <div
                className="rounded-xl p-6"
                style={{
                  background: "var(--cleaner-surface)",
                  border: "1px solid var(--cleaner-border)",
                  boxShadow: "var(--cleaner-shadow)",
                }}
              >
                <h2
                  className="text-lg font-semibold mb-4 flex items-center gap-2"
                  style={{ color: "var(--cleaner-title)" }}
                >
                  <User
                    className="w-5 h-5"
                    style={{ color: "var(--assignment-accent-text)" }}
                  />
                  Cleaner Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label
                      className="text-xs uppercase font-medium"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Full Name
                    </label>
                    <p
                      className="text-sm font-medium mt-1"
                      style={{ color: "var(--cleaner-title)" }}
                    >
                      {cleanerData.name}
                    </p>
                  </div>

                  {cleanerData.email && (
                    <div>
                      <label
                        className="text-xs uppercase font-medium"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Email
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail
                          className="w-4 h-4"
                          style={{ color: "var(--muted-foreground)" }}
                        />
                        <p
                          className="text-sm"
                          style={{ color: "var(--cleaner-subtitle)" }}
                        >
                          {cleanerData.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {cleanerData.phone && (
                    <div>
                      <label
                        className="text-xs uppercase font-medium"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Phone
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone
                          className="w-4 h-4"
                          style={{ color: "var(--muted-foreground)" }}
                        />
                        <p
                          className="text-sm"
                          style={{ color: "var(--cleaner-subtitle)" }}
                        >
                          {cleanerData.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {cleanerData.role && (
                    <div>
                      <label
                        className="text-xs uppercase font-medium"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Role
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Briefcase
                          className="w-4 h-4"
                          style={{ color: "var(--muted-foreground)" }}
                        />
                        <p
                          className="text-sm"
                          style={{ color: "var(--cleaner-subtitle)" }}
                        >
                          {cleanerData.role.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {cleanerData.created_at && (
                    <div>
                      <label
                        className="text-xs uppercase font-medium"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Joined Date
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar
                          className="w-4 h-4"
                          style={{ color: "var(--muted-foreground)" }}
                        />
                        <p
                          className="text-sm"
                          style={{ color: "var(--cleaner-subtitle)" }}
                        >
                          {new Date(cleanerData.created_at).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long", day: "numeric" }
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Locations Card */}
              <div
                className="rounded-xl p-6"
                style={{
                  background: "var(--cleaner-surface)",
                  border: "1px solid var(--cleaner-border)",
                  boxShadow: "var(--cleaner-shadow)",
                }}
              >
                <h2
                  className="text-lg font-semibold mb-4 flex items-center gap-2"
                  style={{ color: "var(--cleaner-title)" }}
                >
                  <MapPin
                    className="w-5 h-5"
                    style={{ color: "var(--assignment-accent-text)" }}
                  />
                  Assigned Locations ({assignedLocations.length})
                </h2>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {assignedLocations.length === 0 ? (
                    <p
                      className="text-sm text-center py-4"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      No locations assigned
                    </p>
                  ) : (
                    assignedLocations.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-3 rounded-lg transition-colors"
                        style={{
                          border: "1px solid var(--cleaner-border)",
                        }}
                        onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--assignment-accent-bg)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3
                              className="font-medium text-sm"
                              style={{ color: "var(--cleaner-title)" }}
                            >
                              {assignment.locations?.name || "Unknown Location"}
                            </h3>

                            {assignment.locations?.address && (
                              <p
                                className="text-xs mt-1"
                                style={{ color: "var(--cleaner-subtitle)" }}
                              >
                                {assignment.locations.address}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className="text-xs px-2 py-1 rounded-full font-medium"
                                style={
                                  assignment.status === "assigned"
                                    ? {
                                      background:
                                        "var(--cleaner-status-active-bg)",
                                      color:
                                        "var(--cleaner-status-active-text)",
                                    }
                                    : {
                                      background:
                                        "var(--cleaner-status-inactive-bg)",
                                      color:
                                        "var(--cleaner-status-inactive-text)",
                                    }
                                }
                              >
                                {assignment.status}
                              </span>
                            </div>
                          </div>

                          {assignment.locations?.latitude &&
                            assignment.locations?.longitude && (
                              <button
                                onClick={() =>
                                  handleViewLocation(
                                    assignment.locations.latitude,
                                    assignment.locations.longitude
                                  )
                                }
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                  color: "var(--assignment-accent-text)",
                                }}
                                onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "var(--assignment-accent-bg)")
                                }
                                onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                                }
                                title="View on Map"
                              >
                                <Navigation className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>


            {/* Right Column - Recent Activities */}
            <div className="lg:col-span-2">
              <div
                className="rounded-xl p-6"
                style={{
                  background: "var(--cleaner-surface)",
                  border: "1px solid var(--cleaner-border)",
                  boxShadow: "var(--cleaner-shadow)",
                }}
              >
                <h2
                  className="text-lg font-semibold mb-4 flex items-center gap-2"
                  style={{ color: "var(--cleaner-title)" }}
                >
                  <Activity
                    className="w-5 h-5"
                    style={{ color: "var(--assignment-accent-text)" }}
                  />
                  Recent Activities (Last 10)
                </h2>

                <div className="space-y-4">
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-12">
                      <ClipboardList
                        className="w-12 h-12 mx-auto mb-3"
                        style={{ color: "var(--muted-foreground)" }}
                      />
                      <p style={{ color: "var(--muted-foreground)" }}>
                        No activities found
                      </p>
                    </div>
                  ) : (
                    recentActivities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="rounded-lg p-4 transition-colors"
                        style={{ border: "1px solid var(--cleaner-border)" }}
                        onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--assignment-accent-bg)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="font-medium"
                                style={{ color: "var(--cleaner-title)" }}
                              >
                                #{index + 1} –{" "}
                                {activity.location?.name || "Unknown Location"}
                              </span>

                              <span
                                className="text-xs px-2 py-1 rounded-full font-medium"
                                style={getStatusColor(activity.status)}
                              >
                                {activity.status}
                              </span>
                            </div>

                            {/* Address */}
                            {activity.address && (
                              <div
                                className="flex items-start gap-2 text-sm mb-2"
                                style={{ color: "var(--cleaner-subtitle)" }}
                              >
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{activity.address}</span>
                              </div>
                            )}

                            {/* Tasks */}
                            {activity.tasks && activity.tasks.length > 0 && (
                              <div className="mt-2">
                                <p
                                  className="text-xs mb-1"
                                  style={{ color: "var(--muted-foreground)" }}
                                >
                                  Tasks:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {activity.tasks.map((task, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-1 rounded"
                                      style={{
                                        background: "var(--muted)",
                                        color: "var(--cleaner-subtitle)",
                                      }}
                                    >
                                      {task}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Score */}
                            {activity.score && (
                              <div className="mt-2 flex items-center gap-2">
                                <TrendingUp
                                  className="w-4 h-4"
                                  style={{ color: "var(--trend-up)" }}
                                />
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: "var(--trend-up)" }}
                                >
                                  Score: {activity.score}/10
                                </span>
                              </div>
                            )}

                            {/* Timestamp */}
                            <div
                              className="flex items-center gap-2 mt-2 text-xs"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(activity.created_at).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
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
    </>
  );
}
