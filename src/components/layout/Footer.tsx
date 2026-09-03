import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0e0e0d] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3 w-fit select-none">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="The Cakes Floor Logo" className="h-14 w-auto object-contain" loading="lazy" />
            <div className="flex flex-col justify-center gap-0 leading-[0.85] font-display h-14">
              <span 
                className="font-extrabold tracking-[0.08em] text-white text-glow uppercase text-xs" 
                style={{ fontFamily: "'Open Sauce One', sans-serif" }}
              >
                THE
              </span>
              <span 
                className="font-extrabold tracking-[0.08em] text-[#ffb954] text-glow uppercase text-xs" 
                style={{ fontFamily: "'Open Sauce One', sans-serif" }}
              >
                CAKES
              </span>
              <span 
                className="font-extrabold tracking-[0.08em] text-[#ffb954] text-glow uppercase text-xs" 
                style={{ fontFamily: "'Open Sauce One', sans-serif" }}
              >
                FLOOR
              </span>
            </div>
          </Link>
          <p className="font-body text-[#e5e2e0]/60 text-sm font-light leading-relaxed max-w-xs">
            Bhandara’s beloved destination for premium cakes, fresh savories, and artisanal celebration masterworks baked daily with love.
          </p>
          <div className="flex gap-4 pt-2">
            <a
              href="https://www.instagram.com/thecakesfloor"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#e5e2e0]/80 hover:text-primary hover:border-primary/50 transition-colors"
              aria-label="Visit Instagram Profile"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a
              href="https://wa.me/917887324373"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#e5e2e0]/80 hover:text-primary hover:border-primary/50 transition-colors"
              aria-label="Chat on WhatsApp"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="font-display text-lg text-primary mb-6 font-semibold">Explore</h4>
          <ul className="space-y-3 font-body text-sm font-light text-[#e5e2e0]/60">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
            </li>
            <li>
              <Link to="/menu" className="hover:text-primary transition-colors">Our Menu</Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-primary transition-colors">Gallery</Link>
            </li>
            <li>
              <Link to="/reviews" className="hover:text-primary transition-colors">Reviews</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Hours */}
        <div>
          <h4 className="font-display text-lg text-primary mb-6 font-semibold">Hours</h4>
          <ul className="space-y-3 font-body text-sm font-light text-[#e5e2e0]/60">
            <li className="flex justify-between border-b border-white/5 pb-2">
              <span>Monday - Sunday:</span>
              <span className="text-[#e5e2e0]">10:00 AM - 10:30 PM</span>
            </li>
            <li className="text-xs text-[#e5e2e0]/40 pt-2 leading-relaxed">
              Open all 7 days of the week, including holidays, to sweeten your special celebrations.
            </li>
          </ul>
        </div>

        {/* Column 4: Contact info */}
        <div>
          <h4 className="font-display text-lg text-primary mb-6 font-semibold">Contact</h4>
          <ul className="space-y-4 font-body text-sm font-light text-[#e5e2e0]/60">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
              <span>Zilla Parishad Square, Takiya Ward, Near Sai Mandir, Near, Ganeshpur, Bhandara, Maharashtra - 441904</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={18} className="text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <a href="tel:+917887324373" className="hover:text-primary transition-colors">+91 78873 24373 <span className="text-xs text-[#e5e2e0]/40">(Bhandara Main)</span></a>
                <a href="tel:+918600629962" className="hover:text-primary transition-colors">+91 86006 29962 <span className="text-xs text-[#e5e2e0]/40">(Lakhani)</span></a>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-primary shrink-0" />
              <a href="mailto:info@thecakesfloor.com" className="hover:text-primary transition-colors">info@thecakesfloor.com</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-body font-light text-[#e5e2e0]/40">
        <div>
          &copy; {new Date().getFullYear()} The Cakes Floor. All rights reserved.
        </div>
        <div className="flex gap-4">
          <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};
