"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Scale,
  Sparkles,
  BookOpen,
  Plus,
  AlertCircle,
  HelpCircle,
  FileText,
  Clock,
  ArrowRight,
  Receipt,
  AlertTriangle,
  Layers,
  Activity,
  Lock,
  ArrowLeft
} from "lucide-react";
import { useCompaniesDropdown } from "@/features/dropdownList/dropdownlist.query";
import { useCompanyId } from "@/providers/CompanyProvider";
import {
  useRuleBooks,
  useActiveRuleBook,
  useRuleBookById,
  useCreateRuleBook,
  usePublishRuleBook,
  useSeedDefaultRuleBook,
  useAddRuleToBook,
  useUpdateRule,
  useDeleteRule,
  usePenalties,
  usePenaltySummary,
  useViolations,
  useApprovePenalty,
  useRejectPenalty,
  useDisputePenalty,
  useReversePenalty,
  useCompanySlaRulesStatus
} from "@/features/slaPenalty/slaPenalty.queries";
import toast, { Toaster } from "react-hot-toast";
import Loader from "@/components/ui/Loader";

import RuleBookHeader from "./components/RuleBookHeader";
import RuleCard from "./components/RuleCard";
import RuleModal from "./components/RuleModal";
import RulePreviewModal from "./components/RulePreviewModal";
import PublishModal from "./components/PublishModal";

import PenaltySummaryCards from "./components/ledger/PenaltySummaryCards";
import PenaltyFilters from "./components/ledger/PenaltyFilters";
import PenaltyTable from "./components/ledger/PenaltyTable";
import PenaltyDetailModal from "./components/ledger/PenaltyDetailModal";
import ApprovalActionModal from "./components/ledger/ApprovalActionModal";
import ViolationsStream from "./components/ledger/ViolationsStream";

export default function SlaPenaltyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCompanyId = searchParams.get("companyId");
  const { user } = useSelector((state) => state.auth);
  const { companyId: contextCompanyId } = useCompanyId();

  const isSuperAdmin = Number(user?.role_id) === 1;

  // Companies dropdown for superadmin
  const {
    data: companies = [],
    isLoading: isLoadingCompanies
  } = useCompaniesDropdown();

  // Effective company ID
  const effectiveCompanyId = isSuperAdmin
    ? urlCompanyId || (companies?.length > 0 ? String(companies[0].id) : "")
    : String(user?.company_id || contextCompanyId || "");

  const handleSelectCompany = (newCompanyId) => {
    router.push(`/sla-penalty?companyId=${newCompanyId}`);
  };

  // Contractual SLA Rules feature status for effective organization (configurations table: sla_rules)
  const {
    data: slaRulesStatus,
    isLoading: isLoadingSlaRulesStatus
  } = useCompanySlaRulesStatus(effectiveCompanyId, Boolean(effectiveCompanyId));
  const isSlaRulesActive = Boolean(slaRulesStatus?.is_active);

  // Top-level Navigation View Mode: "LEDGER" | "RULE_BOOKS" | "VIOLATIONS"
  const [mainView, setMainView] = useState("LEDGER");

  // ==========================================
  // PHASE 1: RULE BOOKS & CLAUSES QUERIES
  // ==========================================
  const {
    data: booksResponse,
    isLoading: isLoadingBooks,
    refetch: refetchBooks
  } = useRuleBooks(effectiveCompanyId);

  const {
    data: activeBook,
    isLoading: isLoadingActive,
    refetch: refetchActive
  } = useActiveRuleBook(effectiveCompanyId);

  const createBookMutation = useCreateRuleBook();
  const publishMutation = usePublishRuleBook();
  const seedMutation = useSeedDefaultRuleBook();
  const addRuleMutation = useAddRuleToBook();
  const updateRuleMutation = useUpdateRule();
  const deleteRuleMutation = useDeleteRule();

  const allBooks = booksResponse?.data || [];
  const draftBookSummary = allBooks.find((b) => b.status === "DRAFT");

  const [selectedBookTab, setSelectedBookTab] = useState("ACTIVE");

  useEffect(() => {
    if (!activeBook && draftBookSummary) {
      setSelectedBookTab("DRAFT");
    } else if (activeBook && selectedBookTab !== "DRAFT") {
      setSelectedBookTab("ACTIVE");
    }
  }, [activeBook, draftBookSummary]);

  const { data: fullDraftBook } = useRuleBookById(draftBookSummary?.id, effectiveCompanyId);
  const currentBook = selectedBookTab === "ACTIVE" ? activeBook : (fullDraftBook || draftBookSummary);
  const isViewingDraft = currentBook?.status === "DRAFT";

  // Rule Modals
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [previewingRule, setPreviewingRule] = useState(null);

  // ==========================================
  // PHASE 2: PENALTY LEDGER & APPROVALS
  // ==========================================
  const [penaltyFilters, setPenaltyFilters] = useState({
    status: "",
    scope: "",
    search: "",
    cleaner_id: "",
    cleaner_name: ""
  });

  const {
    data: penaltiesResponse,
    isLoading: isLoadingPenalties,
    refetch: refetchPenalties
  } = usePenalties(effectiveCompanyId, {
    status: penaltyFilters.status || undefined,
    scope: penaltyFilters.scope || undefined,
    cleaner_id: penaltyFilters.cleaner_id || undefined,
    page: 1,
    limit: 50
  });

  const {
    data: penaltySummary,
    isLoading: isLoadingSummary,
    refetch: refetchSummary
  } = usePenaltySummary(effectiveCompanyId, {
    cleaner_id: penaltyFilters.cleaner_id || undefined
  });

  const {
    data: violationsResponse,
    isLoading: isLoadingViolations,
    refetch: refetchViolations
  } = useViolations(effectiveCompanyId, { limit: 20 });

  const approveMutation = useApprovePenalty();
  const rejectMutation = useRejectPenalty();
  const disputeMutation = useDisputePenalty();
  const reverseMutation = useReversePenalty();

  // Ledger Modals
  const [selectedPenaltyForDetail, setSelectedPenaltyForDetail] = useState(null);
  const [actionModalState, setActionModalState] = useState({
    isOpen: false,
    penalty: null,
    actionType: "APPROVE"
  });

  const handleFilterChange = (key, value) => {
    setPenaltyFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "cleaner_id" && !value) {
        next.cleaner_name = "";
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setPenaltyFilters({ status: "", scope: "", search: "", cleaner_id: "", cleaner_name: "" });
  };

  const handleSelectCleaner = (cleaner) => {
    if (!cleaner) return;
    const cleanerId = String(cleaner.id || cleaner.cleaner_user_id || "");
    const cleanerName = cleaner.name || `Cleaner #${cleanerId}`;
    setPenaltyFilters((prev) => {
      // Toggle if already selected
      if (prev.cleaner_id === cleanerId) {
        return { ...prev, cleaner_id: "", cleaner_name: "" };
      }
      return { ...prev, cleaner_id: cleanerId, cleaner_name: cleanerName };
    });
  };

  // Filter penalties client-side for search query if provided
  const rawPenalties = penaltiesResponse?.data || [];
  const filteredPenalties = rawPenalties.filter((item) => {
    if (!penaltyFilters.search) return true;
    const query = penaltyFilters.search.toLowerCase();
    const penaltyNum = (item.penalty_number || "").toLowerCase();
    const cleanerName = (item.cleaner?.name || "").toLowerCase();
    const ruleCode = (item.rule_code || "").toLowerCase();
    const ruleName = (item.rule?.name || "").toLowerCase();
    return (
      penaltyNum.includes(query) ||
      cleanerName.includes(query) ||
      ruleCode.includes(query) ||
      ruleName.includes(query)
    );
  });

  // Action modal submit
  const handleActionSubmit = async (payload) => {
    const { penalty, actionType } = actionModalState;
    if (!penalty?.id) return;

    try {
      if (actionType === "APPROVE") {
        await approveMutation.mutateAsync({
          penaltyId: penalty.id,
          companyId: effectiveCompanyId,
          data: payload
        });
        toast.success(`Penalty ${penalty.penalty_number} approved successfully`);
      } else if (actionType === "REJECT") {
        await rejectMutation.mutateAsync({
          penaltyId: penalty.id,
          companyId: effectiveCompanyId,
          data: payload
        });
        toast.success(`Penalty ${penalty.penalty_number} rejected / waived`);
      } else if (actionType === "DISPUTE") {
        await disputeMutation.mutateAsync({
          penaltyId: penalty.id,
          companyId: effectiveCompanyId,
          data: payload
        });
        toast.success(`Penalty ${penalty.penalty_number} flagged for dispute`);
      } else if (actionType === "REVERSE") {
        await reverseMutation.mutateAsync({
          penaltyId: penalty.id,
          companyId: effectiveCompanyId,
          data: payload
        });
        toast.success(`Penalty ${penalty.penalty_number} reversed successfully`);
      }

      setActionModalState({ isOpen: false, penalty: null, actionType: "APPROVE" });
      refetchPenalties();
      refetchSummary();
      refetchViolations();
    } catch (err) {
      toast.error(err.message || `Failed to process ${actionType.toLowerCase()}`);
    }
  };

  // Phase 1 Handlers
  const handleSeedDefault = async () => {
    try {
      const res = await seedMutation.mutateAsync({
        companyId: effectiveCompanyId,
        autoPublish: true
      });
      toast.success(res.message || "Standard SLA penalty rule book initialized and published!");
      refetchBooks();
      refetchActive();
    } catch (err) {
      toast.error(err.message || "Failed to seed default rules");
    }
  };

  const handleCreateDraft = async () => {
    try {
      await createBookMutation.mutateAsync({
        company_id: effectiveCompanyId,
        name: `SLA Penalty Rule Book (Draft)`
      });
      toast.success("New draft rule book version created");
      refetchBooks();
      setSelectedBookTab("DRAFT");
    } catch (err) {
      toast.error(err.message || "Failed to create draft version");
    }
  };

  const handlePublish = async () => {
    if (!currentBook?.id) return;
    try {
      await publishMutation.mutateAsync({
        id: currentBook.id,
        companyId: effectiveCompanyId
      });
      toast.success(`Rule Book Version ${currentBook.version} published successfully!`);
      setIsPublishModalOpen(false);
      refetchBooks();
      refetchActive();
      setSelectedBookTab("ACTIVE");
    } catch (err) {
      toast.error(err.message || "Failed to publish rule book");
    }
  };

  const handleSaveRule = async (ruleData) => {
    if (!currentBook?.id) {
      toast.error("No active draft rule book selected");
      return;
    }

    try {
      if (editingRule) {
        await updateRuleMutation.mutateAsync({
          ruleId: editingRule.id,
          companyId: effectiveCompanyId,
          ruleData,
          ruleBookId: currentBook.id
        });
        toast.success(`Rule "${ruleData.rule_code}" updated successfully`);
      } else {
        await addRuleMutation.mutateAsync({
          ruleBookId: currentBook.id,
          companyId: effectiveCompanyId,
          ruleData
        });
        toast.success(`Rule "${ruleData.rule_code}" added to draft book`);
      }

      setIsRuleModalOpen(false);
      setEditingRule(null);
      refetchBooks();
    } catch (err) {
      toast.error(err.message || "Failed to save rule clause");
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm("Are you sure you want to delete this rule clause?")) return;
    try {
      await deleteRuleMutation.mutateAsync({
        ruleId,
        companyId: effectiveCompanyId,
        ruleBookId: currentBook?.id
      });
      toast.success("Rule clause removed");
      refetchBooks();
    } catch (err) {
      toast.error(err.message || "Failed to delete rule");
    }
  };

  const isLoadingInitial = isLoadingCompanies || (isLoadingBooks && isLoadingPenalties);

  if (isLoadingInitial) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Enforce Super Admin Feature Control Guard:
  // If user is not super admin and the company does NOT have sla_rules enabled, block view!
  if (!isSuperAdmin && !isLoadingSlaRulesStatus && !isSlaRulesActive) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200/80 dark:border-slate-800 text-center max-w-xl mx-auto shadow-sm my-16">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-200/60 dark:border-amber-800/40">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            SLA Management Inactive
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
            The contractual SLA Management module is currently not enabled for your organization in the system configuration. Please contact your system administrator to activate this feature.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const rulesList = currentBook?.rules || [];
  const violationsList = violationsResponse?.data || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Navigation & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2.5 cursor-pointer bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
                <Scale className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                SLA Management
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automated contractual compliance, financial deduction ledger, and approval workflow.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setMainView("LEDGER")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mainView === "LEDGER"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Penalty Ledger
            {penaltySummary?.pending_count > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {penaltySummary.pending_count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMainView("RULE_BOOKS")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mainView === "RULE_BOOKS"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Rule Books & Clauses
          </button>

          <button
            onClick={() => setMainView("VIOLATIONS")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mainView === "VIOLATIONS"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Live Violations
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: PENALTY LEDGER & APPROVAL QUEUE (PHASE 2)        */}
      {/* ======================================================== */}
      {mainView === "LEDGER" && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <PenaltySummaryCards
            summary={penaltySummary}
            isLoading={isLoadingSummary}
          />

          {/* Filters Bar */}
          <PenaltyFilters
            filters={penaltyFilters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            cleanerFilterCount={
              penaltyFilters.cleaner_id
                ? (penaltiesResponse?.pagination?.total ?? filteredPenalties.length)
                : null
            }
          />

          {/* Penalties Table / Responsive Cards */}
          <PenaltyTable
            penalties={filteredPenalties}
            isLoading={isLoadingPenalties}
            onViewDetails={(item) => setSelectedPenaltyForDetail(item)}
            onOpenActionModal={(penalty, actionType) =>
              setActionModalState({ isOpen: true, penalty, actionType })
            }
            onSelectCleaner={handleSelectCleaner}
            selectedCleanerId={penaltyFilters.cleaner_id}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: RULE BOOKS & CLAUSES (PHASE 1)                   */}
      {/* ======================================================== */}
      {mainView === "RULE_BOOKS" && (
        <div className="space-y-6">
          <RuleBookHeader
            companies={companies}
            selectedCompanyId={effectiveCompanyId}
            onSelectCompany={handleSelectCompany}
            isSuperAdmin={isSuperAdmin}
            currentBook={currentBook}
            activeBook={activeBook}
            draftBook={draftBookSummary}
            selectedTab={selectedBookTab}
            onSelectTab={setSelectedBookTab}
            onOpenAddModal={() => {
              setEditingRule(null);
              setIsRuleModalOpen(true);
            }}
            onOpenPublishModal={() => setIsPublishModalOpen(true)}
            onSeedDefault={handleSeedDefault}
            onCreateDraft={handleCreateDraft}
            isSeeding={seedMutation.isLoading}
          />

          {rulesList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rulesList.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  isDraft={isViewingDraft}
                  onEdit={(r) => {
                    setEditingRule(r);
                    setIsRuleModalOpen(true);
                  }}
                  onDelete={handleDeleteRule}
                  onSimulate={(r) => setPreviewingRule(r)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                No Penalty Rule Clauses Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                {isViewingDraft
                  ? "This draft rule book has no clauses configured yet. Add your first rule or seed standard defaults."
                  : "No published rule book is active for this organization. Seed the standard baseline rules to begin."}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleSeedDefault}
                  disabled={seedMutation.isLoading}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 px-4 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {seedMutation.isLoading ? "Seeding..." : "Seed Default Baseline Rules"}
                </button>

                {isViewingDraft && (
                  <button
                    onClick={() => {
                      setEditingRule(null);
                      setIsRuleModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Custom Rule Clause
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: LIVE VIOLATIONS STREAM (PHASE 2)                 */}
      {/* ======================================================== */}
      {mainView === "VIOLATIONS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Detected SLA Infractions Stream
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time compliance log of breaches identified by automated inspection audits.
              </p>
            </div>
            <button
              onClick={() => refetchViolations()}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              Refresh
            </button>
          </div>

          <ViolationsStream
            violations={violationsList}
            isLoading={isLoadingViolations}
          />
        </div>
      )}

      {/* SLA Penalty Architectural Guidance */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6">
        <div className="flex items-start gap-3.5">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              SLA Penalty Rule Book Governance & Financial Integrity
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  Two-Tier Hierarchy & Immutability:
                </strong>{" "}
                Published Rule Books are immutable to prevent retroactively corrupting previous deductions. Staging changes requires creating a new draft version.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  Defensible Calculation Snapshots:
                </strong>{" "}
                Every assessed penalty preserves a frozen mathematical JSON snapshot of the formula, rate cards, caps, and input review metrics for audit proof.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  Append-Only Audit Trail:
                </strong>{" "}
                All status transitions (creation, approval, dispute, rejection, reversal) are strictly recorded with user attribution and reason notes.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  Deduplication Keys:
                </strong>{" "}
                Every penalty ledger entry generates a cryptographic deduplication key (`PEN:COMPANY:CLEANER:RULE:DATE`) ensuring no cleaner is ever penalized twice for the same violation.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Phase 1 Modals */}
      <RuleModal
        isOpen={isRuleModalOpen}
        onClose={() => {
          setIsRuleModalOpen(false);
          setEditingRule(null);
        }}
        onSubmit={handleSaveRule}
        initialData={editingRule}
        isSubmitting={addRuleMutation.isLoading || updateRuleMutation.isLoading}
      />

      <RulePreviewModal
        isOpen={Boolean(previewingRule)}
        onClose={() => setPreviewingRule(null)}
        rule={previewingRule}
        companyId={effectiveCompanyId}
      />

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handlePublish}
        book={currentBook}
        isPublishing={publishMutation.isLoading}
      />

      {/* Phase 2 Modals */}
      <PenaltyDetailModal
        penalty={selectedPenaltyForDetail}
        onClose={() => setSelectedPenaltyForDetail(null)}
        onOpenActionModal={(penalty, actionType) =>
          setActionModalState({ isOpen: true, penalty, actionType })
        }
      />

      <ApprovalActionModal
        isOpen={actionModalState.isOpen}
        penalty={actionModalState.penalty}
        actionType={actionModalState.actionType}
        onClose={() =>
          setActionModalState({ isOpen: false, penalty: null, actionType: "APPROVE" })
        }
        onSubmit={handleActionSubmit}
        isSubmitting={
          approveMutation.isLoading ||
          rejectMutation.isLoading ||
          disputeMutation.isLoading ||
          reverseMutation.isLoading
        }
      />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: "13px",
            fontWeight: "500",
            borderRadius: "12px"
          }
        }}
      />
    </div>
  );
}
