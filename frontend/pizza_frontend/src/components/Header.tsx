import { Link } from 'react-router-dom';
import { Pizza, ShoppingCart, User, LogOut, LayoutDashboard, History } from 'lucide-react';
import type { User as UserType } from '../App';
import { useState, useEffect } from 'react';

interface HeaderProps {
  user: UserType | null;
  logout: () => void;
  cartCount: number;
}

export default function Header({ user, logout, cartCount }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-md'
          : 'bg-white/80 backdrop-blur-lg shadow-sm'
      } border-b border-gray-100`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 ${
              scrolled ? 'scale-95' : 'scale-100'
            }`}>
              <Pizza className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">PizzaCraft</span>
          </Link>

          <nav className="flex items-center gap-4 md:gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              Build Pizza
            </Link>

            <Link
              to="/cart"
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors relative px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 bg-gradient-to-br from-red-600 to-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md transition-transform ${
                  scrolled ? 'scale-100' : 'scale-110'
                }`}>
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link
                  to="/orders"
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  <History className="w-5 h-5" />
                  <span className="hidden sm:inline">Orders</span>
                </Link>

                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}

                <div className="flex items-center gap-3 ml-2">
                  <div className="flex items-center gap-2 text-gray-700 px-3 py-2 rounded-lg bg-gray-50">
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all"
              >
                <User className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}