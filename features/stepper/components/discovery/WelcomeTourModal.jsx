"use client";
import React, { useState } from 'react';

export default function WelcomeTourModal({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete(); // Triggers the transition to the DiscoveryWizard
    }
  };

  const skipTour = () => onComplete();

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Modal Box */}
      <div className="bg-white rounded-[24px] w-full max-w-[420px] shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 absolute top-0 left-0 z-10">
          <div 
            className="h-full bg-[#1F4E79] transition-all duration-300 ease-out"
            style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
          />
        </div>

        {/* Slides Container */}
        <div className="p-8 pt-12 min-h-[360px] relative">
          
          {/* Slide 0: Welcome */}
          {currentSlide === 0 && (
            <div className="flex flex-col items-center text-center animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#E8F0F9] flex items-center justify-center text-3xl mb-5 shadow-sm">🌿</div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome to SaafAI</h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[300px]">A simple 5-step setup to digitise your facility's cleaning operations. Takes under 10 minutes.</p>
              <div className="flex gap-2 mt-6 flex-wrap justify-center">
                {['✈️ Airports', '🏥 Hospitals', '🏢 Offices', '🚉 Railways'].map(badge => (
                  <span key={badge} className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-3 py-1.5 rounded-md">{badge}</span>
                ))}
              </div>
            </div>
          )}

          {/* Slide 1: Map Facility */}
          {currentSlide === 1 && (
            <div className="flex flex-col items-center text-center animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF7ED] flex items-center justify-center text-3xl mb-5 shadow-sm">🏗️</div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Step 1 — Map Your Facility</h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[320px]">Tell us your building structure — floors, wings, and zones. Just pick a template and you're done in seconds.</p>
              <div className="flex items-center gap-2 mt-6 bg-[#F8FAFC] border border-slate-200 rounded-lg px-4 py-3">
                <span className="text-lg">🏢</span><span className="text-xs font-bold text-slate-700">Building A</span>
                <span className="text-slate-300">→</span>
                <span className="text-lg">📋</span><span className="text-xs font-bold text-slate-700">Floor 1</span>
                <span className="text-slate-300">→</span>
                <span className="text-lg">📍</span><span className="text-xs font-bold text-slate-700">Zone A</span>
              </div>
            </div>
          )}

          {/* Slide 2: Washrooms */}
          {currentSlide === 2 && (
            <div className="flex flex-col items-center text-center animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-3xl mb-5 shadow-sm">🚻</div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Step 2 — Register Washrooms</h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[320px]">Add each washroom — name it, choose Male / Female / Accessible, and pick how many WCs and basins it has.</p>
              <div className="flex gap-3 mt-6 w-full justify-center">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center flex-1 max-w-[80px]"><div className="text-xl mb-1">🚹</div><div className="text-[9px] font-bold text-green-700">Male WC</div></div>
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 text-center flex-1 max-w-[80px]"><div className="text-xl mb-1">🚺</div><div className="text-[9px] font-bold text-pink-700">Female WC</div></div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center flex-1 max-w-[80px]"><div className="text-xl mb-1">♿</div><div className="text-[9px] font-bold text-blue-700">Accessible</div></div>
              </div>
            </div>
          )}

          {/* Slide 3: Team */}
          {currentSlide === 3 && (
            <div className="flex flex-col items-center text-center animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#F5F3FF] flex items-center justify-center text-3xl mb-5 shadow-sm">👥</div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Step 3 — Add Your Team</h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[320px]">Add cleaners, supervisors and managers. You can auto-fill demo staff with one click to see how it works.</p>
              <div className="flex gap-2 mt-6 flex-wrap justify-center">
                <span className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-[10px] font-bold text-green-700">🧹 Cleaner</span>
                <span className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-[10px] font-bold text-amber-700">👁️ Supervisor</span>
                <span className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-[10px] font-bold text-blue-700">🏢 Manager</span>
              </div>
            </div>
          )}

          {/* Slide 4: Go Live */}
          {currentSlide === 4 && (
            <div className="flex flex-col items-center text-center animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#e8f0f9] flex items-center justify-center text-3xl mb-5 shadow-sm">🚀</div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Steps 4 & 5 — Preview & Go Live!</h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[320px]">See a live preview of the cleaner mobile app, then deploy your facility workspace with one click. That's it!</p>
              <div className="mt-6 flex items-center gap-3 bg-[#e8f0f9] border border-[#bfdbfe] rounded-xl px-4 py-3 w-full">
                <span className="text-xl">🎉</span>
                <span className="text-[12px] font-bold text-[#1a4b6c] text-left">Your facility goes live in under 10 minutes!</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-8 pb-8">
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2, 3, 4].map((idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                  idx === currentSlide ? 'w-6 bg-[#1a4b6c]' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={skipTour}
              className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold text-sm py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Skip Tour
            </button>
            <button 
              onClick={nextSlide}
              className="flex-1 bg-[#1a4b6c] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#123650] transition-colors shadow-sm"
            >
              {currentSlide === totalSlides - 1 ? 'Start Setup 🚀' : 'Next ➔'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}