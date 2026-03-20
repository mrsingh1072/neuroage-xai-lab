import { motion } from 'framer-motion';
import { Github } from 'lucide-react';

export default function SocialLogin() {
  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    // In production, integrate with actual OAuth providers
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Google Button */}
      <motion.button
        type="button"
        onClick={() => handleSocialLogin('Google')}
        whileHover={{ y: -2, boxShadow: '0 0 30px rgba(14, 165, 233, 0.3)' }}
        whileTap={{ scale: 0.95 }}
        className="glass-hover flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 group"
      >
        {/* Google Icon SVG */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="text-white group-hover:text-cyan-400 transition-colors"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            fill="currentColor"
          />
          <path
            d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"
            fill="currentColor"
          />
        </svg>
        <span className="text-sm font-medium text-gray-200 group-hover:text-cyan-300 transition-colors hidden sm:inline">
          Google
        </span>
      </motion.button>

      {/* GitHub Button */}
      <motion.button
        type="button"
        onClick={() => handleSocialLogin('GitHub')}
        whileHover={{ y: -2, boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)' }}
        whileTap={{ scale: 0.95 }}
        className="glass-hover flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 group"
      >
        <Github size={20} className="text-white group-hover:text-purple-400 transition-colors" />
        <span className="text-sm font-medium text-gray-200 group-hover:text-purple-300 transition-colors hidden sm:inline">
          GitHub
        </span>
      </motion.button>
    </div>
  );
}
