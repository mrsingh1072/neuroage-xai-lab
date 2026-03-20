import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export default function Hero() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient orbital */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-conic from-purple-500/20 via-cyan-500/10 to-purple-500/20 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-conic from-cyan-500/20 via-blue-500/10 to-cyan-500/20 rounded-full blur-3xl opacity-30"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center z-10"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center space-x-2 mb-6 glass px-4 py-2"
        >
          <Sparkles size={16} className="text-cyan-400" />
          <span className="text-sm text-cyan-400 font-medium">
            Powered by Advanced AI Models
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="text-gradient">
            AI-Powered Brain Age Prediction
          </span>
          <br />
          <span className="text-white">& MRI Analysis</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Upload brain MRI scans and get accurate age prediction with explainable AI insights using CNN and Vision Transformers.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(139, 92, 246, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="btn-gradient flex items-center space-x-2 group"
          >
            <span>Start Analysis</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(30, 41, 59, 0.8)' }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-lg font-semibold text-white border border-white/20 transition-all duration-300 hover:border-cyan-400/50"
          >
            Sign In
          </motion.button>
        </motion.div>

        {/* Floating Cards - Preview */}
        <motion.div
          variants={itemVariants}
          className="mt-16 relative h-96 md:h-[28rem]"
        >
          {/* Left Card */}
          <motion.div
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 6, repeat: Infinity }}
            whileHover={{ scale: 1.05 }}
            className="absolute left-0 md:left-1/4 top-10 glass p-4 w-48 hidden sm:block"
          >
            <div className="text-xs text-gray-400 mb-2">CNN Model</div>
            <div className="text-2xl font-bold text-cyan-400">95.2%</div>
            <div className="text-xs text-gray-500">Accuracy</div>
            <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: '95.2%' }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Center Card */}
          <motion.div
            animate={{ y: [20, -20, 20] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute left-1/2 -translate-x-1/2 top-0 glass p-6 w-56 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-gray-400">Predicted Age</div>
                <div className="text-4xl font-bold text-gradient">21.4</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Actual Age</div>
                <div className="text-3xl font-bold text-white">22</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="flex-1 p-2 bg-white/5 rounded-lg text-center">
                <div className="text-xs text-gray-500">CNN</div>
                <div className="text-sm font-bold text-cyan-400">High</div>
              </div>
              <div className="flex-1 p-2 bg-white/5 rounded-lg text-center">
                <div className="text-xs text-gray-500">ViT</div>
                <div className="text-sm font-bold text-amber-400">Medium</div>
              </div>
            </div>
          </motion.div>

          {/* Right Card */}
          <motion.div
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 7, repeat: Infinity }}
            whileHover={{ scale: 1.05 }}
            className="absolute right-0 md:right-1/4 top-10 glass p-4 w-48 hidden sm:block"
          >
            <div className="text-xs text-gray-400 mb-2">ViT Model</div>
            <div className="text-2xl font-bold text-purple-400">92.8%</div>
            <div className="text-xs text-gray-500">Accuracy</div>
            <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: '92.8%' }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
