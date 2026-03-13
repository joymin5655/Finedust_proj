import { useState } from 'react';
import { supabase } from '../logic/supabase';
import { Mail, Lock, LogIn, UserPlus, Github, Chrome, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsOpen] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Verification email sent! Please check your inbox.');
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-md mx-auto px-4">
      <div className="bg-white dark:bg-black/20 rounded-[40px] border border-gray-200 dark:border-white/10 p-10 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
        
        <div className="relative z-10 flex flex-col gap-8">
          <div className="text-center flex flex-col gap-2">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              {isLogin ? 'Welcome Back' : 'Join AirLens'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">
              {isLogin ? 'Log in to your environmental HQ' : 'Start your citizen science journey'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-700 dark:text-gray-200 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-700 dark:text-gray-200 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-xl text-xs font-bold border border-red-500/20">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 w-full bg-primary text-bg-dark py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-100 dark:bg-white/5"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 py-3.5 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-xs font-bold text-gray-600 dark:text-gray-300"
            >
              <Chrome size={16} /> Google
            </button>
            <button 
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center gap-2 py-3.5 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-xs font-bold text-gray-600 dark:text-gray-300"
            >
              <Github size={16} /> GitHub
            </button>
          </div>

          <button 
            onClick={() => setIsOpen(!isLogin)}
            className="text-center text-xs font-bold text-primary hover:underline transition-all"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;