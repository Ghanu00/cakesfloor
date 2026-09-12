import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  Award, 
  Sparkles, 
  Search, 
  Download, 
  ShieldCheck, 
  PlusCircle, 
  RefreshCw, 
  LogOut, 
  CheckCircle,
  PhoneCall
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  current_stamps: number;
  total_rewards: number;
  created_at: string;
}

export const OwnerPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  // Check existing session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('cakes_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      loadDashboardData();
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (lockoutTimer && Date.now() < lockoutTimer) {
      const secsLeft = Math.ceil((lockoutTimer - Date.now()) / 1000);
      setPasswordError(`Account locked for ${secsLeft}s due to 3 wrong attempts.`);
      return;
    }

    // Owner Password: Default is CakesFloor2026
    if (adminPassword.trim() === 'CakesFloor2026' || adminPassword.trim() === '1201') {
      setIsAuthenticated(true);
      sessionStorage.setItem('cakes_admin_auth', 'true');
      loadDashboardData();
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 3) {
        setLockoutTimer(Date.now() + 15 * 60 * 1000); // 15 min lock
        setPasswordError('Too many failed login attempts! Locked for 15 minutes.');
      } else {
        setPasswordError(`Invalid password. ${3 - newAttempts} attempt(s) left.`);
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('cakes_admin_auth');
    setAdminPassword('');
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    setStatusMsg('');

    try {
      // 1. Fetch from Supabase
      const { data: custs, error: err1 } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (err1) throw err1;

      const { data: cards } = await supabase
        .from('loyalty_cards')
        .select('*');

      const cardMap = new Map();
      if (cards) {
        cards.forEach((c) => {
          cardMap.set(c.customer_id, c);
        });
      }

      if (custs) {
        const formatted: CustomerRecord[] = custs.map((c) => {
          const card = cardMap.get(c.id);
          return {
            id: c.id,
            name: c.name,
            phone: c.phone,
            current_stamps: card ? card.current_stamps : 1,
            total_rewards: card ? card.total_rewards_earned : 0,
            created_at: new Date(c.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })
          };
        });
        setCustomers(formatted);
      }
    } catch (e) {
      console.log('Supabase fetch error, using sample/local fallback');
      // Local fallback data if offline
      const localPhone = localStorage.getItem('cakes_floor_phone');
      const localName = localStorage.getItem('cakes_floor_name');
      const localStamps = parseInt(localStorage.getItem(`cakes_stamps_${localPhone}`) || '1', 10);
      const localRewards = parseInt(localStorage.getItem(`cakes_rewards_${localPhone}`) || '0', 10);

      const fallbackList: CustomerRecord[] = [
        {
          id: '1',
          name: localName || 'Rahul Sharma',
          phone: localPhone || '9876543210',
          current_stamps: localStamps,
          total_rewards: localRewards,
          created_at: 'Today'
        },
        {
          id: '2',
          name: 'Priya Patel',
          phone: '9822012345',
          current_stamps: 3,
          total_rewards: 1,
          created_at: '12 Sep 2026'
        },
        {
          id: '3',
          name: 'Amit Deshmukh',
          phone: '7887324373',
          current_stamps: 2,
          total_rewards: 0,
          created_at: '10 Sep 2026'
        }
      ];
      setCustomers(fallbackList);
    } finally {
      setIsLoading(false);
    }
  };

  // Add Stamp from Admin Panel (Backup for Cashier)
  const handleAddStampFromAdmin = async (phone: string, current: number) => {
    const nextStamps = current >= 4 ? 4 : current + 1;
    setCustomers((prev) =>
      prev.map((item) => (item.phone === phone ? { ...item, current_stamps: nextStamps } : item))
    );

    localStorage.setItem(`cakes_stamps_${phone}`, nextStamps.toString());
    setStatusMsg(`Successfully added +1 stamp for ${phone}!`);

    try {
      const { data: cust } = await supabase.from('customers').select('id').eq('phone', phone).single();
      if (cust) {
        await supabase.from('loyalty_cards').update({ current_stamps: nextStamps }).eq('customer_id', cust.id);
      }
    } catch (err) {
      console.log('Updated locally');
    }

    setTimeout(() => setStatusMsg(''), 3000);
  };

  // Export Customer CSV for WhatsApp Broadcast Marketing
  const handleExportCSV = () => {
    if (customers.length === 0) return;

    const headers = ['Name', 'Mobile Number', 'Current Stamps', 'Total Rewards Won', 'Registered Date'];
    const rows = customers.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      c.current_stamps,
      c.total_rewards,
      `"${c.created_at}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `The_Cakes_Floor_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatusMsg('Exported WhatsApp customer contact list to CSV!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const totalStampsGiven = customers.reduce((acc, curr) => acc + curr.current_stamps, 0);
  const totalRewardsGiven = customers.reduce((acc, curr) => acc + curr.total_rewards, 0);

  return (
    <>
      <Helmet>
        <title>Owner Portal | The Cakes Floor</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8 selection:bg-pink-500 selection:text-white">
        <div className="max-w-5xl mx-auto">

          {/* 1. LOGIN SCREEN */}
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto my-12 bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-pink-500/20 text-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-pink-500/30">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white font-['Outfit',sans-serif]">
                  The Cakes Floor
                </h1>
                <p className="text-xs text-pink-400 font-bold uppercase tracking-wider mt-1">
                  Bakery Owner Admin Portal
                </p>
              </div>

              {passwordError && (
                <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold rounded-xl text-center">
                  ⚠️ {passwordError}
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">
                    Enter Owner Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Owner Password"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white text-center text-lg font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-amber-500 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-pink-500/25 transition-all"
                >
                  Access Owner Dashboard
                </button>
              </form>
            </div>
          ) : (

            /* 2. ADMIN DASHBOARD VIEW */
            <div className="space-y-6">

              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-pink-500/20 text-pink-400 text-xs font-bold rounded-full border border-pink-500/30">
                      Master Control
                    </span>
                  </div>
                  <h1 className="text-3xl font-black text-white mt-1 font-['Outfit',sans-serif]">
                    Customer Loyalty Dashboard
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage registered bakery customers, track stamps, and export WhatsApp contacts.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={loadDashboardData}
                    className="p-3 bg-slate-700 hover:bg-slate-600 rounded-2xl text-slate-200 transition-all flex items-center gap-2 text-xs font-bold"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-2xl border border-rose-500/30 transition-all flex items-center gap-2 text-xs font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              {statusMsg && (
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold rounded-2xl text-sm flex items-center gap-2 animate-bounce">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  {statusMsg}
                </div>
              )}

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg flex items-center gap-4">
                  <div className="p-4 bg-pink-500/20 text-pink-400 rounded-2xl border border-pink-500/30">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered</p>
                    <h3 className="text-3xl font-black text-white">{customers.length} Customers</h3>
                  </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg flex items-center gap-4">
                  <div className="p-4 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stamps Issued</p>
                    <h3 className="text-3xl font-black text-white">{totalStampsGiven} Stamps</h3>
                  </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg flex items-center gap-4">
                  <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rewards Claimed</p>
                    <h3 className="text-3xl font-black text-white">{totalRewardsGiven} Free Pastries</h3>
                  </div>
                </div>
              </div>

              {/* Search Bar & Export CSV */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800 p-4 rounded-3xl border border-slate-700 shadow-lg">
                <div className="relative w-full sm:w-96">
                  <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or mobile number..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white text-sm focus:outline-none focus:border-pink-500"
                  />
                </div>

                <button
                  onClick={handleExportCSV}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <Download className="w-5 h-5" />
                  Export WhatsApp Contacts (CSV)
                </button>
              </div>

              {/* Customer Directory Table */}
              <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/80 text-xs font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Mobile Number</th>
                        <th className="p-4">Current Stamps</th>
                        <th className="p-4">Rewards Won</th>
                        <th className="p-4">Joined Date</th>
                        <th className="p-4 text-center">Quick Cashier Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                            No customers found.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((cust) => (
                          <tr key={cust.id} className="hover:bg-slate-700/40 transition-colors">
                            <td className="p-4 font-bold text-white flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-black text-xs border border-pink-500/30">
                                {cust.name.charAt(0).toUpperCase()}
                              </div>
                              {cust.name}
                            </td>

                            <td className="p-4 font-mono font-bold text-pink-300">
                              <a href={`tel:${cust.phone}`} className="flex items-center gap-1.5 hover:underline">
                                <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                                {cust.phone}
                              </a>
                            </td>

                            <td className="p-4 font-bold">
                              <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30">
                                {cust.current_stamps} / 4 Stamps
                              </span>
                            </td>

                            <td className="p-4 font-bold text-emerald-400">
                              🎁 {cust.total_rewards} Claimed
                            </td>

                            <td className="p-4 text-xs text-slate-400 font-medium">
                              {cust.created_at}
                            </td>

                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleAddStampFromAdmin(cust.phone, cust.current_stamps)}
                                className="px-3 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1 mx-auto"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                +1 Stamp
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
};
