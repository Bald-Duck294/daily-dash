"use client";

import { useRouter } from "next/navigation";
import { Settings, Layers, ArrowRight } from "lucide-react";
import Loader from "@/components/ui/Loader";
import { useDynamicModules } from "@/features/configurations/configurations.queries";

export default function ConfigurationsDashboard() {
  const router = useRouter();
  const { data: modules = [], isLoading, isError } = useDynamicModules();

  if (isLoading)
    return <Loader size="large" message="Loading configuration modules..." />;
  if (isError)
    return (
      <div className="p-8 text-center text-rose-500 font-bold">
        Failed to load modules.
      </div>
    );

  return (
    <div className="min-h-screen p-6 font-sans bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-[1600px] mx-auto w-full">
        {/* Header Card */}
        <div className="rounded-2xl p-6 mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800">
              <Settings className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                SYSTEM CONFIGURATIONS
              </h1>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-1">
                Manage operational modules and system logic schemas
              </p>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <div
              key={mod.name}
              onClick={() => router.push(`/configurations/${mod.name}`)}
              className="group rounded-2xl p-6 cursor-pointer relative transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md"
            >
              <div className="absolute top-0 left-0 w-full h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-2xl bg-gradient-to-r from-cyan-500 to-blue-500" />

              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/30 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  <Layers size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded">
                  Phase {mod.phase}
                </span>
              </div>

              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">
                {mod.label}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                {mod.description}
              </p>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  Manage Templates
                </span>
                <ArrowRight
                  size={16}
                  className="text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
