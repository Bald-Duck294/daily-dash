"use client";

import React, { useState } from "react";
import { X, Play, CheckCircle, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { usePreviewRule } from "@/features/slaPenalty/slaPenalty.queries";
import toast from "react-hot-toast";

export default function RulePreviewModal({
  isOpen,
  onClose,
  rule,
  companyId
}) {
  const previewMutation = usePreviewRule();
  const [simulationData, setSimulationData] = useState(null);

  if (!isOpen || !rule) return null;

  const handleRunSimulation = async () => {
    try {
      const result = await previewMutation.mutateAsync({
        companyId,
        ruleDefinition: rule
      });
      setSimulationData(result);
      toast.success("Simulation completed successfully");
    } catch (err) {
      toast.error(err.message || "Failed to run simulation");
    }
  };

  const totalDeductions = simulationData?.results?.reduce(
    (acc, r) => acc + (r.simulated_penalty || 0),
    0
  ) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                {rule.rule_code}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Simulation & Review Test
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Testing candidate rule against recent historical reviews without database modifications
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Rule Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
              {rule.name}
            </h4>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Calculation: <span className="font-semibold text-slate-700 dark:text-slate-300">{rule.calculation_method} (₹{rule.penalty_value})</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              Trigger: {JSON.stringify(rule.condition_config)}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Evaluates latest 10 cleaning submissions from ground cleaners
            </span>
            <button
              onClick={handleRunSimulation}
              disabled={previewMutation.isLoading}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              {previewMutation.isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Run Historical Test
                </>
              )}
            </button>
          </div>

          {/* Simulation Output */}
          {simulationData && (
            <div className="space-y-4 pt-2">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/60 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Tested Submissions</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {simulationData.tested_count}
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-950/40 rounded-xl p-3 border border-red-200/60 dark:border-red-800/40 text-center">
                  <div className="text-[11px] text-red-600 dark:text-red-400 font-medium">Breaches Detected</div>
                  <div className="text-base font-bold text-red-700 dark:text-red-300 mt-0.5">
                    {simulationData.matched_count}
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-3 border border-emerald-200/60 dark:border-emerald-800/40 text-center">
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Simulated Deduction</div>
                  <div className="text-base font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                    ₹{totalDeductions.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Detail Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Review ID</th>
                      <th className="px-3 py-2">Hygiene Score</th>
                      <th className="px-3 py-2">Attempt</th>
                      <th className="px-3 py-2">Rule Evaluation</th>
                      <th className="px-3 py-2 text-right">Hypothetical Penalty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {simulationData.results.map((res, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-3 py-2 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          #{res.review_id}
                        </td>
                        <td className="px-3 py-2 font-bold">
                          {res.review_score !== null ? Number(res.review_score).toFixed(1) : "N/A"}
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          #{res.attempt_no}
                        </td>
                        <td className="px-3 py-2">
                          {res.matched ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              BREACH DETECTED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Standard Met
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">
                          {res.simulated_penalty > 0 ? `₹${res.simulated_penalty.toFixed(2)}` : "₹0.00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

