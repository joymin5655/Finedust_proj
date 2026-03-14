import { Check, ShieldCheck, Zap, Globe, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const Pricing = () => {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for curious citizens getting started with atmospheric sensing.',
      features: [
        'Real-time AQI Dashboard',
        '3 Camera AI Measurements / day',
        'Basic 3D Globe View',
        'Community Data Access'
      ],
      icon: <Globe className="text-primary" size={24} />,
      btnText: 'Start Free',
      highlight: false
    },
    {
      name: 'Explorer',
      price: '$4.99',
      unit: '/mo',
      description: 'Unlimited sensing and advanced visual intelligence for active users.',
      features: [
        'Unlimited Camera AI Sensing',
        'All Globe Data Layers (AOD + DQSS)',
        '7-day Air Quality Forecasts',
        'Personal Measurement Vault',
        'Priority GPS Monitoring'
      ],
      icon: <Zap className="text-primary" size={24} />,
      btnText: 'Join Mission',
      highlight: true
    },
    {
      name: 'Researcher',
      price: '$14.99',
      unit: '/mo',
      description: 'Macro-analysis hub for environmental NGO, scientists and policy makers.',
      features: [
        'SDID Policy Impact Analysis',
        'Full Data Center Access (Raw CSV)',
        'API Access (10k requests/mo)',
        'Premium Comparison Charts',
        'Verification Certificates'
      ],
      icon: <Database className="text-primary" size={24} />,
      btnText: 'Get Researcher Access',
      highlight: false
    }
  ];

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-6">
      <Helmet>
        <title>Pricing | AirLens Intelligence Plans</title>
        <meta name="description" content="Choose the plan that fits your mission. Join the global network of citizen scientists." />
      </Helmet>

      <header className="text-center space-y-6 mb-20">
        <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
          <ShieldCheck className="text-primary" size={14} />
          <span className="text-label text-primary">Mission Membership v1.0</span>
        </div>
        <h1 className="heading-xl">
          Fuel Global <span className="text-primary italic font-serif font-light">Intelligence</span>
        </h1>
        <p className="text-p text-lg italic max-w-2xl mx-auto">
          "Environmental truth should be accessible to all. Choose a plan to support our transparent data pipeline."
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`narrative-card group relative flex flex-col p-10 h-full ${tier.highlight ? 'bg-bg-card border-2 border-primary shadow-2xl scale-105 z-10' : 'bg-bg-card border border-text-main/5'}`}
          >
            {tier.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-earth-brown px-4 py-1 rounded-full text-label !opacity-100">
                Most Popular
              </div>
            )}
            
            <div className="mb-8">
              <div className="w-12 h-12 bg-text-main/5 rounded-2xl flex items-center justify-center mb-6">
                {tier.icon}
              </div>
              <h3 className="heading-lg mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-text-main tracking-tighter">{tier.price}</span>
                {tier.unit && <span className="text-label">{tier.unit}</span>}
              </div>
              <p className="text-p text-xs italic mt-4">
                {tier.description}
              </p>
            </div>

            <div className="flex-1 space-y-4 mb-10">
              {tier.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 rounded-full p-0.5 text-primary">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-p text-xs">{feature}</span>
                </div>
              ))}
            </div>

            <button className={`w-full py-4 rounded-2xl text-label transition-all ${tier.highlight ? 'bg-primary text-earth-brown shadow-xl shadow-primary/20 hover:scale-[1.02]' : 'bg-text-dim/5 text-text-dim hover:bg-primary hover:text-earth-brown'}`}>
              {tier.btnText}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 narrative-card !bg-text-main/5 border-dashed border-2 border-primary/20 p-12 text-center flex flex-col items-center gap-6">
        <ShieldCheck className="text-primary" size={40} />
        <div className="space-y-2">
          <h4 className="heading-lg uppercase">Public Benefit Policy</h4>
          <p className="text-p text-sm italic max-w-2xl">
            Environmental researchers, university labs, and non-profit NGOs are eligible for 75% to 100% discounts. We believe data transparency is a fundamental right.
          </p>
        </div>
        <button className="text-label text-primary border-b border-primary/30 pb-1 hover:border-primary transition-all">
          Apply for Academic Grant
        </button>
      </div>
    </div>
  );
};

export default Pricing;
