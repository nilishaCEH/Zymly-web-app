import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#2B3033] text-[#E0D8C8]" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <img 
              src="https://customer-assets.emergentagent.com/job_zymly-mission/artifacts/retece6k_1180243_fotor-2026012315320_1769161062478.png" 
              alt="Zymly" 
              className="h-16 w-auto mb-6"
            />
            <p className="text-[#E0D8C8]/70 max-w-md leading-relaxed">
              Naturally fermented probiotic beverages crafted with love. 
              100% vegan, homemade, and good for your gut.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://instagram.com/zymly"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#E0D8C8]/10 flex items-center justify-center hover:bg-[#C8A25F] transition-colors"
                data-testid="footer-instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="mailto:contactus@zymly.in"
                className="w-10 h-10 rounded-full bg-[#E0D8C8]/10 flex items-center justify-center hover:bg-[#C8A25F] transition-colors"
                data-testid="footer-email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 font-['Outfit']">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-[#E0D8C8]/70 hover:text-[#C8A25F] transition-colors" data-testid="footer-link-home">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/flavors" className="text-[#E0D8C8]/70 hover:text-[#C8A25F] transition-colors" data-testid="footer-link-flavors">
                  Natural Flavors
                </Link>
              </li>
              <li>
                <Link to="/mission" className="text-[#E0D8C8]/70 hover:text-[#C8A25F] transition-colors" data-testid="footer-link-mission">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#E0D8C8]/70 hover:text-[#C8A25F] transition-colors" data-testid="footer-link-about">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6 font-['Outfit']">Get in Touch</h4>
            <ul className="space-y-3 text-[#E0D8C8]/70">
              <li>
                <a href="mailto:contactus@zymly.in" className="hover:text-[#C8A25F] transition-colors">
                  contactus@zymly.in
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C8A25F] transition-colors">
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E0D8C8]/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#E0D8C8]/50 text-sm">
            © {new Date().getFullYear()} Zymly. All rights reserved.
          </p>
          <p className="text-[#E0D8C8]/50 text-sm flex items-center gap-2">
            Made with <Heart size={14} className="text-[#C8A25F]" /> for your gut health
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
