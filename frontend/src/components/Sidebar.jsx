import { motion } from 'framer-motion';
import { Home, Upload, BarChart3, History, Settings, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ isOpen, onToggle }) {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: Upload, label: 'Upload MRI', id: 'upload' },
    { icon: BarChart3, label: 'Results', id: 'results' },
    { icon: History, label: 'History', id: 'history' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  const handleLogout = () => {
    // Clear any auth tokens
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 md:hidden bg-gradient-to-r from-cyan-400 to-purple-600 p-3 rounded-full text-white shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={isOpen ? { x: 0 } : { x: '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed md:static md:translate-x-0 left-0 top-0 z-30 h-screen w-64 bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-md border-r border-white/10 overflow-y-auto"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-6 border-b border-white/10 sticky top-0 bg-gradient-to-b from-slate-900/95 to-transparent"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-purple-500/50">
              N
            </div>
            <div>
              <div className="font-bold text-white">NeuroAge</div>
              <div className="text-xs text-cyan-400">AI</div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Items */}
        <nav className="p-6 space-y-2">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              whileHover={{
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                paddingLeft: '24px',
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.id === 'dashboard') {
                  // Stay on dashboard
                }
                // Future: Handle navigation to other sections
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white transition-colors duration-300 group relative"
            >
              <item.icon
                size={20}
                className="text-cyan-400/60 group-hover:text-cyan-400 transition-colors"
              />
              <span className="text-sm font-medium">{item.label}</span>
              {item.id === 'dashboard' && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-600 rounded-r-lg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-6 border-t border-white/10" />

        {/* Bottom Section - Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 to-transparent"
        >
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-cyan-400 border border-white/10 hover:border-cyan-400/50 transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onToggle}
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
        />
      )}
    </>
  );
}
