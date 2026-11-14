"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, HelpCircle, AlertCircle, Sparkles } from "lucide-react";

const STANDARD_CATEGORIES = [
  { value: "HYGIENE_SCORE_BREACH", label: "Hygiene Score Breach" },
  { value: "RETRY_FAILURE", label: "Retry Inspection Failure" },
  { value: "MAX_RETRIES_EXCEEDED", label: "Max Retries Exceeded" },
  { value: "REPEATED_DAILY_FAILURE", label: "Repeated Daily Deficiency" },
  { value: "MISSED_CLEANING_SCHEDULE", label: "Missed Cleaning Schedule" },
  { value: "LATE_COMPLETION", label: "Late Completion" },
  { value: "CHECKLIST_DEFICIENCY", label: "Checklist Deficiency" }
];

const COMMON_FIELDS = [
  { value: "review.score", label: "review.score (Inspection Score 0-10)" },
  { value: "review.attempt_no", label: "review.attempt_no (Submission Attempt #)" },
  { value: "day_aggregate.failed_review_count", label: "day_aggregate.failed_review_count (Daily Failed Reviews)" },
  { value: "day_aggregate.distinct_locations_breached", label: "day_aggregate.distinct_locations_breached (Locations Breached)" },
  { value: "review.tasks_count", label: "review.tasks_count (Completed Tasks Count)" }
];

export default function RuleModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false
}) {
  const [ruleCode, setRuleCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("HYGIENE_SCORE_BREACH");
  const [scope, setScope] = useState("TASK_WISE");
  const [calcMethod, setCalcMethod] = useState("FIXED_AMOUNT");
  const [penaltyValue, setPenaltyValue] = useState("75");
  const [maxPenaltyCap, setMaxPenaltyCap] = useState("150");
  const [retryPolicy, setRetryPolicy] = useState("WAIT_FOR_RETRY_OUTCOME");

  // Condition AST Builder State
  const [operator, setOperator] = useState("AND");
  const [conditions, setConditions] = useState([
    { field: "review.score", comparator: "<", value: "6.0" }
  ]);

  useEffect(() => {
    if (initialData) {
      setRuleCode(initialData.rule_code || "");
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setCategory(initialData.violation_category || "HYGIENE_SCORE_BREACH");
      setScope(initialData.scope || "TASK_WISE");
      setCalcMethod(initialData.calculation_method || "FIXED_AMOUNT");
      setPenaltyValue(String(initialData.penalty_value ?? "75"));
      setMaxPenaltyCap(initialData.max_penalty_cap ? String(initialData.max_penalty_cap) : "");
      setRetryPolicy(initialData.retry_resolution_policy || "WAIT_FOR_RETRY_OUTCOME");

      if (initialData.condition_config?.operator && Array.isArray(initialData.condition_config?.conditions)) {
        setOperator(initialData.condition_config.operator);
        setConditions(initialData.condition_config.conditions.map(c => ({
          field: c.field,
          comparator: c.comparator,
          value: String(c.value)
        })));
      }
    } else {
      setRuleCode(`R-${Date.now().toString().slice(-4)}`);
      setName("");
      setDescription("");
      setCategory("HYGIENE_SCORE_BREACH");
      setScope("TASK_WISE");
      setCalcMethod("FIXED_AMOUNT");
      setPenaltyValue("75");
      setMaxPenaltyCap("150");
      setRetryPolicy("WAIT_FOR_RETRY_OUTCOME");
      setOperator("AND");
      setConditions([{ field: "review.score", comparator: "<", value: "6.0" }]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddCondition = () => {
    setConditions([...conditions, { field: "review.attempt_no", comparator: "==", value: "1" }]);
  };

  const handleRemoveCondition = (index) => {
    if (conditions.length <= 1) return;
    setConditions(conditions.filter((_, idx) => idx !== index));
  };

  const handleConditionChange = (index, key, val) => {
    const updated = [...conditions];
    updated[index][key] = val;
    setConditions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Construct valid Condition AST
    const formattedConditions = conditions.map(c => ({
      field: c.field.trim(),
      comparator: c.comparator,
      value: !isNaN(Number(c.value)) && c.value.trim() !== "" ? Number(c.value) : c.value
    }));

    const condition_config = {
      operator,
      conditions: formattedConditions
    };

    const payload = {
      rule_code: ruleCode.trim(),
      name: name.trim(),
      description: description.trim() || null,
      violation_category: category,
      violation_type: category,
      scope,
      calculation_method: calcMethod,
      penalty_value: Number(penaltyValue) || 0,
      max_penalty_cap: maxPenaltyCap ? Number(maxPenaltyCap) : null,
      retry_resolution_policy: retryPolicy,
      condition_config,
      is_active: true
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {initialData ? `Edit Penalty Rule (${initialData.rule_code})` : "Configure New SLA Penalty Rule"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Define contractual clause conditions, category, and monetary deductions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Rule Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rule Code *
              </label>
              <input
                type="text"
                required
                value={ruleCode}
                onChange={(e) => setRuleCode(e.target.value.toUpperCase())}
                placeholder="R-HYG-01"
                className="w-full text-xs font-mono font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rule Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hygiene Score Failure Under 6.0"
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Clause Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Operational context and justification for cleaner penalty"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Row 2: Category & Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Violation Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {STANDARD_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Penalty Scope *
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="TASK_WISE">TASK_WISE (Per review cleaning attempt)</option>
                <option value="DAY_WISE">DAY_WISE (Daily cumulative aggregated performance)</option>
              </select>
            </div>
          </div>

          {/* Condition AST Builder Box */}
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Breach Evaluation Criteria (Condition AST)
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                  Zero-eval Safe
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Match:</span>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="AND">ALL conditions (AND)</option>
                  <option value="OR">ANY condition (OR)</option>
                </select>
              </div>
            </div>

            {/* Condition Rows */}
            <div className="space-y-2.5">
              {conditions.map((cond, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5">
                  {/* Field Selector */}
                  <div className="flex-1 min-w-[160px]">
                    <select
                      value={cond.field}
                      onChange={(e) => handleConditionChange(idx, "field", e.target.value)}
                      className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    >
                      {COMMON_FIELDS.map(f => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Comparator Selector */}
                  <div className="w-20">
                    <select
                      value={cond.comparator}
                      onChange={(e) => handleConditionChange(idx, "comparator", e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white focus:outline-none text-center"
                    >
                      <option value="<">&lt; Less</option>
                      <option value="<=">&le; Less Eq</option>
                      <option value=">">&gt; Greater</option>
                      <option value=">=">&ge; Greater Eq</option>
                      <option value="==">== Equal</option>
                      <option value="!=">!= Not Equal</option>
                    </select>
                  </div>

                  {/* Target Value */}
                  <div className="w-24">
                    <input
                      type="text"
                      required
                      value={cond.value}
                      onChange={(e) => handleConditionChange(idx, "value", e.target.value)}
                      placeholder="6.0"
                      className="w-full text-xs font-bold text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Delete Row Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(idx)}
                    disabled={conditions.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddCondition}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Another Condition Criteria
            </button>
          </div>

          {/* Row 3: Calculation Method & Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Calculation Method *
              </label>
              <select
                value={calcMethod}
                onChange={(e) => setCalcMethod(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                <option value="TASK_VALUE_PERCENTAGE">Task Rate Percentage (%)</option>
                <option value="PER_MINUTE_DELAY">Per Minute Delay (₹/min)</option>
                <option value="TIERED_FLAT_RATE">Tiered Flat Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {calcMethod === "TASK_VALUE_PERCENTAGE" ? "Penalty Percentage (%)" : "Penalty Amount (₹) *"}
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={penaltyValue}
                onChange={(e) => setPenaltyValue(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Max Cap (₹ Optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={maxPenaltyCap}
                onChange={(e) => setMaxPenaltyCap(e.target.value)}
                placeholder="150"
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Retry Resolution Policy */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Retry Resolution Policy
            </label>
            <select
              value={retryPolicy}
              onChange={(e) => setRetryPolicy(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="WAIT_FOR_RETRY_OUTCOME">WAIT_FOR_RETRY_OUTCOME (Wait until retries exhaust before billing)</option>
              <option value="AUTO_WAIVE_ON_RETRY_PASS">AUTO_WAIVE_ON_RETRY_PASS (Automatically waive penalty if corrective retry passes)</option>
            </select>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
            >
              {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Penalty Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

