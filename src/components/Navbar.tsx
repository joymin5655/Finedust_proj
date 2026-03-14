import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, User, LogOut, ChevronDown, Bell, Search, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../logic/useAuthStore';
import { useThemeStore } from '../logic/useThemeStore';
import { APP_CONFIG } from '../logic/config';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAdmin, loading, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: t('NAV.STORY'), path: '/' },
    { name: t('NAV.GLOBE'), path: '/globe' },
    { name: 'Analytics', path: '/analytics' },
    { name: t('NAV.IMPACT'), path: '/policy' },
    { name: 'Pricing', path: '/pricing' },
    { name: t('NAV.RESOURCES'), path: '/about' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const isGlobe = location.pathname === '/globe';

  return (
    <nav 
      className={`fixed top-6 left-0 right-0 z-[100] transition-all duration-700 px-6 sm:px-12 flex justify-center`}
    >
      <div 
        className={`w-full max-w-7xl flex items-center justify-between px-6 py-3 transition-all duration-700 ${
          scrolled || !isGlobe 
            ? 'glass-island py-2' 
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-earth-brown rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent"></div>
              <span className="material-symbols-outlined text-primary text-2xl relative z-10">eco</span>
            </div>
            <span className={`heading-lg !text-2xl transition-colors ${isGlobe && !scrolled ? 'text-white' : 'text-text-main'}`}>
              {APP_CONFIG.APP_NAME}<span className="text-primary">.</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-5 py-2.5 rounded-2xl transition-all relative group text-label ${
                  location.pathname === link.path 
                    ? (isGlobe && !scrolled ? 'text-white bg-white/10' : 'text-text-main bg-text-main/5') 
                    : (isGlobe && !scrolled ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-text-dim hover:text-text-main hover:bg-text-main/5')
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div 
                    layoutId="nav-active"
                    className={`absolute bottom-0.5 left-5 right-5 h-0.5 ${isGlobe && !scrolled ? 'bg-white' : 'bg-primary'}`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl transition-all ${isGlobe && !scrolled ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-text-dim hover:text-text-main hover:bg-text-main/5'}`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className={`p-2.5 rounded-2xl transition-all ${isGlobe && !scrolled ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-text-dim hover:text-text-main hover:bg-text-main/5'}`}>
            <Search size={18} />
          </button>
          
          <button className={`p-2.5 rounded-2xl transition-all relative ${isGlobe && !scrolled ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-text-dim hover:text-text-main hover:bg-text-main/5'}`}>
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#25e2f4]"></span>
          </button>

          <div className={`h-6 w-px mx-3 ${isGlobe && !scrolled ? 'bg-white/10' : 'bg-text-main/10'}`}></div>

          {loading ? (
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
          ) : user ? (
            <div className="relative group flex items-center gap-3 cursor-pointer">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className={`text-[9px] font-black uppercase tracking-widest ${isGlobe && !scrolled ? 'text-white' : 'text-text-main'}`}>
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <span className={`text-[7px] font-bold uppercase tracking-tighter ${isGlobe && !scrolled ? 'text-primary/70' : 'text-primary'}`}>
                  {isAdmin ? 'Atmospheric Manager' : 'Climate Observer'}
                </span>
              </div>
              
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-primary font-black shadow-xl overflow-hidden group-hover:scale-110 transition-all duration-500">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>

              <div className="absolute top-full right-0 mt-4 w-56 bg-bg-card backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 py-3 z-50 translate-y-2 group-hover:translate-y-0">
                <div className="px-5 py-3 mb-2">
                  <p className="text-[10px] font-black text-text-main truncate leading-tight">{user.email}</p>
                  <p className="text-[8px] font-bold text-text-dim uppercase tracking-widest mt-1">v1.1 Stable Account</p>
                </div>
                <Link to="/profile" className="w-full px-5 py-2.5 text-left text-[10px] font-black text-text-dim hover:bg-text-main/5 hover:text-text-main transition-colors flex items-center gap-3">
                  <User size={14} className="text-primary" /> Profile Settings
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="w-full px-5 py-2.5 text-left text-[10px] font-black text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
                >
                  <LogOut size={14} /> {t('NAV.SIGN_OUT')}
                </button>
              </div>
            </div>
          ) : (
            <Link 
              to="/auth"
              className="bg-earth-brown text-white px-7 py-3 rounded-2xl text-label shadow-2xl hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
            >
              <User size={16} className="text-primary" />
              {t('NAV.SIGN_IN')}
            </Link>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`lg:hidden p-2.5 rounded-2xl transition-all ${isGlobe && !scrolled ? 'text-white hover:bg-white/10' : 'text-text-main hover:bg-text-main/5'}`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-28 left-6 right-6 bg-bg-card backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 lg:hidden shadow-[0_32px_64px_rgba(0,0,0,0.15)] z-50"
          >
            <div className="flex flex-col gap-8 text-label">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between group transition-colors ${location.pathname === link.path ? 'text-text-main' : 'hover:text-text-main'}`}
                >
                  {link.name}
                  <ChevronDown size={14} className="-rotate-90 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
              <div className="h-px bg-text-main/10 w-full my-2"></div>
              {!user && (
                <Link 
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="bg-earth-brown text-white p-5 rounded-[24px] text-center shadow-2xl font-black tracking-widest"
                >
                  {t('NAV.SIGN_IN')}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
