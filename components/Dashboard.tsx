import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { Activity, Users, HardDrive, DollarSign, TrendingUp, Clock } from 'lucide-react';

const usageData = [
  { name: 'Mon', tokens: 4000, latency: 240 },
  { name: 'Tue', tokens: 3000, latency: 139 },
  { name: 'Wed', tokens: 2000, latency: 980 },
  { name: 'Thu', tokens: 2780, latency: 390 },
  { name: 'Fri', tokens: 1890, latency: 480 },
  { name: 'Sat', tokens: 2390, latency: 380 },
  { name: 'Sun', tokens: 3490, latency: 430 },
];

const costData = [
  { name: 'Wk 1', cost: 120 },
  { name: 'Wk 2', cost: 230 },
  { name: 'Wk 3', cost: 180 },
  { name: 'Wk 4', cost: 350 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="p-6 md:p-10 space-y-8 animate-fade-in text-slate-50 h-full overflow-y-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Enterprise Dashboard</h2>
          <p className="text-slate-400 mt-2">Real-time overview of your AI infrastructure.</p>
        </div>
        <div className="flex gap-2 text-sm bg-slate-800/50 p-1 rounded-lg">
          <button className="px-3 py-1 bg-slate-700 rounded shadow-sm text-white">7 Days</button>
          <button className="px-3 py-1 text-slate-400 hover:text-white">30 Days</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tokens", value: "2.4M", icon: <HardDrive className="h-4 w-4 text-indigo-400" />, trend: "+12.5%" },
          { label: "Avg Latency", value: "340ms", icon: <Clock className="h-4 w-4 text-emerald-400" />, trend: "-8.1%" },
          { label: "Active Users", value: "1,204", icon: <Users className="h-4 w-4 text-blue-400" />, trend: "+4.2%" },
          { label: "Estimated Cost", value: "$430.50", icon: <DollarSign className="h-4 w-4 text-amber-400" />, trend: "+2.3%" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs font-medium flex items-center gap-1">
               <TrendingUp className="h-3 w-3 text-emerald-500" />
               <span className="text-emerald-500">{stat.trend}</span>
               <span className="text-slate-500">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" /> Token Usage Volume
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="tokens" stroke="#6366f1" fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-400" /> Latency Performance (ms)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#334155', opacity: 0.2}}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="latency" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl">
           <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-amber-400" /> Cost Analysis
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, fill: '#f59e0b'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl flex flex-col justify-center items-center text-center">
            <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                <Users className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Invite Team</h3>
            <p className="text-sm text-slate-400 mb-6">Scale your operations by adding team members to your organization.</p>
            <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">Manage Access</button>
        </div>
      </div>
    </div>
  );
};