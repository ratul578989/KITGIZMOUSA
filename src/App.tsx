/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wallet, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw, 
  ArrowUpRight, 
  ArrowDownLeft,
  ArrowRight,
  TrendingUp,
  Zap,
  ShieldCheck,
  Globe,
  Menu,
  X,
  Plus,
  Settings,
  LogOut,
  User,
  Bell,
  Key,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, subtitle }: { title: string, value: string, icon: any, color: string, subtitle?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm hover:border-slate-600 transition-colors group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {subtitle && <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{subtitle}</span>}
    </div>
    <div className="space-y-1">
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const ComparisonCard = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mt-12">
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <TrendingUp className="w-24 h-24 text-slate-400" />
      </div>
      <h4 className="text-slate-400 font-semibold mb-2">Normal Ads</h4>
      <div className="text-5xl font-black text-slate-500 mb-4">35%</div>
      <p className="text-slate-500 text-sm">Average industry success rate for standard Shopify ad campaigns.</p>
    </motion.div>

    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-emerald-500/5 border border-emerald-500/30 p-8 rounded-3xl relative overflow-hidden group shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Zap className="w-24 h-24 text-emerald-400" />
      </div>
      <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest mb-4">
        AI Enhanced
      </div>
      <h4 className="text-emerald-400 font-semibold mb-2">KIT GIZMO AI Ads</h4>
      <div className="text-5xl font-black text-emerald-400 mb-4 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">95%</div>
      <p className="text-emerald-400/70 text-sm font-medium">Breakthrough performance fueled by predictive analytics and real-time optimization.</p>
    </motion.div>
  </div>
);

const SettingsView = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifications, setNotifications] = useState({
    orders: true,
    ads: false,
    wallet: true,
    security: true
  });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl space-y-8"
    >
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white tracking-tight">Account Settings</h2>
        <p className="text-slate-400 text-sm font-medium">Manage your global profile and security preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex items-center gap-6">
          <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-3xl font-black text-slate-950">
            GA
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Gizmo Admin</h3>
            <p className="text-slate-400 text-sm">Professional Scale Plan • Since May 2024</p>
            <button className="mt-2 text-xs font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors">Change Avatar</button>
          </div>
        </div>
        <div className="p-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
              <input 
                type="text" 
                defaultValue="Gizmo Admin"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
              <p className="text-xs text-slate-500 mb-2 italic">Primary contact for fulfillment alerts</p>
              <input 
                type="email" 
                defaultValue="admin@kitgizmo.io"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-medium"
              />
            </div>
          </div>
          <div className="space-y-4">
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Password</label>
              <input 
                type="password" 
                placeholder="Leave blank to keep current"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-medium"
              />
            </div>
            <button className="w-full bg-slate-100 hover:bg-white text-slate-950 font-black py-3 rounded-xl transition-all shadow-xl mt-4">
              SAVE CHANGES
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold text-white">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { id: 'orders', label: 'Order Fulfillment Alerts', sub: 'Instant notify when USA center processes local orders' },
            { id: 'ads', label: 'AI Ad Optimization Reports', sub: 'Weekly performance sync and meta-tiktok ROI analysis' },
            { id: 'wallet', label: 'Wallet Balance Warnings', sub: 'Alert when balance drops below $5,000 threshold' },
            { id: 'security', label: 'Security & Logins', sub: 'Major account changes and new device verification' }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <p className="text-sm font-bold text-white mb-0.5">{item.label}</p>
                <p className="text-[10px] text-slate-500 font-medium">{item.sub}</p>
              </div>
              <button 
                onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications[item.id as keyof typeof notifications] ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-lg ${notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Key className="w-48 h-48" />
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Lock className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold text-white">Developer API Keys</h3>
        </div>
        <div className="space-y-4 relative z-10">
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">
            Use your API key to connect external ERP systems, custom Shopify themes, or third-party ad trackers. Keep this key secret and secure.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 font-mono text-xs flex items-center justify-between">
              <span>{showApiKey ? 'kg_live_7x8291vmp02919sh8291kjz' : '••••••••••••••••••••••••••••••••'}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowApiKey(!showApiKey)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-bold text-xs transition-colors">
              ROLL KEY
            </button>
          </div>
          <div className="flex items-center gap-2 pt-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
             <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active System Integration</span>
          </div>
        </div>
      </div>

      <div className="pt-8 text-center">
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Kit Gizmo Security Infrastructure v4.2.1</p>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-emerald-500/30 selection:text-emerald-400 font-sans">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-xl tracking-tighter">
              KG
            </div>
            <span className="text-xl font-bold tracking-tight">KIT GIZMO</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">API Docs</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="text-slate-400 hover:text-white px-5 py-2.5 rounded-full font-bold transition-colors text-sm"
            >
              Login
            </button>
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="bg-emerald-500 text-slate-950 px-6 py-2.5 rounded-full font-bold hover:bg-emerald-400 transition-colors text-sm flex items-center gap-2 group shadow-xl shadow-emerald-500/10"
            >
              Sign Up <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 pt-12 pb-24">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full shadow-2xl">
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Collaborative Alpha</span>
                <div className="w-px h-4 bg-slate-700" />
                <span className="text-slate-400 text-xs font-semibold">KIT GIZMO x Shopify</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.05]">
                Scale your ads with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Superhuman</span> precision.
              </h1>
              
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mx-auto">
                The ultimate fulfillment and ad-management dashboard designed for high-volume USA dropshippers. Real-time Shopify sync, AI performance optimization, and global wallet management.
              </p>

              <div className="flex flex-wrap gap-8 justify-center items-center pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 15}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-400">
                  <span className="text-white font-bold">1M+ Users</span> worldwide trust KIT GIZMO.
                </div>
              </div>

              <ComparisonCard />
            </motion.div>
          </div>
        </main>

        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-30">
            <Globe className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Global Scale Network</span>
          </div>
          <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">© 2024 KIT GIZMO INC. PREMIER USA DROP-SCALE OPS.</p>
        </footer>
      </div>
    );
  }

  // --- Dashboard View ---

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'ads', label: 'Ad Manager', icon: BarChart3 },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-slate-900 text-sm">
                KG
              </div>
              <span className="font-bold tracking-tight text-lg">KIT GIZMO</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                  ${activeTab === item.id 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 space-y-4">
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Pro Status</span>
              </div>
              <p className="text-[10px] text-emerald-400/70 font-medium mb-3">AI Optimization Active</p>
              <div className="h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-4/5" />
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-800 space-y-1">
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sm ${activeTab === 'settings' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/5 text-sm transition-all"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white capitalize">{activeTab}</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">Welcome back, Gizmo Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shopify Synced</span>
            </div>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-xl relative transition-all ${activeTab === 'settings' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              <User className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'settings' ? (
                <SettingsView key="settings" />
              ) : (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-white tracking-tight">System Overview</h2>
                      <p className="text-slate-400 text-sm font-medium">Real-time data from USA Fulfillment Center</p>
                    </div>
                    <div className="flex gap-3">
                      <button className="bg-slate-900 border border-slate-800 text-white px-5 border-slate-700/50 hover:bg-slate-800 py-3 rounded-2xl font-bold flex items-center gap-2 text-sm transition-all shadow-xl">
                        <Plus className="w-4 h-4" /> Deposit
                      </button>
                      <button className="bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-black flex items-center gap-2 text-sm transition-all shadow-lg hover:bg-emerald-400">
                        <BarChart3 className="w-4 h-4" /> New Campaign
                      </button>
                    </div>
                  </div>

                  {/* Metrics Grid - EXACTLY 7 Boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Financial Box 1: Total Balance */}
                    <StatCard 
                      title="Total Balance" 
                      value="$128,450.00" 
                      icon={Wallet} 
                      color="bg-emerald-500" 
                      subtitle="Available"
                    />
                    {/* Financial Box 2: Total Deposit */}
                    <StatCard 
                      title="Total Deposit" 
                      value="$450,000.00" 
                      icon={ArrowDownLeft} 
                      color="bg-blue-500" 
                      subtitle="Lifetime"
                    />
                    {/* Financial Box 3: Total Withdraw */}
                    <StatCard 
                      title="Total Withdraw" 
                      value="$321,550.00" 
                      icon={ArrowUpRight} 
                      color="bg-purple-500" 
                      subtitle="Settled"
                    />
                    {/* Order Box 4: Total Orders */}
                    <StatCard 
                      title="Total Orders" 
                      value="24,812" 
                      icon={ShoppingCart} 
                      color="bg-slate-400" 
                      subtitle="Synced"
                    />
                    {/* Order Box 5: Fulfilled Orders */}
                    <StatCard 
                      title="Fulfilled Orders" 
                      value="24,103" 
                      icon={CheckCircle2} 
                      color="bg-emerald-400" 
                      subtitle="Success"
                    />
                    {/* Order Box 6: Unfulfilled Orders */}
                    <StatCard 
                      title="Unfulfilled Orders" 
                      value="709" 
                      icon={AlertCircle} 
                      color="bg-red-500" 
                      subtitle="Pending"
                    />
                    {/* Sync Box 7: Ad Performance Sync */}
                    <motion.div 
                      className="bg-slate-900 border-2 border-emerald-500/20 p-6 rounded-2xl group flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <div className="p-3 rounded-xl bg-emerald-500/10">
                          <RefreshCcw className="w-6 h-6 text-emerald-400 animate-spin-slow" />
                        </div>
                        <div className="bg-emerald-500/20 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                          Live
                        </div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-slate-400 text-sm font-medium mb-1">Ad Sync Status</h3>
                        <p className="text-lg font-bold text-white mb-2">99.9% Optimization</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "99.9%" }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="h-full bg-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Performance Graphic Placeholder */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <BarChart3 className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">AI Performance Tracking</h3>
                        <p className="text-slate-500 text-sm">Real-time metrics from meta & tiktok integrations</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">ROAS</p>
                          <p className="text-2xl font-black text-emerald-400">4.82x</p>
                          <p className="text-[10px] text-emerald-500 font-bold">+12% vs last week</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">CPC</p>
                          <p className="text-2xl font-black text-white">$0.42</p>
                          <p className="text-[10px] text-red-400 font-bold">-4% vs average</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">CTR</p>
                          <p className="text-2xl font-black text-white">3.1%</p>
                          <p className="text-[10px] text-emerald-500 font-bold">Optimal</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Conv.</p>
                          <p className="text-2xl font-black text-white">12.5%</p>
                          <p className="text-[10px] text-emerald-500 font-bold">+2.1% spike</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
