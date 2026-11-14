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
  ArrowRight
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
  useDeleteRule
} from "@/features/slaPenalty/slaPenalty.queries";
import toast, { Toaster } from "react-hot-toast";
import Loader from "@/components/ui/Loader";

import RuleBookHeader from "./components/RuleBookHeader";
import RuleCard from "./components/RuleCard";
import RuleModal from "./components/RuleModal";
import RulePreviewModal from "./components/RulePreviewModal";
import PublishModal from "./components/PublishModal";

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

  // Queries for Rule Books
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

  // Mutations
  const createBookMutation = useCreateRuleBook();
  const publishMutation = usePublishRuleBook();
  const seedMutation = useSeedDefaultRuleBook();
  const addRuleMutation = useAddRuleToBook();
  const updateRuleMutation = useUpdateRule();
  const deleteRuleMutation = useDeleteRule();

  // Extract all books & identify draft
  const allBooks = booksResponse?.data || [];
  const draftBookSummary = allBooks.find((b) => b.status === "DRAFT");

  // Tab State: "ACTIVE" or "DRAFT"
  const [selectedTab, setSelectedTab] = useState("ACTIVE");

  // If active book doesn't exist but draft exists, default to draft
  useEffect(() => {
    if (!activeBook && draftBookSummary) {
      setSelectedTab("DRAFT");
    } else if (activeBook && selectedTab !== "DRAFT") {
      setSelectedTab("ACTIVE");
    }
  }, [activeBook, draftBookSummary]);

  // Fetch full details of draft book if selected
  const {
    data: fullDraftBook,
    isLoading: isLoadingDraftDetails
  } = useRuleBookById(draftBookSummary?.id, effectiveCompanyId);

  // Currently displayed book
  const currentBook = selectedTab === "ACTIVE" ? activeBook : (fullDraftBook || draftBookSummary);
  const isViewingDraft = currentBook?.status === "DRAFT";

  // Modal States
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [previewingRule, setPreviewingRule] = useState(null);

  // Handlers
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
      const res = await createBookMutation.mutateAsync({
        company_id: effectiveCompanyId,
        name: `SLA Penalty Rule Book (Draft)`
      });
      toast.success("New draft rule book version created");
      refetchBooks();
      setSelectedTab("DRAFT");
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
      setSelectedTab("ACTIVE");
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
        ruleBookId: currentBook.id
      });
      toast.success("Rule clause removed");
      refetchBooks();
    } catch (err) {
      toast.error(err.message || "Failed to delete rule");
    }
  };

  const isLoading = isLoadingCompanies || isLoadingBooks || isLoadingActive;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    );
  }

  const rulesList = currentBook?.rules || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Organization Switcher & Actions */}
      <RuleBookHeader
        companies={companies}
        selectedCompanyId={effectiveCompanyId}
        onSelectCompany={handleSelectCompany}
        isSuperAdmin={isSuperAdmin}
        currentBook={currentBook}
        activeBook={activeBook}
        draftBook={draftBookSummary}
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        onOpenAddModal={() => {
          setEditingRule(null);
          setIsRuleModalOpen(true);
        }}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onSeedDefault={handleSeedDefault}
        onCreateDraft={handleCreateDraft}
        isSeeding={seedMutation.isLoading}
      />

      {/* Rules Grid or Empty State */}
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
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

      {/* SLA Penalty Architecture Guidance */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex items-start gap-3">
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
                  Deterministic Condition AST:
                </strong>{" "}
                Conditions are evaluated deterministically using structured JSON abstract syntax trees. Dynamic JavaScript `eval()` is strictly prohibited.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  Scope Isolation (Task-Wise vs. Day-Wise):
                </strong>{" "}
                Task-wise penalties apply per individual cleaning review submission. Day-wise penalties evaluate cumulative performance over the whole business day.
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

      {/* Modals */}
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

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: "13px",
            fontWeight: "500",
            borderRadius: "10px"
          }
        }}
      />
    </div>
  );
}

