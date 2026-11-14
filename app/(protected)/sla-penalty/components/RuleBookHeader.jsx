"use client";

import React from "react";
import {
  ShieldCheck,
  Building2,
  Sparkles,
  Plus,
  Send,
  BookOpen,
  History,
  FileCheck2,
  DollarSign,
  AlertCircle
} from "lucide-react";

export default function RuleBookHeader({
  companies = [],
  selectedCompanyId,
  onSelectCompany,
  isSuperAdmin,
  currentBook,
  activeBook,
  draftBook,
  selectedTab,
  onSelectTab,
  onOpenAddModal,
  onOpenPublishModal,
  onSeedDefault,
  onCreateDraft,
  isSeeding = false
}) {
  const isViewingDraft = currentBook?.status === "DRAFT";
  const rateCards = currentBook?.rate_cards || activeBook?.rate_cards || {};

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
      {/* Top Row: Title & Organization Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                SLA Penalty Rule Books
                {currentBook && (
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    currentBook.status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-300"
                  }`}>
                    {currentBook.status} (v{currentBook.version})
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Contractual SLA penalty clauses, mathematical rate cards, and immutable versioning
              </p>
            </div>
          </div>
        </div>

        {/* Company Dropdown for Superadmin */}
        {isSuperAdmin && companies.length > 0 && (
          <div className="flex items-center gap-2 min-w-[240px]">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCompanyId}
              onChange={(e) => onSelectCompany(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Middle Row: Rate Cards & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Active Rule Clauses
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {currentBook?.rules?.length || 0} Clauses
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Standard Task Rate Reference
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            ₹{rateCards.standard_washroom ? Number(rateCards.standard_washroom).toFixed(0) : "100"} / washroom
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Urinal Bank Task Reference
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            ₹{rateCards.urinal_bank ? Number(rateCards.urinal_bank).toFixed(0) : "60"} / unit
          </div>
        </div>
      </div>

      {/* Bottom Row: Version Tabs & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        {/* Version Switcher Tabs */}
        <div className="flex items-center gap-2">
          {activeBook && (
            <button
              onClick={() => onSelectTab("ACTIVE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTab === "ACTIVE"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Active Published (v{activeBook.version})
            </button>
          )}

          {draftBook && (
            <button
              onClick={() => onSelectTab("DRAFT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTab === "DRAFT"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 hover:bg-amber-100"
              }`}
            >
              Draft Version (v{draftBook.version})
            </button>
          )}

          {!activeBook && !draftBook && (
            <span className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              No rule book initialized for this company.
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!activeBook && !draftBook && (
            <button
              onClick={onSeedDefault}
              disabled={isSeeding}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {isSeeding ? "Seeding..." : "Seed Default Baseline Rules"}
            </button>
          )}

          {activeBook && !draftBook && (
            <button
              onClick={onCreateDraft}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-all"
            >
              <History className="w-4 h-4" />
              Draft New Version (v{activeBook.version + 1})
            </button>
          )}

          {isViewingDraft && (
            <>
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 px-3.5 py-2 rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Penalty Rule
              </button>

              <button
                onClick={onOpenPublishModal}
                disabled={!currentBook?.rules?.length}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-4 py-2 rounded-xl shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                Publish Version {currentBook.version}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
