import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { MapPin, Phone, Mail, Clock, Send, Compass } from 'lucide-react';
import { SEO } from '../components/SEO';

export const Contact: React.FC = () => {
  const [isOpenNow, setIsOpenNow] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    deliveryAddress: '',
    pincode: '',
    preferredDate: '',
    nameOnCake: '',
    specialInstructions: '',
    alternatePhone: '',
    orderType: 'Self-Pickup',
    weight: '500g',
    quantity: '1',
    eggPreference: 'Eggless',
    timeSlot: 'Morning (9am–12pm)',
    isSurprise: 'No',
    addOns: [] as string[],
    // Chocolates details
    chocolateType: 'Dark',
    chocolateQty: '250g',
    chocolatePkg: 'Box',
    chocolateMsg: '',
    chocolateAllergy: '',
    // Flower Bouquet details
    flowerType: 'Rose',
    flowerColor: 'Red',
    flowerSize: 'Medium',
    flowerWrap: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate live open/closed status (10:00 AM to 10:30 PM)
  useEffect(() => {
    const checkOpenStatus = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentTime = currentHour * 60 + currentMin; // Current time in minutes from midnight

      const openTime = 10 * 60; // 10:00 AM in minutes
      const closeTime = 22 * 60 + 30; // 10:30 PM in minutes

      if (currentTime >= openTime && currentTime < closeTime) {
        setIsOpenNow(true);
      } else {
        setIsOpenNow(false);
      }
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000); // Re-check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // GSAP ScrollTrigger reveals
    const items = gsap.utils.toArray('.reveal-item');
    const triggers = items.map((item: any) =>
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    );

    return () => {
      triggers.forEach((t) => t.scrollTrigger?.kill());
    };
  }, []);

  const handleGetDirections = (destinationAddress: string) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${encodeURIComponent(destinationAddress)}`,
            '_blank'
          );
        },
        () => {
          // Fallback if permission denied
          window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationAddress)}`,
            '_blank'
          );
        }
      );
    } else {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationAddress)}`,
        '_blank'
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCheckboxChange = (addonName: string) => {
    setFormData((prev) => {
      let updatedAddOns = [...prev.addOns];
      if (addonName === 'None') {
        if (updatedAddOns.includes('None')) {
          updatedAddOns = [];
        } else {
          updatedAddOns = ['None'];
        }
      } else {
        updatedAddOns = updatedAddOns.filter((item) => item !== 'None');
        if (updatedAddOns.includes(addonName)) {
          updatedAddOns = updatedAddOns.filter((item) => item !== addonName);
        } else {
          updatedAddOns.push(addonName);
        }
      }
      return {
        ...prev,
        addOns: updatedAddOns,
      };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.message.trim()) newErrors.message = 'Cake details/message is required';
    if (!formData.weight) newErrors.weight = 'Weight is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    if (!formData.orderType) newErrors.orderType = 'Order type is required';
    
    if (formData.orderType === 'Delivery') {
      if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = 'Delivery address is required for delivery';
      if (!formData.pincode.trim()) newErrors.pincode = 'Pin Code / Area is required for delivery';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const whatsappNumber = '917887324373';
    
    const lines: string[] = [];
    lines.push('*New Cake Enquiry*');
    lines.push(`Name: ${formData.name.trim()}`);
    lines.push(`Phone: ${formData.phone.trim()}`);
    if (formData.alternatePhone.trim()) {
      lines.push(`Alt Phone: ${formData.alternatePhone.trim()}`);
    }
    lines.push(`Cake: ${formData.message.trim()}`);
    lines.push(`Weight: ${formData.weight}`);
    lines.push(`Qty: ${formData.quantity}`);
    lines.push(`Egg Pref: ${formData.eggPreference}`);
    
    if (formData.nameOnCake.trim()) {
      lines.push(`Name on Cake: ${formData.nameOnCake.trim()}`);
    }
    
    const addonsStr = formData.addOns.length > 0 ? formData.addOns.join(', ') : 'None';
    lines.push(`Add-ons: ${addonsStr}`);

    if (formData.addOns.includes('Chocolates')) {
      lines.push(`*Choc:* ${formData.chocolateType}, ${formData.chocolateQty}, ${formData.chocolatePkg}`);
      if (formData.chocolateMsg.trim()) {
        lines.push(`Choc Msg: ${formData.chocolateMsg.trim()}`);
      }
      if (formData.chocolateAllergy.trim()) {
        lines.push(`Choc Allergy: ${formData.chocolateAllergy.trim()}`);
      }
    }

    if (formData.addOns.includes('Flower Bouquet')) {
      lines.push(`*Flowers:* ${formData.flowerType}, ${formData.flowerColor}, ${formData.flowerSize}`);
      if (formData.flowerWrap.trim()) {
        lines.push(`Flower Wrap: ${formData.flowerWrap.trim()}`);
      }
    }
    
    lines.push(`Order Type: ${formData.orderType}`);
    if (formData.orderType === 'Delivery') {
      lines.push(`Address: ${formData.deliveryAddress.trim()}`);
      lines.push(`Pincode: ${formData.pincode.trim()}`);
    }
    
    if (formData.preferredDate) {
      lines.push(`Date: ${formData.preferredDate}`);
    }
    lines.push(`Time: ${formData.timeSlot}`);
    lines.push(`Surprise: ${formData.isSurprise}`);
    
    if (formData.specialInstructions.trim()) {
      lines.push(`Instructions: ${formData.specialInstructions.trim()}`);
    }

    lines.push('_If you\'d like, please feel free to send any reference images of the flower bouquet or cake design here._');
    
    const messageTemplate = lines.join('\n');
    const encodedMessage = encodeURIComponent(messageTemplate);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setFormData({
      name: '',
      phone: '',
      message: '',
      deliveryAddress: '',
      pincode: '',
      preferredDate: '',
      nameOnCake: '',
      specialInstructions: '',
      alternatePhone: '',
      orderType: 'Self-Pickup',
      weight: '500g',
      quantity: '1',
      eggPreference: 'Eggless',
      timeSlot: 'Morning (9am–12pm)',
      isSurprise: 'No',
      addOns: [],
      chocolateType: 'Dark',
      chocolateQty: '250g',
      chocolatePkg: 'Box',
      chocolateMsg: '',
      chocolateAllergy: '',
      flowerType: 'Rose',
      flowerColor: 'Red',
      flowerSize: 'Medium',
      flowerWrap: '',
    });
    setErrors({});
  };

  return (
    <div className="pt-24 pb-16">
      <SEO 
        title="Contact Us & Order Cakes | The Cakes Floor Bhandara" 
        description="Get in touch with The Cakes Floor in Bhandara. Order custom birthday & wedding cakes on WhatsApp, get directions to our Bhandara main branch & Lakhani branch, or contact our support." 
        path="/contact" 
      />
      {/* 1. Page Header */}
      <section className="py-16 bg-gradient-to-b from-[#181817] to-background border-b border-white/5 relative">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <span className="font-body text-xs uppercase tracking-[0.25em] text-primary">Get in Touch</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-on-surface">
            Contact Us
          </h1>
          <div className="w-16 h-[1px] bg-primary/50 mx-auto mt-4" />
          <p className="font-body text-[#e5e2e0]/60 font-light text-sm max-w-lg mx-auto leading-relaxed">
            Have questions about customized birthday cakes or catering? Send us a message or visit us in Bhandara.
          </p>
        </div>
      </section>

      {/* 2. Contact details & form */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Info Column */}
        <div className="text-left space-y-8 reveal-item">
          <div className="space-y-4">
            <h2 className="font-display text-3xl font-bold text-[#e5e2e0]">The Cakes Floor</h2>
            <p className="font-body text-sm font-light text-[#e5e2e0]/60 max-w-md leading-relaxed">
              We look forward to serving you Bhandara’s freshest cakes and savories. Drop by our storefront or contact us via phone/WhatsApp.
            </p>
          </div>

          <div className="space-y-6 font-body text-sm font-light text-[#e5e2e0]/70">
            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <MapPin size={18} />
              </div>
              <div className="space-y-4 flex-1">
                <h4 className="font-semibold text-[#e5e2e0] mb-1">Our Branches</h4>
                <div className="space-y-5 font-body text-xs md:text-sm text-[#e5e2e0]/70 font-light">
                  <div>
                    <p className="font-semibold text-[#e5e2e0]">Bhandara — Zilla Parishad Square (Main Branch)</p>
                    <p className="leading-relaxed">Zilla Parishad Square, Takiya Ward, Near Sai Mandir, Near, Ganeshpur, Bhandara, Maharashtra - 441904</p>
                    <button
                      onClick={() => handleGetDirections("The Cakes Floor, Zilla Parishad Square, Takiya Ward, Near Sai Mandir, Near, Ganeshpur, Bhandara")}
                      className="text-primary hover:underline text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mt-1.5 cursor-pointer"
                    >
                      <Compass size={12} /> Get Directions
                    </button>
                  </div>

                  <div>
                    <p className="font-semibold text-[#e5e2e0]">Lakhani</p>
                    <p className="leading-relaxed">Gangotri Building, Murmadi, Lakhani, Maharashtra</p>
                    <button
                      onClick={() => handleGetDirections("The Cakes Floor, Gangotri Building, Murmadi, Lakhani")}
                      className="text-primary hover:underline text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mt-1.5 cursor-pointer"
                    >
                      <Compass size={12} /> Get Directions
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Phone size={18} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-semibold text-[#e5e2e0]">Call Enquiries</h4>
                <div className="space-y-1 text-xs md:text-sm font-light leading-relaxed text-[#e5e2e0]/70">
                  <p>
                    <span className="text-[#e5e2e0] font-medium">Bhandara Main Branch:</span>{' '}
                    <a href="tel:+917887324373" className="hover:text-primary transition-colors">+91 78873 24373</a>
                  </p>
                  <p>
                    <span className="text-[#e5e2e0] font-medium">Lakhani Branch:</span>{' '}
                    <a href="tel:+918600629962" className="hover:text-primary transition-colors">+91 86006 29962</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Mail size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-[#e5e2e0] mb-1">Email Support</h4>
                <p className="leading-relaxed">
                  <a href="mailto:info@thecakesfloor.com" className="hover:text-primary transition-colors">info@thecakesfloor.com</a>
                </p>
              </div>
            </div>

            {/* Hours with Live status */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Clock size={18} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-[#e5e2e0]">Opening Hours</h4>
                  {isOpenNow ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] uppercase tracking-wider font-semibold animate-pulse">
                      Open Now
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-wider font-semibold">
                      Closed Now
                    </span>
                  )}
                </div>
                <p className="leading-relaxed mt-1">Monday - Sunday: 10:00 AM - 10:30 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="reveal-item">
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <h3 className="font-display text-2xl font-bold text-left text-on-surface">Cake Enquiry Form</h3>

            <form onSubmit={handleSubmit} noValidate className="space-y-5 text-left font-body text-sm">
                {/* 1. Name & Phone & Alternate Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-[#e5e2e0] placeholder-[#e5e2e0]/20 focus:border-primary focus:outline-none transition-colors`}
                      placeholder="Enter your name"
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full bg-white/5 border ${errors.phone ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-[#e5e2e0] placeholder-[#e5e2e0]/20 focus:border-primary focus:outline-none transition-colors`}
                      placeholder="Enter your mobile number"
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="alternatePhone" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                      Alternate Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="alternatePhone"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#e5e2e0] placeholder-[#e5e2e0]/20 focus:border-primary focus:outline-none transition-colors"
                      placeholder="Enter alternate number"
                    />
                  </div>

                  <div>
                    <label htmlFor="nameOnCake" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                      Name to be written on cake (Optional)
                    </label>
                    <input
                      type="text"
                      id="nameOnCake"
                      name="nameOnCake"
                      value={formData.nameOnCake}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#e5e2e0] placeholder-[#e5e2e0]/20 focus:border-primary focus:outline-none transition-colors"
                      placeholder="Leave blank if not needed"
                    />
                  </div>
                </div>

                {/* 2. Order Type, Preferred Date, Preferred Time Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="orderType" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                      Order Type *
                    </label>
                    <select
                      id="orderType"
                      name="orderType"
                      value={formData.orderType}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#e5e2e0] focus:border-primary focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="Self-Pickup" className="bg-[#1e1511] text-[#e5e2e0]">Self-Pickup</option>
                      <option value="Delivery" className="bg-[#1e1511] text-[#e5e2e0]">Delivery</option>
                    </select>
                    <p className="text-[10px] text-[#e5e2e0]/40 mt-1">Select "Delivery" to enter your address details</p>
                  </div>

                  <div>
                    <label htmlFor="preferredDate" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                      Preferred Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="preferredDate"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#e5e2e0] focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="timeSlot" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                      Preferred Time Slot *
                    </label>
                    <select
                      id="timeSlot"
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#e5e2e0] focus:border-primary focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="Morning (9am–12pm)" className="bg-[#1e1511] text-[#e5e2e0]">Morning (9am–12pm)</option>
                      <option value="Afternoon (12pm–4pm)" className="bg-[#1e1511] text-[#e5e2e0]">Afternoon (12pm–4pm)</option>
                      <option value="Evening (4pm–8pm)" className="bg-[#1e1511] text-[#e5e2e0]">Evening (4pm–8pm)</option>
                      <option value="Specific Time (mention in special instructions)" className="bg-[#1e1511] text-[#e5e2e0]">Specific Time (mention below)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Delivery Details (Shown conditionally if Order Type is Delivery) */}
                {formData.orderType === 'Delivery' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="md:col-span-3">
                      <label htmlFor="deliveryAddress" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                        Delivery Address *
                      </label>
                      <textarea
                        id="deliveryAddress"
                        name="deliveryAddress"
                        rows={2}
                        value={formData.deliveryAddress}
                        onChange={handleInputChange}
                        className={`w-full bg-white/5 border ${errors.deliveryAddress ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-[#e5e2e0] placeholder-[#e5e2e0]/20 focus:border-primary focus:outline-none transition-colors resize-none`}
                        placeholder="Enter full delivery address"
                      />
                      {errors.deliveryAddress && <p className="text-red-400 text-xs mt-1">{errors.deliveryAddress}</p>}
                    </div>

                    <div className="md:col-span-1">
                      <label htmlFor="pincode" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                        Pin Code / Area *
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className={`w-full bg-white/5 border ${errors.pincode ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-[#e5e2e0] placeholder-[#e5e2e0]/20 focus:border-primary focus:outline-none transition-colors`}
                        placeholder="441904"
                      />
                      {errors.pincode && <p className="text-red-400 text-xs mt-1">{errors.pincode}</p>}
                    </div>
                  </div>
                )}

                {/* 4. Cake Weight, Quantity, and Egg Preference */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="weight" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                      Cake Weight *
                    </label>
                    <select
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#e5e2e0] focus:border-primary focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="250g" className="bg-[#1e1511] text-[#e5e2e0]">250g</option>
                      <option value="500g" className="bg-[#1e1511] text-[#e5e2e0]">500g</option>
                      <option value="1kg" className="bg-[#1e1511] text-[#e5e2e0]">1kg</option>
                      <option value="1.5kg" className="bg-[#1e1511] text-[#e5e2e0]">1.5kg</option>
                      <option value="2kg" className="bg-[#1e1511] text-[#e5e2e0]">2kg</option>
                      <option value="Custom (specify in cake details)" className="bg-[#1e1511] text-[#e5e2e0]">Custom (specify in details)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                      Cake Quantity *
                    </label>
                    <select
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#e5e2e0] focus:border-primary focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="1" className="bg-[#1e1511] text-[#e5e2e0]">1</option>
                      <option value="2" className="bg-[#1e1511] text-[#e5e2e0]">2</option>
                      <option value="3" className="bg-[#1e1511] text-[#e5e2e0]">3</option>
                      <option value="More than 3" className="bg-[#1e1511] text-[#e5e2e0]">More than 3</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="eggPreference" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                      Egg Preference *
                    </label>
                    <select
                      id="eggPreference"
                      name="eggPreference"
                      value={formData.eggPreference}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#e5e2e0] focus:border-primary focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="Eggless" className="bg-[#1e1511] text-[#e5e2e0]">Eggless</option>
                      <option value="With Egg" className="bg-[#1e1511] text-[#e5e2e0]">With Egg</option>
                    </select>
                  </div>
                </div>

                {/* 5. Is this a surprise order? */}
                <div>
                  <label htmlFor="isSurprise" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                    Is this a surprise order? *
                  </label>
                  <select
                    id="isSurprise"
                    name="isSurprise"
                    value={formData.isSurprise}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#e5e2e0] focus:border-primary focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="No" className="bg-[#1e1511] text-[#e5e2e0]">No</option>
                    <option value="Yes" className="bg-[#1e1511] text-[#e5e2e0]">Yes</option>
                  </select>
                </div>

                {/* 6. Cake Details / Message */}
                <div>
                  <label htmlFor="message" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                    Message / Cake Details *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full bg-white/5 border ${errors.message ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-[#e5e2e0] placeholder-[#e5e2e0]/20 focus:border-primary focus:outline-none transition-colors resize-none`}
                    placeholder="Flavor, theme description, frosting style, custom message details..."
                  />
                  {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                </div>

                {/* 7. Special Instructions */}
                <div>
                  <label htmlFor="specialInstructions" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    rows={2}
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#e5e2e0] placeholder-[#e5e2e0]/20 focus:border-primary focus:outline-none transition-colors resize-none"
                    placeholder="Allergies, packaging preferences, specific time note..."
                  />
                </div>

                {/* 8. Add-ons Checkboxes */}
                <div className="space-y-3">
                  <label className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60">
                    Add-ons (Optional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {['Candles', 'Cake Topper', 'Balloons/Decoration', 'Greeting Card', 'Chocolates', 'Flower Bouquet', 'None'].map((addon) => (
                      <label key={addon} className="flex items-center gap-2.5 cursor-pointer text-xs md:text-sm text-[#e5e2e0]/80 hover:text-white select-none">
                        <input
                          type="checkbox"
                          checked={formData.addOns.includes(addon)}
                          onChange={() => handleCheckboxChange(addon)}
                          className="accent-primary w-4 h-4 rounded border-white/10 cursor-pointer"
                        />
                        {addon}
                      </label>
                    ))}
                  </div>

                  {/* Chocolates Conditional Fields */}
                  {formData.addOns.includes('Chocolates') && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in duration-200 mt-3">
                      <h4 className="text-xs uppercase tracking-wider text-primary font-semibold">Chocolates Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label htmlFor="chocolateType" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-1">
                            Type
                          </label>
                          <select
                            id="chocolateType"
                            name="chocolateType"
                            value={formData.chocolateType}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#e5e2e0] text-xs focus:border-primary focus:outline-none cursor-pointer"
                          >
                            <option value="Dark" className="bg-[#1e1511]">Dark</option>
                            <option value="Milk" className="bg-[#1e1511]">Milk</option>
                            <option value="White" className="bg-[#1e1511]">White</option>
                            <option value="Assorted" className="bg-[#1e1511]">Assorted</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="chocolateQty" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-1">
                            Quantity
                          </label>
                          <select
                            id="chocolateQty"
                            name="chocolateQty"
                            value={formData.chocolateQty}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#e5e2e0] text-xs focus:border-primary focus:outline-none cursor-pointer"
                          >
                            <option value="250g" className="bg-[#1e1511]">250g</option>
                            <option value="500g" className="bg-[#1e1511]">500g</option>
                            <option value="1kg" className="bg-[#1e1511]">1kg</option>
                            <option value="12 Pcs" className="bg-[#1e1511]">12 Pcs</option>
                            <option value="24 Pcs" className="bg-[#1e1511]">24 Pcs</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="chocolatePkg" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-1">
                            Packaging
                          </label>
                          <select
                            id="chocolatePkg"
                            name="chocolatePkg"
                            value={formData.chocolatePkg}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#e5e2e0] text-xs focus:border-primary focus:outline-none cursor-pointer"
                          >
                            <option value="Box" className="bg-[#1e1511]">Box</option>
                            <option value="Basket" className="bg-[#1e1511]">Basket</option>
                            <option value="Loose wrapped" className="bg-[#1e1511]">Loose wrapped</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="chocolateMsg" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-1">
                            Personalized Message (Optional)
                          </label>
                          <input
                            type="text"
                            id="chocolateMsg"
                            name="chocolateMsg"
                            value={formData.chocolateMsg}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#e5e2e0] text-xs placeholder-[#e5e2e0]/20 focus:border-primary focus:outline-none"
                            placeholder="e.g. Happy Birthday"
                          />
                        </div>

                        <div>
                          <label htmlFor="chocolateAllergy" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-1">
                            Allergy Preference (Optional)
                          </label>
                          <input
                            type="text"
                            id="chocolateAllergy"
                            name="chocolateAllergy"
                            value={formData.chocolateAllergy}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#e5e2e0] text-xs placeholder-[#e5e2e0]/20 focus:border-primary focus:outline-none"
                            placeholder="e.g. No nuts"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Flower Bouquet Conditional Fields */}
                  {formData.addOns.includes('Flower Bouquet') && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in duration-200 mt-3">
                      <h4 className="text-xs uppercase tracking-wider text-primary font-semibold">Flower Bouquet Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label htmlFor="flowerType" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-1">
                            Flower Type
                          </label>
                          <select
                            id="flowerType"
                            name="flowerType"
                            value={formData.flowerType}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#e5e2e0] text-xs focus:border-primary focus:outline-none cursor-pointer"
                          >
                            <option value="Rose" className="bg-[#1e1511]">Rose</option>
                            <option value="Lily" className="bg-[#1e1511]">Lily</option>
                            <option value="Mixed Seasonal" className="bg-[#1e1511]">Mixed Seasonal</option>
                            <option value="Other" className="bg-[#1e1511]">Other</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="flowerColor" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-1">
                            Color Preference
                          </label>
                          <select
                            id="flowerColor"
                            name="flowerColor"
                            value={formData.flowerColor}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#e5e2e0] text-xs focus:border-primary focus:outline-none cursor-pointer"
                          >
                            <option value="Red" className="bg-[#1e1511]">Red</option>
                            <option value="Pink" className="bg-[#1e1511]">Pink</option>
                            <option value="Yellow" className="bg-[#1e1511]">Yellow</option>
                            <option value="White" className="bg-[#1e1511]">White</option>
                            <option value="Mixed" className="bg-[#1e1511]">Mixed</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="flowerSize" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-1">
                            Size
                          </label>
                          <select
                            id="flowerSize"
                            name="flowerSize"
                            value={formData.flowerSize}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#e5e2e0] text-xs focus:border-primary focus:outline-none cursor-pointer"
                          >
                            <option value="Small" className="bg-[#1e1511]">Small</option>
                            <option value="Medium" className="bg-[#1e1511]">Medium</option>
                            <option value="Large" className="bg-[#1e1511]">Large</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="flowerWrap" className="block text-xs uppercase tracking-wider text-[#e5e2e0]/60 mb-1">
                          Wrapping/Ribbon Style (Optional)
                        </label>
                        <input
                          type="text"
                          id="flowerWrap"
                          name="flowerWrap"
                          value={formData.flowerWrap}
                          onChange={handleInputChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#e5e2e0] text-xs placeholder-[#e5e2e0]/20 focus:border-primary focus:outline-none"
                          placeholder="e.g. Red satin ribbon with kraft paper"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Italic Note */}
                <p className="text-xs italic text-[#e5e2e0]/60 text-center pt-2">
                  You can also send us reference images of the flower bouquet or cake design directly on WhatsApp after sending this enquiry.
                </p>

                {/* 9. Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-primary text-on-primary font-semibold py-3.5 rounded-full hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={14} />
                    Send Enquiry on WhatsApp
                  </button>
                </div>
              </form>
            </div>
        </div>
      </section>

      {/* 3. Maps Embed */}
      <section className="max-w-7xl mx-auto px-6 pt-10">
        <div className="h-[450px] w-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative bg-white/5">
          <iframe
            src="https://maps.google.com/maps?q=The%20Cakes%20Floor%2C%20near%20Sai%20Mandir%2C%20Khat%20Road%2C%20Bhandara&t=&z=16&ie=UTF8&iwloc=A&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="The Cakes Floor Bhandara Map Location"
          />
        </div>
      </section>
    </div>
  );
};
