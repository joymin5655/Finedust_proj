import { Link } from 'react-router-dom';
import { Wind, ShieldCheck, Activity, ArrowRight, Camera, Globe as GlobeIcon, History, User } from 'lucide-react';
import { useAuthStore } from '../logic/useAuthStore';

const Dashboard = () => {
  const { user, isAdmin } = useAuthStore();

  return (
    <div className="h-screen overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory flex">
      
      {/* Chapter 0: Personalized Hero */}
      <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-20 bg-warm-cream">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="font-sans font-bold text-forest uppercase tracking-[0.2em] text-xs">
              {user ? `Welcome Back, ${user.email?.split('@')[0]}` : 'v1.0 Intelligence'}
            </span>
            
            {user ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
                <h1 className="text-5xl md:text-6xl font-bold text-earth-brown leading-tight">
                  Your Personal <br />
                  <span className="text-forest italic">Atmospheric Hub.</span>
                </h1>
                <p className="text-lg leading-relaxed text-clay max-w-lg font-serif">
                  당신이 기여한 데이터가 더 깨끗한 지구를 만듭니다. 지금 바로 오늘의 공기질을 측정하거나 글로벌 트렌드를 확인하세요.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link to="/camera" className="bg-forest text-warm-cream px-8 py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-forest/90 transition-all flex items-center gap-3">
                    <Camera size={20} /> Start Sensing
                  </Link>
                  <Link to="/globe" className="bg-white border border-earth-brown/10 text-earth-brown px-8 py-4 rounded-2xl font-bold text-sm hover:bg-sage/20 transition-all flex items-center gap-3">
                    <GlobeIcon size={20} /> Live Globe
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-semibold leading-tight text-earth-brown">
                  Beyond Numbers, <br />
                  <span className="text-forest italic">Towards Truth.</span>
                </h1>
                <p className="text-lg leading-relaxed text-clay max-w-lg font-serif">
                  AirLens는 단순한 데이터 시각화를 넘어, AI와 대기 과학을 결합해 대기의 '인과관계'를 분석하는 지능형 플랫폼입니다.
                </p>
                <div className="flex gap-4 pt-4">
                  <Link to="/auth" className="bg-forest text-warm-cream px-8 py-3 rounded-full font-sans font-bold text-sm shadow-xl hover:bg-forest/90 transition-all flex items-center gap-2">
                    Join the Mission <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-soft-green/20 rounded-full blur-3xl"></div>
            {user ? (
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="narrative-card !p-8 flex flex-col gap-4 bg-white/80">
                  <div className="w-12 h-12 bg-forest/10 rounded-2xl flex items-center justify-center text-forest"><History /></div>
                  <div>
                    <p className="text-[10px] font-black text-clay uppercase">Your Records</p>
                    <p className="text-2xl font-bold text-earth-brown font-sans">12 Captures</p>
                  </div>
                </div>
                <div className="narrative-card !p-8 flex flex-col gap-4 bg-white/80">
                  <div className="w-12 h-12 bg-forest/10 rounded-2xl flex items-center justify-center text-forest"><ShieldCheck /></div>
                  <div>
                    <p className="text-[10px] font-black text-clay uppercase">Account Rank</p>
                    <p className="text-2xl font-bold text-earth-brown font-sans">{isAdmin ? 'Admin' : 'Citizen'}</p>
                  </div>
                </div>
                <div className="col-span-2 narrative-card !p-8 flex items-center justify-between bg-forest text-warm-cream border-none shadow-forest/20">
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-60">Daily Quest</p>
                    <p className="text-lg font-bold">오늘의 첫 사진을 찍고 DQSS 포인트를 받으세요</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full"><Camera /></div>
                </div>
              </div>
            ) : (
              <img alt="Atmosphere" className="relative rounded-[40px] shadow-2xl border-4 border-white object-cover h-[500px] w-full" src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=1024" />
            )}
          </div>
        </div>
      </section>

      {/* Chapter 1: Intelligence Engines */}
      <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-20 bg-sage/20">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12 space-y-4">
            <span className="font-sans font-bold text-forest uppercase tracking-[0.2em] text-xs">Scientific Integrity</span>
            <h2 className="text-5xl font-semibold text-earth-brown leading-tight">6 Intelligence <span className="italic text-clay">Engines</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'AOD Correction', desc: 'XGBoost-GTWR 모델로 위성 AOD를 지상 PM2.5 수치로 정밀 보정합니다.', icon: <Wind className="text-forest" /> },
              { title: 'Policy Lab (SDID)', desc: '68개국 정책 효과를 Synthetic DID 모델로 분석해 인과관계를 증명합니다.', icon: <Activity className="text-forest" /> },
              { title: 'DQSS Scoring', desc: '5가지 파라미터로 데이터 품질을 점수화하여 불확실성을 공시합니다.', icon: <ShieldCheck className="text-forest" /> }
            ].map((item, i) => (
              <div key={i} className="narrative-card group">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2 font-sans">{item.title}</h3>
                <p className="text-sm text-clay leading-relaxed font-serif">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter 2: Navigation Hub */}
      <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-20">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <span className="font-sans font-bold text-forest uppercase tracking-[0.2em] text-xs">Platform Modules</span>
            <h2 className="text-5xl font-semibold leading-tight text-earth-brown">Decode the <span className="italic text-clay">Atmosphere</span></h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/globe" className="p-6 bg-white border border-earth-brown/10 rounded-3xl hover:border-forest/40 transition-all group">
                <p className="font-bold text-forest mb-1 group-hover:underline">Global Flux</p>
                <p className="text-[10px] text-clay uppercase">3D Globe & AOD</p>
              </Link>
              <Link to="/camera" className="p-6 bg-white border border-earth-brown/10 rounded-3xl hover:border-forest/40 transition-all group">
                <p className="font-bold text-forest mb-1 group-hover:underline">Vision Sensing</p>
                <p className="text-[10px] text-clay uppercase">DINOv2 Camera AI</p>
              </Link>
              <Link to="/policy" className="p-6 bg-white border border-earth-brown/10 rounded-3xl hover:border-forest/40 transition-all group">
                <p className="font-bold text-forest mb-1 group-hover:underline">Impact Lab</p>
                <p className="text-[10px] text-clay uppercase">SDID Policy Analysis</p>
              </Link>
              {isAdmin ? (
                <div className="p-6 bg-earth-brown text-warm-cream rounded-3xl border border-transparent shadow-lg">
                  <p className="font-bold mb-1">Admin Console</p>
                  <p className="text-[10px] uppercase opacity-60">System Monitoring</p>
                </div>
              ) : (
                <Link to="/about" className="p-6 bg-white border border-earth-brown/10 rounded-3xl hover:border-forest/40 transition-all group">
                  <p className="font-bold text-forest mb-1 group-hover:underline">Methods</p>
                  <p className="text-[10px] text-clay uppercase">Open Pipeline</p>
                </Link>
              )}
            </div>
          </div>
          <div className="bg-earth-brown text-warm-cream p-10 rounded-[40px] shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 font-sans tracking-tight">Transparency & Integrity</h3>
            <p className="text-warm-cream/70 leading-relaxed mb-6 font-serif">우리는 "보여주는 것"에 그치지 않습니다. 측정 공백을 위성 데이터로 메우고, AI 모델의 신뢰 구간을 p10~p90으로 투명하게 공개하여 과학적 무결성을 유지합니다.</p>
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/10">
              <ShieldCheck className="text-soft-green" />
              <span className="text-xs font-bold font-sans uppercase">DQSS Quality Badge Active</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
