import { ShieldCheck, Zap, Layers, Globe, Database, Github, Satellite, LineChart } from 'lucide-react';

const About = () => {
  const stats = [
    { label: 'Data Sources', value: '4', desc: 'Station, Satellite, Camera, Weather' },
    { label: 'Countries Analyzed', value: '66', desc: 'Policy effect tracking' },
    { label: 'Analysis Engines', value: '6', desc: 'SDID, PARAAD, CORN, etc.' },
    { label: 'Auto Pipeline', value: '24/7', desc: 'Continuous data collection' },
  ];

  const sources = [
    { 
      name: 'WAQI', 
      fullname: 'World Air Quality Index', 
      icon: <Globe className="text-blue-500" />,
      desc: 'Real-time AQI/PM2.5 from 1,000+ stations worldwide.',
      usage: 'Globe markers, Today dashboard'
    },
    { 
      name: 'OpenAQ', 
      fullname: 'Open Air Quality Data', 
      icon: <Database className="text-emerald-500" />,
      desc: 'Historical PM2.5 time-series for 66 countries.',
      usage: 'Policy impact analysis (SDID)'
    },
    { 
      name: 'NASA Earthdata', 
      fullname: 'MAIAC MODIS AOD', 
      icon: <Satellite className="text-primary" />,
      desc: 'Satellite aerosol optical depth for gap-filling.',
      usage: 'Remote sensing estimation'
    },
    { 
      name: 'Open-Meteo', 
      fullname: 'Weather Forecast API', 
      icon: <Zap className="text-amber-500" />,
      desc: 'PBL height, humidity, and temperature covariates.',
      usage: 'ML model correction'
    },
  ];

  return (
    <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 flex flex-col gap-20">
      {/* Hero Section */}
      <section className="text-center flex flex-col gap-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 self-center">
          <Zap className="text-primary w-4 h-4 fill-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">How AirLens Works</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
          From data collection to <br />
          <span className="text-primary">causal intelligence.</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
          AirLens isn't just a visualization tool. It's a comprehensive pipeline that fuses physical station data, 
          satellite remote sensing, and computer vision to deliver high-fidelity air quality insights.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-200 dark:border-white/10 text-center flex flex-col gap-1">
            <span className="text-4xl font-black text-primary">{s.value}</span>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{s.label}</span>
            <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">{s.desc}</p>
          </div>
        ))}
      </section>

      {/* Data Sources Section */}
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">1. Data Sources & Collection</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            We automate the ingestion of air quality, meteorological, and satellite data from 4 major public sources.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sources.map((src) => (
            <div key={src.name} className="bg-white dark:bg-black/20 p-8 rounded-[32px] border border-gray-200 dark:border-white/10 flex flex-col gap-4 group hover:border-primary/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 dark:bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {src.icon}
                </div>
                <div>
                  <h3 className="font-black text-xl text-gray-900 dark:text-white">{src.name}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{src.fullname}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{src.desc}</p>
              <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Primary Usage:</p>
                <p className="text-xs text-primary font-bold mt-1">{src.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Analysis Engines Section */}
      <section className="bg-bg-dark text-white rounded-[40px] overflow-hidden p-8 md:p-16 relative border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col gap-12">
          <div className="flex flex-col gap-4 max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight uppercase italic text-primary">2. Analysis Engines</h2>
            <p className="text-white/60 leading-relaxed text-sm">
              Our backend processes raw data through 6 specialized engines to ensure accuracy, 
              quantify uncertainty, and extract causal relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <LineChart size={18} className="text-primary" />
                <span className="font-black text-xs uppercase tracking-widest">Synthetic DID</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Separates policy-driven changes from natural fluctuations using counterfactual control groups.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-primary" />
                <span className="font-black text-xs uppercase tracking-widest">PARAAD Engine</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Bi-LSTM based anomaly detection to identify and filter faulty station readings in real-time.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                <span className="font-black text-xs uppercase tracking-widest">DQSS Scoring</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Calculates a Data Quality Security Score based on 5 parameters: completeness, freshness, consistency, etc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-10 bg-gray-50 dark:bg-white/5 p-10 rounded-[40px] border border-gray-100 dark:border-white/5">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Open Source & Community</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Join our mission to democratize environmental intelligence.</p>
        </div>
        <div className="flex gap-4">
          <a 
            href="https://github.com/joymin5655/AirLens" 
            target="_blank" 
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all"
          >
            <Github size={18} />
            GitHub Repository
          </a>
          <a 
            href="/globe" 
            className="flex items-center gap-2 bg-primary text-bg-dark px-6 py-3 rounded-2xl font-black text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            <Globe size={18} />
            Try Live Globe
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;