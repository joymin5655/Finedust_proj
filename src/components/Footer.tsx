import { APP_CONFIG } from '../logic/config';

const Footer = () => {
  return (
    <footer className="bg-bg-base border-t border-text-main/10 py-12 mt-auto transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-8 text-center flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-label !text-text-dim/60">
          © {new Date().getFullYear()} {APP_CONFIG.APP_NAME}. Data powered by <span className="text-primary italic">Atmospheric Matrix</span>.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-8 items-center">
          <div className="flex items-center gap-3 bg-text-main/5 px-5 py-2.5 rounded-full border border-text-main/10 backdrop-blur-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow animate-pulse"></span>
            <span className="text-label !text-text-main !tracking-tight">Environmental Sensing Matrix v1.1 Active</span>
          </div>
          
          <div className="flex gap-8 items-center">
            <a
              href={APP_CONFIG.GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label !text-text-dim hover:!text-primary transition-all duration-300 relative group"
            >
              Intelligence Base
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <span className="w-1 h-1 rounded-full bg-text-dim/20"></span>
            <span className="text-label !text-text-dim/40 italic">Decoding the Invisible</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
