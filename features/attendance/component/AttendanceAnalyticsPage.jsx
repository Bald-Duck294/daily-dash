"use client";

import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, Users, UserCheck, UserX, Clock, Calendar, 
  Download, ArrowUpRight, ArrowDownRight, MapPin, Activity
} from 'lucide-react';

/* --- MOCK DATA FOR DEMO --- */
const trendData = [
  { name: 'Mon', present: 85, absent: 15 },
  { name: 'Tue', present: 88, absent: 12 },
  { name: 'Wed', present: 92, absent: 8 },
  { name: 'Thu', present: 80, absent: 20 },
  { name: 'Fri', present: 95, absent: 5 },
  { name: 'Sat', present: 70, absent: 30 },
  { name: 'Sun', present: 65, absent: 35 },
];

const locationData = [
  { name: 'Central Station', value: 45 },
  { name: 'Airport T1', value: 38 },
  { name: 'City Mall', value: 25 },
  { name: 'Tech Park', value: 20 },
  { name: 'Metro Plaza', value: 15 },
];

const recentActivity = [
  { id: 1, name: "Anil Kumar", action: "Checked In", time: "8:00 AM", location: "Central Station", status: "on-time" },
  { id: 2, name: "Priya Singh", action: "Checked In", time: "8:15 AM", location: "Airport T1", status: "late" },
  { id: 3, name: "Rahul Verma", action: "Missed Shift", time: "9:00 AM", location: "City Mall", status: "absent" },
  { id: 4, name: "Sneha Patil", action: "Checked Out", time: "4:30 PM", location: "Tech Park", status: "completed" },
];

/* --- REUSABLE KPI COMPONENT --- */
const KpiCard = ({ title, value, icon: Icon, trend, trendValue, colorClass, bgGradient }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm hover:shadow-md transition-all duration-300 group`}>
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${bgGradient}`}></div>
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 backdrop-blur-sm`}>
        <Icon size={20} className="currentColor" />
      </div>
    </div>
    
    <div className="mt-4 flex items-center text-sm relative z-10">
      <span className={`flex items-center font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend === 'up' ? <ArrowUpRight size={16} className="mr-1"/> : <ArrowDownRight size={16} className="mr-1"/>}
        {trendValue}
      </span>
      <span className="text-slate-400 ml-2">vs last week</span>
    </div>
  </div>
);

/* --- MAIN PAGE --- */
export default function AttendanceAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("This Week");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Intelligence Hub
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time attendance insights and workforce analytics.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                className="appearance-none bg-slate-100 dark:bg-[#1F2937] border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-lg pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>This Quarter</option>
              </select>
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            
            <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>

        {/* KPI CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <KpiCard 
            title="Total Workforce" value="142" icon={Users} 
            trend="up" trendValue="4%" colorClass="text-blue-600 dark:text-blue-400" bgGradient="bg-blue-500"
          />
          <KpiCard 
            title="Avg. Attendance Rate" value="92.4%" icon={UserCheck} 
            trend="up" trendValue="2.1%" colorClass="text-emerald-600 dark:text-emerald-400" bgGradient="bg-emerald-500"
          />
          <KpiCard 
            title="Absenteeism" value="7.6%" icon={UserX} 
            trend="down" trendValue="1.2%" colorClass="text-rose-600 dark:text-rose-400" bgGradient="bg-rose-500"
          />
          <KpiCard 
            title="Avg. Late Arrivals" value="12" icon={Clock} 
            trend="down" trendValue="3" colorClass="text-amber-600 dark:text-amber-400" bgGradient="bg-amber-500"
          />
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* MAIN TREND CHART (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-500"/> Attendance Trends
                </h3>
                <p className="text-xs text-slate-500 mt-1">Daily comparison of present vs absent staff</p>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', border: 'none', color: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="present" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }} />
                  <Area type="monotone" dataKey="absent" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#colorAbsent)" activeDot={{ r: 6, strokeWidth: 0, fill: '#F43F5E' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DISTRIBUTION CHART (Spans 1 column) */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
              <MapPin size={18} className="text-indigo-500"/> Top Locations by Staff
            </h3>
            
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} width={100} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', border: 'none', color: '#fff' }}/>
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : index === 1 ? '#6366F1' : index === 2 ? '#8B5CF6' : '#94A3B8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LIVE ACTIVITY FEED */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-emerald-500"/> Live Activity Feed
              </h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">View All</button>
            </div>

            <div className="space-y-4">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-[#1F2937] rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                      {log.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{log.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {log.location}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                      ${log.status === 'on-time' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                      ${log.status === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                      ${log.status === 'absent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : ''}
                      ${log.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                    `}>
                      {log.action}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INSIGHTS / ALERTS */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            
            <h3 className="text-lg font-bold mb-2 relative z-10">Smart Insights</h3>
            <p className="text-indigo-100 text-sm mb-6 relative z-10">AI-driven patterns detected in your workforce attendance.</p>
            
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <p className="text-xs font-semibold text-indigo-200 mb-1">PATTERN DETECTED</p>
                <p className="text-sm leading-snug">Absenteeism at <span className="font-bold text-white">City Mall</span> is 15% higher on Mondays.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <p className="text-xs font-semibold text-emerald-300 mb-1">POSITIVE TREND</p>
                <p className="text-sm leading-snug">Late arrivals have decreased by 20% since the new scheduling policy.</p>
              </div>
            </div>
            
            <button className="w-full mt-6 bg-white text-indigo-600 font-bold text-sm py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-md relative z-10">
              View Detailed Analytics
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}