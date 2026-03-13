import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wind, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../logic/useAuthStore';
import { supabase } from '../logic/supabase';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();

  const links = [
    { name: 'Today', path: '/' },
    { name: 'Globe', path: '/globe' },
    { name: 'Policy', path: '/policy' },
    { name: 'Camera AI', path: '/camera' },
    { name: 'About', path: '/about' },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed w-full z-50 bg-white/70 dark:bg-bg-dark/70 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Wind className="text-bg-dark w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
              AirLens
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  location.pathname === link.path
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-2"></div>

            {user ? (
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <Link 
                to="/auth"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-bg-dark bg-primary hover:brightness-110 transition-all"
              >
                <User size={16} />
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            {!user && (
              <Link to="/auth" className="text-primary">
                <User size={20} />
              </Link>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 dark:text-gray-300">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-bg-dark border-b border-gray-100 dark:border-white/5 animate-in slide-in-from-top-4 duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-2xl text-base font-black uppercase tracking-tight ${
                  location.pathname === link.path
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <button 
                onClick={() => { handleSignOut(); setIsOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-2xl text-base font-black uppercase tracking-tight text-red-500"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;