import { useState } from 'react';
import { supabase } from '../logic/supabase';
import { Mail, Lock, LogIn, UserPlus, Github, Chrome, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsOpen] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess(true);
      }
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
      <div className="bg-white rounded-[40px] border border-earth-brown/5 p-10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-forest/5 blur-3xl rounded-full"></div>
        
        <div className="relative z-10 flex flex-col gap-8">
          <div className="text-center flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-earth-brown tracking-tight uppercase font-sans">
              {isLogin ? 'Welcome Back' : 'Join AirLens'}
            </h1>
            <p className="text-clay text-xs font-bold uppercase tracking-widest font-sans">
              {isLogin ? 'Log in to your environmental HQ' : 'Start your citizen science journey'}
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-6 py-8 animate-in fade-in zoom-in duration-500 text-center">
              <div className="bg-sage p-4 rounded-full">
                <CheckCircle2 size={48} className="text-forest" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-earth-brown">Verification Sent!</h2>
                <p className="text-sm text-clay leading-relaxed">
                  We've sent a magic link to <br/><strong>{email}</strong>.<br/>
                  Please confirm your email to start sensing.
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(true)}
                className="text-forest font-bold text-xs uppercase tracking-widest hover:underline"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-clay uppercase tracking-widest ml-1 font-sans">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-clay w-4 h-4" />
                  <input 
                    type="email" 
                    required
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-sage/10 border-none rounded-2xl text-sm focus:ring-2 focus:ring-forest/50 text-earth-brown transition-all font-sans"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-clay uppercase tracking-widest ml-1 font-sans">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-clay w-4 h-4" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-sage/10 border-none rounded-2xl text-sm focus:ring-2 focus:ring-forest/50 text-earth-brown transition-all font-sans"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-xs font-bold border border-red-100 font-sans">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="mt-2 w-full bg-forest text-warm-cream py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-forest/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-forest/20 font-sans"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-warm-cream/30 border-t-warm-cream rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-earth-brown/5"></div>
                <span className="text-[10px] font-bold text-clay uppercase tracking-widest font-sans">Or continue with</span>
                <div className="flex-1 h-px bg-earth-brown/5"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center gap-2 py-3.5 border border-earth-brown/10 rounded-2xl hover:bg-sage/10 transition-all text-xs font-bold text-earth-brown font-sans"
                >
                  <Chrome size={16} /> Google
                </button>
                <button 
                  onClick={() => handleSocialLogin('github')}
                  className="flex items-center justify-center gap-2 py-3.5 border border-earth-brown/10 rounded-2xl hover:bg-sage/10 transition-all text-xs font-bold text-earth-brown font-sans"
                >
                  <Github size={16} /> GitHub
                </button>
              </div>

              <button 
                onClick={() => setIsOpen(!isLogin)}
                className="text-center text-xs font-bold text-forest hover:underline transition-all font-sans"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;