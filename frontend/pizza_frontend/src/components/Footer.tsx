import { Pizza, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg">
                <Pizza className="w-5 h-5 text-white" />
              </div>
              <span className="text-white">PizzaCraft</span>
            </div>
            <p className="text-gray-400 mb-4">
              Crafting the perfect pizza since 2024. Made with love, baked to perfection, delivered with care.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-br hover:from-red-600 hover:to-orange-500 flex items-center justify-center transition-all hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-br hover:from-red-600 hover:to-orange-500 flex items-center justify-center transition-all hover:scale-110"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-br hover:from-red-600 hover:to-orange-500 flex items-center justify-center transition-all hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-red-500 transition-colors">
                  Build Your Pizza
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-red-500 transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-red-500 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  Delivery Information
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  123 Pizza Street<br />
                  New York, NY 10001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-red-500 flex-shrink-0" />
                <a href="tel:+15551234567" className="text-gray-400 hover:text-red-500 transition-colors">
                  (555) 123-4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-red-500 flex-shrink-0" />
                <a href="mailto:hello@pizzacraft.com" className="text-gray-400 hover:text-red-500 transition-colors">
                  hello@pizzacraft.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  Mon - Sun<br />
                  11:00 AM - 11:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 PizzaCraft. All rights reserved. Made with ❤️ for pizza lovers.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
