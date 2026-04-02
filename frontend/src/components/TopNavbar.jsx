import { motion } from 'framer-motion';
import { Bell, User, Moon, Sun, Menu } from 'lucide-react';
import { useState } from 'react';








export default function TopNavbar({ onMenuToggle }) {
  const [isDark, setIsDark] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass border-b border-white/10 sticky top-0 z-20"
    >
      <div className="px-6 md:px-8 py-4 flex items-center justify-between">
        {/* Left - Menu */}
        <motion.button
          onClick={onMenuToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:flex p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <Menu size={24} />
        </motion.button>

        {/* Right - Actions */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <Bell size={20} />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
            />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            onClick={() => setIsDark(!isDark)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-cyan-400 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>

          {/* Profile */}
          <div className="relative">
            <motion.button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/50">
                U
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                  User
                </span>
                <span className="text-xs text-gray-400">Premium</span>
              </div>
            </motion.button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-48 glass rounded-2xl border border-white/20 overflow-hidden shadow-xl"
              >
                <div className="p-4 space-y-3">
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    <span>Settings</span>
                  </motion.button>
                  <div className="border-t border-white/10" />
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                  >
                    Logout
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
