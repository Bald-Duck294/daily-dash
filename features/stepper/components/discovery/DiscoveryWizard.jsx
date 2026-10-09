"use client";
import React, { useState } from 'react';

const QUESTIONS = [
  {
    id: 'organisationType',
    title: 'Which best describes your organisation?',
    options: [
      { label: 'Private Organisation', sub: 'Corporate, commercial, hospitality', icon: '🏢', bg: 'bg-[#e8f0f9]' },
      { label: 'Public Sector Organisation', sub: 'Government, municipal, public services', icon: '🏛️', bg: 'bg-[#f0fdf4]' },
      { label: 'Public Infrastructure Service Provider', sub: 'Railways, metro, airports, bus terminals', icon: '🤝', bg: 'bg-[#fef3c7]' },
      { label: 'Other (Please Specify)', sub: 'Religious trusts, NGOs, custom facility types', icon: '⚙️', bg: 'bg-slate-100', isOther: true }
    ]
  },
  {
    id: 'facilityType',
    title: 'What type of facility are you managing?',
    options: [
      { label: 'Office / IT Park', icon: '🏢', bg: 'bg-[#e8f0f9]' },
      { label: 'Hospital / Healthcare', icon: '🏥', bg: 'bg-red-50' },
      { label: 'Shopping Mall / Retail', icon: '🛍️', bg: 'bg-purple-50' },
      { label: 'Manufacturing Plant', icon: '🏭', bg: 'bg-orange-50' },
      { label: 'Other (Please Specify)', icon: '⚙️', bg: 'bg-slate-100', isOther: true }
    ]
  },
  {
    id: 'operationalStructure',
    title: 'How is your operation structured?',
    options: [
      { label: 'Single Facility', icon: '🏠', bg: 'bg-[#e8f0f9]' },
      { label: 'Multi-Building Campus', icon: '🏘️', bg: 'bg-[#e8f0f9]' },
      { label: 'Multiple Locations', icon: '📍', bg: 'bg-[#e8f0f9]' },
      { label: 'Regional Network', icon: '🗺️', bg: 'bg-[#e8f0f9]' },
      { label: 'National Network', icon: '🌐', bg: 'bg-[#e8f0f9]' },
      { label: 'Other (Please Specify)', icon: '⚙️', bg: 'bg-slate-100', isOther: true }
    ]
  },
  {
    id: 'operationalScope',
    title: 'What would you like to manage using Safai?',
    options: [
      { label: 'Washroom Management', icon: '🚻', bg: 'bg-[#e8f0f9]' },
      { label: 'Housekeeping Operations', icon: '🧹', bg: 'bg-[#e8f0f9]' },
      { label: 'Audits & Inspections', icon: '📋', bg: 'bg-[#e8f0f9]' },
      { label: 'Workforce Management', icon: '👥', bg: 'bg-[#e8f0f9]' },
      { label: 'Complete Facility Management', icon: '🏢', bg: 'bg-[#e8f0f9]' },
      { label: 'Other (Please Specify)', icon: '⚙️', bg: 'bg-slate-100', isOther: true }
    ]
  },
  {
    id: 'primaryUsers',
    title: 'Who will primarily use the platform?',
    options: [
      { label: 'Cleaning Staff', icon: '🧹', bg: 'bg-[#e8f0f9]' },
      { label: 'Supervisors & Inspectors', icon: '👁️', bg: 'bg-[#e8f0f9]' },
      { label: 'Facility Managers', icon: '🏢', bg: 'bg-[#e8f0f9]' },
      { label: 'External Contractors', icon: '🤝', bg: 'bg-[#e8f0f9]' },
      { label: 'Mixed Team', icon: '👨‍👩‍👧', bg: 'bg-[#e8f0f9]' },
      { label: 'Other (Please Specify)', icon: '⚙️', bg: 'bg-slate-100', isOther: true }
    ]
  }
];

export default function DiscoveryWizard({ 
  answers = {}, 
  onAnswerChange, 
  onComplete 
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  
  // State to handle the "Other" input field
  const [showingOtherFor, setShowingOtherFor] = useState(null);
  const [otherText, setOtherText] = useState('');

  const currentQuestion = QUESTIONS[currentStep];

  // --- Handlers ---
  const handleSelect = (opt) => {
    if (opt.isOther) {
      setShowingOtherFor(opt.label);
      setOtherText(answers[currentQuestion.id] || '');
      return;
    }
    
    setShowingOtherFor(null);
    onAnswerChange({ ...answers, [currentQuestion.id]: opt.label });
    advance();
  };

  const handleConfirmOther = () => {
    if (!otherText.trim()) return;
    onAnswerChange({ ...answers, [currentQuestion.id]: otherText.trim() });
    setShowingOtherFor(null);
    advance();
  };

  const advance = () => {
    setTimeout(() => {
      if (currentStep === QUESTIONS.length - 1) {
        setShowSummary(true);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }, 300);
  };

  const handleBack = () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowingOtherFor(null);
    }
  };

  // --- Sub-Component for the Smart Preview Chips ---
  const LiveChip = ({ icon, label, value }) => {
    const isReady = !!value && value !== 'Waiting...';
    return (
      <div className="bg-white rounded-lg p-2.5 flex items-center gap-3 shadow-sm border border-slate-100">
        <div className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center text-sm shrink-0 border border-slate-100">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
          <div className={`text-xs font-bold truncate mt-0.5 transition-colors ${isReady ? 'text-[#1a4b6c]' : 'text-slate-400 italic'}`}>
            {value || 'Waiting...'}
          </div>
        </div>
        <div className={`text-[#2E7D32] text-sm shrink-0 transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
          ✓
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center py-10 px-4 md:px-6">
      <div className="w-full max-w-[520px]">
        
        {/* ── HEADER ── */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img
              src="/flo-mascot.webp"
              alt="SaafAI Mascot"
              className="w-7 h-7 object-contain shrink-0"
            />
            <span className="font-black text-base text-[#0f172a] tracking-tight">
              Saaf<span className="bg-gradient-to-r from-[#6C5CE7] to-[#00D2D3] bg-clip-text text-transparent">AI</span>
            </span>
          </div>
          <h2 className="text-xl font-black mb-1 text-slate-900">Quick Setup — 5 Questions</h2>
          <p className="text-sm text-slate-500 font-medium">Help us personalise the setup for your facility.</p>
        </div>

        {/* ── PROGRESS DOTS ── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2, 3, 4].map(idx => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep && !showSummary ? 'w-7 bg-[#1a4b6c]' : 
                idx < currentStep || showSummary ? 'w-2 bg-[#1a4b6c] opacity-50' : 'w-2 bg-slate-200'
              }`} 
            />
          ))}
        </div>

        {/* ── LIVE SMART CONFIG PREVIEW ── */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600">Safai is configuring your workspace as you answer</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <LiveChip icon="🗺️" label="Facility Map" value={answers.operationalStructure} />
            <LiveChip icon="🚻" label="Washrooms" value={answers.facilityType} />
            <LiveChip icon="👥" label="Suggested Team" value={answers.primaryUsers} />
            <LiveChip icon="👁️" label="Platform Users" value={answers.operationalScope} />
          </div>
        </div>

        {/* ── QUESTION CARD ── */}
        {!showSummary ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold uppercase tracking-wider rounded-md mb-3">
              Question {currentStep + 1} of 5
            </span>
            <h3 className="text-lg font-bold text-slate-900 mb-5 leading-snug">
              {currentQuestion.title}
            </h3>
            
            <div className="space-y-3">
              {currentQuestion.options.map(opt => {
                const isSelected = answers[currentQuestion.id] === opt.label || showingOtherFor === opt.label;
                
                return (
                  <div key={opt.label} className="animate-in fade-in">
                    <div 
                      onClick={() => handleSelect(opt)}
                      className={`flex items-center gap-3.5 p-3 rounded-xl border-[1.5px] cursor-pointer transition-all group
                        ${isSelected 
                          ? 'border-[#1a4b6c] bg-[#f8fafc]' 
                          : 'border-slate-100 hover:border-slate-300 bg-white'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105 ${opt.bg}`}>
                        {opt.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${isSelected ? 'text-[#1a4b6c]' : 'text-slate-900'}`}>
                          {opt.label}
                        </p>
                        {opt.sub && (
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">{opt.sub}</p>
                        )}
                      </div>
                    </div>

                    {/* Expandable 'Other' Input Field */}
                    {opt.isOther && showingOtherFor === opt.label && (
                      <div className="mt-3 ml-1 animate-in slide-in-from-top-2 fade-in duration-200">
                        <input 
                          type="text" 
                          autoFocus
                          value={otherText}
                          onChange={(e) => setOtherText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleConfirmOther()}
                          placeholder="Please specify..." 
                          className="w-full border-[1.5px] border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1a4b6c] font-medium text-slate-700"
                        />
                        <button 
                          onClick={handleConfirmOther}
                          disabled={!otherText.trim()}
                          className="w-full mt-2 bg-[#1a4b6c] text-white py-2.5 rounded-lg font-bold text-sm hover:bg-[#123650] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                        >
                          Continue ➔
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Back Button within Card */}
            {currentStep > 0 && (
              <button 
                onClick={handleBack} 
                className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1"
              >
                ← Back
              </button>
            )}
          </div>
        ) : (
          
          /* ── SUMMARY SCREEN ── */
          <div className="bg-white border border-emerald-200 rounded-2xl p-8 shadow-sm text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-[#2E7D32] rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
              ✓
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">All set! Here's your facility profile.</h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">We've customized the setup flow based on your inputs.</p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {Object.values(answers).filter(Boolean).map((val, idx) => (
                <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-md shadow-sm">
                  {val}
                </span>
              ))}
            </div>
            
            <button 
              onClick={onComplete} 
              className="w-full bg-[#1a4b6c] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#123650] transition-colors shadow-md flex items-center justify-center gap-2"
            >
              Start Setup ➔
            </button>
            <button onClick={handleBack} className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
              Wait, I need to change something
            </button>
          </div>
        )}
      </div>
    </div>
  );
}