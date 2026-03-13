const Footer = () => {
  return (
    <footer className="bg-white dark:bg-bg-dark border-t border-gray-200 dark:border-white/10 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} AirLens. Built with ❤️ for a cleaner planet.
        </p>
        <div className="mt-4 flex justify-center space-x-6">
          <a
            href="https://github.com/joymin5655/AirLens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 text-sm font-semibold"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;