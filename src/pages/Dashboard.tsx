import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wind, ShieldCheck, Activity, ArrowRight, Camera, Globe as GlobeIcon, Edit3, Heart, Award, LogOut, Save, MapPin, Zap, Info, History } from 'lucide-react';
import { useAuthStore } from '../logic/useAuthStore';
import { supabase } from '../logic/supabase';
import { APP_CONFIG } from '../logic/config';
import { useGeolocation } from '../logic/useGeolocation';
import { fetchIntegratedAirQuality, getAQIGrade } from '../logic/airQualityService';
import AQICard from '../components/AQICard';
import LocationCard from '../components/LocationCard';
import DataSourcesCard from '../components/DataSourcesCard';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  // Local Sensing State
  const { location } = useGeolocation();
  const [aqiData, setAqiData] = useState<any>(null);
  const [aqiLoading, setAqiLoading] = useState(true);
  const [userCaptures, setUserCaptures] = useState<any[]>([]);

  // Load profile & archive data
  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      
      const fetchData = async () => {
        // Fetch bio
        const { data: profileData } = await supabase.from('profiles').select('bio').eq('id', user.id).single();
        if (profileData?.bio) setBio(profileData.bio);

        // Fetch archive (captures)
        const { data: captures } = await supabase
          .from('captures')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (captures && captures.length > 0) {
          // Fetch signed URLs for private images
          const paths = captures.filter(c => c.image_url).map(c => c.image_url);
          if (paths.length > 0) {
            try {
              const { data: signedData, error: signedError } = await supabase.storage
                .from('captures')
                .createSignedUrls(paths, 3600);
              
              if (!signedError && signedData) {
                const urlMap: Record<string, string> = {};
                signedData.forEach(item => {
                  if (item.signedUrl) urlMap[item.path || ''] = item.signedUrl;
                });
                
                const enriched = captures.map(c => ({
                  ...c,
                  signed_url: urlMap[c.image_url] || null
                }));
                setUserCaptures(enriched);
              } else {
                setUserCaptures(captures);
              }
            } catch (err) {
              console.error('Error fetching signed URLs:', err);
              setUserCaptures(captures);
            }
          } else {
            setUserCaptures(captures);
          }
        }
      };
      fetchData();
    }
  }, [user]);

  // Fetch real-time AQI when location is available
  useEffect(() => {
    if (location) {
      const getAqi = async () => {
        setAqiLoading(true);
        try {
          const data = await fetchIntegratedAirQuality(location.latitude, location.longitude);
          setAqiData(data);
        } catch (err) {
          console.error('AQI Fetch Error:', err);
        } finally {
          setAqiLoading(false);
        }
      };
      getAqi();
    }
  }, [location]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, bio: bio, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      setIsEditing(false);
    } catch (err: any) {
      alert('Update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getHealthAdvice = (grade: string) => {
    const key = grade.toUpperCase().replace(/\s+/g, '_');
    return t(`ADVICE.${key}`, t('ADVICE.ANALYZING'));
  };

  const defaultBio = isAdmin ? t('DEFAULT_BIO.ADMIN') : t('DEFAULT_BIO.USER');
  const userRole = isAdmin ? t('LABELS.INTEL_MANAGER') : t('LABELS.CITIZEN_SCIENTIST');

  const currentPM = aqiData?.iaqi?.pm25?.v || 0;
  const currentGrade = getAQIGrade(currentPM);

  return (
    <div className="h-screen overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory flex bg-warm-cream">
      
      {/* Chapter 0: Personalized Hero & Profile */}
      <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-20">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-forest/5 px-3 py-1 rounded-full border border-forest/10">
              <div className="w-1.5 h-1.5 bg-forest rounded-full animate-pulse"></div>
              <span className="font-sans font-bold text-forest uppercase tracking-[0.2em] text-[10px]">
                {user ? `Active Session: ${user.email?.split('@')[0]}` : t('HERO.MISSION_TAG')}
              </span>
            </div>
            
            {user ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
                <h1 className="text-5xl md:text-7xl font-bold text-earth-brown leading-tight tracking-tight">
                  {t('HERO.WELCOME_A')} <br />
                  <span className="text-forest italic">{t('HERO.WELCOME_B')}</span>
                </h1>
                <p className="text-lg leading-relaxed text-clay max-w-lg font-serif italic">
                  "{t('HERO.QUOTE')}"
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link to="/camera" className="bg-forest text-warm-cream px-8 py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-forest/90 transition-all flex items-center gap-3">
                    <Camera size={20} /> {t('LABELS.NEW_MEASUREMENT')}
                  </Link>
                  <Link to="/globe" className="bg-white border border-earth-brown/10 text-earth-brown px-8 py-4 rounded-2xl font-bold text-sm hover:bg-sage/20 transition-all flex items-center gap-3">
                    <GlobeIcon size={20} /> {t('LABELS.EXPLORE_DATA')}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-semibold leading-tight text-earth-brown tracking-tight">
                  {t('HERO.TITLE_A')} <br />
                  <span className="text-forest italic">{t('HERO.TITLE_B')}</span>
                </h1>
                <p className="text-lg leading-relaxed text-clay max-w-lg font-serif">
                  {t('HERO.DESCRIPTION')}
                </p>
                <div className="flex gap-4 pt-4">
                  <Link to="/auth" className="bg-forest text-warm-cream px-10 py-4 rounded-full font-sans font-bold text-sm shadow-xl hover:bg-forest/90 transition-all flex items-center gap-2">
                    {t('LABELS.GET_STARTED')} <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="absolute -inset-4 bg-soft-green/20 rounded-full blur-3xl"></div>
            
            {user ? (
              <div className="flex flex-col gap-4 relative z-10 animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="narrative-card !p-0 overflow-hidden bg-white/90">
                  <div className="h-24 bg-forest relative">
                    <div className="absolute -bottom-10 left-8 p-1 bg-white rounded-3xl shadow-lg">
                      <div className="w-20 h-24 bg-sage rounded-2xl flex items-center justify-center text-forest overflow-hidden">
                        {user.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <Award size={40} />
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-red-500/40 transition-all border border-white/20 group"
                      title={t('LABELS.SIGN_OUT')}
                    >
                      <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  
                  <div className="pt-14 pb-8 px-8 space-y-4">
                    {isEditing ? (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <input 
                          className="w-full bg-sage/30 border border-forest/20 rounded-xl px-4 py-2 text-sm font-bold text-earth-brown outline-none focus:ring-2 focus:ring-forest/30"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your Name"
                        />
                        <textarea 
                          className="w-full bg-sage/30 border border-forest/20 rounded-xl px-4 py-2 text-xs text-clay outline-none focus:ring-2 focus:ring-forest/30 h-20 resize-none"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about your mission..."
                        />
                        <div className="flex gap-2">
                          <button onClick={handleUpdateProfile} disabled={saving} className="flex-1 bg-forest text-warm-cream py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
                            {saving ? t('LABELS.SAVING') : <><Save size={12}/> {t('LABELS.SAVE_CHANGES')}</>}
                          </button>
                          <button onClick={() => setIsEditing(false)} className="px-4 bg-clay/10 text-clay py-2 rounded-xl text-[10px] font-black uppercase">{t('LABELS.CANCEL')}</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-bold text-earth-brown font-sans">{fullName || user.email?.split('@')[0]}</h3>
                            {isAdmin && <span className="bg-earth-brown text-warm-cream text-[8px] px-1.5 py-0.5 rounded font-black uppercase">{t('LABELS.ADMIN')}</span>}
                          </div>
                          <p className="text-xs text-clay font-bold uppercase tracking-widest">{userRole}</p>
                        </div>
                        <p className="text-sm text-clay leading-relaxed font-serif italic bg-sage/20 p-4 rounded-2xl border border-soft-green/10">
                          {bio || defaultBio}
                        </p>
                        <div className="flex gap-3 pt-2">
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="flex-1 bg-forest/5 text-forest py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-forest/10 transition-all flex items-center justify-center gap-2"
                          >
                            <Edit3 size={12} /> {t('LABELS.EDIT_PROFILE')}
                          </button>
                          <button className="w-12 bg-sage/30 text-forest rounded-xl flex items-center justify-center hover:bg-sage/50 transition-all">
                            <Heart size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <img alt="Atmosphere" className="relative rounded-[40px] shadow-2xl border-4 border-white object-cover h-[550px] w-full" src={APP_CONFIG.PLACEHOLDER_HERO_IMAGE} />
            )}
          </div>
        </div>
      </section>

      {/* Chapter 1: Intelligence Engines */}
      <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-20 bg-sage/20">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12 space-y-4">
            <span className="font-sans font-bold text-forest uppercase tracking-[0.2em] text-xs">{t('LABELS.SCIENTIFIC_INTEGRITY')}</span>
            <h2 className="text-5xl font-semibold text-earth-brown leading-tight">6 Intelligence <span className="italic text-clay">Engines</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'AOD Correction', desc: t('DASHBOARD.ENGINE_AOD_DESC'), icon: <Wind className="text-forest" /> },
              { title: t('LABELS.IMPACT_LAB') + ' (SDID)', desc: t('DASHBOARD.ENGINE_SDID_DESC'), icon: <Activity className="text-forest" /> },
              { title: 'DQSS Scoring', desc: t('DASHBOARD.ENGINE_DQSS_DESC'), icon: <ShieldCheck className="text-forest" /> }
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

      {/* Chapter 2: Local Sensing (Upgrade) */}
      <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-20">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 text-forest">
              <MapPin size={18} />
              <span className="font-sans font-bold uppercase tracking-widest text-xs">Chapter 2: Local Intelligence</span>
            </div>
            <h2 className="text-5xl font-semibold leading-tight text-earth-brown">Real-time <br/><span className="italic text-clay">Sensing</span></h2>
            
            <LocationCard city={aqiData?.city || 'Checking...'} loading={aqiLoading} />
            
            <div className="bg-white/50 border border-forest/10 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-forest font-bold text-xs uppercase"><Info size={14}/> Health Horizon</div>
              <p className="text-sm text-earth-brown leading-relaxed font-serif italic">
                "{getHealthAdvice(currentGrade)}"
              </p>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${currentGrade === 'Good' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                <Zap size={10} /> {currentGrade} Air Quality Active
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <AQICard 
              pm25={currentPM} 
              grade={currentGrade} 
              loading={aqiLoading} 
              confScore={aqiData?.dqss || 85} 
            />
            <DataSourcesCard 
              sources={aqiData?.sources || ['WAQI Station']} 
              dqss={aqiData?.dqss || 85} 
              loading={aqiLoading} 
            />
          </div>
        </div>
      </section>

      {/* Chapter 3: Navigation & Platform Hub */}
      <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-20 bg-sage/10">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <span className="font-sans font-bold text-forest uppercase tracking-[0.2em] text-xs">Platform Modules</span>
            <h2 className="text-5xl font-semibold leading-tight text-earth-brown">Decode the <span className="italic text-clay">Atmosphere</span></h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/globe" className="p-6 bg-white border border-earth-brown/10 rounded-3xl hover:border-forest/40 transition-all group shadow-sm">
                <p className="font-bold text-forest mb-1 group-hover:underline">{t('LABELS.GLOBAL_FLUX')}</p>
                <p className="text-[10px] text-clay uppercase">3D Globe & AOD</p>
              </Link>
              <Link to="/camera" className="p-6 bg-white border border-earth-brown/10 rounded-3xl hover:border-forest/40 transition-all group shadow-sm">
                <p className="font-bold text-forest mb-1 group-hover:underline">{t('LABELS.VISION_SENSING')}</p>
                <p className="text-[10px] text-clay uppercase">DINOv2 Camera AI</p>
              </Link>
              <Link to="/policy" className="p-6 bg-white border border-earth-brown/10 rounded-3xl hover:border-forest/40 transition-all group shadow-sm">
                <p className="font-bold text-forest mb-1 group-hover:underline">{t('LABELS.IMPACT_LAB')}</p>
                <p className="text-[10px] text-clay uppercase">SDID Policy Analysis</p>
              </Link>
              <Link to="/about" className="p-6 bg-white border border-earth-brown/10 rounded-3xl hover:border-forest/40 transition-all group shadow-sm">
                <p className="font-bold text-forest mb-1 group-hover:underline">{t('LABELS.METHODS')}</p>
                <p className="text-[10px] text-clay uppercase">{t('LABELS.OPEN_PIPELINE')}</p>
              </Link>
            </div>
          </div>
          <div className="bg-earth-brown text-warm-cream p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Activity size={120} /></div>
            <h3 className="text-2xl font-bold mb-4 font-sans tracking-tight relative z-10">{t('LABELS.SCIENTIFIC_INTEGRITY')}</h3>
            <p className="text-warm-cream/70 leading-relaxed mb-6 font-serif relative z-10">{t('LABELS.PURPOSE')}</p>
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/10 relative z-10 backdrop-blur-sm">
              <ShieldCheck className="text-soft-green" />
              <span className="text-xs font-bold font-sans uppercase">DQSS Quality Badge Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 4: Personal Vault (Archive) */}
      {user && (
        <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-20">
          <div className="max-w-6xl w-full space-y-12">
            <div className="flex items-end justify-between border-b border-earth-brown/10 pb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-forest">
                  <History size={18} />
                  <span className="font-sans font-bold uppercase tracking-widest text-xs">Chapter 4: Personal Archive</span>
                </div>
                <h2 className="text-5xl font-semibold text-earth-brown tracking-tight">Your Atmospheric <span className="italic text-clay">Journey</span></h2>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-2xl font-bold text-earth-brown">{userCaptures.length}</p>
                <p className="text-[10px] text-clay uppercase font-sans font-bold tracking-widest">Saved Measurements</p>
              </div>
            </div>

            {userCaptures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {userCaptures.map((cap) => (
                  <div key={cap.id} className="narrative-card group !p-0 overflow-hidden bg-white/80 hover:shadow-2xl transition-all">
                    <div className="h-40 bg-sage/20 relative overflow-hidden">
                      {cap.signed_url ? (
                        <img 
                          src={cap.signed_url} 
                          alt="Capture" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-forest/30"><Camera size={40}/></div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-forest shadow-sm border border-forest/10">
                        PM2.5: {cap.pm25_est}
                      </div>
                    </div>
                    <div className="p-6 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-bold text-clay uppercase tracking-widest">{cap.city_name || 'Local Sensing'}</p>
                        <p className="text-[10px] text-clay/60 font-serif">{new Date(cap.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm font-bold text-earth-brown">{cap.aqi_class || 'Calculated'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="narrative-card flex flex-col items-center justify-center py-20 text-center space-y-6 bg-sage/5 border-dashed border-2 border-forest/10">
                <div className="bg-warm-cream p-6 rounded-full text-forest/20"><Camera size={48} /></div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-earth-brown">{t('DASHBOARD.NO_CAPTURES')}</h4>
                  <p className="text-sm text-clay font-serif italic max-w-sm mx-auto">{t('DASHBOARD.EMPTY_VAULT')}</p>
                </div>
                <Link to="/camera" className="bg-forest text-warm-cream px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-forest/20 hover:scale-105 transition-transform">
                  Start First Sensing
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
