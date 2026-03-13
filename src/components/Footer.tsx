const Footer = () => {
  return (
    <footer className="bg-warm-cream border-t border-earth-brown/10 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-forest text-xs font-sans font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} AirLens. Data powered by AirLens Intelligence.
          </p>
          <div className="flex gap-6 items-center">
             <div className="flex items-center gap-2 bg-sage/50 px-3 py-1.5 rounded-full border border-soft-green/10">
              <span className="w-2 h-2 rounded-full bg-forest shadow-[0_0_8px_rgba(46,125,50,0.5)] animate-pulse"></span>
              <span className="font-bold text-forest text-[10px] font-sans uppercase tracking-tight">Environmental Sensing Network Active</span>
            </div>
            <a
              href="https://github.com/joymin5655/AirLens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest hover:text-forest/80 text-[10px] font-bold uppercase tracking-widest font-sans border-b border-forest/20"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;