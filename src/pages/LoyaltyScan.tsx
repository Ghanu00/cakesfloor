import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import confetti from 'canvas-confetti';
import { 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Star, 
  UtensilsCrossed, 
  Globe, 
  Phone, 
  X, 
  Award, 
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const STAFF_PIN = '1201';

// Direct Google Maps review writing dialog URL for The Cakes Floor (Bhandara Main Branch)
const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJ45vTPpo5KzoRak6ZRefnnzs';

export const LoyaltyScan: React.FC = () => {
  // State for Customer
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [currentStamps, setCurrentStamps] = useState<number>(0);
  const [totalRewards, setTotalRewards] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form input states for 1st time registration
  const [inputName, setInputName] = useState<string>('');
  const [inputPhone, setInputPhone] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Stamping PIN Modal state
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [selectedStampQty, setSelectedStampQty] = useState<number>(1);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [failedPinCount, setFailedPinCount] = useState<number>(0);

  // Modal triggers
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);

  // Load existing session on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('cakes_floor_phone');
    const savedName = localStorage.getItem('cakes_floor_name');

    if (savedPhone && savedName) {
      setCustomerPhone(savedPhone);
      setCustomerName(savedName);
      setIsRegistered(true);
      fetchCustomerData(savedPhone, savedName);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch or create customer record in Supabase / Local Storage fallback
  const fetchCustomerData = async (phone: string, _name: string) => {
    setIsLoading(true);
    try {
      const { data: customer, error: custErr } = await supabase
        .from('customers')
        .select('id, name, phone')
        .eq('phone', phone)
        .single();

      if (custErr && custErr.code !== 'PGRST116') {
        console.warn('Supabase fetch error, using local storage fallback:', custErr);
      }

      if (customer) {
        const { data: card } = await supabase
          .from('loyalty_cards')
          .select('current_stamps, total_rewards_earned, review_prompted')
          .eq('customer_id', customer.id)
          .single();

        if (card) {
          setCurrentStamps(card.current_stamps);
          setTotalRewards(card.total_rewards_earned);
        }
      } else {
        const localStamps = parseInt(localStorage.getItem(`cakes_stamps_${phone}`) || '1', 10);
        const localRewards = parseInt(localStorage.getItem(`cakes_rewards_${phone}`) || '0', 10);
        setCurrentStamps(localStamps);
        setTotalRewards(localRewards);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
      const localStamps = parseInt(localStorage.getItem(`cakes_stamps_${phone}`) || '1', 10);
      setCurrentStamps(localStamps);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle First Time Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanName = inputName.trim();
    const cleanPhone = inputPhone.trim().replace(/\D/g, '');

    if (!cleanName) {
      setFormError('Please enter your full name');
      return;
    }
    if (cleanPhone.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);

    try {
      localStorage.setItem('cakes_floor_phone', cleanPhone);
      localStorage.setItem('cakes_floor_name', cleanName);
      localStorage.setItem(`cakes_stamps_${cleanPhone}`, '1');
      localStorage.setItem(`cakes_rewards_${cleanPhone}`, '0');

      setCustomerName(cleanName);
      setCustomerPhone(cleanPhone);
      setCurrentStamps(1);
      setTotalRewards(0);
      setIsRegistered(true);

      const { data: newCustomer } = await supabase
        .from('customers')
        .insert([{ name: cleanName, phone: cleanPhone }])
        .select()
        .single();

      if (newCustomer) {
        await supabase
          .from('loyalty_cards')
          .insert([{ customer_id: newCustomer.id, current_stamps: 1, total_rewards_earned: 0 }]);
        
        await supabase
          .from('stamp_logs')
          .insert([{ customer_id: newCustomer.id, stamps_added: 1, staff_pin_used: 'REGISTER_WELCOME' }]);
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (err) {
      console.log('Registered with local fallback');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle PIN Submission for Adding Stamp(s)
  const handleVerifyPin = async () => {
    setPinError('');

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const secondsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setPinError(`Too many attempts! Please wait ${secondsLeft}s`);
      return;
    }

    if (enteredPin.trim() !== STAFF_PIN) {
      const newCount = failedPinCount + 1;
      setFailedPinCount(newCount);
      if (newCount >= 3) {
        setLockoutUntil(Date.now() + 5 * 60 * 1000);
        setPinError('Locked for 5 minutes due to 3 wrong PIN attempts.');
      } else {
        setPinError(`Incorrect Cashier PIN. ${3 - newCount} attempt(s) remaining.`);
      }
      return;
    }

    setFailedPinCount(0);

    let newStamps = currentStamps + selectedStampQty;
    if (newStamps >= 4) {
      newStamps = 4;
    }

    setCurrentStamps(newStamps);
    localStorage.setItem(`cakes_stamps_${customerPhone}`, newStamps.toString());

    try {
      const { data: cust } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customerPhone)
        .single();

      if (cust) {
        await supabase
          .from('loyalty_cards')
          .update({ current_stamps: newStamps, updated_at: new Date().toISOString() })
          .eq('customer_id', cust.id);

        await supabase
          .from('stamp_logs')
          .insert([{ customer_id: cust.id, stamps_added: selectedStampQty, staff_pin_used: STAFF_PIN }]);
      }
    } catch (err) {
      console.log('Updated stamp locally');
    }

    setIsPinModalOpen(false);
    setEnteredPin('');
    setSelectedStampQty(1);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });

    if (newStamps === 3 && !localStorage.getItem(`review_shown_${customerPhone}`)) {
      setTimeout(() => {
        setShowReviewModal(true);
        localStorage.setItem(`review_shown_${customerPhone}`, 'true');
      }, 800);
    }

    if (newStamps >= 4) {
      setTimeout(() => {
        setShowRewardModal(true);
      }, 800);
    }
  };

  // Handle Reward Redemption
  const handleRedeemReward = async () => {
    const newRewardsCount = totalRewards + 1;
    setTotalRewards(newRewardsCount);
    setCurrentStamps(0);

    localStorage.setItem(`cakes_stamps_${customerPhone}`, '0');
    localStorage.setItem(`cakes_rewards_${customerPhone}`, newRewardsCount.toString());

    try {
      const { data: cust } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customerPhone)
        .single();

      if (cust) {
        await supabase
          .from('loyalty_cards')
          .update({ current_stamps: 0, total_rewards_earned: newRewardsCount, updated_at: new Date().toISOString() })
          .eq('customer_id', cust.id);

        await supabase
          .from('reward_redemptions')
          .insert([{ customer_id: cust.id, reward_item: '1 Free ₹50 Pastry', staff_pin_used: STAFF_PIN }]);
      }
    } catch (e) {
      console.log('Redeemed locally');
    }

    setShowRewardModal(false);

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.4 }
    });
  };

  return (
    <>
      <Helmet>
        <title>Loyalty Rewards | The Cakes Floor</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-pink-50 to-rose-100 font-sans text-gray-800 pb-16 pt-6 px-4 selection:bg-pink-200">
        <div className="max-w-md mx-auto">

          {/* Header & Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg border-2 border-pink-300 p-2 mb-3 transform hover:rotate-6 transition-transform">
              <img src="/logo.png" alt="The Cakes Floor Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-['Outfit',sans-serif]">
              The Cakes Floor
            </h1>
            <p className="font-['Caveat',cursive] text-2xl font-bold text-pink-600 mt-1">
              ✨ Pastry Loyalty Club ✨
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 text-center shadow-xl border border-pink-200">
              <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading your rewards card...</p>
            </div>
          )}

          {/* FIRST TIME REGISTRATION FORM */}
          {!isLoading && !isRegistered && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl border-2 border-pink-200 transition-all">
              <div className="text-center mb-5">
                <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-700 text-sm font-bold rounded-full mb-2">
                  🎉 Special Customer Welcome
                </span>
                <h2 className="text-2xl font-bold text-gray-900 font-['Outfit',sans-serif]">
                  Join & Claim 1st Stamp!
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Buy 4 Pastries (₹50 each) ➔ Get 1 Free ₹50 Pastry!
                </p>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-rose-100 text-rose-700 text-sm font-semibold rounded-2xl text-center">
                  ⚠️ {formError}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 ml-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 bg-pink-50/50 border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-pink-500 font-semibold text-gray-800 text-base shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 ml-1">
                    Mobile Number (10 Digits)
                  </label>
                  <input
                    type="tel"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 bg-pink-50/50 border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-pink-500 font-semibold text-gray-800 text-base shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-lg rounded-2xl shadow-lg hover:shadow-pink-400/50 transform active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 animate-bounce" />
                  Start Earning & Get 1st Stamp
                </button>
              </form>

              <p className="text-xs text-center text-gray-700 mt-4 font-semibold">
                📌 Strictly 1 stamp per visit on any ₹50 pastry purchase.
              </p>
            </div>
          )}

          {/* ACTIVE LOYALTY CARD VIEW */}
          {!isLoading && isRegistered && (
            <div className="space-y-6">

              {/* Welcome Badge */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-md border border-pink-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-pink-600 uppercase tracking-wider">Welcome Back 👋</p>
                  <h3 className="text-lg font-bold text-gray-900">{customerName}</h3>
                </div>
                {totalRewards > 0 && (
                  <div className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Award className="w-4 h-4 text-amber-600" />
                    {totalRewards} Rewards Won!
                  </div>
                )}
              </div>

              {/* The Main 4-Stamp Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border-4 border-amber-300 relative overflow-hidden">

                {/* Card Header */}
                <div className="text-center mb-6">
                  <span className="inline-block px-4 py-1 bg-amber-100 text-amber-900 text-xs font-extrabold uppercase rounded-full mb-1 tracking-wider shadow-sm">
                    🧁 Pastry Loyalty Card
                  </span>
                  <h2 className="text-2xl font-black text-gray-900 font-['Outfit',sans-serif]">
                    Buy 4 Pastries ➔ Get 1 Free!
                  </h2>
                  <p className="text-xs text-pink-600 font-bold mt-1">
                    Applicable on all ₹50 Pastries at The Cakes Floor
                  </p>
                </div>

                {/* 4 STAMP SLOTS GRID */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[1, 2, 3, 4].map((slotNum) => {
                    const isStamped = slotNum <= currentStamps;
                    const isRewardSlot = slotNum === 4;

                    return (
                      <div
                        key={slotNum}
                        className={`aspect-square rounded-2xl border-3 flex flex-col items-center justify-center p-3 relative transition-all transform ${
                          isStamped
                            ? 'bg-gradient-to-br from-pink-400 via-rose-500 to-amber-400 border-amber-300 text-white shadow-lg scale-105 rotate-1'
                            : isRewardSlot
                            ? 'bg-amber-50 border-dashed border-amber-400 text-amber-600'
                            : 'bg-gray-50 border-dashed border-pink-200 text-gray-400'
                        }`}
                      >
                        <span className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isStamped ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          #{slotNum}
                        </span>

                        {isStamped ? (
                          <div className="text-center animate-pulse">
                            <span className="text-3xl block">🧁</span>
                            <span className="text-[11px] font-extrabold uppercase tracking-wide mt-1 text-white drop-shadow">
                              {isRewardSlot ? 'REWARD!' : 'COLLECTED'}
                            </span>
                          </div>
                        ) : isRewardSlot ? (
                          <div className="text-center">
                            <Gift className="w-8 h-8 text-amber-500 mx-auto animate-bounce mb-1" />
                            <span className="text-[10px] font-bold text-amber-700 uppercase">FREE PASTRY</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-2xl opacity-40 block">🎂</span>
                            <span className="text-[10px] font-semibold text-gray-600 mt-1">₹50 Pastry</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Progress Status Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                    <span>Your Progress</span>
                    <span>{currentStamps} of 4 Stamps</span>
                  </div>
                  <div className="w-full bg-pink-100 h-3 rounded-full overflow-hidden p-0.5 border border-pink-200">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(currentStamps / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                {currentStamps < 4 ? (
                  <button
                    onClick={() => setIsPinModalOpen(true)}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white font-extrabold text-lg rounded-2xl shadow-xl hover:shadow-amber-400/50 transform active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-white/40"
                  >
                    <Sparkles className="w-6 h-6 animate-spin" />
                    Add Today's Stamp
                  </button>
                ) : (
                  <button
                    onClick={() => setShowRewardModal(true)}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-emerald-400/50 animate-pulse flex items-center justify-center gap-2"
                  >
                    <Gift className="w-6 h-6" />
                    Claim Free Pastry Reward!
                  </button>
                )}

                {/* Terms Note */}
                <div className="mt-4 pt-3 border-t border-pink-100 text-center">
                  <p className="text-[11px] text-gray-600 font-semibold">
                    📌 Valid exclusively on ₹50 pastries at The Cakes Floor. 1 stamp per visit.
                  </p>
                </div>

              </div>

              {/* BOTTOM ACTION LINKS (Opening in New Tab for Menu & Website) */}
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-lg border border-pink-200 space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider text-center mb-2">
                  Quick Actions
                </h4>

                {/* Google Review Button (Opens in New Tab) */}
                <a
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-amber-50 hover:bg-amber-100/80 rounded-2xl border border-amber-200 transition-all font-bold text-amber-900 text-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <span>Leave a 5-Star Google Review</span>
                      <p className="text-[11px] text-amber-700 font-normal">Support your favorite local bakery</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </a>

                {/* Digital Menu Link (Opens in New Tab) */}
                <a
                  href="/menu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-rose-50 hover:bg-rose-100/80 rounded-2xl border border-rose-200 transition-all font-bold text-rose-900 text-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500 text-white rounded-xl shadow-sm">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div>
                      <span>Explore Digital Cake Menu</span>
                      <p className="text-[11px] text-rose-700 font-normal">View fresh cakes & pastries</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-rose-600 group-hover:translate-x-1 transition-transform" />
                </a>

                {/* Main Website Link (Opens in New Tab) */}
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-purple-50 hover:bg-purple-100/80 rounded-2xl border border-purple-200 transition-all font-bold text-purple-900 text-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 text-white rounded-xl shadow-sm">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <span>Visit Main Website</span>
                      <p className="text-[11px] text-purple-700 font-normal">thecakesfloor.in</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </a>

                {/* Call Bakery Link */}
                <a
                  href="tel:+917887324373"
                  className="flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100/80 rounded-2xl border border-emerald-200 transition-all font-bold text-emerald-900 text-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span>Call Bakery Counter</span>
                      <p className="text-[11px] text-emerald-700 font-normal">+91 78873 24373</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </a>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* MODAL 1: CASHIER PIN VERIFICATION MODAL */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-amber-300 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setIsPinModalOpen(false);
                setEnteredPin('');
                setPinError('');
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cashier Verification</h3>
              <p className="text-xs text-gray-600 mt-1">
                Ask Cashier at The Cakes Floor counter to enter Staff PIN
              </p>
            </div>

            {pinError && (
              <div className="mb-4 p-3 bg-rose-100 text-rose-700 text-xs font-bold rounded-xl text-center">
                ⚠️ {pinError}
              </div>
            )}

            {/* Optional Multi-Stamp Selector */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-gray-600 uppercase text-center mb-1.5">
                Stamps To Add (1 Default)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setSelectedStampQty(qty)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      selectedStampQty === qty
                        ? 'bg-pink-500 text-white border-pink-500 shadow-md scale-105'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    +{qty} Stamp
                  </button>
                ))}
              </div>
            </div>

            {/* PIN Input */}
            <div className="mb-5">
              <input
                type="password"
                maxLength={4}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Enter 4-Digit Staff PIN"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 bg-pink-50/50 border-2 border-pink-300 rounded-2xl focus:outline-none focus:border-pink-500"
              />
            </div>

            <button
              onClick={handleVerifyPin}
              disabled={enteredPin.length < 4}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-amber-500 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-pink-400/50 disabled:opacity-50 transition-all"
            >
              Verify & Add Stamp
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: 3rd STAMP GOOGLE REVIEW POPUP (Opens in New Tab) */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-pink-300 relative text-center">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
              <Star className="w-9 h-9 fill-current animate-bounce" />
            </div>

            <h3 className="text-2xl font-black text-gray-900 font-['Outfit',sans-serif]">
              Enjoying Our Pastries? 🍰
            </h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              You've unlocked <strong>3 Stamps</strong>! Would you take 10 seconds to leave us a 5-Star Review on Google? It helps our bakery immensely!
            </p>

            <div className="mt-5 space-y-2">
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowReviewModal(false)}
                className="block w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-amber-300/50 transition-all flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4 fill-current" />
                Leave a 5-Star Review on Google
              </a>

              <button
                onClick={() => setShowReviewModal(false)}
                className="block w-full py-2.5 text-xs text-gray-700 font-bold hover:underline"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: 4th STAMP REWARD UNLOCKED MODAL */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-amber-100 via-white to-pink-50 rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-amber-400 relative text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl animate-pulse">
              <Gift className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 bg-amber-200 text-amber-900 text-xs font-black rounded-full uppercase tracking-wider">
              🎉 Reward Unlocked!
            </span>

            <h3 className="text-2xl font-black text-gray-900 mt-2 font-['Outfit',sans-serif]">
              1 FREE ₹50 PASTRY!
            </h3>

            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Show this screen to the cashier at <strong>The Cakes Floor</strong> counter to claim your free ₹50 pastry gift!
            </p>

            <div className="mt-6 p-4 bg-white/90 rounded-2xl border-2 border-amber-300 shadow-inner">
              <p className="text-[11px] font-bold text-gray-700 uppercase">Cashier Redemption</p>
              <p className="text-xs text-gray-700 mt-1">Cashier will type PIN to complete redemption</p>

              <button
                onClick={handleRedeemReward}
                className="mt-3 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold rounded-xl shadow-lg hover:shadow-emerald-400/50 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Cashier Redeem Reward
              </button>
            </div>

            <button
              onClick={() => setShowRewardModal(false)}
              className="mt-3 text-xs font-bold text-gray-700 hover:underline"
            >
              Close for now
            </button>
          </div>
        </div>
      )}

    </>
  );
};
